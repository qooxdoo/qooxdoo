/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2021 Zenesis Ltd

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * John Spackman (john.spackman@zenesis.com, @johnspackman)

************************************************************************ */

const fs = require("fs");
const path = require("upath");

/**
 * Migrates code to ES6 (partially)
 */
qx.Class.define("qx.tool.cli.commands.Es6ify", {
  extend: qx.tool.cli.commands.Command,
  statics: {
    getYargsCommand() {
      return {
        command: "es6ify [file]",
        describe: "help migrate code to ES6",
        builder: {
          verbose: {
            alias: "v",
            describe: "Verbose logging"
          },

          overwrite: {
            type: "boolean",
            default: true,
            describe: "Overwrite source files"
          },

          exclude: {
            type: "array",
            describe: "Paths to exclude"
          },

          arrowFunctions: {
            choices: ["never", "always", "careful", "aggressive"],
            default: "careful"
          }
        }
      };
    }
  },

  members: {
    async process() {
      await super.process();
      let exclude = this.argv.exclude;

      const processFile = async filename => {
        if (exclude && filename.startsWith(exclude)) {
          return;
        }

        console.log(`Processing ${filename}...`);
        let ify = new qx.tool.compiler.Es6ify(filename);
        ify.set({
          arrowFunctions: this.argv.arrowFunctions,
          overwrite: this.argv.overwrite
        });

        await ify.transform();
      };

      const scanImpl = async filename => {
        let basename = path.basename(filename);
        let stat = await fs.promises.stat(filename);

        if (stat.isFile() && basename.match(/\.js$/)) {
          await processFile(filename);
        } else if (
          stat.isDirectory() &&
          (basename == "." || basename[0] != ".")
        ) {
          let files = await fs.promises.readdir(filename);
          for (let i = 0; i < files.length; i++) {
            let subname = path.join(filename, files[i]);
            await scanImpl(subname);
          }
        }
      };

      await scanImpl(this.argv.file);
    }
  }
});
