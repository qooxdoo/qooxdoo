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

const qx = require("qooxdoo");
const fs = require("fs");
const process = require('process');
const Repository = require('github-api/dist/components/Repository');
const jsonlint = require("jsonlint");
const semver = require("semver");
const inquirer = require("inquirer");

const MANIFEST_KEY_COMPAT_VERSION_RANGE = "qooxdoo-range";
const ENV_GH_ACCESS_TOKEN = "GITHUB_ACCESS_TOKEN";

/**
 * Publishes a release on GitHub
 * @todo add GitHub topic "qooxdoo-contrib" to repository (not yet availaible via API)
 */
qx.Class.define("qxcli.commands.contrib.Publish", {
  extend: qxcli.commands.Contrib,

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
          "token": {
            alias: "T",
            describe: 'Use a GitHub access token'
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
          }
        },
        handler: function(argv) {
          return new qxcli.commands.contrib.Publish(argv)
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
        throw new qxcli.Utils.UserError("Please commit or stash all remaining changes first.");
      }
      status = await this.exec("git status --porcelain --branch");
      if( status.includes("ahead") ){
        throw new qxcli.Utils.UserError("Please push all local commits to GitHub first.");
      }
      
      // token
      let token = argv.token || process.env[ENV_GH_ACCESS_TOKEN];
      if( ! token ){
        throw new qxcli.Utils.UserError(`GitHub access token required. Pass it via --token or set the environment variable ${ENV_GH_ACCESS_TOKEN}`);
      }

      // read Manifest.json
      let manifest_path = process.cwd() + "/Manifest.json";
      if( ! fs.existsSync(manifest_path) ) {
        throw new qxcli.Utils.UserError("Cannot find Manifest.json - are you in the project directory?");
      }
      let manifest = jsonlint.parse( fs.readFileSync(manifest_path,"utf-8") );

      // version
      let new_version;
      if( argv.version ) {
        // use user-supplied value
        new_version = argv.version;
        if( ! semver.valid(new_version) ) {
          throw new qxcli.Utils.UserError(`${new_version} is not a valid version number.`);
        }
      } else {
        // use version number from manifest and increment it
        let old_version = manifest.info.version;
        if( ! semver.valid(old_version) ) {
          throw new qxcli.Utils.UserError("Invalid version number in Manifest.");
        }
        new_version = semver.inc( old_version, argv.type );
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
      fs.writeFileSync( manifest_path, JSON.stringify(manifest, null, 2), "utf-8");
      
      // tag name
      let url, repo_name, tag_name;
      try {
        url = await this.exec("git config --get remote.origin.url");
      } catch(e) {
        this.exit("Cannot determine remote repository.");
      }
      repo_name = url.replace(/https:\/\/github.com\//,"").replace(/\.git/,"").trim();
      tag_name = `v${new_version}`;
      if ( argv.dryrun ) {
        if( ! argv.quiet) console.info(`Dry run: not creating tag and release '${tag_name}' of ${repo_name}...`);
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
        let answer = await inquirer.prompt(question);
        message = answer.message;
      } 
      if( ! message ) {
        message  = `Release v${new_version}`;
      }
      
      if( ! argv.quiet ) {
        console.info(`Creating tag and release '${tag_name}' of ${repo_name}...`);
      } 

      // commit and push
      try {
        await this.run("git",["add","Manifest.json"]);
        await this.run("git",["commit",`-m "${message}"`]);
        await this.run("git",["push"]);
        let release_data = {
          tag_name,
          "target_commitish": "master",
          "name": tag_name,
          "body": ``,
          "draft": false,
          "prerelease": (argv.type.indexOf("pre")>=0)
        }
        let repository = new Repository(repo_name, {token} ); 
        await repository.createRelease(release_data);
      } catch(e) {
        throw new qxcli.Utils.UserError(e.message);
      }
    }
  }
});
