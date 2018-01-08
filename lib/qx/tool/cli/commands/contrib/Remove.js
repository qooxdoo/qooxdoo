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
const fs = require('fs');
const path_module = require('upath');
const process = require('process');
const rimraf = require('rimraf');
const jsonlint = require("jsonlint");

/**
 * Installs a contrib libraries
 */
qx.Class.define("qxcli.commands.contrib.Remove", {
  extend: qxcli.commands.Contrib,

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
          return new qxcli.commands.contrib.Remove(argv)
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
        throw new qxcli.Utils.UserError( "No repository name given.");
      }
      
      // read libraries array from contrib.json
      let data = this.getContribData();
    
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
    }
  }
});
