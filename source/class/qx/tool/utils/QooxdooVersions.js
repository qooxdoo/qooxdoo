/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2023 Zenesis Limited https://www.zenesis.com

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * John Spackman (@johnspackman)

************************************************************************ */

const semver = require("semver");
const path = require("upath");
const fs = qx.tool.utils.Promisify.fs;

qx.Class.define("qx.tool.utils.QooxdooVersions", {
  extend: qx.core.Object,

  construct() {
    super();
  },

  members: {
    /** @type{*} saee GitHub API */
    __githubTags: null,

    /** @type{*} database of best matches */
    __db: null,

    /**
     * Gets the tags from Github so we can find releases
     *
     * @returns {*} see GitHub API
     */
    async _getTags() {
      if (!this.__githubTags) {
        this.__githubTags = await qx.tool.utils.Http.getJson(
          "https://api.github.com/repos/qooxdoo/qooxdoo/tags"
        );
      }
      return this.__githubTags;
    },

    /**
     * Returns the filename for the cache database
     *
     * @returns {String}
     */
    __getFilename() {
      return path.join(
        qx.tool.cli.ConfigDb.getDirectory(),
        "versions",
        "versions.txt"
      );
    },

    /**
     * Opens the cache database if there is one
     */
    async _open() {
      if (this.__db) {
        return this.__db;
      }

      try {
        let data = await fs.promises.readFile(this.__getFilename(), "utf8");
        this.__db = JSON.parse(data);
      } catch (ex) {
        if (ex.errno !== "ENOENT") {
          throw ex;
        }
        this.__db = {};
      }
    },

    /**
     * Saves the database
     */
    async save() {
      if (!this.__db) {
        await fs.promises.unlink(this.__getFilename());
      } else {
        await fs.promises.writeFile(
          this.__getFilename(),
          JSON.stringify(this.__db, null, 2),
          "utf8"
        );
      }
    },

    /**
     * Erases the database
     */
    async clean() {
      this.__db = {};
      try {
        await fs.promises.rm(
          path.join(qx.tool.cli.ConfigDb.getDirectory(), "versions"),
          {
            recursive: true,
            force: true
          }
        );
      }catch(ex) {
        // Nothing - exception is thrown if the directory does not exist
      }
    },

    /**
     * Finds the best version of Qooxdoo which is available, whether it is at Github as a release, or the
     * default Qooxdoo that is provided by this compiler instance
     *
     * @param {String} versionToMatch semver satisfaction sequence, eg "^7.0.0"
     * @returns {String} the directory where the Qooxdoo installation is
     */
    async findBestVersion(versionToMatch) {
      const Console = qx.tool.compiler.Console.getInstance();

      let defaultVersion = await qx.tool.config.Utils.getQxVersion();
      if (semver.satisfies(defaultVersion, versionToMatch)) {
        let qxpath = await this.getQxPath();
        return qxpath;
      }

      await this._open();
      if (this.__db.versions[versionToMatch]) {
        let dirname = this.__db.versions[versionToMatch];
        if (fs.existsSync(dirname)) {
          return dirname;
        }
        delete this.__db.versions[versionToMatch];
      }

      await this._getTags();
      for (let tag of this.__githubTags) {
        let match = tag.name.match(/^v([0-9]+\.[0-9]+\.[0-9]+)$/);
        if (match) {
          let version = match[1];
          if (semver.satisfies(version, versionToMatch)) {
            let dirname = path.join(
              qx.tool.cli.ConfigDb.getDirectory(),
              "versions",
              "v" + version
            );

            if (!fs.existsSync(path.join(dirname, ".download-success"))) {
              await fs.promises.rm(dirname, {
                recursive: true,
                force: true
              });

              let zipFilename = dirname + ".zip";
              Console.log(
                `Downloading Qooxdoo v${version} to satisfy ${versionToMatch}...`
              );

              await qx.tool.utils.Http.downloadToFile(
                tag.zipball_url,
                zipFilename
              );

              await qx.tool.utils.Zip.unzip(zipFilename, null, filename =>
                filename.replace(
                  /^qooxdoo-qooxdoo-[a-z0-9]+\//,
                  dirname + path.sep
                )
              );

              await fs.promises.writeFile(
                path.join(dirname, ".download-success"),
                new Date().toString(),
                "utf-8"
              );
            }
            this.__db.versions[versionToMatch] = path.resolve(dirname);
            await this.save();
            return dirname;
          }
        }
      }
      throw new Error(
        `Cannot find a released version of Qooxdoo which is compatible with ${versionToMatch}`
      );
    }
  }
});
