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

/**
 * Cleans generated and cache files
 */
qx.Class.define("qx.tool.compiler.cli.commands.Clean", {
  extend: qx.tool.compiler.cli.Command,
  statics: {
    async createCliCommand(clazz = this) {
      let cmd = await qx.tool.compiler.cli.Command.createCliCommand(clazz);
      cmd.set({
        name: "clean",
        description: "cleans generated files and caches."
      });

      return cmd;
    }
  },

  members: {
    /**
     * Deletes all generated and cache files
     */
    async process() {
      let compileConfig = await qx.tool.config.Compile.getInstance().load();
      for (let target of compileConfig.getValue("targets")) {
        await this.__removePath(path.join(process.cwd(), target.outputPath));
        if (target.deployPath) {
          await this.__removePath(path.join(process.cwd(), target.deployPath));
        }
      }
      await this.__removePath(
        path.join(process.cwd(), qx.tool.compiler.cli.commands.Package.cache_dir)
      );

      // check if we have to migrate files
      await this.checkMigrations();
    },

    async __removePath(pathToRemove) {
      if (await fs.existsAsync(pathToRemove)) {
        if (this.argv.verbose) {
          qx.tool.compiler.Console.info(`Removing ${pathToRemove}...`);
        }
        await qx.tool.utils.files.Utils.deleteRecursive(pathToRemove);
      }
    }
  }
});
