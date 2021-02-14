/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2021 The authors

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Boulanger (info@bibliograph.org, @cboulanger)

************************************************************************ */
const process = require("process");

qx.Class.define("qx.tool.migration.Runner",{
  extend: qx.core.Object,
  properties: {
    /**
     * The command instance that is calling the runner (can be null)
     */
    command: {
      check: "qx.tool.cli.command.Command",
      nullable: true,
      apply: "_applyCommand"
    },

    /**
     * Whether to apply the migrations (false) or just announce them (true)
     */
    dryRun: {
      check: "Boolean",
      init: false
    },

    /**
     * Whether there should be no non-error output (true)
     */
    quiet: {
      check: "Boolean",
      init: false
    },

    /**
     * Whether to log additional output for debugging
     */
    verbose: {
      check: "Boolean",
      init: false
    },

  },
  members: {

    _applyCommand(command) {
      if (command) {
        this.setQuiet(command.getArgs().quiet);
        this.setVerbose(command.getArgs().verbose);
      }
    },

    /**
     * Runs all migration classes in the `qx.tool.migration` namespace,
     * even those which have lower version numbers than the application
     * which is to be migrated, since the previous migration might have
     * have had bugs that were later fixed. This is safe because all
     * migration files must be written in a way that they can be safely
     * run several times without unwanted side effects. see {@link
      * qx.tool.migration.IMigration#migrate}
     * @return {Promise<void>}
     */
    async runMigrations() {
      if (this.getQuiet()) {
        qx.tool.utils.Logger.info(`>>> Running migrations...`);
      }
      let migrationClasses = Object
        .getOwnPropertyNames(qx.tool.migration)
        .filter(clazz => clazz.match(/^M[0-9]/));
      for (let clazz of migrationClasses) {
        let migration = new qx.Class.getByName(clazz)({command});
        if (this.getVerbose()) {
          qx.tool.utils.Logger.info(` - Running migration ${clazz}`);
        }
        try {
          let mustBeMigrated = migration.migrate();
          if (mustBeMigrated) {
            if (!this.getQuiet()) {
              qx.tool.compiler.Console.warn(`*** Please run (npx) qx pkg migrate to apply the changes.`);
            }
            process.exit(1);
          }
        } catch (e) {
          qx.tool.utils.Logger.error(e);
          process.exit(1);
        }
      }
    },
  }
});
