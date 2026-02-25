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
qx.Class.define("qx.tool.compiler.cli.commands.Typescript", {
  extend: qx.tool.compiler.cli.Command,
  statics: {
    async createCliCommand(clazz = this) {
      let cmd = await qx.tool.compiler.cli.Command.createCliCommand(clazz);
      cmd.set({
        name: "typescript", 
        description: "generate typescript definitions"
      });

      cmd.addArgument(
        new qx.tool.cli.Argument("files").set({
          description: "files to process",
          array: true,
          type: "string"
        })
      );

      cmd.addFlag(
        new qx.tool.cli.Flag("outputFilename").set({
          description: "Output filename",
          type: "string",
          value: "qooxdoo.d.ts"
        })
      );

      cmd.addFlag(
        new qx.tool.cli.Flag("exclude").set({
          description: "Paths to exclude",
          array: true,
          type: "string"
        })
      );

      if (qx.core.Environment.get("qx.debug")) {
        cmd.addFlag(
          new qx.tool.cli.Flag("meta-debug").set({
            description: "Debug metadata output to console, implies --verbose and only one file",
            type: "boolean",
            value: false
          })
        );
      }

      return cmd;
    }
  },

  members: {
    async process() {
      const IGNORE_FILENAME = ".typescriptignore";
      const ig = ignore();
      try {
        ig.add((await fs.promises.readFile(IGNORE_FILENAME)).toString());
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

      let files = this.argv.files || [];
      if (files.length === 0) {
        if (fs.existsSync("Manifest.json")) {
          let manifest = await qx.tool.utils.Json.loadJsonAsync(
            "Manifest.json"
          );

          let tmp = manifest?.provides?.class;
          if (tmp) {
            files.push(tmp);
          }
        }
        if (files.length === 0 && fs.existsSync("source/class")) {
          files.push("source/class");
        }
      }
      if (files.length === 0) {
        qx.tool.compiler.Console.error("No files to process");
        process.exit(1);
      }

      if (qx.core.Environment.get("qx.debug")) {
        if (this.argv.metaDebug) {
          this.argv.verbose = true;
          let target = files[0];
          let stat = await fs.promises.stat(target);
          if (stat.isDirectory()) {
            const findFirst = async dir => {
              for (let entry of await fs.promises.readdir(dir)) {
                let full = path.join(dir, entry);
                let s = await fs.promises.stat(full);
                if (s.isFile() && entry.endsWith(".js")) {
                  return full;
                }
                if (s.isDirectory() && entry[0] !== ".") {
                  let found = await findFirst(full);
                  if (found) {
                    return found;
                  }
                }
              }
              return null;
            };
            target = await findFirst(target);
            if (!target) {
              qx.tool.compiler.Console.error("No .js file found for meta debug");
              process.exit(1);
            }
          }
          let meta = new qx.tool.compiler.MetaExtraction();
          await meta.parse(target);
          meta.fixupJsDoc({ resolveType: type => type });
          console.log(JSON.stringify(meta.getMetaData(), null, 2));
          process.exit(0);
        }
      }

      let metaDb = new qx.tool.compiler.MetaDatabase();
      await metaDb.load();
      await metaDb.loadFromDirectories(files, { ignore: ig, verbose: this.argv.verbose });

      let tsWriter = new qx.tool.compiler.targets.TypeScriptWriter(metaDb);
      if (this.argv.outputFilename) {
        tsWriter.setOutputTo(this.argv.outputFilename);
      }
      await tsWriter.process();
    }
  }
});
