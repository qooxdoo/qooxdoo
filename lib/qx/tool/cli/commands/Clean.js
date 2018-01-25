/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2017 Christian Boulanger and others

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Boulanger (info@bibliograph.org, @cboulanger)
     * Henner Kollmann (hkollmann)

************************************************************************ */

/*global qx qxcli*/

require("./Contrib");

require("qooxdoo");
const fs = require("fs");
const process = require('process');
const path = require('upath');
const rimraf = require('rimraf');

/**
 * Cleans generated and cache files
 */
qx.Class.define("qx.tool.cli.commands.Clean", {
  extend: qx.tool.cli.commands.Command,
  statics: {
    getYargsCommand: function() {
      return {
        command: 'clean',
        describe: 'cleans generated files and caches.',
        builder: {
          "verbose":{
            alias : "v",
            describe: 'Verbose logging'
          }                    
        },
        handler: function(argv) {
          return new qx.tool.cli.commands.Clean(argv)
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
     * Deletes all generated and cache files
     */
    process: async function() {
      let verbose = this.argv.verbose;
      let compile = await this.parseCompileConfig();
      for( let target of compile.targets ){
        let outputPath = path.join( process.cwd(), target.outputPath );
        if( await fs.existsAsync( outputPath ) ){
          if( verbose ) console.info(`Removing ${target.outputPath}...`);
          await new Promise((resolve,reject)=>{
            rimraf(outputPath,{},(err)=>{
              if( err ) reject(err); else resolve(); 
            });
          });
        }
      }
      for( let cacheFile of ["db.json","resource-db.json"]){
        let dbPath = path.join( process.cwd(), cacheFile );
        if( verbose ) console.info(`Removing ${cacheFile}...`);
        await fs.unlinkAsync(dbPath);
      }
    }
  }
});
