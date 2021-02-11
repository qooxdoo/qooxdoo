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
const fs = require("fs");
const path = require("upath");
const process = require("process");
const { Octokit } = require("@octokit/rest");
const semver = require("semver");
const inquirer = require("inquirer");
const glob = require("glob");

/**
 * Publishes a release on GitHub
 */
qx.Class.define("qx.tool.cli.commands.package.Publish", {
  extend: qx.tool.cli.commands.Package,

  statics: {
    getYargsCommand: function() {
      return {
        command: "publish",
        describe: "publishes a new release of the package on GitHub. Requires a GitHub access token. By default, makes a patch release.",
        builder: {
          "type": {
            alias : "t",
            describe: "Set the release type",
            nargs: 1,
            requiresArg: true,
            choices: "major,premajor,minor,preminor,patch,prepatch,prerelease".split(/,/),
            type: "string",
            default : "patch"
          },
          "noninteractive":{
            alias: "I",
            describe: "Do not prompt user"
          },
          "use-version": {
            alias: "V",
            describe: "Use given version number"
          },
          "prerelease": {
            alias: "p",
            describe: "Publish as a prerelease (as opposed to a stable release)"
          },
          "quiet": {
            alias: "q",
            describe: "No output"
          },
          "message":{
            alias: "m",
            describe: "Set commit/release message"
          },
          "dryrun":{
            alias: "d",
            describe: "Show result only, do not publish to GitHub"
          },
          "verbose": {
            alias: "v",
            describe: "Verbose logging"
          },
          "force": {
            alias: "f",
            describe: "Ignore warnings (such as demo check)"
          },
          "create-index": {
            alias: "i",
            describe: "Create an index file (qooxdoo.json) with paths to Manifest.json files"
          }
        }
      };
    }
  },

  members: {

    /**
     * Publishes a new release of the package on GitHub, by executing the following steps:
     *
     * 1. In Manifest.json, update the qooxdoo-range value to include the version of the qooxdoo
     *    framework (As per package.json).
     * 2. In Manifest.json, based the given options, increment the version number (patch,
     *    feature, breaking).
     * 3. Create a release with the tag vX.Y.Z according to the current version.
     * 4. Add "qooxdoo-package" to the list of GitHub topics.
     *
     */
    process: async function() {
      await this.base(arguments);
      // init
      const argv = this.argv;

      // qooxdoo version
      let qooxdoo_version = await this.getUserQxVersion();
      if (argv.verbose) {
        qx.tool.compiler.Console.log(`>>> qooxdoo version:  ${qooxdoo_version}`);
      }

      // check git status
      let status = await this.exec("git status --porcelain");
      if (status.trim() !=="") {
        throw new qx.tool.utils.Utils.UserError("Please commit or stash all remaining changes first.");
      }
      status = await this.exec("git status --porcelain --branch");
      if (status.includes("ahead")) {
        throw new qx.tool.utils.Utils.UserError("Please push all local commits to GitHub first.");
      }

      // token
      let cfg = await qx.tool.cli.ConfigDb.getInstance();
      let github = cfg.db("github", {});
      if (!github.token) {
        let response = await inquirer.prompt([
          {
            type: "input",
            name: "token",
            message: "Publishing to GitHub requires an API token - visit https://github.com/settings/tokens to obtain one " +
                "(you must assign permission to publish);\nWhat is your GitHub API Token ? "
          }
        ]
        );
        if (!response.token) {
          qx.tool.compiler.Console.error("You have not provided a GitHub token.");
          return;
        }
        github.token = response.token;
        cfg.save();
      }
      let token = github.token;
      if (!token) {
        throw new qx.tool.utils.Utils.UserError(`GitHub access token required.`);
      }
      const octokit = new Octokit({
        auth: token
      });

      // create index file first?
      if (argv.i) {
        await this.__createIndexFile(argv);
      }

      let libraries;
      let version;
      let manifestModels = [];
      let mainManifestModel;
      const cwd = process.cwd();
      const registryModel = qx.tool.config.Registry.getInstance();
      if (await registryModel.exists()) {
        // we have a qooxdoo.json index file containing the paths of libraries in the repository
        await registryModel.load();
        libraries = registryModel.getValue("libraries");
        for (let library of libraries) {
          let manifestModel =
            await (new qx.tool.config.Abstract(qx.tool.config.Manifest.config))
              .set({baseDir: path.join(cwd, library.path)})
              .load();
          manifestModels.push(manifestModel);
          // use the first manifest or the one with a truthy property "main" as reference
          if (!version || library.main) {
            version = manifestModel.getValue("info.version");
            mainManifestModel = manifestModel;
          }
        }
      } else {
        // read Manifest.json
        mainManifestModel = await qx.tool.config.Manifest.getInstance().load();
        manifestModels.push(mainManifestModel);
        // prevent accidental publication of demo manifest.
        if (!argv.force && mainManifestModel.getValue("provides.namespace").includes(".demo")) {
          throw new qx.tool.utils.Utils.UserError("This seems to be the library demo. Please go into the library root directory to publish the library.");
        }
        libraries = [{ path: "."}];
      }

      // version
      let new_version;
      if (argv.useVersion) {
        // use user-supplied value
        new_version = semver.coerce(argv.useVersion);
        if (!new_version) {
          throw new qx.tool.utils.Utils.UserError(`${argv.useVersion} is not a valid version number.`);
        }
        new_version = new_version.toString();
      } else {
        // use version number from manifest and increment it
        let old_version = mainManifestModel.getValue("info.version");
        if (!semver.valid(old_version)) {
          throw new qx.tool.utils.Utils.UserError("Invalid version number in Manifest. Must be a valid semver version (x.y.z).");
        }
        new_version = semver.inc(old_version, argv.type);
      }

      // tag and repo name
      let tag = `v${new_version}`;
      let url;
      try {
        url = (await this.exec("git config --get remote.origin.url")).trim();
      } catch (e) {
        throw new qx.tool.utils.Utils.UserError("Cannot determine remote repository.");
      }
      let repo_name = url.replace(/(https:\/\/github.com\/|git@github.com:)/, "").replace(/\.git/, "");
      let [owner, repo] = repo_name.split(/\//);
      if (argv.verbose) {
        qx.tool.compiler.Console.log(`>>> Repository:  ${repo_name}`);
      }
      let repoExists = false;
      try {
        await octokit.repos.getReleaseByTag({owner, repo, tag});
        repoExists = true;
      } catch (e) {}
      if (repoExists) {
        throw new qx.tool.utils.Utils.UserError(`A release with tag '${tag} already exists.'`);
      }

      // get topics, this will also check credentials
      let result;
      let topics;
      try {
        result = await octokit.repos.getAllTopics({owner,
          repo});
        topics = result.data.names;
      } catch (e) {
        if (e.message.includes("Bad credentials")) {
          throw new qx.tool.utils.Utils.UserError(`Your token is invalid.`);
        }
        throw e;
      }

      // prompt user to confirm
      let doRelease = true;
      if (!argv.noninteractive) {
        let question = {
          type: "confirm",
          name: "doRelease",
          message: `This will ${argv.version?"set":"increment"} the version to ${new_version} and create a release of the current master on GitHub. Do you want to proceed?`,
          default: "y"
        };
        let answer = await inquirer.prompt(question);
        doRelease = answer.doRelease;
      }
      if (!doRelease) {
        process.exit(0);
      }

      // framework dependency
      let semver_range = mainManifestModel.getValue("requires.@qooxdoo/framework");
      if (!semver.satisfies(qooxdoo_version, semver_range, {loose: true})) {
        semver_range += "^" + qooxdoo_version;
      }

      // update Manifest(s)
      for (let manifestModel of manifestModels) {
        manifestModel
          .setValue("requires.@qooxdoo/framework", semver_range)
          .setValue("info.version", new_version);
        if (argv.dryrun) {
          if (!argv.quiet) {
            qx.tool.compiler.Console.info(`Dry run: Not committing ${manifestModel.getRelativeDataPath()} with the following content:`);
            qx.tool.compiler.Console.info(manifestModel.getData());
          }
        } else {
          manifestModel.save();
        }
      }

      // package.json, only supported in the root
      const package_json_path = path.join(process.cwd(), "package.json");
      if (await fs.existsAsync(package_json_path)) {
        let data = await qx.tool.utils.Json.loadJsonAsync(package_json_path);
        data.version = new_version;
        if (this.argv.dryrun) {
          qx.tool.compiler.Console.info("Dry run: Not changing package.json version...");
        } else {
          await qx.tool.utils.Json.saveJsonAsync(package_json_path, data);
          if (!this.argv.quiet) {
            qx.tool.compiler.Console.info(`Updated version in package.json.`);
          }
        }
      }

      if (argv.dryrun) {
        qx.tool.compiler.Console.info(`Dry run: not creating tag and release '${tag}' of ${repo_name}...`);
        process.exit(0);
      }

      // commit message
      let message;
      if (argv.message) {
        message = argv.message.replace(/"/g, "\\\"");
      } else if (!argv.noninteractive) {
        let question = {
          type: "input",
          name: "message",
          message: `Please enter a commit message:`
        };
        let answer = await inquirer.prompt([question]);
        message = answer.message;
      }
      if (!message) {
        message = `Release v${new_version}`;
      }

      if (!argv.quiet) {
        qx.tool.compiler.Console.info(`Creating tag and release '${tag}' of ${repo_name}...`);
      }

      // commit and push
      try {
        await this.run("git", ["add", "--all"]);
        await this.run("git", ["commit", `-m "${message}"`, "--allow-empty"]);
        await this.run("git", ["push"]);
        let release_data = {
          owner,
          repo,
          tag_name: tag,
          target_commitish: "master",
          name: tag,
          body: message,
          draft: false,
          prerelease: Boolean(argv.prerelease)
        };
        await octokit.repos.createRelease(release_data);
        if (!argv.quiet) {
          qx.tool.compiler.Console.info(`Published new version '${tag}'.`);
        }
      } catch (e) {
        throw new qx.tool.utils.Utils.UserError(e.message);
      }
      // add GitHub topic
      const topic = "qooxdoo-package";
      if (!topics.includes(topic)) {
        topics.push(topic);
        await octokit.repos.replaceAllTopics({owner,
          repo,
          names:topics});
        if (!argv.quiet) {
          qx.tool.compiler.Console.info(`Added GitHub topic '${topic}'.`);
        }
      }
      await this.run("git", ["pull"]);
    },

    /**
     * Creates a qooxdoo.json file with paths to Manifest.json files in this repository
     * @private
     */
    __createIndexFile: async argv => new Promise((resolve, reject) => {
      if (argv.verbose && !argv.quiet) {
        qx.tool.compiler.Console.info("Creating index file...");
      }
      glob(qx.tool.config.Manifest.config.fileName, {matchBase: true}, async (err, files) => {
        if (err) {
          reject(err);
        }
        if (!files || !files.length) {
          reject(new qx.tool.utils.Utils.UserError("No Manifest.json files could be found"));
        }
        let mainpath;
        if (files.length > 1) {
          let choices = files.map(p => {
            let m = qx.tool.utils.Json.parseJson(fs.readFileSync(path.join(process.cwd(), p), "utf-8"));
            return {
              name: m.info.name + (m.info.summary ? ": " + m.info.summary : ""),
              value: p
            };
          });
          let answer = await inquirer.prompt({
            name: "mainpath",
            message: "Please choose the main library",
            type: "list",
            choices
          });
          mainpath = answer.mainpath;
        }
        let data = {
          libraries: files.map(p => files.length > 1 && p === mainpath ? {
            path: path.dirname(p),
            main: true
          } : {path: path.dirname(p)})
        };
        // write index file
        const registryModel = qx.tool.config.Registry.getInstance();
        if (argv.dryrun) {
          qx.tool.compiler.Console.info(`Dry run: not creating index file ${registryModel.getRelativeDataPath()} with the following content:`);
          qx.tool.compiler.Console.info(data);
        } else {
          await registryModel.load(data);
          await registryModel.save();
          if (!argv.quiet) {
            qx.tool.compiler.Console.info(`Created index file ${registryModel.getRelativeDataPath()}'.`);
          }
        }
        resolve();
      });
    })
  }
});
