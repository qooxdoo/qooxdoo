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
     * Return a new default migrationIinfo object
     * @return {{applied: number, pending: number}}
     */
    createMigrationInfo() {
      return {
        applied: 0,
        pending: 0
      }
    },

    /**
     * Runs all migration classes in the `qx.tool.migration` namespace which
     * match the version of the current application.
     *
     * The method returns an object with two numeric properties, `applied`
     * containing the number of migrations that have been applied, `pending`
     * containing the number of those that still have to be applied (for example,
     * after a dry-run).
     *
     * @return {Promise<{applied, pending}>}
     */
    async runMigrations() {
      let version = this.getVersion();
      let migrationInfo = this.createMigrationInfo();
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
            if (version) {
              this.info(` - Running migration ${Clazz.classname} since app version ${version} matches range ${range}`);
            } else {
              this.info(` - Running migration ${Clazz.classname}`);
            }
          }
        }
        if (skip) {
          continue;
        }
        try {
          let {applied, pending} = await migration.run();
          if (this.getVerbose()) {
            this.info(`    ${applied} migrations applied, ${pending} migrations pending.`);
          }
          migrationInfo.applied += applied;
          migrationInfo.pending += pending;
        } catch (e) {
          qx.tool.utils.Logger.error(e);
          process.exit(1);
        }
      }
      return migrationInfo;
    },
  }
});
