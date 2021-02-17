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
 * Migrates an application to a higher version
 */
qx.Class.define("qx.tool.cli.commands.Migrate", {
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
        dryRun: Boolean(this.argv.dryRun),
        verbose: Boolean(this.argv.verbose)
      });
      let mustBeMigrated = await runner.runMigrations();
      this.info(
        mustBeMigrated
          ? (this.argv.dryRun ? "Re-run without --dry-run to apply the migrations." : "Something went wrong.")
          : "A migration is not necessary or was successfully applied."
      );
    },

    /**
     * @override
     */
    checkMigrations(){}
  }
});
