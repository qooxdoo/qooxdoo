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
const semver = require("semver");
const columnify = require("columnify");
const path = require("upath");

/**
 * Lists compatible packages
 */
qx.Class.define("qx.tool.cli.commands.package.List", {
  extend: qx.tool.cli.commands.Package,
  statics: {
    /**
     * The name of a "fake" repository containing libraries from local paths
     */
    localPathRepoName: "_local_",

    /**
     * Returns the yargs command data
     * @return {Object}
     */
    getYargsCommand() {
      return {
        command: "list [repository]",
        describe:
          'if no repository name is given, lists all available packages that are compatible with the project\'s qooxdoo version ("--all" lists incompatible ones as well). Otherwise, list all compatible packages.',
        builder: {
          all: {
            alias: "a",
            describe: "Show all versions, including incompatible ones"
          },

          verbose: {
            alias: "v",
            describe: "Verbose logging"
          },

          quiet: {
            alias: "q",
            describe: "No output"
          },

          json: {
            alias: "j",
            describe: "Output list as JSON literal"
          },

          installed: {
            alias: "i",
            describe: "Show only installed libraries"
          },

          namespace: {
            alias: "n",
            describe: "Display library namespace"
          },

          match: {
            alias: "m",
            describe: "Filter by regular expression (case-insensitive)"
          },

          libraries: {
            alias: "l",
            describe: "List libraries only (no repositories)"
          },

          short: {
            alias: "s",
            describe: "Omit title and description to make list more compact"
          },

          noheaders: {
            alias: "H",
            describe: "Omit header and footer"
          },

          prereleases: {
            alias: "p",
            describe: "Include prereleases into latest compatible releases"
          },

          "uris-only": {
            alias: "u",
            describe:
              "Output only the GitHub URIs of the packages which are used to install the packages. Implies --noheaders and --libraries."
          },

          "qx-version": {
            check: argv => semver.valid(argv.qxVersion),
            describe:
              "A semver string. If given, the qooxdoo version for which to generate the listings"
          }
        }
      };
    }
  },

  members: {
    /**
     * Lists library packages compatible with the current project
     */
    async process() {
      await super.process();
      this.__repositories = [];
      this.__libraries = {};
      this.__latestCompatible = {};
      const localPathRepoName = this.self(arguments).localPathRepoName;

      let repos_cache = this.getCache().repos;

      // implicit qx package update, disabled
      // if (repos_cache.list.length === 0 || this.getCache().version !== qx.tool.config.Lockfile.getInstance().getVersion()) {
      //   await (new qx.tool.cli.commands.package.Update({quiet:true})).process();
      // }

      let qxVersion;
      try {
        qxVersion = await this.getAppQxVersion();
      } catch (ex) {
        qx.tool.compiler.Console.error(
          `Cannot determine a qooxdoo version to show packages only for this version, because you are not in a project directory.`
        );

        process.exit(1);
      }
      let num_compat_repos = await this.__createIndexes(qxVersion);
      if (this.argv.verbose) {
        this.debug(
          `>>> We have ${num_compat_repos} packages compatible with qooxdoo version ${qxVersion}`
        );
      }

      if (num_compat_repos === 0 && !this.argv.all && !this.argv.quiet) {
        qx.tool.compiler.Console.info(
          `Currently, no packages compatible with qooxdoo version ${qxVersion} exist.`
        );

        return;
      }

      // detailed repo information
      let repo = this.argv.repository;
      if (repo) {
        if (!repos_cache.list.includes(repo)) {
          throw new qx.tool.utils.Utils.UserError(
            `Repository ${repo} does not exist or is not a qooxdoo package repo.`
          );
        }
        if (this.__libraries[repo] && this.__libraries[repo].length) {
          let columnify_options = {
            columnSplitter: "   ",
            config: {
              description: { maxWidth: 60 },
              compatibility: {
                dataTransform(data) {
                  switch (data) {
                    case "false":
                      return "not compatible / untested";
                    case "true":
                      return "√";
                    default:
                      return "";
                  }
                }
              },

              installedVersion: {
                dataTransform(data) {
                  switch (data) {
                    case "false":
                      return "-";
                    default:
                      return data;
                  }
                }
              }
            }
          };

          if (!this.argv.quiet) {
            let data = this.__libraries[repo]
              // shallow copy
              .map(row => Object.assign({}, row))
              // sort
              .sort((a, b) => a.name.localeCompare(b.name));
            let pretty = data
              // another shallow copy
              .map(row => Object.assign({}, row))
              // clean up and omit redundant cell values
              .map((row, index) => {
                delete row.manifest;
                if (index) {
                  let previousRow = data[index - 1];
                  for (let key of Object.getOwnPropertyNames(row).reverse()) {
                    if (
                      ["compatibility", "required_qx_version"].indexOf(key) > -1
                    ) {
                      continue;
                    }
                    if (
                      row[key] === previousRow[key] &&
                      row.name === previousRow.name
                    ) {
                      row[key] = "";
                    }
                  }
                }
                return row;
              });
            // output list
            if (this.argv.json) {
              // as JSON
              qx.tool.compiler.Console.info(JSON.stringify(data, null, 2));
            } else {
              qx.tool.compiler.Console.info(
                columnify(pretty, columnify_options)
              );
            }
          }
        } else if (this.argv.verbose) {
          qx.tool.compiler.Console.info(
            `Repository ${repo} does not contain suitable qooxdoo libraries.`
          );
        }
        return;
      }

      // list output

      let columns;
      if (this.argv.urisOnly) {
        columns = ["uri"];
        this.argv.noheaders = true;
        this.argv.libraries = true;
      } else if (this.argv.short) {
        columns = [
          "uri",
          "installedVersion",
          "latestVersion",
          "latestCompatible"
        ];
      } else {
        columns = [
          "uri",
          "name",
          "description",
          "installedVersion",
          "latestVersion",
          "latestCompatible"
        ];
      }
      if (this.argv.namespace || this.argv.installed) {
        columns.splice(1, 0, "namespace");
      }
      let columnify_options = {
        showHeaders: !this.argv.noheaders,
        columnSplitter: "   ",
        columns,
        config: {
          name: { maxWidth: 25 },
          description: { maxWidth: 60 },
          installedVersion: {
            headingTransform: () => "INSTALLED",
            dataTransform: data => (data === "false" ? "" : data)
          },

          latestVersion: {
            headingTransform: () => "LATEST",
            dataTransform: data => (data === "false" ? "-" : data)
          },

          latestCompatible: {
            headingTransform: () => "COMPATIBLE",
            dataTransform: data => (data === "false" ? "-" : data)
          }
        }
      };

      // filter by compatibility unless --all
      let list = this.argv.all
        ? this.__repositories
        : this.__repositories.filter(
            item =>
              item.latestCompatible ||
              (this.argv.installed && item.name === localPathRepoName)
          );

      // sort
      list.sort((l, r) => {
        l = l.name.toLowerCase();
        r = r.name.toLowerCase();
        return l < r ? -1 : l > r ? 1 : 0;
      });
      // list all libraries contained in a repo
      let expanded_list = [];
      for (let repo of list) {
        let repo_libs = [];
        if (!qx.lang.Type.isArray(this.__libraries[repo.name])) {
          continue;
        }
        for (let library of this.__libraries[repo.name]) {
          if (!semver.valid(library.version)) {
            if (this.argv.verbose) {
              qx.tool.compiler.Console.warn(
                `>>> Ignoring '${repo.name}' ${library.name}': invalid version format '${library.version}'.`
              );
            }
            continue;
          }
          if (
            repo.name === localPathRepoName ||
            semver.eq(library.version, repo.latestVersion)
          ) {
            let uri =
              repo.name === this.self(arguments).localPathRepoName
                ? library.path
                : path.join(repo.name, library.path || "");
            repo_libs.push({
              type: "library",
              uri,
              namespace: library.namespace,
              name: library.name,
              description: library.summary || repo.description,
              installedVersion: library.installedVersion,
              latestVersion: repo.latestVersion,
              latestCompatible: repo.latestCompatible,
              manifest: library.manifest
            });
          }
        }

        // add title to multiple-library repos
        if (
          repo_libs.length > 1 &&
          !(
            this.argv.libraries ||
            this.argv.short ||
            repo.name === localPathRepoName
          )
        ) {
          expanded_list.push({
            type: "repository",
            uri: repo.name,
            name: "",
            description: repo.description,
            installedVersion: "",
            latestVersion: repo.latestVersion,
            latestCompatible: repo.latestCompatible
          });

          if (
            !this.argv.json &&
            !this.argv.installed &&
            !this.argv.match &&
            !this.argv.urisOnly
          ) {
            // add an indent to group libraries in a repository
            repo_libs = repo_libs.map(lib => {
              lib.uri = "| " + lib.uri;
              return lib;
            });
          }
        }
        expanded_list = expanded_list.concat(repo_libs);
      }
      // filter by regular expression if requested
      if (this.argv.match) {
        let exp = new RegExp(this.argv.match, "i");
        expanded_list = expanded_list.filter(
          lib =>
            lib.uri.match(exp) ||
            lib.name.match(exp) ||
            lib.description.match(exp)
        );
      }

      // show only installed libraries if requested
      if (this.argv.installed) {
        expanded_list = expanded_list.filter(lib =>
          Boolean(lib.installedVersion)
        );
      }

      // output list
      if (this.argv.json) {
        // as JSON
        qx.tool.compiler.Console.info(JSON.stringify(expanded_list, null, 2));
      } else if (!this.argv.quiet) {
        // as columns
        qx.tool.compiler.Console.info(
          columnify(expanded_list, columnify_options)
        );

        if (!this.argv.noheaders) {
          qx.tool.compiler.Console.info();
          qx.tool.compiler.Console.info(
            "Note on columns: LATEST: Latest release that can be installed with this CLI;"
          );

          qx.tool.compiler.Console.info(
            "                 COMPATIBLE: Latest release that is semver-compatible with the qooxdoo version used."
          );

          if (!this.argv.all) {
            qx.tool.compiler.Console.info(
              "To see all libraries, including potentially incompatible ones, use 'qx package list --all'."
            );
          }
        }
      }

      // save to cache
      this.getCache().compat[qxVersion] = this.__latestCompatible[qxVersion];
      await this.saveCache();
    },

    /**
     * compatibility indexes
     */
    __repositories: null,
    __libraries: null,
    __latestCompatible: null,

    /**
     * Create compatibilty indexes of repositories and the contained libraries
     * @param qooxdoo_version {String} The qooxdoo version to check compatibiity with
     * @return {Number} The number of repositories containing compatible libraries
     */
    async __createIndexes(qooxdoo_version) {
      if (this.argv.installed) {
        // local libraries
        const localPathRepoName = this.self(arguments).localPathRepoName;
        this.__repositories.push({
          name: localPathRepoName,
          description: "Libraries on local filesystem"
        });

        this.__libraries[localPathRepoName] = [];
        let libData = await this.getLockfileData();
        for (let lib of libData.libraries) {
          if (!lib.repo_name) {
            let manifest_path = path.join(
              process.cwd(),
              lib.path,
              qx.tool.config.Manifest.config.fileName
            );

            let manifest = await qx.tool.utils.Json.loadJsonAsync(
              manifest_path
            );

            let info = manifest.info;
            this.__libraries[localPathRepoName].push({
              name: info.name,
              namespace: manifest.provides.namespace,
              summary: info.summary,
              version: "v" + info.version,
              compatibility: semver.satisfies(
                qooxdoo_version,
                manifest.requires["qooxdoo-sdk"],
                true
              ),

              path: path.relative(process.cwd(), path.dirname(manifest_path)),
              installedVersion: "v" + info.version,
              manifest
            });
          }
        }
      }

      // repositories
      let repos_cache = this.getCache().repos;
      let num_compat_repos = 0;
      if (this.__latestCompatible[qooxdoo_version] === undefined) {
        this.__latestCompatible[qooxdoo_version] = {};
      }

      // iterate over repositories
      for (let repo_name of repos_cache.list) {
        let repo_data = repos_cache.data[repo_name];

        // filter out repositories that are deprecated or should not be listed unless --all
        let d = repo_data.description;
        if (
          !this.argv.all &&
          d &&
          (d.includes("(deprecated)") || d.includes("(unlisted)"))
        ) {
          if (this.argv.verbose) {
            qx.tool.compiler.Console.warn(
              `>>> Ignoring ${repo_name}: Deprecated or unlisted. `
            );
          }
          continue;
        }

        let tag_names = repo_data.releases.list;
        let { description } = repo_data;
        let hasCompatibleRelease = false;
        let latestVersion = false;
        let repoInstalledVersion = false;

        // iterate over releases
        for (let tag_name of tag_names) {
          let release_data = repo_data.releases.data[tag_name];
          let { prerelease, manifests } = release_data;
          // iterate over library manifests in that release
          for (let manifest of manifests) {
            let { qx_versions, info, provides, path: manifest_path } = manifest;
            let installedVersion = false;
            if (info === undefined) {
              if (this.argv.verbose) {
                qx.tool.compiler.Console.warn(
                  `>>> Ignoring ${repo_name} ${tag_name}: Undefined info field. `
                );
              }
              continue;
            }

            // library version MUST match tag name (which can be longer, for example with pre-release info (alpha, beta, pre, rc etc)
            let library_name = info.name;
            let version = info.version;
            let tag_version = tag_name.replace(/v/, "");
            if (version !== tag_version.substr(0, version.length)) {
              if (this.argv.verbose) {
                qx.tool.compiler.Console.warn(
                  `>>> Ignoring ${repo_name} ${tag_name}, library '${library_name}': mismatch between tag version '${tag_version}' and library version '${version}'.`
                );
              }
              continue;
            }

            // save latest version
            try {
              if (!latestVersion || semver.gt(version, latestVersion, true)) {
                latestVersion = tag_name;
              }
            } catch (e) {
              if (this.argv.verbose) {
                qx.tool.compiler.Console.warn(
                  `>>> Ignoring ${repo_name} ${tag_name}, library '${library_name}': invalid version format '${version}'.`
                );
              }
            }

            // installed from GitHub?
            let installed = await this.getInstalledLibraryTag(
              repo_name,
              library_name
            );

            if (installed) {
              installedVersion = installed;
              repoInstalledVersion = installed;
            } else {
              let lib = await this.getInstalledLibraryData(library_name);
              if (lib) {
                installedVersion = "v" + lib.library_version;
              }
            }

            // check compatibility of library
            let compatibility = semver.satisfies(
              qooxdoo_version,
              qx_versions,
              true
            );

            // prepare indexes
            if (this.__libraries[repo_name] === undefined) {
              this.__libraries[repo_name] = [];
            }

            // use the latest compatible release, i.e the one that satisfies the following conditions:
            // 1) must be semver-compatible with the qooxdoo version
            // 2) must be the higher than any other version found so far
            // 3) should not be a pre-release unless there are no other compatible releases
            let latestCompatibleRelease =
              this.__latestCompatible[qooxdoo_version][repo_name];
            let latestCompatibleVersion = latestCompatibleRelease
              ? latestCompatibleRelease.replace(/v/, "")
              : undefined;
            if (
              compatibility === true &&
              (latestCompatibleRelease === undefined ||
                (semver.gt(tag_version, latestCompatibleVersion, false) &&
                  (!prerelease || this.argv.prereleases)))
            ) {
              this.__latestCompatible[qooxdoo_version][repo_name] = tag_name;
              hasCompatibleRelease = true;
            }

            // save data
            this.__libraries[repo_name].push({
              name: info.name,
              namespace: provides ? provides.namespace : "",
              summary: info.summary,
              version,
              compatibility,
              required_qx_version: qx_versions,
              path: path.dirname(manifest_path),
              installedVersion,
              manifest
            });
          }
        }
        if (hasCompatibleRelease) {
          num_compat_repos++;
        }

        // add to list
        this.__repositories.push({
          name: repo_name,
          description,
          installedVersion: repoInstalledVersion,
          latestVersion,
          latestCompatible: hasCompatibleRelease
            ? this.__latestCompatible[qooxdoo_version][repo_name]
            : false
        });
      }
      return num_compat_repos;
    }
  }
});
