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
     * Runs the migration for the version indicated in the class name. Returns
     * true if migration have to be applied/ were applied, otherwise false.
     *
     * The migration code must be written in a way that it can be safely
     * run multiple times over the same code and always produce the same result,
     * i.e. it must check if the migration code changes have already
     * been applied and skip the migration in that case.
     *
     * @param {Object} options Map of options:
     *    announceOnly {Boolean} If true, a migration step is only announced and not executed
     *    quiet {Boolean} If true, suppress non-error output
     *    verbose {Boolean} Log additional output for debugging purposes
     * @return {Promise<boolean>}
     */
    migrate(options) {}
  }
})
