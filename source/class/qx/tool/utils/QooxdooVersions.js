qx.Class.define("qx.tool.utils.QooxdooVersions", {
  extend: qx.core.Object,

  construct() {
    super();
  },

  members: {
    __githubTags: null,

    /**
     * Gets the tags from Github so we can find releases
     *
     * @returns {*} see GitHub API
     */
    async _getTags() {
      if (!this.__githubTags) {
        this.__githubTags = qxGithubTags = await qx.tool.utils.Http.getJson(
          "https://api.github.com/repos/qooxdoo/qooxdoo/tags"
        );
      }
      return this.__githubTags;
    },

    /**
     * Finds the best version of Qooxdoo which is available, whether it is at Github as a release, or the
     * default Qooxdoo that is provided by this compiler instance
     *
     * @param {String} versionToMatch semver satisfaction sequence, eg "^7.0.0"
     * @returns {String} the directory where the Qooxdoo installation is
     */
    async findBestVersion(versionToMatch) {
      let defaultVersion = await qx.tool.config.Utils.getQxVersion();
      if (semver.satisfies(version, versionToMatch)) {
        let qxpath = await this.getQxPath();
        return qxpath;
      }

      for (let tag of this.__githubTags) {
        let match = tag.name.match(/^v([0-9]+\.[0-9]+\.[0-9]+)$/);
        if (match) {
          let version = match[1];
          if (semver.satisfies(version, versionToMatch)) {
            let dirname = path.join(
              qx.tool.cli.ConfigDb.getDirectory(),
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
