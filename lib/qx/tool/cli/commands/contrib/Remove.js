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
const fs = require('fs');
const path_module = require('upath');
const process = require('process');
const path = require('upath');
const rimraf = require('rimraf');

/**
 * Installs a contrib libraries
 */
qx.Class.define("qx.tool.cli.commands.contrib.Remove", {
  extend: qx.tool.cli.commands.Contrib,

  statics: {
    getYargsCommand: function() {
      return {
        command: 'remove [repository]',
        describe: 'removes a contrib library from the configuration.',
        builder: {
          "verbose": {
            alias: 'v',
            describe: 'Verbose logging'
          },
          'quiet': {
            alias: 'q',
            describe: 'No output'
          }
        },
        handler: function(argv) {
          return new qx.tool.cli.commands.contrib.Remove(argv)
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
     * Removes contrib libraries
     */
    process: async function() {
      let argv = this.argv;

      let repo_name = argv.repository;
      if ( ! repo_name ){
        throw new qx.tool.cli.Utils.UserError( "No repository name given.");
      }
      
      await this.removeApplication(repo_name);

      // read libraries array from contrib.json
      let data = await this.getContribData();
    
      // does the repository name already exist?
      let found = [];
      let libraries = [];
      for ( let [index, elem] of data.libraries.entries() ){
        if( elem.repo_name == repo_name ){
          found.push(index);
        } else {
          libraries.push(elem);
        }
      } 
      if( found.length ){
        rimraf.sync(data.libraries[found[0]].path);
        if (! argv.quiet) console.info(`Deleted ${found.length} entries for ${repo_name}`);
      } else if( argv.verbose) {
        console.warn(`No entry for ${repo_name}`);
      }
      data.libraries = libraries;
      fs.writeFileSync( this.getContribFileName(), JSON.stringify(data, null, 2), "utf-8");
    },
    removeApplication: async function(repoName) {
      let contribJson = await this.getContribData();
      let libraryJson = contribJson.libraries.find(data => data.repo_name == repoName);
      if (!libraryJson)
        throw new Error("Repo for " + repoName + " is not installed as a contrib");
      
      let manifest = await qx.tool.compiler.utils.Json.loadJsonAsync(path.join(libraryJson.path, "Manifest.json"), "utf8");
      if (!manifest.provides || !manifest.provides.application) {
        if (this.argv.verbose) 
          console.info(">>> No application to remove.");
        return;
      }

      let compileJson = await qx.tool.compiler.utils.Json.loadJsonAsync("compile.json");
      let manifestApp = manifest.provides.application;
      let app = compileJson.applications.find(app => {
        if (manifestApp.name && app.name)
          return manifestApp.name == app.name;
        return manifestApp["class"] == app["class"];
      });
      if (app) {
        let idx = compileJson.applications.indexOf(app);
        compileJson.applications.splice(idx, 1);

        if (this.argv.verbose) 
          console.info(">>> Removed application " + (app.name||app["class"]));
        return await qx.tool.compiler.utils.Json.saveJsonAsync("compile.json", compileJson);


      }  
    }
  }
});
