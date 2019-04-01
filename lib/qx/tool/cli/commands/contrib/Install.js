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
            describe: "use a specific release tag instead of the tag of the latest compatible release",
            nargs: 1,
            requiresArg: true,
            type: "string"
          },
          "ignore" : {
            alias: "i",
            describe: "ignore unmatch of qooxdoo"
          },
          "verbose": {
            alias: "v",
            describe: "Verbose logging"
          },
          "quiet": {
            alias: "q",
            describe: "No output"
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

    /**
     * Lists contrib libraries compatible with the current project
     */
    process: async function() {
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

      if (!this.argv["contrib_uri@release_tag"]) {
        await this.__loadFromContribJson();
        return;
      }

      if (!this.argv.release) {
        let s = this.argv["contrib_uri@release_tag"].split(/@/);
        this.argv["contrib_uri@release_tag"] = s[0];
        this.argv.release = s[1];
      }

      this.__manifest = await qx.tool.compiler.utils.Json.loadJsonAsync("Manifest.json");
      if (!this.__manifest.requires) {
        this.__manifest.requires = {};
      }
      // read libraries array from contrib.json
      this.__data = await this.getContribData();

      // install repo
      await this.__installRepo(this.argv["contrib_uri@release_tag"], this.argv.release, true);
      // save data
      await qx.tool.compiler.utils.Json.saveJsonAsync(this.getContribFileName(), this.__data);
      await qx.tool.compiler.utils.Json.saveJsonAsync("Manifest.json", this.__manifest);

      if (this.argv.verbose) {
        console.info(">>> Done.");
      }
    },


    __installRepo: async function(uriName, tagName, writeToManifest) {
      let qooxdoo_version = await this.getUserQxVersion();
      if (this.argv.verbose) {
        console.info(`>>> qooxdoo version:  ${qooxdoo_version}`);
      }

      // has a contrib_uri name been given?
      if (!uriName) {
        throw new qx.tool.cli.Utils.UserError("No contrib resource identifier given");
      }
      // currently, the contrib uri is github_username/repo_name[/path/to/repo].
      let parts = uriName.split(/\//);
      let repo_name = parts.slice(0, 2).join("/");
      let contrib_path = parts.length > 2 ? parts.slice(2).join("/") : "";
      if (!this.getCache().repos.data[repo_name]) {
        throw new qx.tool.cli.Utils.UserError(`A contrib repository '${repo_name}' cannot be found.`);
      }

      // get compatible tag name unless a release name has been given
      if (!tagName) {
        let cache = this.getCache();
        if (cache.compat[qooxdoo_version] === undefined) {
          if (!this.argv.quiet) {
            console.info(">>> Updating cache...");
          }
          await (new qx.tool.cli.commands.contrib.List({quiet:true})).process();
          cache = this.getCache(true);
        }
        tagName = cache.compat[qooxdoo_version][repo_name];
        if (!tagName) {
          throw new qx.tool.cli.Utils.UserError(
            `'${repo_name}' has no stable release compatible with qooxdoo version ${qooxdoo_version}.
             To install anyways, use --release x.y.z. 
             Please ask the contrib maintainer to release a compatible version`);
        }
      }
      let {release_data, download_path} = await this.__download(repo_name, tagName);

      // iterate over contained libraries
      let library_elem = null;
      let found = false;
      for (let {info, path:filename} of release_data.manifests) {
        if (contrib_path && (path.dirname(filename) !== contrib_path)) {
          // if a path component exists, only install the contrib in this path
          continue;
        }
        let current_download_path = path.join(download_path, path.dirname(filename));
        if (!fs.existsSync(current_download_path)) {
          await this.__download(repo_name, tagName, true);
        }
        let current_uri = path.join(repo_name, path.dirname(filename));
        found = true;
        // does the contrib_uri name already exist?
        let index = this.__data.libraries.findIndex(elem => elem.uri && (elem.uri === current_uri));
        library_elem = {
          library_name : info.name,
          library_version : info.version,
          uri : current_uri,
          repo_name: repo_name,
          repo_tag : tagName, // todo: replace by real version string
          path : path.relative(process.cwd(), current_download_path)
        };
        if (index >= 0) {
          this.__data.libraries[index] = library_elem;
          if (!this.argv.quiet) {
            console.info(`>>> Updating already existing config.json entry for'${current_uri}'.`);
          }
        } else {
          this.__data.libraries.push(library_elem);
        }
        if (writeToManifest && !this.__manifest.requires[current_uri]) {
          this.__manifest.requires[current_uri] = "^" + info.version;
        }
        await this.installApplication(current_download_path);
        await this.installDependencies(current_download_path);
        if (!this.argv.quiet) {
          console.info(`>>> Installed ${info.name} (${current_uri}, ${info.version})`);
        }
      }
      if (!found) {
        throw new qx.tool.cli.Utils.UserError(`The contrib library identified by '${uriName}' could not be found.`);
      }
    },

    installDependencies: async function(downloadPath) {
      let manifest = await qx.tool.compiler.utils.Json.loadJsonAsync(path.join(downloadPath, "Manifest.json"));
      if (!manifest.requires) {
        if (this.argv.verbose) {
          console.info(">>> No dependencies to install.");
        }
        return;
      }
      for (let lib_name of Object.getOwnPropertyNames(manifest.requires)) {
        let lib_version = manifest.requires[lib_name];
        switch (lib_name) {
          case "qooxdoo-compiler":
            break;
          case "qooxdoo-sdk": {
            let qxVer = await this.getUserQxVersion();
            if (!semver.satisfies(qxVer, lib_version, {loose: true}) && this.argv.ignore) {
              throw new qx.tool.cli.Utils.UserError(
                `Contrib needs qooxdoo-sdk version ${lib_version}, found ${qxVer}`
              );
            }
            break;
          }
          default: {
            // remove path into repo to get repo name only
            lib_name = lib_name.split(/\//).slice(0, 2).join("/");
            let lib = this.getCache().repos.data[lib_name];
            if (!lib) {
              throw new qx.tool.cli.Utils.UserError(`${lib_name} is not in the library registry!`);
            }
            let versionList = [];
            lib.releases.list.forEach(elem => versionList.push(elem.substring(1)));
            let version = semver.maxSatisfying(versionList, lib_version, {loose: true});
            if (!version) {
              throw new qx.tool.cli.Utils.UserError(`No satisfying version found for ${lib_name}@${lib_version}!`);
            }
            await this.__installRepo(lib_name, `v${version}`);
            break;
          }
        }
      }
    },

    installApplication: async function(downloadPath) {
      let manifest = await qx.tool.compiler.utils.Json.loadJsonAsync(path.join(downloadPath, "Manifest.json"));
      if (!manifest.provides || !manifest.provides.application) {
        if (this.argv.verbose) {
          console.info(">>> No application to install.");
        }
        return;
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
        for (let key in manifestApp) {
          app[key] = manifestApp[key];
        }
      }
      await qx.tool.compiler.utils.Json.saveJsonAsync("compile.json", compileJson);
      if (this.argv.verbose) {
        console.info(">>> Installed application " + (app.name||app["class"]));
      }
    },

    __loadFromContribJson: async function() {
      // read libraries array from contrib.json
      let contrib_json_path = process.cwd() + "/contrib.json";
      let data = fs.existsSync(contrib_json_path) ? qx.tool.compiler.utils.Json.parseJson(fs.readFileSync(contrib_json_path, "utf-8")) : {libraries : []};
      for (let i = 0; i < data.libraries.length; i++) {
        await this.__download(data.libraries[i].repo_name, data.libraries[i].repo_tag);
      }
    },

    /**
     * Downloads a release
     * @param {String} repoName
     * @param {String} tagName
     * @return {Object} A map containing {release_data, download_path}
     */
    __download: async function(repo_name, tag_name, force = false) {
      let repo_data = this.getCache().repos.data[repo_name];
      if (!repo_data) {
        throw new qx.tool.cli.Utils.UserError(`A contrib repository '${repo_name}' cannot be found.`);
      }
      let release_data = repo_data.releases.data[tag_name];
      if (!release_data) {
        throw new qx.tool.cli.Utils.UserError(`'${repo_name}' has no release '${tag_name}'.`);
      }
      // download zip of release
      let url = release_data.zip_url;
      let contrib_dir = [process.cwd(), "contrib", repo_name.replace(/\//g, "_")+"_"+tag_name];
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
      if (!force && dir_exists) {
        if (this.argv.verbose) {
          console.info(`>>> Contrib repository '${repo_name}' has already been downloaded to ${download_path}. To download again, execute 'qx clean'.`);
        }
      } else {
        if (this.argv.verbose) {
          console.info(`>>> Downloading contrib repository '${repo_name}' from ${url} to ${download_path}`);
        }
        try {
          await download(url, download_path, {extract:true,
            strip: 1});
        } catch (e) {
          throw e;
        }
      }
      return {release_data, download_path};
    }
  }
});
