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
const fs = qx.tool.utils.Promisify.fs;
const path = require("upath");
const process = require("process");
const stringify = require("json-stable-stringify");

/**
 * Handles library packages
 */
qx.Class.define("qx.tool.cli.commands.Package", {
  extend: qx.tool.cli.commands.Command,

  statics: {
    /**
     * The name of the directory in which to download the package files
     */
    cache_dir: "qx_packages",

    /**
     * The name of the file that caches the package registry
     */
    package_cache_name: "package-cache.json",

    /**
     * The lockfile with library versions etc.
     */
    lockfile: {
      filename: "qx-lock.json"
    },

    /**
     * The URL of the cached repository data
     */
    repository_cache_url:
      "https://raw.githubusercontent.com/qooxdoo/package-cache/master/cache.json",

    /**
     * The yargs command data
     * @return {{}}
     */
    getYargsCommand() {
      return {
        command: "package <command> [options]",
        desc: "manages qooxdoo packages",
        builder: yargs => {
          qx.tool.cli.Cli.addYargsCommands(
            yargs,
            [
              "Install",
              "List",
              "Publish",
              "Remove",
              "Update",
              "Upgrade",
              "Migrate"
            ],

            "qx.tool.cli.commands.package"
          );

          return yargs.showHelpOnFail().help();
        },
        handler() {
          // Nothing
        }
      };
    }
  },

  members: {
    /**
     * The current cache object
     */
    __cache: null,

    /**
     * @override
     */
    async checkMigrations() {},

    /**
     * Returns the absolute path to the lockfile.
     * @return {String}
     */
    getLockfilePath() {
      return path.join(process.cwd(), qx.tool.config.Lockfile.config.fileName);
    },

    /**
     * Deletes the lockfile
     * @return {Promise<void>}
     */
    async deleteLockfile() {
      await fs.unlinkAsync(this.getLockfilePath());
    },

    /**
     * Returns the lockfile data. Deprecated. Use {@link qx.tool.cli.commands.Package#getLockfileModel}
     * @deprecated
     * @return {Object}
     */
    async getLockfileData() {
      return (await this.getLockfileModel()).getData();
    },

    /**
     * Returns the model of the lockfile
     * @return {Promise<qx.tool.config.Lockfile>}
     */
    async getLockfileModel() {
      return qx.tool.config.Lockfile.getInstance().load();
    },

    /**
     * Returns the model of the manifest
     * @return {Promise<qx.tool.config.Manifest>}
     */
    async getManifestModel() {
      return qx.tool.config.Manifest.getInstance().load();
    },

    /**
     * Convenience method to return all config file models as an array
     * @return {Array} containing [{qx.tool.config.Manifest}, {qx.tool.config.Lockfile}, {qx.tool.config.Compile}]
     */
    async _getConfigData() {
      return [await this.getManifestModel(), await this.getLockfileModel()];
    },

    /**
     * Save configuration data if their content has changed
     * @return {Promise<void>}
     * @private
     */
    async _saveConfigData() {
      const [manifestModel, lockfileModel] = await this._getConfigData();
      if (this.argv.save && manifestModel.isDirty()) {
        await manifestModel.save();
        if (this.argv.verbose) {
          qx.tool.compiler.Console.info(
            `>>> Saved dependency data to ${manifestModel.getRelativeDataPath()}`
          );
        }
      }
      if (lockfileModel.isDirty()) {
        await lockfileModel.save();
        if (this.argv.verbose) {
          qx.tool.compiler.Console.info(
            `>>> Saved library data to ${lockfileModel.getRelativeDataPath()}`
          );
        }
      }
    },

    /**
     * Returns the tag name of the given library in the given package, if installed.
     * Returns false if not installed.
     * @param {String} repo_name
     * @param {String} library_name
     * @return {String|false}
     */
    async getInstalledLibraryTag(repo_name, library_name) {
      let library = (await this.getLockfileModel())
        .getValue("libraries")
        .find(
          lib =>
            lib.repo_name === repo_name && lib.library_name === library_name
        );

      return library ? library.repo_tag : false;
    },

    /**
     * Returns the data of the given library, if installed.
     * Returns false if not installed.
     * @param {String} library_name
     * @return {Object|false}
     */
    async getInstalledLibraryData(library_name) {
      return (await this.getLockfileModel())
        .getValue("libraries")
        .find(lib => lib.library_name === library_name);
    },

    /**
     * Returns the absolute path to the file that persists the cache object
     * @return {String}
     */
    getCachePath() {
      return path.join(
        qx.tool.cli.ConfigDb.getDirectory(),
        this.self(arguments).package_cache_name
      );
    },

    /**
     * Returns the URL of the package registry data on GitHub
     * @return {String}
     */
    getRepositoryCacheUrl() {
      return this.self(arguments).repository_cache_url;
    },

    /**
     * Returns the cache object, retrieving it from a local file if necessary
     * @return {Object}
     * @todo use config model API for cache file
     */
    getCache(readFromFile = false) {
      if (!readFromFile && this.__cache && typeof this.__cache == "object") {
        return this.__cache;
      }
      try {
        this.__cache = JSON.parse(
          fs.readFileSync(this.getCachePath(), "UTF-8")
        );
      } catch (e) {
        this.__cache = {
          repos: {
            list: [],
            data: {}
          },

          compat: {}
        };
      }
      return this.__cache;
    },

    /**
     * Manually overwrite the cache data
     * @param data {Object}
     * @return {void}
     */
    setCache(data) {
      this.__cache = data;
    },

    /**
     * Saves the cache to a hidden local file
     * @return {void}
     */
    async saveCache() {
      await qx.tool.utils.Utils.makeParentDir(this.getCachePath());
      await fs.writeFileAsync(
        this.getCachePath(),
        JSON.stringify(this.__cache, null, 2),
        "UTF-8"
      );
    },

    /**
     * Exports the cache to an external file. Note that the structure of the cache
     * data can change any time. Do not build anything on it. You have been warned.
     * @param path {String}
     * @return {void}
     */
    async exportCache(path) {
      try {
        let cache = this.__cache || this.getCache(true);
        let data = stringify(cache, { space: 2 });
        await fs.writeFileAsync(path, data, "UTF-8");
      } catch (e) {
        qx.tool.compiler.Console.error(
          `Error exporting cache to ${path}:` + e.message
        );

        process.exit(1);
      }
    },

    /**
     * Clears the cache
     */
    clearCache() {
      this.__cache = null;
      try {
        fs.unlinkSync(this.getCachePath());
      } catch (e) {}
    }
  }
});
