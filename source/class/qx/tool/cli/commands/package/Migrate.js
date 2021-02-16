/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2017-2021 Christian Boulanger

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Boulanger (info@bibliograph.org, @cboulanger)

************************************************************************ */
const process = require("process");

/**
 * Installs a package
 */
qx.Class.define("qx.tool.cli.commands.package.Migrate", {
  extend: qx.tool.cli.commands.Package,

  statics: {
    /**
     * Flag to prevent recursive call to process()
     */
    migrationInProcess: false,
    /**
     * Return the Yargs configuration object
     * @return {{}}
     */
    getYargsCommand: function() {
      return {
        command: "migrate",
        describe: "migrates the package system to a newer version.",
        builder: {
          "verbose": {
            alias: "v",
            describe: "Verbose logging"
          },
          "dry-run": {
            describe: "Do not apply migrations"
          }
        }
      };
    }
  },

  members: {
    /**
     * Announces or applies a migration
     */
    process: async function() {
      let runner = new qx.tool.migration.Runner().set({
        command: this,
        dryRun: this.argv.dryRun,
        verbose: this.argv.verbose
      });
      runner.runMigrations();
      if (!this.argv.quiet) {
        qx.tool.compiler.Console.info("Migration completed.");
      }
    }
  }
});
