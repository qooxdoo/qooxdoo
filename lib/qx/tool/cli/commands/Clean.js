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
require("./Contrib");

require("qooxdoo");
const fs = require("fs");
const process = require("process");
const path = require("upath");
const rimraf = require("rimraf");

/**
 * Cleans generated and cache files
 */
qx.Class.define("qx.tool.cli.commands.Clean", {
  extend: qx.tool.cli.commands.Command,
  statics: {
    getYargsCommand: function() {
      return {
        command: "clean",
        describe: "cleans generated files and caches.",
        builder: {
          "verbose":{
            alias : "v",
            describe: "Verbose logging"
          }                    
        },
        handler: function(argv) {
          return new qx.tool.cli.commands.Clean(argv)
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
     * Deletes all generated and cache files
     */
    process: async function() {
      let compile = await this.parseCompileConfig();
      for (let target of compile.targets) {
        await this.__removePath(path.join(process.cwd(), target.outputPath));
      }
      await this.__removePath(path.join(process.cwd(), "contrib"));
    },

    __removePath: async function(pathToRemove) {
      if (await fs.existsAsync(pathToRemove)) {
        if (this.argv.verbose) {
          console.info(`Removing ${pathToRemove}...`);
        }
        await new Promise((resolve, reject) => {
          rimraf(pathToRemove, {}, err => {
            if (err) {
              reject(err); 
            } else {
              resolve(); 
            } 
          });
        });
      }
    }
  }
});
