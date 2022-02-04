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
qx.Class.define("qx.tool.migration.Runner", {
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
     * The maximum qooxdoo version for which the migration class should be applicable
     */
    qxVersion: {
      check: "String",
      validate: version => semver.valid(version),
      nullable: true
    }
  },

  members: {
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
      this.debug(
        `${
          this.getDryRun() ? "Checking" : "Running"
        } migrations for app qx version ${appQxVersion} and current qooxdoo version ${qxVersion}`
      );

      let migrationClasses = Object.getOwnPropertyNames(qx.tool.migration)
        .filter(clazz => clazz.match(/^M[0-9_]+$/))
        .map(clazz => qx.Class.getByName("qx.tool.migration." + clazz));
      let applied = 0;
      let pending = 0;
      for (let Clazz of migrationClasses) {
        let migrationInstance = new Clazz(this);
        let migrationVersion = migrationInstance.getVersion();
        let qxVersion = this.getQxVersion();
        this.debug(
          `>>> Migration version: ${migrationVersion}, maximum qx version: ${qxVersion}`
        );

        let skip =
          (appQxVersion && !semver.lt(appQxVersion, migrationVersion)) ||
          (qxVersion && semver.gt(migrationVersion, qxVersion));
        if (skip) {
          this.debug(`>>> Skipping migration ${Clazz.classname}.`);
        } else {
          this.debug(`>>> Running migration ${Clazz.classname}...`);
        }
        if (skip) {
          continue;
        }
        let migrationMethods = Object.getOwnPropertyNames(Clazz.prototype)
          .filter(key => key.startsWith("migrate"))
          .filter(key => typeof Clazz.prototype[key] == "function");

        for (let method of migrationMethods) {
          let previousApplied = migrationInstance.getApplied();
          let previousPending = migrationInstance.getPending();
          await migrationInstance[method]();
          this.debug(
            `>>> - ${method}: ${
              migrationInstance.getApplied() - previousApplied
            } applied/${
              migrationInstance.getPending() - previousPending
            } pending`
          );
        }
        applied += migrationInstance.getApplied();
        pending += migrationInstance.getPending();
        this.debug(
          `>>> Done with ${Clazz.classname}: ${applied} migrations applied, ${pending} migrations pending.`
        );
      }

      return { applied, pending };
    }
  }
});
