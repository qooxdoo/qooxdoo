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


require("../Contrib");

require("qooxdoo");
const download = require("download");
const fs = qx.tool.compiler.utils.Promisify.fs;
const path = require("upath");
const process = require("process");
const semver = require("semver");
const rimraf = require("rimraf");

/**
 * Installs a contrib libraries
 */
qx.Class.define("qx.tool.cli.commands.contrib.Install", {
  extend: qx.tool.cli.commands.Contrib,

  statics: {
    getYargsCommand: function() {
      return {
        command: "install [contrib_uri[@release_tag]]",
        describe: "installs the latest compatible release of a contrib library (as per Manifest.json). Use \"-r <release tag>\" or @<release tag> to install a particular release.",
        builder: {
          "release" : {
            alias: "r",
            describe: "Use a specific release tag instead of the tag of the latest compatible release",
            nargs: 1,
            requiresArg: true,
            type: "string"
          },
          "ignore" : {
            alias: "i",
            describe: "Ignore unmatch of qooxdoo"
          },
          "verbose": {
            alias: "v",
            describe: "Verbose logging"
          },
          "quiet": {
            alias: "q",
            describe: "No output"
          },
          "save": {
            alias: "s",
            default: true,
            describe: "Save the installed libraries as permanent dependencies"
          }
        },
        handler: function(argv) {
          return new qx.tool.cli.commands.contrib.Install(argv)
            .process()
            .catch(e => {
              console.error(e.stack || e.message);
              process.exit(1);
            });
        }
      };
    }
  },

  members: {

    __data: null,
    __manifest: null,
    __cacheUpdated: false,

    /**
     * API method to install a library
     * @param {String} library_uri
     * @param {String} release_tag
     * @return {Promise<void>}
     */
    async install(library_uri, release_tag) {
      this.argv["contrib_uri@release_tag"]= library_uri + (release_tag?"@"+release_tag:"");
      await this.process();
    },


    /**
     * Installs a contrib library
     */
    process: async function() {
      await this.__updateCache();
      await this.__readConfigData();

      // if no library uri has been passed install from contrib.json or Manifest.json
      if (!this.argv["contrib_uri@release_tag"]) {
        if (this.__data.libraries.length) {
          await this.__loadFromContribJson();
        } else {
          await this.__installDependenciesFromManifest(this.__manifest);
          await this.__saveConfigData();
        }
        return;
      }

      let uri = this.argv["contrib_uri@release_tag"];
      let id;
      if (this.argv.release) {
        id = this.argv.release;
      } else {
        [uri, id] = uri.split(/@/);
      }


      // install library/libraries
      if (!id || (qx.lang.Type.isString(id) && id.startsWith("v"))) {
        // we use the latest or a given release
        await this.__installFromRelease(uri, id, this.argv.save);
      } else {
        // arbitrary path into the code tree
        await this.__installFromTree(uri, id, this.argv.save);
      }

      await this.__saveConfigData();

      if (this.argv.verbose) {
        console.info(">>> Done.");
      }
    },

    /**
     * Update repo cache
     * @return {Promise<void>}
     * @private
     */
    async __updateCache() {
      let repos_cache = this.getCache().repos;
      if (repos_cache.list.length === 0) {
        if (!this.argv.quiet) {
          console.info(">>> Updating cache...");
        }
        this.clearCache();
        // implicit update
        await (new qx.tool.cli.commands.contrib.Update({quiet:true})).process();
        await (new qx.tool.cli.commands.contrib.List({quiet:true})).process();
      }
    },

    /**
     * Read manifest and contrib library data into (private) members
     * @return {Promise<void>}
     * @private
     */
    async __readConfigData() {
      this.__manifest = await qx.tool.compiler.utils.Json.loadJsonAsync("Manifest.json");
      if (!this.__manifest.requires) {
        this.__manifest.requires = {};
      }
      this.__data = await this.getContribData();
    },

    /**
     * Save manifest (unless --save==false) and contrib library data
     * @return {Promise<void>}
     * @private
     */
    async __saveConfigData() {
      await qx.tool.compiler.utils.Json.saveJsonAsync(this.getContribFileName(), this.__data);
      if (this.argv.save) {
        await qx.tool.compiler.utils.Json.saveJsonAsync("Manifest.json", this.__manifest);
      }
    },

    /**
     * Returns information on the given URI
     * @param {String} uri
     * @return {{contrib_path: string | string, repo_name: string}}
     * @private
     */
    __getUriInfo(uri) {
      // has a contrib_uri name been given?
      if (!uri) {
        throw new qx.tool.cli.Utils.UserError("No contrib resource identifier given");
      }
      // currently, the contrib uri is github_username/repo_name[/path/to/repo].
      let parts = uri.split(/\//);
      let repo_name = parts.slice(0, 2).join("/");
      let contrib_path = parts.length > 2 ? parts.slice(2).join("/") : "";
      if (!this.getCache().repos.data[repo_name]) {
        throw new qx.tool.cli.Utils.UserError(`A contrib repository '${repo_name}' cannot be found.`);
      }
      return {
        repo_name,
        contrib_path
      };
    },

    /**
     * Installs libraries in a repository from a given release tag name
     * @param {String} uri The name of the repository (e.g. qooxdoo/qxl.apiviewer),
     *  or of a library within a repository (such as ergobyte/qookery/qookeryace)
     * @param {String} tag_name The tag name of the release, such as "v1.1.0"
     * @param {Boolean} writeToManifest Whether the library should be written to
     * Manifest.json as a dependency
     * @return {Promise<void>}
     * @private
     */
    __installFromRelease: async function(uri, tag_name, writeToManifest) {
      let qooxdoo_version = await this.getUserQxVersion();

      let {repo_name, contrib_path} = this.__getUriInfo(uri);
      if (!tag_name) {
        let cache = this.getCache();
        if (cache.compat[qooxdoo_version] === undefined) {
          if (this.argv.verbose && !this.argv.quiet) {
            console.info(">>> Updating cache...");
          }
          await (new qx.tool.cli.commands.contrib.List({quiet:true, all:true})).process();
          cache = this.getCache(true);
        }
        tag_name = cache.compat[qooxdoo_version][repo_name];
        if (!tag_name) {
          throw new qx.tool.cli.Utils.UserError(
            `'${repo_name}' has no stable release compatible with qooxdoo version ${qooxdoo_version}.
             To install anyways, use --release x.y.z.
             Please ask the contrib maintainer to release a compatible version`);
        }
      }
      if (this.argv.verbose) {
        console.info(`>>> Installing '${uri}', release '${tag_name}' for qooxdoo version: ${qooxdoo_version}`);
      }
      let {download_path} = await this.__download(repo_name, tag_name);
      // iterate over contained libraries
      let found = false;
      let repo_data = this.getCache().repos.data[repo_name];
      if (!repo_data) {
        throw new qx.tool.cli.Utils.UserError(`A contrib repository '${repo_name}' cannot be found.`);
      }
      let release_data = repo_data.releases.data[tag_name];
      if (!release_data) {
        throw new qx.tool.cli.Utils.UserError(`'${repo_name}' has no release '${tag_name}'.`);
      }
      // TODO: the path in the cache data should be the path to the library containing Manifest.json, not to the Manifest.json itself
      for (let {path:manifest_path} of release_data.manifests) {
        if (contrib_path && (path.dirname(manifest_path) !== contrib_path)) {
          // if a path component exists, only install the contrib in this path
          continue;
        }
        let library_uri = path.join(repo_name, path.dirname(manifest_path));
        found = true;
        await this.__updateInstalledLibraryData(library_uri, tag_name, download_path, writeToManifest);
      }
      if (!found) {
        throw new qx.tool.cli.Utils.UserError(`The contrib library identified by '${uri}' could not be found.`);
      }
    },

    /**
     * Installs libraries in a given repository from the given hash of a code tree
     * independent from the library cache. This ignores dependency constraints.
     * The given uri must point to a folder containing Manifest.json
     * @param {String} uri
     *  The path to a library in a a repository
     *  (e.g. qooxdoo/qxl.apiviewer or ergobyte/qookery/qookeryace)
     * @param {String} hash
     *  A path into the code tree on GitHub such as "tree/892f44d1d1ae5d65c7dd99b18da6876de2f2a920"
     * @param {Boolean} writeToManifest Whether the library should be written to
     * Manifest.json as a dependency
     * @return {Promise<void>}
     * @private
     */
    __installFromTree: async function(uri, hash, writeToManifest) {
      let qooxdoo_version = await this.getUserQxVersion();
      if (this.argv.verbose) {
        console.info(`>>> Installing '${uri}' from tree hash '${hash}' for qooxdoo version ${qooxdoo_version}`);
      }
      let {repo_name} = this.__getUriInfo(uri);
      let {download_path} = await this.__download(repo_name, hash);
      await this.__updateInstalledLibraryData(uri, hash, download_path, writeToManifest);
    },

    /**
     * Updates the data in contrib.json and (optionally) in Manifest.json
     * @param {String} uri The path to a library in a a repository
     * (e.g. qooxdoo/qxl.apiviewer or ergobyte/qookery/qookeryace)
     * @param {String} id
     *  The tag name of a release such as "v1.1.0" or a tree hash such as
     *  tree/892f44d1d1ae5d65c7dd99b18da6876de2f2a920
     * @param {String} download_path The path to the downloaded repository
     * @param {Boolean} writeToManifest
     *  Whether the library should be written to Manifest.json as a dependency
     * @return {Promise<void>}
     * @private
     */
    async __updateInstalledLibraryData(uri, id, download_path, writeToManifest) {
      let {repo_name, contrib_path} = this.__getUriInfo(uri);
      let library_path = path.join(download_path, contrib_path);
      let manifest_path = path.join(library_path, "Manifest.json");
      let {info} = qx.tool.compiler.utils.Json.parseJson(fs.readFileSync(manifest_path, "utf-8"));
      // does the contrib_uri name already exist?
      let index = this.__data.libraries.findIndex(elem => elem.uri && (elem.uri === uri));
      let library_elem = {
        library_name : info.name,
        library_version : info.version,
        uri : uri,
        repo_name: repo_name,
        repo_tag : id,
        path : path.relative(process.cwd(), library_path)
      };
      if (index >= 0) {
        this.__data.libraries[index] = library_elem;
        if (this.argv.verbose && !this.argv.quiet) {
          console.info(`>>> Updating already existing contrib.json entry for'${uri}'.`);
        }
      } else {
        this.__data.libraries.push(library_elem);
      }
      if (writeToManifest && !this.__manifest.requires[uri]) {
        this.__manifest.requires[uri] = "^" + info.version;
      }
      let appsInstalled = await this.installApplication(library_path);
      if (!appsInstalled && this.argv.verbose) {
        console.info(`>>> No applications installed for ${uri}.`);
      }
      let depsInstalled = await this.__installDependenciesFromPath(library_path);
      if (!depsInstalled && this.argv.verbose) {
        console.info(`>>> No dependencies installed for ${uri}.`);
      }
      if (!this.argv.quiet) {
        console.info(`Installed ${info.name} (${uri}, ${info.version})`);
      }
    },

    /**
     * Given a download path of a library, install its dependencies
     * @param {String} downloadPath
     * @return {Promise<Boolean>} Wether any libraries were installed
     */
    __installDependenciesFromPath: async function(downloadPath) {
      let manifest = await qx.tool.compiler.utils.Json.loadJsonAsync(path.join(downloadPath, "Manifest.json"));
      if (!manifest.requires) {
        return false;
      }
      return this.__installDependenciesFromManifest(manifest);
    },

    /**
     * Given a library's manifest data, install its dependencies
     * @param {Object} manifest
     * @return {Promise<Boolean>} Wether any libraries were installed
     */
    async __installDependenciesFromManifest(manifest) {
      for (let lib_uri of Object.getOwnPropertyNames(manifest.requires)) {
        let lib_version = manifest.requires[lib_uri];
        switch (lib_uri) {
          case "qooxdoo-compiler":
            break;
          case "qooxdoo-sdk": {
            let qxVer = await this.getUserQxVersion();
            if (!semver.satisfies(qxVer, lib_version, {loose: true}) && this.argv.ignore) {
              throw new qx.tool.cli.Utils.UserError(
                `Library '${lib_uri}' needs qooxdoo-sdk version ${lib_version}, found ${qxVer}`
              );
            }
            break;
          }
          default: {
            // version info is semver range -> released version
            if (semver.validRange(lib_version)) {
              let version = this.__getHighestCompatibleVersion(lib_uri, lib_version);
              if (!version) {
                throw new qx.tool.cli.Utils.UserError(`No satisfying version found for ${lib_uri}@${lib_version}!`);
              }
              await this.__installFromRelease(lib_uri, `v${version}`, false);
              break;
            }
            // treat version info as tree-ish identifier
            try {
              await this.__installFromTree(lib_uri, lib_version, false);
              break;
            } catch (e) {
              throw new qx.tool.cli.Utils.UserError(`Could not install ${lib_uri}@${lib_version}: ${e.message}`);
            }
          }
        }
      }
      return true;
    },

    /**
     * Given the URI of a library repo and a semver range, returns the highest
     * release compatible with the semver range
     * @param {String} lib_uri The URI of the library
     * @param {String} lib_range The semver range
     * @private
     */
    __getHighestCompatibleVersion(lib_uri, lib_range) {
      let {repo_name} = this.__getUriInfo(lib_uri);
      let lib = this.getCache().repos.data[repo_name];
      if (!lib) {
        throw new qx.tool.cli.Utils.UserError(`${lib_uri} is not in the library registry!`);
      }
      let versionList = [];
      lib.releases.list.forEach(elem => versionList.push(elem.substring(1)));
      return semver.maxSatisfying(versionList, lib_range, {loose: true});
    },

    /**
     * Given the download path of a library, install its applications
     * @param {String} downloadPath
     * @return {Promise<Boolean>} Returns true if applications were installed
     */
    installApplication: async function(downloadPath) {
      let manifest = await qx.tool.compiler.utils.Json.loadJsonAsync(path.join(downloadPath, "Manifest.json"));
      if (!manifest.provides || !manifest.provides.application) {
        return false;
      }

      let compileJson = await qx.tool.compiler.utils.Json.loadJsonAsync("compile.json");
      let manifestApp = manifest.provides.application;
      let app = compileJson.applications.find(app => {
        if (manifestApp.name && app.name) {
          return manifestApp.name === app.name;
        }
        return manifestApp["class"] === app["class"];
      });
      if (!app) {
        compileJson.applications.push(manifestApp);
        app = manifestApp;
      } else {
        for (let key of Object.getOwnPropertyNames(manifestApp)) {
          app[key] = manifestApp[key];
        }
      }
      await qx.tool.compiler.utils.Json.saveJsonAsync("compile.json", compileJson);
      if (this.argv.verbose) {
        console.info(">>> Installed application " + (app.name||app["class"]));
      }
      return true;
    },

    /**
     * Download repos listed in from contrib.json
     * @return {Promise<void>}
     * @private
     */
    __loadFromContribJson: async function() {
      if (this.argv.verbose) {
        console.info(">>> Downloading libraries listed in contrib.json...");
      }
      let libraries = (await this.getContribData()).libraries;
      for (let i = 0; i < libraries.length; i++) {
        await this.__download(libraries[i].repo_name, libraries[i].repo_tag);
      }
    },

    /**
     * Downloads a release
     * @return {Object} A map containing {release_data, download_path}
     * @param {String} repo_name The name of the repository
     * @param {String} treeish
     *  If prefixed by "v", the name of a release tag. Otherwise, arbitrary
     *  tree-ish expression (see https://help.github.com/en/articles/getting-permanent-links-to-files)
     * @param {Boolean} force Overwrite existing downloads
     * @return {{download_path:String}}
     */
    __download: async function(repo_name, treeish=null, force = false) {
      qx.core.Assert.assertNotNull(treeish, "Empty tree-ish id is not allowed");
      let url = `https://github.com/${repo_name}/archive/${treeish}.zip`;
      // create local directory
      let dir_name = `${repo_name}_${treeish}`.replace(/[\^./*?"'<>:]/g, "_");
      let contrib_dir = [process.cwd(), "contrib", dir_name];
      let dir_exists;
      let download_path = contrib_dir.reduce((prev, current) => {
        let dir = prev + path.sep + current;
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir);
          dir_exists = false;
        } else {
          dir_exists = true;
        }
        return dir;
      });
      // download zip
      if (!force && dir_exists) {
        if (this.argv.verbose) {
          console.info(`>>> Contrib repository '${repo_name}', '${treeish}' has already been downloaded to ${download_path}. To download again, execute 'qx clean'.`);
        }
      } else {
        if (this.argv.verbose) {
          console.info(`>>> Downloading contrib repository '${repo_name}', '${treeish}' from ${url} to ${download_path}`);
        }
        try {
          await download(url, download_path, {extract:true, strip: 1});
        } catch (e) {
          // remove download path so that failed downloads do not result in empty folder
          if (this.argv.verbose) {
            console.info(`>>> Download failed. Removing download folder.`);
          }
          rimraf.sync(download_path);
          throw e;
        }
      }
      return {download_path};
    }
  }
});
