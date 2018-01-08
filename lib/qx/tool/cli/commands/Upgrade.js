/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2017 Zenesis Ltd

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * John Spackman (john.spackman@zenesis.com, @johnspackman)
     * Christian Boulanger (info@bibliograph.org, @cboulanger)

************************************************************************ */

const qx = require("qooxdoo");

const {promisify} = require('util');

const spawn = require('child_process').spawn;
const fs = require("fs");
const path = require("upath");
const process = require("process");
const JsonToAst = require("json-to-ast");

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

require("./Command");

/**
 * Command to initialise a new qooxdoo application, or upgrade an old (pre-6.0) application
 * 
 */
qx.Class.define("qxcli.commands.Upgrade", {
  extend: qxcli.commands.Command,
  
  statics: {
    /**
     * Installs the command into yargs
     */
    getYargsCommand: function() {
      return {
        command: "upgrade [options]",
        desc: "upgrades a qooxdoo application",
        usage: "upgrade",
        builder: {
          "verbose": {
            alias : "v",
            describe: "enables additional progress output to console",
            type: "boolean"
          }
        },
        handler: function (argv) {
          return new qxcli.commands.Upgrade(argv)
          .process()
          .catch((e) => {
            console.error(e.stack || e.message);
            process.exit(1);
          });
        }  
      }
    }
  },
  
  members: {
    /*
     * @Override
     */
    process: async function() {
      var t = this;
      var compileAst = null;
      var compileJson = {};
      var configJson;
      
      var lets = {};
      function getMacro(name) {
        var value = lets[name];
        value = replaceMacros(value);
        return value;
      }
      
      function replaceMacros(value) {
        if (!value)
          return "";
        while (true) {
          var pos = value.indexOf('${');
          var endPos = value.indexOf('}', pos);
          if (pos < 0 || endPos < 0)
            return value;
          var name = value.substring(pos + 2, endPos);
          var left = value.substring(0, pos);
          var right = value.substring(endPos + 1);
          value = left + lets[name] + right;
        }
      }
      
      function parseJson(str) {
        var ast = JsonToAst.parseToAst(str);
        var json = JsonToAst.astToObject(ast);
        return json;
      }
      
      t.debug(">>> Loading config.json");
      var data;
      try {
        data = await readFile("config.json", {encoding: "utf8"});
      }catch(ex) {
        if (ex.code == "ENOENT")
          return null;
        throw new qxcli.Utils.UserError("Cannot read config.json: " + (ex.message||ex.stack))
      }
      try {
        configJson = parseJson(data);
      }catch(ex) {
        throw new qxcli.Utils.UserError("Cannot parse config.json: " + (ex.message||ex.stack));
      }
      
      t.debug(">>> Loading compile.json (if there is one)")
      try {
        var data = await readFile("compile.json", {encoding: "utf8"});
        try {
          compileAst = JsonToAst.parseToAst(data, { verbose: true });
          compileJson = JsonToAst.astToObject(compileAst);
        }catch(ex) {
          throw new qxcli.Utils.UserError("Cannot parse compile.json: " + (ex.message||ex.stack));
        }
      } catch(err) {
        if (err.code !== "ENOENT")
          throw err;
      }
      
      t.debug(">>> Loading Manifest.json");
      try {
        var str = await readFile("Manifest.json", { encoding: "utf8" });
        data = parseJson(str);
      }catch(ex) {
        data = null;
      }
      
      lets = (configJson && configJson["let"])||{};
      compileJson = Object.assign({
        applications: [],
        libraries: [],
        targets: [
          {
            "type": "source",
            "outputPath": "source-output"
          },
          {
            "type": "hybrid",
            "outputPath": "hybrid-output"
          },
          {
            "type": "build",
            "outputPath": "build-output"
          }
        ],
        defaultTarget: "source",
        locales: getMacro("LOCALES")|| ["en"]
      }, compileJson);
      
      if (compileJson.libraries) {
        compileJson.libraries = compileJson.libraries.map(function(path) {
          if (typeof path === "object" && typeof path.path === "string") {
            return path.path;
            
          } else if (typeof path !== "string") {
            throw new qxcli.Utils.UserError("Cannot interpret configuration for libraries");
          }
          
          return path;
        });
      }
      
      if (!compileJson.defaultTarget) {
        const MAP_JOB_TO_TARGET = {
            "source": "source",
            "source-hybrid": "hybrid",
            "build": "build"
        };
        compileJson.defaultTarget = MAP_JOB_TO_TARGET[configJson["default-job"]]||"source";
      }
      
      var appName = getMacro("APPLICATION");
      var appClass = getMacro("APPLICATION_CLASS");
      if (!appClass)
        appClass = appName + ".Application";
      var qxTheme = getMacro("QXTHEME");
      
      t.debug(">>> Loading known library manifests");
      var libLookup = {};
      
      function addLibrary(ns, dir) {
        libLookup[ns] = {
            path: dir
        };
        compileJson.libraries.push(dir);
      }
      
      await Promise.all(compileJson.libraries.map(function(path) {
        return readFile(path + "/Manifest.json", {encoding: "utf8"})
          .then(function(data) {
            data = parseJson(data);
            var ns = data.provides.namespace;
            t.debug("    > Loaded " + ns);
            libLookup[ns] = {
              manifest: data,
              path: path
            };
          })
      }));
      
      if (configJson && configJson.jobs && configJson.libraries && configJson.libraries.library) {
        t.debug(">>> Loading extra library manifests")
        var all = configJson.libraries.library.map(async (clib) => {
          var filename = getMacro(clib.manifest);
          var pos = filename.lastIndexOf('/');
          var dir = filename.substring(pos + 1);
          var str = await readFile(filename, { encoding: "utf8" });
          var manifest = parseJson(str);
          var ns = manifest.provides.namespace;
          t.debug("    > Loaded " + ns);
          var lib = libLookup[ns];
          if (!lib) {
            addLibrary(ns, dir);
          }
        });
        await Promise.all(all);
      }

      this.info(">>> Configuring");
      if(!libLookup["qx"]) {
        var dir = getMacro("QOOXDOO_PATH");
        if (!dir) {
          throw new qxcli.Utils.UserError("Cannot find Qooxdoo in " + dir);
        } else {
          let p = path.join(dir, "framework");
          p = p.replace(/\\/g, "/");
          addLibrary("qx", p);
        }
      }
      
      if (appName.length && !libLookup[appName]) {
        addLibrary(appName, ".");
      }
      
      if (!compileJson.applications.length) {
        compileJson.applications.push({
          "class": appClass,
          theme: qxTheme,
          name: appName
        });
      }

      var str = JsonToAst.reprint(compileJson, compileAst);
      await writeFile("compile.json", str, { encoding: "utf8" });
      this.info(">>> Done.");
    }
    
  }
 
});

