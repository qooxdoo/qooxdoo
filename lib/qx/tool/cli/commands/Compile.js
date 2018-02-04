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

************************************************************************ */

require("qooxdoo");
const process = require('process');
const async = require('async');
const Gauge = require("gauge");

require('app-module-path').addPath(process.cwd() + '/node_modules');

require("./Command");
require("./MConfig");

/**
 * Handles compilation of the project by qxcompiler
 */
/* global qxcli */
qx.Class.define("qx.tool.cli.commands.Compile", {
  extend: qx.tool.cli.commands.Command,
  include: [qx.tool.cli.commands.MConfig],

  statics: {
    
    getYargsCommand: function() {
      return {
        command   : "compile [configFile]",
        describe  : "compiles the current application, using compile.json",
        builder   : {
          "all-targets": {
            describe: "Compile all targets in config file",
            type: "boolean"
          },
          "target": {
            describe: "Set the target type: source, build, hybrid or class name. Default is first target in config file",
            requiresArg: true,
            type: "string"
          },
          "output-path": {
            describe: "Base path for output",
            nargs: 1,
            requiresArg: true,
            type: "string"
          },
          "locale": {
            describe: "Compile for a given locale",
            nargs: 1,
            requiresArg: true,
            type: "string",
            array: true
          },
          "write-all-translations": {
            describe: "enables output of all translations, not just those that are explicitly referenced",
            type: "boolean"
          },
          "set": {
            describe: "sets an environment value",
            nargs: 1,
            requiresArg: true,
            type: "string",
            array: true
          },
          "app-class": {
            describe: "sets the application class",
            nargs: 1,
            requiresArg: true,
            type: "string"
          },
          "app-theme": {
            describe: "sets the theme class for the current application",
            nargs: 1,
            requiresArg: true,
            type: "string"
          },
          "app-name": {
            describe: "sets the name of the current application",
            nargs: 1,
            requiresArg: true,
            type: "string"
          },
          "library": {
            describe: "adds a library",
            nargs: 1,
            requiresArg: true,
            type: "string",
            array: true
          },
          "watch": {
            describe: "enables watching for changes and continuous compilation",
            type: "boolean"
          },
          "machine-readable": {
            describe: "output compiler messages in machine-readable format",
            type: "boolean"
          },
          "verbose": {
            alias: "v",
            describe: "enables additional progress output to console",
            type: "boolean"
          },
          "minify": {
            describe: "disables minification (for build targets only)",
            choices: [ "off", "minify", "mangle", "beautify" ],
            default: "mangle"
          },
          "save-unminified": {
            describe: "Saves a copy of the unminified version of output files (build target only)",
            type: "boolean",
            default: false
          },
          "erase": {
            describe: "Enabled automatic deletion of the output directory when compiler version changes",
            type: "boolean",
            default: true
          },
          "feedback": {
            describe: "Shows gas-gause feedback",
            type: "boolean",
            default: true
          },
          "typescript": {
            describe: "Outputs typescript definitions in qooxdoo.d.ts",
            type: "boolean"
          },
          "add-created-at": {
            describe: "Adds code to populate object's $$createdAt",
            type: "boolean"
          },
          "clean": {
            describe: "Deletes the target dir before compile",
            type: "boolean"
          }
          
        },
        handler   : function(argv){
          return new qx.tool.cli.commands.Compile(argv)
            .process()
            .catch((e) => {
              console.log(e.stack || e.message);
              process.exit(1);
            });
        }
      };
    }
 
  },
    
  members: {
    __gauge: null,
    
    /*
     * @Override
     */
    process: async function() {
      if (this.argv["machine-readable"])
        qx.tool.compiler.Console.getInstance().setMachineReadable(true);
      else if (this.argv["feedback"]) {
        this.__gauge = new Gauge();
        this.__gauge.show("Compiling", 0);
        const TYPES = {
          "error": "ERROR",
          "warning": "Warning"  
        };
        qx.tool.compiler.Console.getInstance().setWriter((str, msgId) => { 
          msgId = qx.tool.compiler.Console.MESSAGE_IDS[msgId];
          if (msgId.type !== "message")
            console.log('\n' + TYPES[msgId.type] + ": " + str);
          else
            this.__gauge.show(str); 
        });
      }
      var config = await this.parse(this.argv);
      if (!config)
        throw new qx.tool.cli.Utils.UserError("Error: Cannot find any configuration");
      var maker = await this.createMakerFromConfig(config);
      if (!maker)
        throw new qx.tool.cli.Utils.UserError("Error: Cannot find anything to make");
      if (this.argv["clean"]) {
        await maker.eraseOutputDir(); 
        await qx.tool.compiler.files.Utils.safeUnlink(maker.getAnalyser().getDbFilename());
        await qx.tool.compiler.files.Utils.safeUnlink(maker.getAnalyser().getResDbFilename());
      }  
      var analyser = maker.getAnalyser();
      var target = maker.getTarget();
      if (this.__gauge) {
        maker.addListener("writingApplications", () => this.__gauge.show("Writing Applications", 0));
        maker.addListener("writtenApplications", () => this.__gauge.show("Writing Applications", 1));
        maker.addListener("writingApplication", (evt) => this.__gauge.pulse("Writing Application " + evt.getData().getName()));
        analyser.addListener("compilingClass", (evt) => this.__gauge.pulse("Compiling " + evt.getData().classFile.getClassName()));
        if (target instanceof qx.tool.compiler.targets.BuildTarget) {
          target.addListener("minifyingApplication", (evt) => this.__gauge.pulse("Minifying " + evt.getData().application.getName() + " " + evt.getData().filename));
        }
      } else {
        maker.addListener("writingApplication", (evt) => qx.tool.compiler.Console.print("qx.tool.cli.compile.writingApplication", evt.getData().getName()));
        if (target instanceof qx.tool.compiler.targets.BuildTarget) {
          target.addListener("minifyingApplication", (evt) => qx.tool.compiler.Console.print("qx.tool.cli.compile.minifyingApplication", evt.getData().application.getName(), evt.getData().filename));
        }
      }

      var p = qx.tool.compiler.files.Utils.safeStat("source/index.html")
        .then((stat) => stat && qx.tool.compiler.Console.print("qx.tool.cli.compile.legacyFiles", "source/index.html"));
      
      // Simple one of make
      if (!this.argv.watch) {
        return p.then(() => {
          return new Promise((resolve, reject) => {
            maker.make((err) => {
              if (this.__gauge)
                this.__gauge.show("Compiling", 1);
              if (err)
                return reject(err);
              resolve();
            });
          });
        });
      }
      
      // Continuous make
      return p.then(() => new qx.tool.cli.Watch(maker).start());
    },
    
    /**
     * Uses loadConfig to load the configuration and produce a Maker.
     * Instead of the callback-style, you can also use the returned Promise
     * @param path {String}
     * @return {Promise} A promise that resolves with the maker object. 
     */
    configure: async function(path) {
      var t = this;
      return t.loadConfig(path).then((data) => {
        if (data.target === undefined) {
          data.target = data.targets.find((target)=>target.type == data.defaultTarget); 
        }
        var maker = t.createMakerFromConfig(data);
        return maker;
      });
    },

    /**
     * Processes the configuration from a JSON data structure and creates a Maker
     *
     * @param data {Map}
     * @return {Maker}
     */
    createMakerFromConfig: async function(data) {
      var t = this;
      var maker = null;
      
      var outputPath = data.target.outputPath;
      if (!outputPath)
        throw new qx.tool.cli.Utils.UserError("Missing output-path for target " + data.target.type);
      
      maker = new qx.tool.compiler.makers.AppMaker();
      if (!this.argv["erase"])
        maker.setNoErase(true);
      
      if (!data.target)
        throw new qx.tool.cli.Utils.UserError("No target specified");
      var targetClass = this.resolveTargetClass(data.target.type);
      if (!targetClass)
        throw new qx.tool.cli.Utils.UserError("Cannot find target class: " + data.target.type);
      var target = new targetClass(outputPath);
      if (data.target.uri)
        target.setTargetUri(data.target.uri);
      if (data.target.writeCompileInfo)
        target.setWriteCompileInfo(true);
      maker.setTarget(target);

      maker.setLocales(data.locales||[ "en" ]);
      if (data.writeAllTranslations)
        maker.setWriteAllTranslations(data.writeAllTranslations);
      
      if (typeof data.target.typescript == "string") {
        maker.set({ outputTypescript: true, outputTypescriptTo: data.target.typescript });
      } else if (typeof data.target.typescript == "boolean") {
        maker.set({ outputTypescript: true });
      }  
      if (this.argv["typescript"])
        maker.set({ outputTypescript: true });
      
      var environment = {};
      if (data.environment)
        Object.assign(environment, data.environment);
      if (data.target.environment)
        Object.assign(environment, data.target.environment);
      maker.setEnvironment(environment);
      
      if (data["path-mappings"]) {
        for (var from in data["path-mappings"]) {
          var to = data["path-mappings"][from];
          target.addPathMapping(from, to);
        }
      }
      
      function mergeArray(dest, ...srcs) {
        srcs.forEach(function(src) {
          if (src) {
            src.forEach(function(elem) {
              if (!qx.lang.Array.contains(dest, src))
                dest.push(elem);
            });
          }
        });
        return dest;
      }

      var addCreatedAt = data.target["addCreatedAt"] || t.argv["addCreatedAt"];
      if (addCreatedAt)
        maker.getAnalyser().setAddCreatedAt(true);

      var appNames = null;
      if (t.argv["app-name"])
        appNames = t.argv["app-name"].split(',');
      
      let hasFoundIndexHtmlToRoot = false;  
      data.applications.forEach(function(appData, appIndex) {
        if (appNames && appNames.indexOf(appData.name) == -1)
          return;
        var app = new qx.tool.compiler.app.Application(appData["class"]);
        [ "type", "theme", "name", "environment", "outputPath", "loaderTemplate"]
          .forEach((name) => {
            if (appData[name] !== undefined) {
              var fname = "set" + qx.lang.String.firstUp(name);
              app[fname](appData[name]);
            }
          });
        if (app.isBrowserApp() && appData.writeIndexHtmlToRoot) {
           if (hasFoundIndexHtmlToRoot) {
              throw new qx.tool.cli.Utils.UserError("Error: writeIndexHtmlToRoot=true is only allowed for one application!");
           }
           hasFoundIndexHtmlToRoot = true;  
           app.setWriteIndexHtmlToRoot(true);  
        }
        if (appData.uri)
          app.setSourceUri(appData.uri);
        if (appData.title)
          app.setTitle(appData.title);
        
        var minify = appData["minify"] || data.target["minify"] || t.argv["minify"];
        if (typeof minify == "boolean")
          minify = minify ? "minify" : "off";
        if (!minify)
          minify = "mangle";
        if (typeof target.setMinify == "function")
          target.setMinify(minify);
        var saveUnminified = appData["save-unminified"] || data.target["save-unminified"] || t.argv["save-unminified"];
        if (typeof saveUnminified == "boolean" && typeof target.setSaveUnminified == "function")
          target.setSaveUnminified(saveUnminified);

        var parts = appData.parts || data.target.parts || data.parts;
        if (parts) {
          if (!parts.boot)
            throw new qx.tool.cli.Utils.UserError("Cannot determine a boot part for application " + (appIndex + 1) + " " + (appData.name||""));
          for (var partName in parts) {
            var partData = parts[partName];
            var include = typeof partData.include == "String" ? [ partData.include ] : partData.include;
            var exclude = typeof partData.exclude == "String" ? [ partData.exclude ] : partData.exclude;
            var part = new qx.tool.compiler.app.Part(partName, include, exclude).set({
              combine: !!partData.combine,
              minify: !!partData.minify
            });
            app.addPart(part);
          }
        }
        app.set({
          exclude: mergeArray([], data.exclude, data.target.exclude, appData.exclude),
          include: mergeArray([], data.include, data.target.include, appData.include)
        });
        maker.addApplication(app);
      });

      maker.getAnalyser().addListener("compiledClass", function(evt) {
        var data = evt.getData();
        var data = evt.getData();
        var markers = data.dbClassInfo.markers;
        if (markers) {
          markers.forEach(function(marker) {
            var str = qx.tool.compiler.Console.decodeMarker(marker);
            t.warn(data.classFile.getClassName() + ": " + str);
          });
        }
      });
      
      return new Promise((resolve, reject) => {
        async.forEach(data.libraries,
            function(path, cb) {
              maker.addLibrary(path, cb);
            },
            function(err) {
              if (err)
                reject(err);
              else
                resolve(maker);
            });
      });
    },

    /**
     * Resolves the target class instance from the type name; accepts "source", "build", "hybrid" or
     * a class name
     * @param type {String}
     * @returns {Maker}
     */
    resolveTargetClass: function(type) {
      if (!type)
        return null;
      if (type.$$type == "Class")
        return type;
      if (type == "build")
        return qx.tool.compiler.targets.BuildTarget;
      if (type == "source")
        return qx.tool.compiler.targets.SourceTarget;
      if (type == "hybrid")
        return qx.tool.compiler.targets.HybridTarget;
      if (type == "typescript")
        throw new qx.tool.cli.Utils.UserError("Typescript targets are no longer supported - please use `typescript: true` in source target instead");
      if (type) {
        var targetClass;
        if (data.target.type.indexOf('.') < 0)
          targetClass = qx.Class.getByName("qx.tool.compiler.targets." + type);
        else
          targetClass = qx.Class.getByName(type);
        return targetClass;
      }
      return null;
    }
  },
  
  defer: function(statics) {
    qx.tool.compiler.Console.addMessageIds({
      "qx.tool.cli.compile.writingApplication": "Writing application %1",
      "qx.tool.cli.compile.minifyingApplication": "Minifying %1 %2"
    });
    qx.tool.compiler.Console.addMessageIds({
      "qx.tool.cli.compile.legacyFiles": "File %1 exists but is no longer used"
    }, "warning");

  }
});
