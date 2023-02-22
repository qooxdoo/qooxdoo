/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2017-2021 Christian Boulanger

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Boulanger (info@bibliograph.org, @cboulanger)

************************************************************************ */

const download = require("download");
const fs = qx.tool.utils.Promisify.fs;
const path = require("upath");
const process = require("process");
const semver = require("semver");
const rimraf = require("rimraf");

/**
 * Installs a package
 */
qx.Class.define("qx.tool.cli.commands.package.Install", {
  extend: qx.tool.cli.commands.Package,

  statics: {
    /**
     * Yarg commands data
     * @return {{}}
     */
    getYargsCommand() {
      return {
        command: "install [uri[@release_tag]]",
        describe: `installs the latest compatible release of package (as per Manifest.json). Use "-r <release tag>" or @<release tag> to install a particular release.
        examples:
           * qx package install name: Install latest published version
           * qx package install name@v0.0.2: Install version 0.0.2,
           * qx package install name@master: Install current master branch from github`,
        builder: {
          release: {
            alias: "r",
            describe:
              "Use a specific release tag instead of the tag of the latest compatible release",
            nargs: 1,
            requiresArg: true,
            type: "string"
          },

          ignore: {
            alias: "i",
            describe: "Ignore unmatch of qooxdoo"
          },

          verbose: {
            alias: "v",
            describe: "Verbose logging"
          },

          quiet: {
            alias: "q",
            describe: "No output"
          },

          save: {
            alias: "s",
            default: false,
            describe: "Save the libraries as permanent dependencies"
          },

          "from-path": {
            alias: "p",
            nargs: 1,
            describe: "Install a library/the given library from a local path"
          },

          "qx-version": {
            check: argv => semver.valid(argv.qxVersion),
            describe:
              "A semver string. If given, the maximum qooxdoo version for which to install a package"
          }
        }
      };
    }
  },

  members: {
    /**
     * @var {Boolean}
     */
    __cacheUpdated: false,

    /**
     * API method to install a library via its URI and version tag
     * @param {String} library_uri
     * @param {String} release_tag
     * @return {Promise<void>}
     */
    async install(library_uri, release_tag) {
      let installee = library_uri + (release_tag ? "@" + release_tag : "");
      if (this.argv.verbose) {
        qx.tool.compiler.Console.info(`>>> To be installed: ${installee}`);
      }
      this.argv.uri = installee;
      this.argv.fromPath = false;
      await this.process();
    },

    /**
     * API method to install a library from a local path
     * @param {String} local_path
     * @param {String} library_uri Optional library URI.
     * @return {Promise<void>}
     */
    async installFromLocaPath(local_path, library_uri) {
      if (!path.isAbsolute(local_path)) {
        local_path = path.join(process.cwd(), local_path);
      }
      if (this.argv.verbose) {
        qx.tool.compiler.Console.info(
          `>>> To be installed: ${
            library_uri || "local libarary"
          } from ${local_path}`
        );
      }
      this.argv.uri = library_uri;
      this.argv.fromPath = local_path;
      await this.process();
    },

    /**
     * API method to check if a library has been installed
     * @param {String} library_uri
     * @param {String} release_tag
     * @return {Promise<Boolean>}
     */
    async isInstalled(library_uri, release_tag) {
      return (await this.getLockfileModel())
        .getValue("libraries")
        .some(
          lib =>
            lib.uri === library_uri &&
            (release_tag === undefined || release_tag === lib.repo_tag)
        );
    },

    /**
     * Installs a package
     */
    async process() {
      await super.process();
      await this.__updateCache();
      const [manifestModel, lockfileModel] = await this._getConfigData();

      // create shorthand for uri@id
      this.argv.uri = this.argv.uri || this.argv["uri@release_tag"];

      // if no library uri has been passed, install from lockfile or manifest

      if (!this.argv.uri && !this.argv.fromPath) {
        if (lockfileModel.getValue("libraries").length) {
          await this.__downloadLibrariesInLockfile();
        } else {
          await this.__installDependenciesFromManifest(manifestModel.getData());
          await this._saveConfigData();
        }
        return;
      }

      // library uri and id, which can be none (=latest), version, or tree-ish expression
      let uri = this.argv.uri;
      let id;
      if (this.argv.release) {
        id = this.argv.release;
      } else if (uri) {
        [uri, id] = uri.split(/@/);
      }

      // prepend "v" to valid semver strings
      if (semver.valid(id) && id[0] !== "v") {
        if (this.argv.verbose) {
          qx.tool.compiler.Console.info(`>>> Prepending "v" to ${id}.`);
        }
        id = `v${id}`;
      }

      if (this.argv.fromPath) {
        // install from local path?
        if (id) {
          throw new qx.tool.utils.Utils.UserError(
            `Version identifier cannot be used when installing from local path.`
          );
        }
        let saveToManifest = uri ? this.argv.save : false;
        await this.__installFromPath(uri, this.argv.fromPath, saveToManifest);
      } else if (!id || (qx.lang.Type.isString(id) && id.startsWith("v"))) {
        // install library/libraries from GitHub release
        await this.__installFromRelease(uri, id, this.argv.save);
      } else {
        // install library from GitHub code tree
        await this.__installFromTree(uri, id, this.argv.save);
      }

      await this._saveConfigData();

      if (this.argv.verbose) {
        qx.tool.compiler.Console.info(">>> Done.");
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
          qx.tool.compiler.Console.info(">>> Updating cache...");
        }
        this.clearCache();
        // implicit update
        await new qx.tool.cli.commands.package.Update({
          quiet: true
        }).process();
        await new qx.tool.cli.commands.package.List({ quiet: true }).process();
      }
    },

    /**
     * Returns information on the given URI
     * @param {String} uri
     * @return {{package_path: string | string, repo_name: string}}
     * @private
     */
    __getUriInfo(uri) {
      if (!uri) {
        throw new qx.tool.utils.Utils.UserError(
          "No package resource identifier given"
        );
      }
      // currently, the uri is github_username/repo_name[/path/to/repo].
      let parts = uri.split(/\//);
      let repo_name = parts.slice(0, 2).join("/");
      let package_path = parts.length > 2 ? parts.slice(2).join("/") : "";
      if (!this.getCache().repos.data[repo_name]) {
        throw new qx.tool.utils.Utils.UserError(
          `A repository '${repo_name}' cannot be found.`
        );
      }
      return {
        repo_name,
        package_path
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
    async __installFromRelease(uri, tag_name, writeToManifest) {
      let qxVersion = (await this.getAppQxVersion()).replace("-beta", "");
      let { repo_name, package_path } = this.__getUriInfo(uri);
      if (!tag_name) {
        let cache = this.getCache();
        if (cache.compat[qxVersion] === undefined) {
          if (this.argv.verbose && !this.argv.quiet) {
            qx.tool.compiler.Console.info(">>> Updating cache...");
          }
          let options = { quiet: true, all: true, qxVersion };
          await new qx.tool.cli.commands.package.List(options).process();
          cache = this.getCache(true);
        }
        tag_name =
          cache.compat[qxVersion] && cache.compat[qxVersion][repo_name];
        if (!tag_name) {
          qx.tool.compiler.Console.warn(
            `'${repo_name}' has no (stable) release compatible with qooxdoo version ${qxVersion}.
             To install anyways, use '--release <release>' or 'qx install ${repo_name}@<release>'.
             Please ask the library maintainer to release a compatible version.`
          );

          return;
        }
      }
      if (this.argv.verbose) {
        qx.tool.compiler.Console.info(
          `>>> Installing '${uri}', release '${tag_name}' for qooxdoo version: ${qxVersion}`
        );
      }
      let { download_path } = await this.__download(repo_name, tag_name);
      // iterate over contained libraries
      let found = false;
      let repo_data = this.getCache().repos.data[repo_name];
      if (!repo_data) {
        throw new qx.tool.utils.Utils.UserError(
          `A repository '${repo_name}' cannot be found.`
        );
      }
      let release_data = repo_data.releases.data[tag_name];
      if (!release_data) {
        throw new qx.tool.utils.Utils.UserError(
          `'${repo_name}' has no release '${tag_name}'.`
        );
      }
      // TO DO: the path in the cache data should be the path to the library containing Manifest.json, not to the Manifest.json itself
      for (let { path: manifest_path } of release_data.manifests) {
        if (package_path && path.dirname(manifest_path) !== package_path) {
          // if a path component exists, only install the library in this path
          continue;
        }
        let library_uri = path.join(repo_name, path.dirname(manifest_path));
        found = true;
        await this.__updateInstalledLibraryData(
          library_uri,
          tag_name,
          download_path,
          writeToManifest
        );
      }
      if (!found) {
        throw new qx.tool.utils.Utils.UserError(
          `The package/library identified by '${uri}' could not be found.`
        );
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
    async __installFromTree(uri, hash, writeToManifest) {
      let qxVersion = await this.getAppQxVersion();
      if (this.argv.verbose) {
        qx.tool.compiler.Console.info(
          `>>> Installing '${uri}' from tree hash '${hash}' for qooxdoo version ${qxVersion}`
        );
      }
      let { repo_name } = this.__getUriInfo(uri);
      let { download_path } = await this.__download(repo_name, hash);
      await this.__updateInstalledLibraryData(
        uri,
        hash,
        download_path,
        writeToManifest
      );
    },

    /**
     * Installs libraries from a local path
     * @param {String} uri
     *  The URI identifying a library (e.g. qooxdoo/qxl.apiviewer or
     *  ergobyte/qookery/qookeryace)
     * @param {String} dir
     *  The path to a local directory
     * @param {Boolean} writeToManifest
     *  Whether the library should be written to Manifest.json as a dependency
     * @return {Promise<void>}
     * @private
     */
    async __installFromPath(uri, dir, writeToManifest = false) {
      let qxVersion = await this.getAppQxVersion();
      if (this.argv.verbose) {
        qx.tool.compiler.Console.info(
          `>>> Installing '${uri}' from '${dir}' for qooxdoo version ${qxVersion}`
        );
      }
      await this.__updateInstalledLibraryData(
        uri,
        undefined,
        dir,
        writeToManifest
      );
    },

    /**
     * Updates the data in the lockfile and (optionally) in the manifest
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
    async __updateInstalledLibraryData(
      uri,
      id,
      download_path,
      writeToManifest
    ) {
      let { repo_name, package_path } = uri
        ? this.__getUriInfo(uri)
        : { repo_name: "", package_path: "" };
      const [manifestModel, lockfileModel] = await this._getConfigData();
      let library_path = path.join(download_path, package_path);
      let manifest_path = path.join(
        library_path,
        qx.tool.config.Manifest.config.fileName
      );

      if (!fs.existsSync(manifest_path)) {
        throw new qx.tool.utils.Utils.UserError(
          `No manifest file in '${library_path}'.`
        );
      }
      let { info } = qx.tool.utils.Json.parseJson(
        fs.readFileSync(manifest_path, "utf-8")
      );

      let local_path = path.relative(process.cwd(), library_path);
      // create entry
      let lib = {
        library_name: info.name,
        library_version: info.version,
        path: local_path
      };

      if (uri) {
        lib.uri = uri;
      }
      // remote library info
      if (repo_name) {
        lib.repo_name = repo_name;
        if (id) {
          lib.repo_tag = id;
        }
      }

      // do we already have an entry for the library that matches either the URI or the local path?
      let index = lockfileModel
        .getValue("libraries")
        .findIndex(
          elem =>
            (uri && elem.uri === uri) || (!uri && elem.path === local_path)
        );

      if (index >= 0) {
        lockfileModel.setValue(["libraries", index], lib);
        if (this.argv.verbose) {
          qx.tool.compiler.Console.info(
            `>>> Updating already existing lockfile entry for ${info.name}, ${
              info.version
            }, installed from '${uri ? uri : local_path}'.`
          );
        }
      } else {
        lockfileModel.transform("libraries", libs => libs.push(lib) && libs);
        if (this.argv.verbose) {
          qx.tool.compiler.Console.info(
            `>>> Added new lockfile entry for ${info.name}, ${
              info.version
            }, installed from '${uri ? uri : local_path}'.`
          );
        }
      }
      if (writeToManifest) {
        manifestModel.setValue(["requires", uri], "^" + info.version);
      }
      let appsInstalled = await this.__installApplication(library_path);
      if (!appsInstalled && this.argv.verbose) {
        qx.tool.compiler.Console.info(
          `>>> No applications installed for ${uri}.`
        );
      }
      let depsInstalled = await this.__installDependenciesFromPath(
        library_path
      );

      if (!depsInstalled && this.argv.verbose) {
        qx.tool.compiler.Console.info(
          `>>> No dependencies installed for ${uri}.`
        );
      }
      if (!this.argv.quiet) {
        qx.tool.compiler.Console.info(
          `Installed ${info.name} (${uri}, ${info.version})`
        );
      }
    },

    /**
     * Given a download path of a library, install its dependencies
     * @param {String} downloadPath
     * @return {Promise<Boolean>} Wether any libraries were installed
     */
    async __installDependenciesFromPath(downloadPath) {
      let manifest_file = path.join(
        downloadPath,
        qx.tool.config.Manifest.config.fileName
      );

      let manifest = await qx.tool.utils.Json.loadJsonAsync(manifest_file);
      if (!manifest.requires) {
        if (this.argv.verbose) {
          qx.tool.compiler.Console.info(
            `>>> ${manifest_file} does not contain library dependencies.`
          );
        }
        return false;
      }
      if (this.argv.verbose) {
        qx.tool.compiler.Console.info(
          `>>> Installing libraries from ${manifest_file}.`
        );
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
        let lib_range = manifest.requires[lib_uri];
        switch (lib_uri) {
          case "@qooxdoo/compiler":
          case "qooxdoo-sdk":
          case "qooxdoo-compiler":
            // ignore legacy entries
            break;
          case "@qooxdoo/framework": {
            let qxVersion = await this.getAppQxVersion();
            if (
              !semver.satisfies(qxVersion, lib_range, { loose: true }) &&
              this.argv.ignore
            ) {
              throw new qx.tool.utils.Utils.UserError(
                `Library '${lib_uri}' needs @qooxdoo/framework version ${lib_range}, found ${qxVersion}`
              );
            }
            break;
          }
          default: {
            // version info is semver range -> released version
            if (semver.validRange(lib_range)) {
              let { tag } = this.__getHighestCompatibleVersion(
                lib_uri,
                lib_range
              );

              if (!tag) {
                throw new qx.tool.utils.Utils.UserError(
                  `No satisfying release found for ${lib_uri}@${lib_range}!`
                );
              }
              if (!(await this.isInstalled(lib_uri, tag))) {
                await this.__installFromRelease(lib_uri, tag, false);
                break;
              }
              if (this.argv.verbose) {
                qx.tool.compiler.Console.info(
                  `>>> ${lib_uri}@${tag} is already installed.`
                );
              }
              break;
            }
            // treat version info as tree-ish identifier
            if (!(await this.isInstalled(lib_uri, lib_range))) {
              try {
                await this.__installFromTree(lib_uri, lib_range, false);
                break;
              } catch (e) {
                throw new qx.tool.utils.Utils.UserError(
                  `Could not install ${lib_uri}@${lib_range}: ${e.message}`
                );
              }
            }
            if (this.argv.verbose) {
              qx.tool.compiler.Console.info(
                `>>> ${lib_uri}@${lib_range} is already installed.`
              );
            }
          }
        }
      }
      return true;
    },

    /**
     * Given the URI of a library repo and a semver range, returns the highest
     * version compatible with the semver range and the release tag containing
     * this version.
     * @param {String} lib_uri The URI of the library
     * @param {String} lib_range The semver range
     * @return {Object} Returns an object with the keys "tag" and "version"
     * @private
     */
    __getHighestCompatibleVersion(lib_uri, lib_range) {
      let { repo_name } = this.__getUriInfo(lib_uri);
      let lib = this.getCache().repos.data[repo_name];
      if (!lib) {
        throw new qx.tool.utils.Utils.UserError(
          `${lib_uri} is not in the library registry!`
        );
      }
      // map version to release (this helps with prereleases)
      let version2release = {};
      let versionList = lib.releases.list
        .map(tag => {
          // all libraries in a package MUST have the same version
          let manifest = lib.releases.data[tag].manifests[0];
          if (
            !qx.lang.Type.isObject(manifest) ||
            !qx.lang.Type.isObject(manifest.info) ||
            !manifest.info.version
          ) {
            this.debug(`${repo_name}/${tag}: Invalid Manifest!`);
            return null;
          }
          let version = manifest.info.version;
          version2release[version] = tag;
          return version;
        })
        .filter(version => Boolean(version));
      let highestCompatibleVersion = semver.maxSatisfying(
        versionList,
        lib_range,
        { loose: true }
      );

      return {
        version: highestCompatibleVersion,
        tag: version2release[highestCompatibleVersion]
      };
    },

    /**
     * Given the download path of a library, install its applications
     * todo use config API, use compile.js where it exists
     * @param {String} downloadPath
     * @return {Promise<Boolean>} Returns true if applications were installed
     */
    async __installApplication(downloadPath) {
      let manifest = await qx.tool.utils.Json.loadJsonAsync(
        path.join(downloadPath, qx.tool.config.Manifest.config.fileName)
      );

      if (!manifest.provides || !manifest.provides.application) {
        return false;
      }
      let manifestApp = manifest.provides.application;
      const compileConfigModel = await qx.tool.config.Compile.getInstance();
      if (!(await compileConfigModel.exists())) {
        qx.tool.compiler.Console.info(
          ">>> Cannot install application " +
            (manifestApp.name || manifestApp["class"]) +
            " because compile.json does not exist (you must manually add it)"
        );

        return false;
      }
      // relaod config. We need a fresh model here because data will be verified.
      // The original model is enriched during parsing so validate will fail.
      compileConfigModel.setLoaded(false);
      await compileConfigModel.load();
      let app = compileConfigModel.getValue("applications").find(app => {
        if (manifestApp.name && app.name) {
          return manifestApp.name === app.name;
        }
        return manifestApp["class"] === app["class"];
      });
      if (!app) {
        compileConfigModel.transform("applications", apps =>
          apps.concat([manifestApp])
        );

        app = manifestApp;
      }
      if (compileConfigModel.isDirty()) {
        await compileConfigModel.save();
      }
      if (this.argv.verbose) {
        qx.tool.compiler.Console.info(
          ">>> Installed application " + (app.name || app["class"])
        );
      }
      return true;
    },

    /**
     * Download repos listed in the lockfile
     * @return {Promise<void>}
     * @private
     */
    async __downloadLibrariesInLockfile() {
      if (this.argv.verbose) {
        qx.tool.compiler.Console.info(
          `>>> Downloading libraries listed in ${qx.tool.config.Lockfile.config.fileName}...`
        );
      }
      let libraries = (await this.getLockfileData()).libraries;
      return qx.Promise.all(
        libraries
          .filter(lib => lib.repo_name && lib.repo_tag)
          .map(lib => this.__download(lib.repo_name, lib.repo_tag))
      );
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
    async __download(repo_name, treeish = null, force = false) {
      qx.core.Assert.assertNotNull(treeish, "Empty tree-ish id is not allowed");
      let url = `https://github.com/${repo_name}/archive/${treeish}.zip`;
      // create local directory
      let dir_name = `${repo_name}_${treeish}`.replace(/[\^./*?"'<>:]/g, "_");
      let parts = [
        process.cwd(),
        qx.tool.cli.commands.Package.cache_dir,
        dir_name
      ];

      let dir_exists;
      let download_path = parts.reduce((prev, current) => {
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
          qx.tool.compiler.Console.info(
            `>>> Repository '${repo_name}', '${treeish}' has already been downloaded to ${download_path}. To download again, execute 'qx clean'.`
          );
        }
      } else {
        if (this.argv.verbose) {
          qx.tool.compiler.Console.info(
            `>>> Downloading repository '${repo_name}', '${treeish}' from ${url} to ${download_path}`
          );
        }
        try {
          await download(url, download_path, { extract: true, strip: 1 });
        } catch (e) {
          // remove download path so that failed downloads do not result in empty folder
          if (this.argv.verbose) {
            qx.tool.compiler.Console.info(
              `>>> Download failed: ${e.message}. Removing download folder.`
            );
          }
          rimraf.sync(download_path);
          qx.tool.compiler.Console.error(
            `Could not install '${repo_name}@${treeish}'. Use the --verbose flag for more information.`
          );

          process.exit(1);
        }
      }
      return { download_path, dir_exists };
    }
  }
});
