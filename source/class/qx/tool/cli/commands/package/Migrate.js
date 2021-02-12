/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2017 Christian Boulanger

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Boulanger (info@bibliograph.org, @cboulanger)

************************************************************************ */
const process = require("process");
const path = require("upath");
const semver = require("semver");
const fs = qx.tool.utils.Promisify.fs;

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
          }
        }
      };
    }
  },

  members: {
    /**
     * Announces or applies a migration
     * @param {Boolean} announceOnly If true, announce the migration without
     * applying it.
     */
    process: async function(announceOnly=false) {
      const self = qx.tool.cli.commands.package.Migrate;
      if (self.migrationInProcess) {
        return;
      }
      self.migrationInProcess = true;
      let needFix = qx.tool.migration.Utils.runMigrations(this.argv, announceOnly);
      self.migrationInProcess = false;
      if (needFix) {
        if (announceOnly) {
          qx.tool.compiler.Console.error(`
*** Try executing 'qx package migrate' to apply the changes. Alternatively,
    upgrade or downgrade framework and/or compiler to match the library dependencies.`);
          process.exit(1);
        }
        qx.tool.compiler.Console.info("Migration completed.");
      } else if (!announceOnly && !this.argv.quiet) {
        qx.tool.compiler.Console.info("Everything is up-to-date. No migration necessary.");
      }
    }
  }
});
