/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
   * Henner Kollmann

************************************************************************ */

/**
 * A tiny worker API used by qx.test.tool.worker.JobQueue to exercise the job queue.
 * The implementation lives in qx.test.tool.worker.TestJobApi (the "I" prefix is dropped
 * by the worker's interface-to-implementation naming convention).
 */
qx.Interface.define("qx.test.tool.worker.ITestJobApi", {
  members: {
    /**
     * Returns its argument unchanged.
     * @param {var} value
     * @return {var}
     */
    async echo(value) {},

    /**
     * Returns the sum of its two arguments.
     * @param {Number} a
     * @param {Number} b
     * @return {Number}
     */
    async add(a, b) {}
  }
});
