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
const semver = require("semver");

/**
 * Migrates an application to a higher version
 */
qx.Class.define("qx.tool.compiler.cli.commands.Migrate", {
  extend: qx.tool.compiler.cli.commands.Package,

  statics: {
    /**
     * Flag to prevent recursive call to process()
     */
    migrationInProcess: false,
    /**
     * Creates CLI command
     */
    async createCliCommand(clazz = this) {
      let cmd = await qx.tool.compiler.cli.Command.createCliCommand(clazz);
      cmd.set({
        name: "migrate",
        description: "migrate a library/application to a newer qooxdoo version"
      });

      cmd.addFlag(
        new qx.tool.cli.Flag("dry-run").set({
          description: "Do not apply migrations",
          type: "boolean"
        })
      );

      cmd.addFlag(
        new qx.tool.cli.Flag("qx-version").set({
          description: "A semver string. If given, the maximum qooxdoo version for which to run migrations",
          type: "string"
        })
      );

      return cmd;
    }
  },

  members: {
    /**
     * Announces or applies a migration
     */
    async process() {
      let runner = new qx.tool.migration.Runner().set({
        dryRun: Boolean(this.argv.dryRun),
        verbose: Boolean(this.argv.verbose),
        qxVersion: this.argv.qxVersion || null
      });

      let { applied, pending } = await runner.runMigrations();
      qx.tool.compiler.Console.info(
        `Finished ${
          this.argv.dryRun ? "checking" : "running"
        } migrations: ${applied} migrations applied, ${pending} migrations pending.`
      );
    },

    /**
     * @override
     */
    async checkMigrations() {}
  },

  /**
  * @ignore(qx.tool.cli.commands)
  * @ignore(qx.tool.cli.api)
  */
   defer() {
        // we need to declare some of the older classes that have been moved
      // otherwise loading of old packages will fail
      if (!qx.tool.cli.commands && !!qx.tool.compiler.cli.commands) {
         qx.tool.cli.commands = qx.tool.compiler.cli.commands;    
      }        
      if (!qx.tool.cli.api && !!qx.tool.compiler.cli.api) {
         qx.tool.cli.api = qx.tool.compiler.cli.api;    
      }        
  }
});
