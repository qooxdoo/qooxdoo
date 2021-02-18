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
     * Update a migration info from the result of a migration method
     * or utility function. This allows to be forward compatible
     * to changes in the structure of the migrationInfo object
     *
     * @param {Object} migrationInfo
     * @param {Object} result
     */
    updateMigrationInfo(migrationInfo, result) {
      return {
        applied: migrationInfo.applied + result.applied,
        pending: migrationInfo.pending + result.pending
      }
    },

    /**
     * Instantiates all migration classes in the `qx.tool.migration` namespace which
     * match the version of the current application, and runs all methods of
     * these instances that start with "migrate".
     *
     * The methods must return an object with two numeric properties, `applied`
     * containing the number of migrations that have been applied, `pending`
     * containing the number of those that still have to be applied (for example,
     * after a dry-run).
     *
     * @return {Promise<{applied, pending}>}
     */
    async runMigrations() {
      let qxVersion = await qx.tool.config.Utils.getQxVersion();
      let appQxVersion = await qx.tool.config.Utils.getAppQxVersion();
      this.debug(`${this.getDryRun()?"Checking":"Running" } migrations for app qx version ${appQxVersion} and current qooxdoo version ${qxVersion}`);
      let migrationInfo = this.createMigrationInfo();
      let migrationClasses = Object
        .getOwnPropertyNames(qx.tool.migration)
        .filter(clazz => clazz.match(/^M[0-9_]+$/))
        .map(clazz => qx.Class.getByName("qx.tool.migration." + clazz));
      for (let Clazz of migrationClasses) {
        let migrationInstance = new Clazz(this);
        let skip = appQxVersion && !semver.lt(appQxVersion, migrationInstance.getVersion());
        if (this.getVerbose()) {
          if (skip) {
            this.debug(`>>> Skipping migration ${Clazz.classname}.`);
          } else {
            this.debug(`>>> Running migration ${Clazz.classname}...`);
          }
        }
        if (skip) {
          continue;
        }
        let migrationMethods = Object.getOwnPropertyNames(Clazz.prototype)
          .filter(key => key.startsWith("migrate"))
          .filter(key => typeof Clazz.prototype[key] == "function");
        for (let method of migrationMethods) {
          let result = await migrationInstance[method]();
          migrationInfo = this.updateMigrationInfo(migrationInfo, result);
          this.debug(`>>> ${Clazz.classname}.${method}: ${result.applied} applied/${result.pending} pending`);
        }
        //this.debug(`${Clazz.classname}: ${migrationInfo.applied} migrations applied, ${migrationInfo.pending} migrations pending.`);
      }
      return migrationInfo;
    },
  }
});
