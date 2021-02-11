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
const fs = qx.tool.utils.Promisify.fs;
const process = require("process");
const child_process = require("child_process");
const path = require("upath");
const semver = require("semver");
const replace_in_file = require("replace-in-file");

/**
 * Base class for commands
 */
qx.Class.define("qx.tool.cli.commands.Command", {
  extend: qx.core.Object,

  construct: function(argv) {
    this.base(arguments);
    this.argv = argv;
  },

  properties: {
    /**
     * A reference to the current compilerApi instance
     * @var {qx.tool.cli.api.CompilerApi}
     */
    compilerApi: {
      check: "qx.tool.cli.api.CompilerApi",
      nullable: true
    }
  },

  members: {
    argv: null,
    compileJs: null,

    async process() {
      let argv = this.argv;
      if (argv.set) {
        let configDb = await qx.tool.cli.ConfigDb.getInstance();
        argv.set.forEach(function(kv) {
          var m = kv.match(/^([^=\s]+)(=(.+))?$/);
          if (m) {
            var key = m[1];
            var value = m[3];
            configDb.setOverride(key, value);
          } else {
            throw new Error(`Failed to parse environment setting commandline option '--set ${kv}'`);
          }
        });
      }

      // check if we have to migrate files
      await (new qx.tool.cli.commands.package.Migrate(this.argv)).process(true);
    },

    /**
     * This is to notify the commands after loading the full args.
     * The commands can overload special arg arguments here.
     * e.g. Deploy will will overload the target.
     *
     * @param {*} argv : args to procvess
     *
     */
    processArgs: function(argv) {
      // Nothing
    },

    /**
     * Returns data on the project in which the CLI commands are executed. If a qooxdoo.json file
     * exists, the data is taken from there. If not, it tries the following:
     * 1) If a Manifest.json exists in the current dir, it is assumed to be the main library dir.
     * 2) if a compile.json file exists in the current dir, it is assumed to be the application dir
     * 3) if not, the subdir demo/default is checked for a compile.json file.
     *
     * @return {Promise<Object>} A promise that resolves to a map containing the following keys:
     * 'libraries': an array of maps containing a 'path' property with a relative path to a library folder,
     * 'applications': an array of maps containing a 'path' property with a relative path to an
     * application folder. If no project data can be determined, resolves to an empty map.
     */
    getProjectData : async function() {
      let qooxdooJsonPath = path.join(process.cwd(), qx.tool.config.Registry.config.fileName);
      let data = {
        libraries: [],
        applications: []
      };
      if (await fs.existsAsync(qooxdooJsonPath)) {
        let qooxdooJson = await qx.tool.utils.Json.loadJsonAsync(qooxdooJsonPath);
        if (qx.lang.Type.isArray(qooxdooJson.libraries)) {
          data.libraries = qooxdooJson.libraries;
        }
        if (qx.lang.Type.isArray(qooxdooJson.applications)) {
          data.applications = qooxdooJson.applications;
        }
      }
      if (await fs.existsAsync(path.join(process.cwd(), qx.tool.config.Manifest.config.fileName))) {
        if (!data.libraries.find(lib => lib.path === ".")) {
          data.libraries.push({path : "."});
        }
      }
      if (await fs.existsAsync(path.join(process.cwd(), qx.tool.config.Compile.config.fileName))) {
        if (!data.applications.find(app => app.path === ".")) {
          data.applications.push({path : "."});
        }
      }
      return data;
    },

    /**
     * Returns the path to the current library. If the current directory contains several libraries,
     * the first one found is returned.
     * @throws {Error} Throws an error if no library can be found.
     * @return {String} A promise that resolves with the absolute path to the library
     */
    getLibraryPath: async function() {
      let {libraries} = await this.getProjectData();
      if (libraries instanceof Array && libraries.length) {
        return path.resolve(process.cwd(), libraries[0].path);
      }
      throw new qx.tool.utils.Utils.UserError("Cannot find library path - are you in the right directory?");
    },

    /**
     * Returns the path to the current application, depending on the current
     * working directory. If a directory contains several applications, the first one found is
     * returned.
     * @throws {Error} Throws an error if no application can be found.
     * @return {Promise<String>} A promise that resolves with the absolute path to the application
     */
    getApplicationPath: async function() {
      let {applications} = await this.getProjectData();
      if (applications instanceof Array && applications.length) {
        return path.resolve(process.cwd(), applications[0].path);
      }
      throw new qx.tool.utils.Utils.UserError("Cannot find application path - are you in the right directory?");
    },

    /**
     * Returns the absolute path to the qooxdoo framework used by the current project
     * @return {Promise<String>} Promise that resolves with the path {String}
     */
    getAppQxPath : async function() {
      if (!await fs.existsAsync(path.join(process.cwd(), qx.tool.config.Compile.config.fileName))) {
        return this.getGlobalQxPath();
      }
      let compileConfig = await qx.tool.config.Compile.getInstance().load();
      let qxpath = false;
      let appPath = await this.getApplicationPath();
      let libraries = compileConfig.getValue("libraries");
      if (libraries) {
        for (let somepath of libraries) {
          let manifestPath = somepath;
          if (!path.isAbsolute(somepath)) {
            manifestPath = path.join(appPath, manifestPath);
          }
          manifestPath = path.join(manifestPath, qx.tool.config.Manifest.config.fileName);
          let manifest = await qx.tool.utils.Json.loadJsonAsync(manifestPath);
          try {
            if (manifest.provides && manifest.provides.namespace === "qx") {
              qxpath = path.dirname(manifestPath);
              return qxpath;
            }
          } catch (e) {
            qx.tool.compiler.Console.warn(`Invalid manifest file ${manifestPath}.`);
          }
        }
      }
      return this.getGlobalQxPath();
    },

    /**
     * Returns a promise that resolves to the path to the qooxdoo library
     * @return {Promise<*|never|string>}
     */
    getGlobalQxPath: async function() {
      if (!this.argv["block-global-framework"]) {
        // Config override
        let cfg = await qx.tool.cli.ConfigDb.getInstance();
        let dir = cfg.db("qx.library");
        if (dir) {
          let manifestPath = path.join(dir, qx.tool.config.Manifest.config.fileName);
          if (await fs.existsAsync(manifestPath)) {
            return dir;
          }
        }
      }
      // This project's node_modules
      if (await fs.existsAsync("node_modules/@qooxdoo/framework/" + qx.tool.config.Manifest.config.fileName)) {
        return path.resolve("node_modules/@qooxdoo/framework");
      }

      // The compiler's qooxdoo
      let filename = require.resolve("@qooxdoo/framework/package.json");
      return path.dirname(filename);
    },

    /**
     * Returns the absolute path to the qooxdoo framework used by the current project, unless
     * the user provided a CLI option "qxpath", in which case this value is returned.
     * @return {Promise<String>} Promise that resolves with the absolute path
     */
    getUserQxPath : async function() {
      let qxpath = await this.getAppQxPath();
      return path.isAbsolute(qxpath) ? qxpath : path.resolve(qxpath);
    },

    /**
     * Returns the version of the qooxdoo framework used by the current project
     * @throws {Error} If the version cannot be determined
     * @return {Promise<String>} Promise that resolves with the version string
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
      let manifestPath = path.join(libPath, qx.tool.config.Manifest.config.fileName);
      let manifest = await qx.tool.utils.Json.loadJsonAsync(manifestPath);
      let version;
      try {
        version = manifest.info.version;
      } catch (e) {
        throw new qx.tool.utils.Utils.UserError(`No valid version data in manifest.`);
      }
      if (!semver.valid(version)) {
        throw new qx.tool.utils.Utils.UserError(`Manifest at ${manifestPath} contains invalid version number "${version}". Please use a semver compatible version.`);
      }
      return version;
    },

    /**
     * Awaitable wrapper around child_process.spawn.
     * Runs a command in a separate process. The output of the command
     * is ignored. Throws when the exit code is not 0.
     * @param  {String} cmd Name of the command
     * @param  {Array} args Array of arguments to the command
     * @return {Promise<Number>} A promise that resolves with the exit code
     */
    run : function(cmd, args) {
      let opts = {env: process.env};
      return new Promise((resolve, reject) => {
        let exe = child_process.spawn(cmd, args, opts);
        // suppress all output unless in verbose mode
        exe.stdout.on("data", data => {
          if (this.argv.verbose) {
            qx.tool.compiler.Console.log(data.toString());
          }
        });
        exe.stderr.on("data", data => {
          if (this.argv.verbose) {
            qx.tool.compiler.Console.error(data.toString());
          }
        });
        exe.on("close", code => {
          if (code !== 0) {
            let message = `Error executing '${cmd} ${args.join(" ")}'. Use --verbose to see what went wrong.`;
            throw new qx.tool.utils.Utils.UserError(message);
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
     * @return {Promise<String>} Promise that resolves with the result
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
     * Returns the absolute path to the template directory
     * @return {String}
     */
    getTemplateDir : function() {
      let dir = qx.util.ResourceManager.getInstance().toUri("qx/tool/cli/templates/template_vars.js");
      dir = path.dirname(dir);
      return dir;
    },

    /**
     * Returns the absolute path to the node_module directory
     * @return {String}
     * not used
     */
    getNodeModuleDir : function() {
      return qx.tool.cli.commands.Command.NODE_MODULES_DIR;
    },

    /**
     * Detects whether the command line explicit set an option (as opposed to yargs
     * providing a default value).  Note that this does not handle aliases, use the
     * actual, full option name.
     *
     * @param option {String} the name of the option, eg "listen-port"
     * @return {Boolean}
     */
    isExplicitArg(option) {
      function searchForOption(option) {
        return process.argv.indexOf(option) > -1;
      }
      return searchForOption(`-${option}`) || searchForOption(`--${option}`);
    },

    /**
     * Given an array of [newPath,oldPath], return those array which need to be
     * renamed.
     * @param fileList {[]}
     * @return []
     */
    checkFilesToRename(fileList) {
      let filesToRename = [];
      for (let [newPath, oldPath] of fileList) {
        if (!fs.existsSync(newPath) && fs.existsSync(oldPath)) {
          filesToRename.push([newPath, oldPath]);
        }
      }
      return filesToRename;
    },

    /**
     * Migrate files/schemas or announces the migration.
     * @param {String[]} fileList Array containing arrays of [new name, old name]
     * @param {String[]} replaceInFilesArr Optional array containing objects compatible with https://github.com/adamreisnz/replace-in-file
     * @param {Boolean} annouceOnly If true, annouce the migration. If false (default), just apply it.
     * @private
     */
    async migrate(fileList, replaceInFilesArr=[], annouceOnly=false) {
      let quiet = this.argv.quiet;
      if (qx.lang.Type.isArray(fileList)) {
        let filesToRename = this.checkFilesToRename(fileList);
        if (filesToRename.length) {
          if (annouceOnly) {
            // announce migration
            qx.tool.compiler.Console.warn(`*** Warning: Some metadata filenames have changed. The following files will be renamed:`);
            for (let [newPath, oldPath] of filesToRename) {
              qx.tool.compiler.Console.warn(`    '${oldPath}' => '${newPath}'.`);
            }
          } else {
            // apply migration
            for (let [newPath, oldPath] of filesToRename) {
              try {
                await fs.renameAsync(oldPath, newPath);
                if (!quiet) {
                  qx.tool.compiler.Console.info(`Renamed '${oldPath}' to '${newPath}'.`);
                }
              } catch (e) {
                qx.tool.compiler.Console.error(`Renaming '${oldPath}' to '${newPath}' failed: ${e.message}.`);
                process.exit(1);
              }
            }
          }
        }
      }
      if (qx.lang.Type.isArray(replaceInFilesArr) && replaceInFilesArr.length) {
        for (let replaceInFiles of replaceInFilesArr) {
          if (annouceOnly) {
            qx.tool.compiler.Console.warn(`*** In the file(s) ${replaceInFiles.files}, '${replaceInFiles.from}' will be changed to '${replaceInFiles.to}'.`);
            return;
          }
          try {
            let results = await replace_in_file(replaceInFiles);
            if (!quiet) {
              let files = results.filter(result => result.hasChanged).map(result => result.file);
              qx.tool.compiler.Console.info(`The following files were changed: ${files.join(", ")}`);
            }
          } catch (e) {
            qx.tool.compiler.Console.error(`Error replacing in files: ${e.message}`);
            process.exit(1);
          }
        }
      }
    }
  }
});
