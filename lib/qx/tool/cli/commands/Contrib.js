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

require("qooxdoo");
const fs = qx.tool.compiler.utils.Promisify.fs;
const path = require("upath");
const process = require("process");
const jsonlint = require("jsonlint");

/**
 * Handles contrib libraries
 */
qx.Class.define("qx.tool.cli.commands.Contrib", {
  extend: qx.tool.cli.commands.Command,

  statics: {

    getYargsCommand: function() {
      return {
        command : "contrib <command> [options]",
        desc : "Manages qooxdoo contrib libraries",
        builder : function(yargs) {
          qx.tool.cli.Cli.addYargsCommands(yargs, [
            "Install",
            "List",
            "Publish",
            "Remove",
            "Update",
            "Upgrade"
          ], "qx.tool.cli.commands.contrib");

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
     * Returns the absolute path to the contrib.json file
     * @return {String}
     */
    getContribFileName: function() {
      return path.join(process.cwd(), "contrib.json");
    },

    /**
     * Returns the library list from the contrib file
     * @return {Object}
     */
    getContribData: async function() {
      let contrib_json_path = this.getContribFileName();
      if (!await fs.existsAsync(contrib_json_path)) {
        return {libraries : []};
      }
      return qx.tool.compiler.utils.Json.loadJsonAsync(contrib_json_path);
    },

    /**
     * Returns the tag name of the given library in the given contrib repository, if installed.
     * Returns false if not installed.
     * @param {String} repo_name
     * @param {String} library_name
     * @return {String|false}
     */
    getInstalledTagName : async function(repo_name, library_name) {
      let library = (await this.getContribData()).libraries.find(lib => lib.repo_name == repo_name && lib.library_name == library_name);
      return library ? library.repo_tag : false;
    },

    /**
     * Returns the absolute path to the file that persists the cache object
     * @return {String}
     */
    getCachePath : function() {
      return path.join(qx.tool.cli.ConfigDb.getDirectory(), "contrib-cache.json");
    },

    /**
     * Returns the URL of the cache data in the qx-contrib repository
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
