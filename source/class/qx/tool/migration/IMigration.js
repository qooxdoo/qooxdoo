/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2017-2021 The authors

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Boulanger (info@bibliograph.org, @cboulanger)

************************************************************************ */

qx.Interface.define("qx.tool.migration.IMigration", {
  members: {
    /**
     * Returns the version below which this migration should be applied.
     * @return {String}
     */
    getVersion() {},

    /**
     * Runs the migration for the version indicated in the class name.
     *
     * The migration code must be written in a way that it can
     * be safely run multiple times over already migrated code,
     * i.e. it must check if the migration code changes have
     * already been applied and skip the migration in that case.
     *
     * If automatic migration is mot possible for a specific change in the
     * framework, the method should output a warning about the needed
     * manual intervention and execute `process.exit(1)`.
     *
     * The method returns an object with two numeric properties, `applied`
     * containing the number of migrations that have been applied, `pending`
     * containing the number of those that still have to be applied (for example,
     * after a dry-run).
     *
     * @return {Promise<{applied: number, pending: number}>}
     */
    async run() {}
  }
})
