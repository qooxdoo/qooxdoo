/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2017 Christian Boulanger

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Boulanger (info@bibliograph.org, @cboulanger)

************************************************************************ */

require("./Command");

require("@qooxdoo/framework");
const fs = qx.tool.compiler.utils.Promisify.fs;
const path = require("upath");
const process = require("process");
const jsonlint = require("jsonlint");

/**
 * Handles library packages
 */
qx.Class.define("qx.tool.cli.commands.Package", {
  extend: qx.tool.cli.commands.Command,

  statics: {
    /**
     * The name of the file that caches the package registry
     */
    package_cache_name: "package-cache.json",
    /**
     * The yargs command data
     * @return {{}}
     */
    getYargsCommand: function() {
      return {
        command : "package <command> [options]",
        desc : "Manages qooxdoo packages",
        builder : function(yargs) {
          qx.tool.cli.Cli.addYargsCommands(yargs, [
            "Install",
            "List",
            "Publish",
            "Remove",
            "Update",
            "Upgrade"
          ], "qx.tool.cli.commands.package");

          return yargs
            .demandCommand()
            .showHelpOnFail()
            .help();
        },
        handler : function(argv) {
        }
      };
    }
  },

  members: {

    /**
     * The current cache object
     */
    __cache : null,

    /**
     * Returns the absolute path to the lockfile
     * @return {String}
     */
    getLockfilePath: function() {
      return path.join(process.cwd(), qx.tool.cli.ConfigSchemas.lockfile.filename);
    },

    /**
     * Deletes the lockfile
     * @return {Promise<void>}
     */
    async deleteLockfile() {
      await fs.unlinkAsync(this.getLockfilePath());
    },

    /**
     * Returns the library list from the lockfile
     * @return {Object}
     */
    getPackageData: async function() {
      let lockfile_path = this.getLockfilePath();
      if (!await fs.existsAsync(lockfile_path)) {
        return {
          version: qx.tool.cli.ConfigSchemas.lockfile.version,
          libraries: []
        };
      }
      return qx.tool.compiler.utils.Json.loadJsonAsync(lockfile_path);
    },

    /**
     * Returns the tag name of the given library in the given package, if installed.
     * Returns false if not installed.
     * @param {String} repo_name
     * @param {String} library_name
     * @return {String|false}
     */
    getInstalledLibraryTag : async function(repo_name, library_name) {
      let library = (await this.getPackageData()).libraries.find(lib => lib.repo_name === repo_name && lib.library_name === library_name);
      return library ? library.repo_tag : false;
    },

    /**
     * Returns the data of the given library, if installed.
     * Returns false if not installed.
     * @param {String} library_name
     * @return {Object|false}
     */
    getInstalledLibraryData : async function(library_name) {
      return (await this.getPackageData()).libraries.find(lib => lib.library_name === library_name);
    },

    /**
     * Returns the absolute path to the file that persists the cache object
     * @return {String}
     */
    getCachePath : function() {
      return path.join(qx.tool.cli.ConfigDb.getDirectory(), this.self(arguments).package_cache_name);
    },

    /**
     * Returns the URL of the package registry data on GitHub
     * TODO: rename repository
     * @return {String}
     */
    getRepositoryCacheUrl : function() {
      return "https://raw.githubusercontent.com/qooxdoo/qx-contrib/master/cache.json";
    },

    /**
     * Returns the cache object, retrieving it from a local file if necessary
     * @return {Object}
     */
    getCache : function(readFromFile = false) {
      if (!readFromFile && this.__cache && typeof this.__cache == "object") {
        return this.__cache;
      }
      try {
        this.__cache = jsonlint.parse(fs.readFileSync(this.getCachePath(), "UTF-8"));
      } catch (e) {
        this.__cache = {
          repos : {
            list : [],
            data : {}
          },
          compat : {}
        };
      }
      return this.__cache;
    },

    /**
     * Manually overwrite the cache data
     * @param data {Object}
     * @return {void}
     */
    setCache : function(data) {
      this.__cache = data;
    },

    /**
     * Saves the cache to a hidden local file
     * @return {void}
     */
    saveCache : async function() {
      await qx.tool.cli.Utils.makeParentDir(this.getCachePath());
      await fs.writeFileAsync(this.getCachePath(), JSON.stringify(this.__cache, null, 2), "UTF-8");
    },

    /**
     * Exports the cache to an external file. Note that the structure of the cache
     * data can change any time. Do not build anything on it. You have been warned.
     * @param path {String}
     * @return {void}
     */
    exportCache : async function(path) {
      return fs.writeFileAsync(path, JSON.stringify(this.__cache, null, 2), "UTF-8")
        .catch(e => console.error(`Error exporting cache to ${path}:` + e.message));
    },

    /**
     * Clears the cache
     */
    clearCache : function() {
      this.__cache = null;
      try {
        fs.unlinkSync(this.getCachePath());
      } catch (e) {}
    }
  }
});
