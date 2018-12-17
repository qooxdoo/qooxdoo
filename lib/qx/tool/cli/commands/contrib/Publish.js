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

/*global qxcli*/

require("../Contrib");

require("qooxdoo");
const fs = require("fs");
const process = require('process');
const octokit = require('@octokit/rest')();
const jsonlint = require("jsonlint");
const semver = require("semver");
const inquirer = require("inquirer");

const MANIFEST_KEY_COMPAT_VERSION_RANGE = "qooxdoo-range";
const ENV_GH_ACCESS_TOKEN = "GITHUB_ACCESS_TOKEN";

/**
 * Publishes a release on GitHub
 */
qx.Class.define("qx.tool.cli.commands.contrib.Publish", {
  extend: qx.tool.cli.commands.Contrib,

  statics: {
    getYargsCommand: function() {
      return {
        command: 'publish',
        describe: 'publishes a new release of the contrib on GitHub. Requires a GitHub access token. By default, makes a patch release.',
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
            describe: 'Do not prompt user'
          },
          "version": {
            alias: "V",
            describe: 'Use given version number'
          },
          'quiet': {
            alias: 'q',
            describe: 'No output'
          },
          "message":{
            alias: 'm',
            describe: 'Set commit/release message'
          },
          "dryrun":{
            describe: 'Show result only, do not publish to GitHub'
          },
          "verbose": {
            alias: "v",
            describe: 'Verbose logging'
          },
          "force": {
            alias: "f",
            describe: 'overrun demo check'
          }
        },
        handler: function(argv) {
          return new qx.tool.cli.commands.contrib.Publish(argv)
            .process()
            .catch((e) => {
              console.error(e.stack || e.message);
              process.exit(1);
            });
        }
      };
    }
  },

  members: {

    /**
     * Publishes a new release of the contrib on GitHub, by executing the following steps:
     * 
     * 1. In Manifest.json, update the qooxdoo-range value to include the version of the qooxdoo 
     *    framework (As per version.txt).
     * 2. In Manifest.json, based the given options, increment the version number (patch, 
     *    feature, breaking). 
     * 3. Create a release with the tag vX.Y.Z according to the current version.
     * 4. Add "qooxdoo-contrib" to the list of GitHub topics.
     * 
     */
    process: async function() {
      
      // init
      let names = [];
      const argv = this.argv;

      // qooxdoo version 
      let qooxdoo_version = await this.getUserQxVersion();
      if(argv.verbose) console.log(`>>> qooxdoo version:  ${qooxdoo_version}`);    
      
      // check git status
      let status = await this.exec("git status --porcelain");
      if( status.trim() !=="" ){
        throw new qx.tool.cli.Utils.UserError("Please commit or stash all remaining changes first.");
      }
      status = await this.exec("git status --porcelain --branch");
      if( status.includes("ahead") ){
        throw new qx.tool.cli.Utils.UserError("Please push all local commits to GitHub first.");
      }
      
      // token
      let cfg = await qx.tool.cli.ConfigDb.getInstance();
      let github = cfg.db("github", {});
      if (!github.token) {
        let response = await inquirer.prompt([ 
          {
            type: 'input',
            name: 'token',
            message: "Publishing to GitHub requires an API token - visit https://github.com/settings/tokens to obtain one " +
                "(you must assign permission to publish);\nWhat is your GitHub API Token ? "
          }
          ]
        );
        if (!response.token) {
          console.error("You have not provided a GitHub token.")
          return;
        }
        github.token = response.token;
        cfg.save();
      }
      let token = github.token;
      if( ! token ){
        throw new qx.tool.cli.Utils.UserError(`GitHub access token required.`);
      }
      octokit.authenticate({
        type: 'token',
        token
      });

      // read Manifest.json
      let manifest_path = process.cwd() + "/Manifest.json";
      if( ! fs.existsSync(manifest_path) ) {
        throw new qx.tool.cli.Utils.UserError("Cannot find Manifest.json - are you in the project directory?");
      }
      let manifest = jsonlint.parse( fs.readFileSync(manifest_path,"utf-8") );

      // prevent accidental publication of demo manifest.
      if(!argv.force &&  manifest.provides.namespace.includes(".demo") ){
        throw new qx.tool.cli.Utils.UserError("This seems to be the contrib demo. Please go into the library directory to publish the library.");
      }

      // version
      let new_version;
      if( argv.version ) {
        // use user-supplied value
        new_version = argv.version;
        if( ! semver.valid(new_version) ) {
          throw new qx.tool.cli.Utils.UserError(`${new_version} is not a valid version number.`);
        }
      } else {
        // use version number from manifest and increment it
        let old_version = manifest.info.version;
        if( ! semver.valid(old_version) ) {
          throw new qx.tool.cli.Utils.UserError("Invalid version number in Manifest. Must be a valid semver version (x.y.z).");
        }
        new_version = semver.inc( old_version, argv.type );
      }

      // tag and repo name
      let tag = `v${new_version}`;
      let url;
      try {
        url = (await this.exec("git config --get remote.origin.url")).trim();
      } catch(e) {
        throw new qx.tool.cli.Utils.UserError("Cannot determine remote repository.");
      }
      let repo_name   = url.replace(/(https:\/\/github.com\/|git@github.com:)/,"").replace(/\.git/,"");
      let [owner,repo] = repo_name.split(/\//);
      if(argv.verbose) {
        console.log(`>>> Repository:  ${repo_name}`);
      }
      let repoExists = false;
      try{
        const result = await octokit.repos.getReleaseByTag({owner, repo, tag});
        repoExists = true;
      } catch(e) {}
      if (repoExists) throw new qx.tool.cli.Utils.UserError(`A release with tag '${tag} already exists.'`);

      // get topics, this will also check credentials
      let result, topics;
      try {
        result = await octokit.repos.getTopics({owner, repo});
        topics = result.data.names;
      } catch (e) {
        if ( e.message.includes("Bad credentials") ){
          throw new qx.tool.cli.Utils.UserError(`Your token is invalid.`);
        }
        throw e;
      }

      // prompt user to confirm
      let doRelease = true;
      if( ! argv.noninteractive ){
        let question = {
          type: "confirm",
          name: "doRelease",
          message: `This will ${argv.version?"set":"increment"} the version to ${new_version} and create a release of the current master on GitHub. Do you want to proceed?`,
          default: "y"
        };
        let answer = await inquirer.prompt(question);
        doRelease = answer.doRelease;
      }
      if ( ! doRelease ) process.exit(0);

      // update Manifest.json
      manifest.info.version = new_version;
      // qooxdoo-versions @deprecated
      let qooxdoo_versions = manifest.info["qooxdoo-versions"];
      if( qooxdoo_versions instanceof Array ){
        if( ! qooxdoo_versions.includes(qooxdoo_version) ){
          manifest.info["qooxdoo-versions"].push(qooxdoo_version);
        }
      }
      // qooxdoo-range
      let semver_range = manifest.info[MANIFEST_KEY_COMPAT_VERSION_RANGE] || "";
      if( ! semver.satisfies( qooxdoo_version, semver_range, true ) ){
        semver_range += ( semver_range ? " || " : "" ) + qooxdoo_version;
        manifest.info[MANIFEST_KEY_COMPAT_VERSION_RANGE] = semver_range;
      }
      let manifest_content = JSON.stringify(manifest, null, 2);
      if ( ! argv.dryrun ) {
        fs.writeFileSync( manifest_path, manifest_content, "utf-8");
      }

      if ( argv.dryrun ) {
        if( ! argv.quiet) console.info(`Dry run: not creating tag and release '${tag}' of ${repo_name}...`);
        console.info( "Here is the Manifest.json that would have been committed: ");
        console.info(manifest_content);
        process.exit(0);
      }

      // commit message
      let message;
      if( argv.message) {
        message = argv.message.replace(/"/g,"\\\"");
      } else if ( ! argv.noninteractive ) {
        let question = {
          type: "input",
          name: "message",
          message: `Please enter a commit message:`
        };
        let answer = await inquirer.prompt([question]);
        message = answer.message;
      } 
      if( ! message ) {
        message  = `Release v${new_version}`;
      }
      
      if( ! argv.quiet ) {
        console.info(`Creating tag and release '${tag}' of ${repo_name}...`);
      } 

      // commit and push
      try {
        await this.run("git",["add","Manifest.json"]);
        await this.run("git",["commit",`-m "${message}"`]);
        await this.run("git",["push"]);
        let release_data = {
          owner,
          repo,
          tag_name: tag,
          target_commitish: "master",
          name: tag,
          body: message,
          draft: false,
          prerelease: (argv.type.indexOf("pre")>=0)
        };
        await octokit.repos.createRelease(release_data);
        if( ! argv.quiet ) {
          console.info(`Published new version '${tag}'.`);
        }
      } catch(e) {
        throw new qx.tool.cli.Utils.UserError(e.message);
      }
      // add GitHub topic
      const topic = "qooxdoo-contrib";
      if( ! topics.includes(topic) ){
        topics.push(topic);
        await octokit.repos.replaceTopics({owner, repo, names:topics});
        if( ! argv.quiet ) {
          console.info(`Added GitHub topic '${topic}'.`);
        }
      }
    }
  }
});