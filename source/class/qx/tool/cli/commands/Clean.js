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
        }
      };
    }
  },

  members: {

    /**
     * Deletes all generated and cache files
     */
    process: async function() {
      let compileConfig = await qx.tool.config.Compile.getInstance().load();
      for (let target of compileConfig.getValue("targets")) {
        await this.__removePath(path.join(process.cwd(), target.outputPath));
        if (target.deployPath) {
          await this.__removePath(path.join(process.cwd(), target.deployPath));
        }
      }
      await this.__removePath(path.join(process.cwd(), qx.tool.cli.commands.Package.cache_dir));
    },

    __removePath: async function(pathToRemove) {
      if (await fs.existsAsync(pathToRemove)) {
        if (this.argv.verbose) {
          qx.tool.compiler.Console.info(`Removing ${pathToRemove}...`);
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
