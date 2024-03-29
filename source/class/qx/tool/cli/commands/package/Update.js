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
const process = require("process");
const Search = require("github-api/dist/components/Search");
const Repository = require("github-api/dist/components/Repository");
const semver = require("semver");
const inquirer = require("inquirer");
const path = require("upath");

/**
 * Updates the local cache with information of available library packages
 * @ignore(github.*)
 */
qx.Class.define("qx.tool.cli.commands.package.Update", {
  extend: qx.tool.cli.commands.Package,

  statics: {
    getYargsCommand() {
      return {
        command: "update [repository]",
        describe:
          "updates information on packages from github. Has to be called before the other commands. If a package URI is supplied, only update information on that package",
        builder: {
          file: {
            alias: "f",
            describe: "Output result to a file"
          },

          search: {
            alias: "S",
            describe:
              "Search GitHub for repos (as opposed to using the cached nightly data)"
          },

          "all-versions": {
            alias: "a",
            describe:
              "Retrieve all releases (as opposed to the latest minor/patch release of each major release)"
          },

          verbose: {
            alias: "v",
            describe: "Verbose logging"
          },

          quiet: {
            alias: "q",
            describe: "No output"
          },

          "export-only": {
            alias: "E",
            describe:
              "Export the current cache without updating it first (requires --file)"
          }
        }
      };
    }
  },

  members: {
    __names: null,

    /**
     * Updates the cache with information from GitHub.
     */
    async process() {
      super.process();

      // init
      this.__names = [];

      // export only
      if (this.argv.exportOnly) {
        if (!this.argv.file) {
          qx.tool.compiler.Console.error("Path required via --file argument.");
          process.exit(1);
        }
        this.exportCache(this.argv.file);
        return;
      }

      if (!this.argv.repository) {
        this.clearCache();
      }

      let cfg = await qx.tool.cli.ConfigDb.getInstance();
      let github = cfg.db("github", {});

      // Create the cache
      if (!this.argv.search) {
        // Retrieve the data from the repository
        await this.updateFromRepository();
      } else {
        if (!github.token) {
          let response = await inquirer.prompt([
            {
              type: "input",
              name: "token",
              message:
                "Searching GitHub requires an API token - visit https://github.com/settings/tokens to obtain one " +
                "(you do not need to assign any permissions, just create a token);\nWhat is your GitHub API Token ? "
            }
          ]);

          if (!response.token) {
            qx.tool.compiler.Console.error(
              "You have not provided a GitHub token."
            );

            return;
          }
          github.token = response.token;
          cfg.save();
        }

        // Generate data from GitHub API
        await this.updateFromGitHubAPI(github.token);
      }

      let num_libraries = this.getCache().num_libraries;
      if (num_libraries && !this.argv.quiet) {
        qx.tool.compiler.Console.info(
          `Found ${num_libraries} releases of libraries.`
        );

        qx.tool.compiler.Console.info(
          `Run 'qx package list' in the root dir of your project to see which versions of these libraries are compatible.`
        );
      }

      // save cache and export it if requested
      await this.saveCache();
      if (this.argv.file) {
        await this.exportCache(this.argv.file);
      }
    },

    /**
     * Update the package cache from the nightly cron job
     * @return {Promise<void>}
     */
    async updateFromRepository() {
      if (!this.argv.quiet) {
        qx.tool.compiler.Console.info("Downloading cache from GitHub ...");
      }
      let url = this.getRepositoryCacheUrl();
      try {
        let fetch = (await import("node-fetch")).default;
        let res = await fetch(url);
        let data = await res.json();
        this.setCache(data);
      } catch (e) {
        throw new qx.tool.utils.Utils.UserError(e.message);
      }
    },

    /**
     * Updates the package cache from the GitHub Api
     * @param {String} token
     * @return {Promise<void>}
     */
    async updateFromGitHubAPI(token) {
      const auth = {
        token
      };

      const search = new Search({}, auth);
      let num_libraries = 0;

      // repositories
      if (!this.argv.quiet) {
        qx.tool.compiler.Console.info(
          "Searching for package repositories on GitHub..."
        );
      }

      let query = "topic:qooxdoo-package fork:true";
      if (this.argv.repository) {
        query += " " + this.argv.repository;
      }
      let result = await search.forRepositories({ q: query });
      // backwards-compatibility
      query = "topic:qooxdoo-contrib fork:true";
      if (this.argv.repository) {
        query += " " + this.argv.repository;
      }
      let result2 = await search.forRepositories({ q: query });
      let repos = result.data.concat(result2.data);
      let repo_lookup = {};

      let repos_data = this.getCache().repos.data;

      // iterate over repositories
      for (let repo of repos) {
        let name = repo.full_name;
        // already dealt with
        if (repo_lookup[name]) {
          continue;
        }
        repo_lookup[name] = repo;
        // if a repository name has been given, only update this repo
        if (this.argv.repository && name !== this.argv.repository) {
          continue;
        }
        if (this.argv.verbose) {
          qx.tool.compiler.Console.info(`### Found ${name} ...`);
        }
        this.__names.push(name);
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
          qx.tool.compiler.Console.error("Error retrieving releases: " + e);
          continue;
        }

        // filter releases to speed up updates
        let releases = releases_data.data
          // filter out invalid release names unless "--all-versions"
          .filter(r =>
            this.argv["all-versions"] ? true : semver.valid(r.tag_name, true)
          )

          // attach a clean version number
          .map(r => {
            r.version = semver.valid(r.tag_name, true) || "0.0.0";
            return r;
          })
          // sort by version number
          .sort((a, b) => semver.compare(a.version, b.version))
          // use only the latest minor/patch unless "--all-versions"
          .filter(
            (r, i, a) =>
              r.version !== "0.0.0" &&
              (this.argv["all-versions"]
                ? true
                : i === a.length - 1 ||
                  semver.major(a[i + 1].version) > semver.major(r.version))
          );

        let versions = releases.map(r => r.version);
        if (this.argv.verbose) {
          qx.tool.compiler.Console.info(
            `>>> Retrieved ${
              releases.length
            } release(s) of ${name}: ${versions.join(", ")}.`
          );
        }

        // get Manifest.json of each release to determine compatible qooxdoo versions
        for (let release of releases) {
          let tag_name = release.tag_name;
          let releases = repos_data[name].releases;

          // list of paths to manifest files, default is Manifest.json in the root dir
          let manifests = [{ path: "." }];

          // can be overridden by a qoxdoo.json in the root dir
          let qooxdoo_data;
          if (this.argv.verbose) {
            this.debug(
              `>>> Trying to retrieve 'qooxdoo.json' for ${name} ${tag_name}...`
            );
          }
          try {
            // @todo check if the method can return JSON to save parsing
            qooxdoo_data = await repository.getContents(
              tag_name,
              "qooxdoo.json",
              true
            );

            if (this.argv.verbose) {
              this.debug(`>>>  File exists, checking for libraries...`);
            }
            let data = qooxdoo_data.data;
            if (typeof data == "string") {
              try {
                data = qx.tool.utils.Json.parseJson(data);
              } catch (e) {
                if (this.argv.verbose) {
                  qx.tool.compiler.Console.warn(
                    `!!!  Parse error: ${e.message}`
                  );
                }
              }
            }
            // we have a list of Manifest.json paths!
            manifests = data.libraries || data.contribs; // to do remove data.contribs. eventually, only there for BC
          } catch (e) {
            // no qooxdoo.json
            if (e.message.match(/404/)) {
              if (this.argv.verbose) {
                this.debug(`>>> No qooxdoo.json`);
              }
            } else if (this.argv.verbose) {
              qx.tool.compiler.Console.warn(`!!! Error: ${e.message}`);
            }
          }

          // create a list of libraries via their manifests
          for (let [index, manifest] of manifests.entries()) {
            let manifest_data;
            const manifest_path = path.join(
              manifest.path,
              qx.tool.config.Manifest.config.fileName
            );

            try {
              if (this.argv.verbose) {
                this.debug(
                  `>>> Retrieving Manifest file '${manifest_path}' for ${name} ${tag_name}...`
                );
              }
              manifest_data = await repository.getContents(
                tag_name,
                manifest_path,
                true
              );
            } catch (e) {
              if (e.message.match(/404/)) {
                if (this.argv.verbose) {
                  qx.tool.compiler.Console.warn(`!!!  File does not exist.`);
                }
              } else if (this.argv.verbose) {
                qx.tool.compiler.Console.warn(`!!! Error: ${e.message}`);
              }
              continue;
            }
            // retrieve compatible qooxdoo versions
            let data = manifest_data.data;
            // @todo check if the method can return JSON to save parsing
            if (typeof data == "string") {
              try {
                data = qx.tool.utils.Json.parseJson(data);
              } catch (e) {
                if (this.argv.verbose) {
                  qx.tool.compiler.Console.warn(
                    `!!! Parse error: ${e.message}`
                  );

                  this.debug(data);
                }
                continue;
              }
            }

            var qx_version_range =
              data.requires && data.requires["@qooxdoo/framework"];
            if (!qx_version_range) {
              if (this.argv.verbose) {
                qx.tool.compiler.Console.warn(
                  `!!! No valid qooxdoo version information in the manifest, skipping...`
                );
              }
              continue;
            }

            if (!semver.validRange(qx_version_range, { loose: true })) {
              if (this.argv.verbose) {
                qx.tool.compiler.Console.warn(
                  `!!! Invalid qooxdoo version information in the Manifest, skipping...`
                );
              }
              continue;
            }

            // add information to manifest index
            manifests[index] = {
              path: manifest_path,
              qx_versions: qx_version_range,
              info: data.info,
              requires: data.requires,
              provides: data.provides
            };

            num_libraries++;
            if (this.argv.verbose) {
              this.debug(
                `>>> ${name} ${tag_name}: Found package '${data.info.name}' (compatible with ${qx_version_range})`
              );
            } else if (!this.argv.quiet) {
              process.stdout.write("."); // output dots to indicate progress
            }
          } // end iteration over manifests
          // save data in cache
          let zip_url = `https://github.com/${name}/archive/${tag_name}.zip`;
          releases.list.push(tag_name);
          releases.data[tag_name] = {
            id: release.id,
            published_at: release.published_at,
            comment: release.body,
            title: release.name,
            prerelease: release.prerelease,
            manifests,
            zip_url
          };
        } // end iteration over releases
      } // end iteration over repos

      // wrap-up
      this.getCache().version =
        qx.tool.config.Lockfile.getInstance().getVersion();
      this.getCache().num_libraries = num_libraries;
      if (!this.argv.repository) {
        this.getCache().repos.list = this.__names.sort();
      }
      if (!this.argv.quiet && !this.argv.verbose) {
        process.stdout.write("\n");
      }
    }
  }
});
