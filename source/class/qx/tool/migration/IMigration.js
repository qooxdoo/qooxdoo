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
     * Returns the semver range of version on which this migration should be
     * applied.
     * @return {String}
     */
    getVersionRange() {},

    /**
     * Runs the migration for the version indicated in the class name.
     *
     * The migration code must be written in a way that it can
     * be safely run multiple times over already migrated code,
     * i.e. it must check if the migration code changes have
     * already been applied and skip the migration in that case.
     *
     * The method returns false if the migration does not need to be applied
     * or has successfully been applied, and true if it still needs to be
     * applied but hasn't yet, for example if this is a dry run. If automatic
     * migration is mot possible, the method should output a warning about
     * the needed manual intervention and execute `process.exit(1)`.
     *
     * @return {Promise<boolean>} False if the migration has been applied or
     * is not neccessary; true if it is necessary but hasn't been applied.
     */
    async run() {}
  }
})
