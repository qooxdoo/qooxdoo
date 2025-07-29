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
qx.Class.define("qx.tool.compiler.cli.commands.Es6ify", {
  extend: qx.tool.compiler.cli.Command,
  statics: {
    async createCliCommand(clazz = this) {
      let cmd = await qx.tool.compiler.cli.Command.createCliCommand(clazz);
      cmd.set({
        name: "es6ify",
        description: "help migrate code to ES6"
      });

      cmd.addArgument(
        new qx.tool.cli.Argument("files").set({
          description: "files to process",
          array: true,
          type: "string"
        })
      );

      cmd.addFlag(
        new qx.tool.cli.Flag("gitPreCommit").set({
          description: "When used as a Git pre-commit hook",
          type: "boolean"
        })
      );

      cmd.addFlag(
        new qx.tool.cli.Flag("overwrite").set({
          description: "Overwrite source files",
          type: "boolean",
          value: true
        })
      );

      cmd.addFlag(
        new qx.tool.cli.Flag("exclude").set({
          description: "Paths to exclude",
          array: true,
          type: "string"
        })
      );

      cmd.addFlag(
        new qx.tool.cli.Flag("arrowFunctions").set({
          description: "Arrow function conversion mode",
          type: ["never", "always", "careful", "aggressive"],
          value: "careful"
        })
      );

      cmd.addFlag(
        new qx.tool.cli.Flag("singleLineBlocks").set({
          description: "Force braces around single line bodies for if, for, while, and do while",
          type: "boolean",
          value: false
        })
      );

      return cmd;
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
          overwrite: this.argv.overwrite,
          singleLineBlocks: this.argv.singleLineBlocks
        });

        await ify.transform();
      };

      if (this.argv.gitPreCommit) {
        let result = await qx.tool.utils.Utils.runCommand(
          process.cwd(),
          "git",
          "diff",
          "--cached",
          "--name-only",
          "--diff-filter=ACMR"
        );

        if (result.exitCode != 0) {
          qx.tool.compiler.Console.error(
            `Failed to run 'git diff': ${JSON.stringify(result, null, 2)}`
          );

          process.exit(1);
          return;
        }
        let lines = result.output
          .split(/\n/)
          .filter(str => !!str.match(/^source\/class\/.*\.js$/));
        for (let filename of lines) {
          await processFile(filename);
          result = await qx.tool.utils.Utils.runCommand(
            process.cwd(),
            "git",
            "add",
            filename
          );

          if (result.exitCode != 0) {
            qx.tool.compiler.Console.error(
              `Failed to run 'git add ${filename}': ${JSON.stringify(
                result,
                null,
                2
              )}`
            );

            process.exit(1);
            return;
          }
        }
        process.exit(0);
      }

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
