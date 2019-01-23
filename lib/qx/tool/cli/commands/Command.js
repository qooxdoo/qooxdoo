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

require("qooxdoo");
const process = require("process");
const child_process = require("child_process");
const path = require("upath");
const semver = require("semver");
const JsonToAst = require("json-to-ast");

const fs = qx.tool.compiler.utils.Promisify.fs;
require("../Utils");

/**
 * Base class for commands
 */
qx.Class.define("qx.tool.cli.commands.Command", {
  extend: qx.core.Object,

  statics:{
    TEMPLATE_DIR: path.join(__dirname, "../../../../../tool/cli/templates"),
    NODE_MODULES_DIR: path.join(__dirname, "../../../../../node_modules")
  },

  construct: function(argv) {
    this.base(arguments);
    this.argv = argv;
    if (argv.verbose) {
      qx.tool.cli.LogAppender.setMinLevel("debug");
    }
  },

  members: {
    argv: null,

    /**
     * Returns data on the project in which the CLI commands are executed. If a qooxdoo.json file
     * exists, the data is taken from there. If not, it tries the following:
     * 1) If a Manifest.json exists in the current dir, it is assumed to be the main library dir.
     * 2) if a compile.json file exists in the current dir, it is assumed to be the application dir
     * 3) if not, the subdir demo/default is checked for a compile.json file.
     *
     * @return {Promise(Object)} A promise that resolves to a map containing the following keys:
     * 'libraries': an array of maps containing a 'path' property with a relative path to a library folder,
     * 'applications': an array of maps containing a 'path' property with a realtive path to an
     * application folder. If no project data can be determined, resolves to an empty map.
     */
    getProjectData : async function() {
      let qooxdooJsonPath = path.join(process.cwd(), "qooxdoo.json");
      let data = {};
      if (await fs.existsAsync(qooxdooJsonPath)) {
        data = await this.parseJsonFile(qooxdooJsonPath);
      } else {
        if (await fs.existsAsync(path.join(process.cwd(), "Manifest.json"))) {
          data.libraries = [{path : "."}];
        }
        if (await fs.existsAsync(path.join(process.cwd(), "compile.json"))) {
          data.applications = [{path : "."}];
        } else if (await fs.existsAsync(path.join(process.cwd(), "demo/default/compile.json"))) {
          data.applications = [{path : "demo/default"}];
        }
      }
      return data;
    },

    /**
     * Returns the path to the current library. If the current directory contains several libraries,
     * the first one found is returned.
     * @throws {Error} Throws an error if no library can be found.
     * @return {Promise(String)} A promise that resolves with the absolute path to the library
     */
    getLibraryPath: async function() {
      let {libraries} = await this.getProjectData();
      if (libraries instanceof Array && libraries.length) {
        return path.resolve(process.cwd(), libraries[0].path);
      }
      throw new qx.tool.cli.Utils.UserError("Cannot find library path - are you in the right directory?");
    },

    /**
     * Returns the path to the current application, depending on the current
     * working directory. If a directory contains several applications, the first one found is
     * returned.
     * @throws {Error} Throws an error if no application can be found.
     * @return {Promise(String)} A promise that resolves with the absolute path to the application
     */
    getApplicationPath: async function() {
      let {applications} = await this.getProjectData();
      if (applications instanceof Array && applications.length) {
        return path.resolve(process.cwd(), applications[0].path);
      }
      throw new qx.tool.cli.Utils.UserError("Cannot find application path - are you in the right directory?");
    },

    /**
     * Return the content of a json file in the library as an object.
     * @param {String} filePath absolute path to the file
     * @throws {Error} Throws if file cannot be parsed.
     * @return {Promise(Object)}
     */
    parseJsonFile : async function(filePath) {
      var data = await fs.readFileAsync(filePath, "utf8");
      try {
        let compileAst = JsonToAst.parseToAst(data, {verbose: true});
        let compileJson = JsonToAst.astToObject(compileAst);
        return compileJson;
      } catch (e) {
        throw new qx.tool.cli.Utils.UserError(`Cannot parse ${filePath}:` + e.message);
      }
    },

    /**
     * Returns the content of the Manifest.json file as an object.
     * @throws {Error} Throws if library cannot be found or file cannot be parsed.
     * @return {Promise(Object)}
     */
    parseManifest : async function() {
      let manifestPath = path.join(await this.getLibraryPath(), "Manifest.json");
      return await this.parseJsonFile(manifestPath);
    },

    /**
     * Returns the content of the compile.json file as an object.
     * @throws {Error} Throws if application cannot be found or file cannot be parsed.
     * @return {Promise(Object)} The compile configuration data
     */
    parseCompileConfig : async function() {
      let compileJsonPath = path.join(await this.getApplicationPath(), "compile.json");
      return await this.parseJsonFile(compileJsonPath);
    },

    /**
     * Returns the absolute path to the qooxdoo framework used by the current project
     * @return {Promise(String)} Promise that resolves with the path {String}
     */
    getAppQxPath : async function() {
      let compileJsonPath = null;
      try {
        path.join(await this.getApplicationPath(), "compile.json");
      } catch (ex) {
        // Nothing - cannot find compile.json
      }
      if (compileJsonPath && await fs.existsAsync(compileJsonPath)) {
        let compileConfig = await this.parseCompileConfig();
        let qxpath = false;
        let appPath = await this.getApplicationPath();
        if (compileConfig.libraries) {
          for (let somepath of compileConfig.libraries) {
            let manifestPath = somepath;
            if (!path.isAbsolute(somepath)) {
              manifestPath = path.join(appPath, manifestPath);
            }
            manifestPath = path.join(manifestPath, "Manifest.json");
            let manifest = await this.parseJsonFile(manifestPath);
            try {
              if (manifest.provides.namespace === "qx") {
                qxpath = path.dirname(manifestPath);
                return qxpath;
              }
            } catch (e) {
              console.warn(`Invalid manifest file ${manifestPath}.`);
            }
          }
        }
      }
      return this.getGlobalQxPath();
    },

    getGlobalQxPath: async function() {
      // Config override
      let cfg = await qx.tool.cli.ConfigDb.getInstance();
      let dir = cfg.db("qx.library");
      if (dir) {
        let manifestPath = path.join(dir, "Manifest.json");
        if (await fs.existsAsync(manifestPath)) {
          return dir;
        }
      }

      // This project's node_modules
      if (await fs.existsAsync("node_modules/qooxdoo-sdk/framework/Manifest.json")) {
        return path.resolve("node_modules/qooxdoo-sdk/framework");
      }

      // The compiler's qooxdoo
      let filename = require.resolve("qooxdoo-sdk/package.json");
      return path.join(path.dirname(filename), "framework");
    },

    /**
     * Returns the absolute path to the qooxdoo framework used by the current project, unless
     * the user provided a CLI option "qxpath", in which case this value is returned.
     * @return {Promise(String)} Promise that resolves with the absolute path
     */
    getUserQxPath : async function() {
      let qxpath = await this.getAppQxPath();
      return path.isAbsolute(qxpath) ? qxpath : path.resolve(qxpath);
    },

    /**
     * Returns the version of the qooxdoo framework used by the current project
     * @throws {Error} If the version cannot be determined
     * @return {Promise(String)} Promise that resolves with the version string
     */
    getUserQxVersion : async function() {
      let qxpath = await this.getUserQxPath();
      let qxversion = await this.getLibraryVersion(qxpath);
      return qxversion;
    },

    /**
     * Given the path to a library folder, returns the library version from its manifest
     * @param {String} libPath
     * @return {String} Version
     */
    getLibraryVersion : async function(libPath) {
      let manifestPath = path.join(libPath, "Manifest.json");
      let manifest = await this.parseJsonFile(manifestPath);
      let version;
      try {
        version = manifest.info.version;
      } catch (e) {
        throw new qx.tool.cli.Utils.UserError(`No valid version data in manifest.`);
      }
      if (!semver.valid(version)) {
        throw new qx.tool.cli.Utils.UserError(`Manifest at ${manifestPath} contains invalid version number "${version}". Please use a semver compatible version.`);
      }
      return version;
    },

    /**
     * Method that is called to do the actual work of the subclass.
     * Stub to be overridden.
     */
    process: function() {
      throw new Error("No implementation for " + this.classname + ".process");
    },

    /**
     * Awaitable wrapper around child_process.spawn.
     * Runs a command in a separate process. The output of the command
     * is ignored. Throws when the exit code is not 0.
     * @param  {String} cmd Name of the command
     * @param  {Array} args Array of arguments to the command
     * @return {Promise} A promise that resolves with the exit code
     */
    run : function(cmd, args) {
      let opts = {env: process.env};
      return new Promise((resolve, reject) => {
        let exe = child_process.spawn(cmd, args, opts);
        // suppress all output unless in verbose mode
        exe.stdout.on("data", data => {
          if (this.argv.verbose) {
            console.log(data.toString());
          }
        });
        exe.stderr.on("data", data => {
          if (this.argv.verbose) {
            console.error(data.toString());
          }
        });
        exe.on("close", code => {
          if (code !== 0) {
            let message = `Error executing ${cmd.join(" ")}. Use --verbose to see what went wrong.`;
            throw new qx.tool.cli.Utils.UserError(message);
          } else {
            resolve(0);
          }
        });
        exe.on("error", reject);
      });
    },

    /**
     * Awaitable wrapper around child_process.exec
     * Executes a command and return its result wrapped in a Promise.
     * @param cmd {String} Command with all parameters
     * @return {Promise} Promise that resolves with the result
     */
    exec : function(cmd) {
      return new Promise((resolve, reject) => {
        child_process.exec(cmd, (err, stdout, stderr) => {
          if (err) {
            reject(err);
          }
          if (stderr) {
            reject(new Error(stderr));
          }
          resolve(stdout);
        });
      });
    },

    /**
     * Returns the absolute path to the tempate directory
     * @return {String}
     */
    getTemplateDir : function() {
      return qx.tool.cli.commands.Command.TEMPLATE_DIR;
    },

    /**
     * Returns the absolute path to the node_module directory
     * @return {String}
     * not used
     */
    getNodeModuleDir : function() {
      return qx.tool.cli.commands.Command.NODE_MODULES_DIR;
    }
  }
});
