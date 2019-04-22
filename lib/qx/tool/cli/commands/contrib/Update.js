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

require("@qooxdoo/framework");
const process = require("process");
const Search = require("github-api/dist/components/Search");
const Repository = require("github-api/dist/components/Repository");
const fetch = require("node-fetch");
const semver = require("semver");
const inquirer = require("inquirer");
const path = require("upath");

/**
 * Updates the local cache with information of available contrib libraries
 */
qx.Class.define("qx.tool.cli.commands.contrib.Update", {
  extend: qx.tool.cli.commands.Contrib,

  statics: {
    getYargsCommand: function() {
      return {
        command: "update [repository]",
        describe: "updates information on contrib libraries from github. Has to be called before the other commands.",
        builder: {
          "file": {
            alias: "f",
            describe: "Output result to a file"
          },
          "search": {
            alias: "S",
            describe: "Search GitHub for repos (as opposed to using the cached nightly data)"
          },
          "all-versions": {
            alias: "a",
            describe: "Retrieve all releases (as opposed to the latest minor/patch release of each major release)"
          },
          "prereleases": {
            alias: "p",
            describe: "Include prereleases"
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
          return new qx.tool.cli.commands.contrib.Update(argv)
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

    /**
     * Updates the cache with information from GitHub.
     */
    process: async function() {
      // init
      let names = [];
      const argv = this.argv;
      const update_repo_only = argv.repository;
      if (!update_repo_only) {
        this.clearCache();
      }

      let cfg = await qx.tool.cli.ConfigDb.getInstance();
      let github = cfg.db("github", {});

      const self = this;
      // Create the cache
      if (!argv.search) {
        // Retrieve the data from the qooxdoo/qx-contrib repository
        await updateFromRepository();
      } else {
        if (!github.token) {
          let response = await inquirer.prompt([
              {
                type: "input",
                name: "token",
                message: "Searching GitHub requires an API token - visit https://github.com/settings/tokens to obtain one " +
                  "(you do not need to assign any permissions, just create a token);\nWhat is your GitHub API Token ? "
              }
            ]
          );
          if (!response.token) {
            console.error("You have not provided a GitHub token.");
            return;
          }
          github.token = response.token;
          cfg.save();
        }

        // Generate data from GitHub API
        await updateFromGitHubAPI();
      }

      let num_libraries = this.getCache().num_libraries;
      if (num_libraries && !argv.quiet) {
        console.info(`Found ${num_libraries} releases of libraries.`);
        console.info(`Run 'qx contrib list' in the root dir of your project to see which versions of these libraries are compatible.`);
      }

      // save cache
      if (argv.file) {
        await this.exportCache(argv.file);
      } else {
        await this.saveCache();
      }

      async function updateFromRepository() {
        if (!argv.quiet) {
          console.log("Downloading cache from GitHub ...");
        }
        let url = self.getRepositoryCacheUrl();
        try {
          let res = await fetch(url);
          let data = await res.json();
          self.setCache(data);
        } catch (e) {
          throw new qx.tool.cli.Utils.UserError(e.message);
        }
      }

      async function updateFromGitHubAPI() {
        const auth = {
          token: github.token
        };
        const search = new Search({}, auth);
        let num_libraries = 0;

        // qooxdoo-contrib repositories
        if (!argv.quiet) {
          console.log("Searching for qooxdoo-contrib repositories on GitHub...");
        }
        let query = "topic:qooxdoo-contrib fork:true";
        if (update_repo_only) {
          query += " " + update_repo_only;
        }
        let result = await search.forRepositories({q: query});
        let repos_data = self.getCache().repos.data;

        // iterate over repositories
        for (let repo of result.data) {
          let name = repo.full_name;

          // if a repository name has been given, only update this repo
          if (update_repo_only && name !== update_repo_only) {
            continue;
          }
          if (argv.verbose) {
            console.info(`### Found ${name} ...`);
          }
          names.push(name);
          let repository = new Repository(name, auth);
          repos_data[name] = {
            description: repo.description,
            url: repo.url,
            releases: {
              list: [],
              data: {}
            }
          };

          // get releases
          try {
            var releases_data = await repository.listReleases();
          } catch (e) {
            console.error("Error retrieving releases: " + e);
            continue;
          }

          // filter releases to speed up updates
          let releases = releases_data.data
          // filter out invalid release names and prereleases unless "--all-versions"
            .filter(r => argv["all-versions"] ? true :
              (semver.valid(r.tag_name, true) && (!semver.prerelease(r.tag_name, true) || argv["prereleases"]))
            )
            // attach a clean version number
            .map(r => {
              r.version = semver.valid(r.tag_name, true) || "0.0.0";
              return r;
            })
            // sort by version number
            .sort((a, b) => semver.compare(a.version, b.version))
            // use only the latest minor/patch unless "--all-versions"
            .filter((r, i, a) => r.version !== "0.0.0" && (argv["all-versions"] ? true : (i === a.length-1 || semver.major(a[i+1].version) > semver.major(r.version))));

          let versions = releases.map(r => r.version);
          if (argv.verbose) {
            console.info(`>>> Retrieved ${releases.length} release(s) of ${name}: ${versions.join(", ")}.`);
          }

          // get Manifest.json of each release to determine compatible qooxdoo versions
          for (let release of releases) {
            let tag_name = release.tag_name;
            let releases = repos_data[name].releases;

            // list of paths to manifest files, default is Manifest.json in the root dir
            let manifests = [{path: "."}];

            // can be overridden by a qoxdoo.json in the root dir
            let qooxdoo_data;
            if (argv.verbose) {
              console.log(`>>> Trying to retrieve 'qooxdoo.json' for ${name} ${tag_name}...`);
            }
            try {
              // @todo check if the method can return JSON to save parsing
              qooxdoo_data = await repository.getContents(tag_name, "qooxdoo.json", true);
              if (argv.verbose) {
                console.log(`>>>  File exists, checking for libraries...`);
              }
              let data = qooxdoo_data.data;
              if (typeof data == "string") {
                try {
                  data = qx.tool.compiler.utils.Json.parseJson(data);
                } catch (e) {
                  if (argv.verbose) {
                    console.warn(`!!!  Parse error: ${e.message}`);
                  }
                }
              }
              // we have a list of Manifest.json paths!
              if (data.contribs && data.contribs instanceof Array) {
                // deprecated, but supported for bc
                manifests = data.contribs;
              } else if (data.libraries && data.libraries instanceof Array) {
                manifests = data.libraries;
              }
            } catch (e) {
              // no qooxdoo.json
              if (e.message.match(/404/)) {
                if (argv.verbose) {
                  console.log(`>>> No qooxdoo.json`);
                }
              } else if (argv.verbose) {
                console.warn(`!!! Error: ${e.message}`);
              }
            }

            // create a list of contribs via their manifests
            for (let [index, {path:manifest_path}] of manifests.entries()) {
              let manifest_data;
              manifest_path = path.join(manifest_path, "Manifest.json");
              try {
                if (argv.verbose) {
                  console.log(`>>> Retrieving Manifest file '${manifest_path}' for ${name} ${tag_name}...`);
                }
                manifest_data = await repository.getContents(tag_name, manifest_path, true);
              } catch (e) {
                if (e.message.match(/404/)) {
                  if (argv.verbose) {
                    console.warn(`!!!  File does not exist.`);
                  }
                } else if (argv.verbose) {
                  console.warn(`!!! Error: ${e.message}`);
                }
                continue;
              }
              // retrieve compatible qooxdoo versions
              let data = manifest_data.data;
              // @todo check if the method can return JSON to save parsing
              if (typeof data == "string") {
                try {
                  data = qx.tool.compiler.utils.Json.parseJson(data);
                } catch (e) {
                  if (argv.verbose) {
                    console.warn(`!!! Parse error: ${e.message}`);
                    console.log(data);
                  }
                  continue;
                }
              }

              // qooxdoo version @deprecated
              var qx_versions = data.info["qooxdoo-versions"];
              // @deprecated
              var qx_version_range = (data.requires && data.requires["qooxdoo-sdk"]) || data.info["qooxdoo-range"];
              if (argv.verbose && data.info["qooxdoo-range"]) {
                console.warn(`!!! info.qooxdoo-range is deprecated. Please use the requires.qooxdoo-sdk key instead.`);
              }

              // provide backwards-compatibility for info.qooxdoo-versions containing the semver range
              // (to be removed)
              if (typeof qx_versions == "string" && !qx_version_range) {
                qx_version_range = qx_versions;
                if (argv.verbose) {
                  console.warn(`!!! info.qooxdoo-version is deprecated. Please use the requires.qooxdoo-sdk key instead.`);
                }
              }

              // provide backwards-compatibility for info.qooxdoo-version
              if (qx_versions instanceof Array && qx_versions.length && !qx_version_range) {
                qx_version_range = qx_versions.join(" || ");
                if (argv.verbose) {
                  console.warn(`!!! Manifest key 'info.qooxdoo-version' is deprecated. Please use the requires.qooxdoo-sdk key instead.`);
                }
              }

              if (!qx_version_range) {
                if (argv.verbose) {
                  console.warn(`!!! No compatibility information, skipping...`);
                }
                continue;
              }

              if (!semver.validRange(qx_version_range, {loose: true})) {
                if (argv.verbose) {
                  console.warn(`!!! Invalid compatibility information, skipping...`);
                }
                continue;
              }

              qx_versions = qx_version_range;
              let info = data.info;
              // add information to manifest index
              manifests[index] = {
                path: manifest_path,
                qx_versions,
                info
              };
              num_libraries++;
              if (argv.verbose) {
                console.log(`>>> ${name} ${tag_name}: Found '${info.name}' contrib (compatible with ${qx_versions})`);
              } else if (!argv.quiet) {
                process.stdout.write("."); // output dots to indicate progress
              }
            } // end iteration over manifests
            // save data in cache
            let zip_url = `https://github.com/${name}/archive/${tag_name}.zip`;
            releases.list.push(tag_name);
            releases.data[tag_name] = {
              title: release.name,
              prerelease: release.prerelease,
              manifests,
              zip_url
            };
          } // end iteration over releases
        } // end iteration over repos

        // wrap-up
        self.getCache().num_libraries = num_libraries;
        if (!update_repo_only) {
          self.getCache().repos.list = names.sort();
        }
        if (!argv.quiet && !argv.verbose) {
          process.stdout.write("\n");
        }
      }
    }
  }
});
