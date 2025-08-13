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

      const classFiles = [];

      const scanImpl = async filename => {
        let basename = path.basename(filename);
        let stat = await fs.promises.stat(filename);
        if (stat.isFile() && basename.match(/\.js$/)) {
          classFiles.push(filename);
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
      for (let file of files) {
        await scanImpl(file);
      }

      if (qx.core.Environment.get("qx.debug")) {
        if (this.argv.metaDebug) {
          this.argv.verbose = true;
          if (classFiles.length > 1) {
            console.log("Only one file can be processed in meta debug mode");
          }
          let meta = new qx.tool.compiler.MetaExtraction();
          await meta.parse(classFiles[0]);
          meta.fixupJsDoc({ resolveType: type => type });
          console.log(JSON.stringify(meta.getMetaData(), null, 2));
          process.exit(0);
        }
      }

      let metaDb = new qx.tool.compiler.MetaDatabase();
      await metaDb.load();
      for (let filename of classFiles) {
        if (this.argv.verbose) {
          qx.tool.compiler.Console.info(`Processing ${filename} ...`);
        }
        await metaDb.addFile(filename);
      }
      await metaDb.reparseAll();

      let tsWriter = new qx.tool.compiler.targets.TypeScriptWriter(metaDb);
      await tsWriter.process();
    }
  }
});
