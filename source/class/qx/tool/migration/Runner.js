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
const semver = require("semver");

/**
 * Runs all available migrations
 */
qx.Class.define("qx.tool.migration.Runner",{
  extend: qx.core.Object,
  properties: {

    /**
     * Whether to apply the migrations (false) or just announce them (true)
     */
    dryRun: {
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

    /**
     * If set, run only those migrations which match the given version,
     * Otherwise, run all.
     */
    version: {
      nullable: true,
      validate: v => v === null || semver.valid(v)
    }
  },
  members: {

    /**
     * Runs all migration classes in the `qx.tool.migration` namespace,
     * even those which have lower version numbers than the application
     * which is to be migrated, since the previous migration might have
     * have had bugs that were later fixed. This is safe because all
     * migration files must be written in a way that they can be safely
     * run several times without unwanted side effects. see {@link
      * qx.tool.migration.IMigration#run}
     * @return {Promise<void>}
     */
    async runMigrations() {
      let version = this.getVersion();
      let mustBeMigrated = false;
      this.info(`>>> Running migrations...`);
      let migrationClasses = Object
        .getOwnPropertyNames(qx.tool.migration)
        .filter(clazz => clazz.match(/^M[0-9]/))
        .map(clazz => qx.Class.getByName("qx.tool.migration." + clazz));
      for (let Clazz of migrationClasses) {
        let migration = new Clazz(this);
        let range = migration.getVersionRange();
        let skip = version && !semver.satisfies(version, range);
        if (this.getVerbose()) {
          if (skip) {
            this.info(` - Skipping migration ${Clazz.classname} since app version ${version} does not match range ${range}`);
          } else {
            this.info(` - Running migration ${Clazz.classname} since app version ${version} matches range ${range}`);
          }
        }
        if (skip) {
          continue;
        }
        try {
          let result = await migration.run();
          if (this.getVerbose()) {
            this.debug(
              result ? `   Migration necessary.` : `   Migration is not necessary or was successfully applied`
            );
          }
          mustBeMigrated = mustBeMigrated || result;
        } catch (e) {
          qx.tool.utils.Logger.error(e);
          process.exit(1);
        }
      }
      return mustBeMigrated;
    },
  }
});
