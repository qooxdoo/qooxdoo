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
 * Implementation of qx.test.tool.worker.ITestJobApi, run by the worker when
 * qx.test.tool.worker.JobQueue submits jobs for this API.
 */
qx.Class.define("qx.test.tool.worker.TestJobApi", {
  extend: qx.core.Object,
  implement: [qx.test.tool.worker.ITestJobApi],

  members: {
    async echo(value) {
      return value;
    },

    async add(a, b) {
      return a + b;
    }
  }
});
