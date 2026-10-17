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
 * Tests `qx.tool.worker.JobQueue` - the worker pool that replaced the former
 * `qx.tool.compiler.TranspilerPool`.
 *
 * A `JobQueue` with the default `maxConcurrentJobs` of 1 runs jobs in-process via a
 * loopback worker; that is what these tests exercise (using the small
 * `qx.test.tool.worker.ITestJobApi` job API).  The loopback worker client is a
 * process-wide singleton, so a single started queue is shared across the tests rather
 * than starting/stopping one per method.
 */
qx.Class.define("qx.test.tool.worker.JobQueue", {
  extend: qx.dev.unit.TestCase,

  members: {
    /** @type {Promise<qx.tool.worker.JobQueue>} */
    __queuePromise: null,

    /**
     * Lazily creates and starts a single loopback `JobQueue` shared by all tests.
     * @returns {Promise<qx.tool.worker.JobQueue>}
     */
    __getQueue() {
      if (!this.__queuePromise) {
        let queue = new qx.tool.worker.JobQueue();
        this.__queuePromise = queue.start().then(() => queue);
      }
      return this.__queuePromise;
    },

    async "test job resolves with its result"() {
      let queue = await this.__getQueue();
      let job = queue.addJob(qx.test.tool.worker.ITestJobApi, "echo", 42);
      this.assertEquals(42, await job.promiseComplete);
    },

    async "test job passes multiple arguments"() {
      let queue = await this.__getQueue();
      let job = queue.addJob(qx.test.tool.worker.ITestJobApi, "add", 3, 7);
      this.assertEquals(10, await job.promiseComplete);
    },

    async "test queued jobs each resolve with their own result"() {
      let queue = await this.__getQueue();
      let jobs = [1, 2, 3].map(value => queue.addJob(qx.test.tool.worker.ITestJobApi, "echo", value));
      let results = await qx.Promise.all(jobs.map(job => job.promiseComplete));
      this.assertArrayEquals([1, 2, 3], results);
    },

    "test default pool size is one"() {
      let queue = new qx.tool.worker.JobQueue();
      this.assertEquals(1, queue.getMaxConcurrentJobs());
      queue.dispose();
    }
  }
});
