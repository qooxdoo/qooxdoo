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
const ignore = require("ignore");

/**
 * Migrates code to ES6 (partially)
 */
qx.Class.define("qx.tool.cli.commands.Es6ify", {
  extend: qx.tool.cli.commands.Command,
  statics: {
    getYargsCommand() {
      return {
        command: "es6ify [files...]",
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
      const ignoreFileName = ".prettierignore";
      const ig = ignore();
      try {
        ig.add((await fs.promises.readFile(ignoreFileName)).toString());
      } catch (err) {
        if (err.code !== "ENOENT") {
          throw err;
        }
      }
      let exclude = this.argv.exclude;
      if (exclude) {
        if (!qx.lang.Type.isArray(exclude)) {
          exclude = [exclude];
        }
        ig.add(exclude);
      }

      const processFile = async filename => {
        if (ig.ignores(filename)) {
          return;
        }
        qx.tool.compiler.Console.info(`Processing ${filename}...`);
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
      let files = this.argv.files || [];
      if (files.length === 0) {
        files.push("source");
      }
      for await (let file of files) {
        await scanImpl(file);
      }
    }
  }
});
