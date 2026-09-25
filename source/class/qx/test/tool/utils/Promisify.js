/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

************************************************************************ */

qx.Class.define("qx.test.tool.utils.Promisify", {
  extend: qx.dev.unit.TestCase,

  members: {
    async testPoolEachOf() {
      const results = [];
      const arr = [1, 2, 3, 4, 5];
      await qx.tool.utils.Promisify.poolEachOf(arr, 2, async item => {
        results.push(item);
      });
      this.assertArrayEquals(arr, results.sort((a, b) => a - b));
    },

    async testPoolEachOfConcurrency() {
      let running = 0;
      let maxRunning = 0;
      const arr = [1, 2, 3, 4, 5, 6];
      await qx.tool.utils.Promisify.poolEachOf(arr, 3, async () => {
        running++;
        maxRunning = Math.max(maxRunning, running);
        await new Promise(resolve => setTimeout(resolve, 10));
        running--;
      });
      this.assertTrue(maxRunning <= 3, `maxRunning=${maxRunning} should be <= 3`);
    },

    async testSomePoolFound() {
      const arr = [1, 2, 3, 4, 5];
      const result = await qx.tool.utils.Promisify.somePool(arr, 2, async item => item === 3);
      this.assertTrue(result);
    },

    async testSomePoolNotFound() {
      const arr = [1, 2, 3, 4, 5];
      const result = await qx.tool.utils.Promisify.somePool(arr, 2, async item => item === 99);
      this.assertFalse(result);
    },

    async testSomePoolConcurrency() {
      let running = 0;
      let maxRunning = 0;
      const arr = [1, 2, 3, 4, 5, 6];
      await qx.tool.utils.Promisify.somePool(arr, 2, async () => {
        running++;
        maxRunning = Math.max(maxRunning, running);
        await new Promise(resolve => setTimeout(resolve, 10));
        running--;
        return false;
      });
      this.assertTrue(maxRunning <= 2, `maxRunning=${maxRunning} should be <= 2`);
    }
  }
});
