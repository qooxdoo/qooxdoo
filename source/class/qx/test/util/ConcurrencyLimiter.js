/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

************************************************************************ */

qx.Class.define("qx.test.util.ConcurrencyLimiter", {
  extend: qx.dev.unit.TestCase,

  members: {
    async testBasicExecution() {
      const limiter = new qx.util.ConcurrencyLimiter(2);
      const result = await limiter.add(() => Promise.resolve(42));
      this.assertEquals(42, result);
    },

    async testResultPropagation() {
      const limiter = new qx.util.ConcurrencyLimiter(2);
      const [a, b] = await Promise.all([limiter.add(() => Promise.resolve(1)), limiter.add(() => Promise.resolve(2))]);
      this.assertEquals(1, a);
      this.assertEquals(2, b);
    },

    async testRejection() {
      const limiter = new qx.util.ConcurrencyLimiter(2);
      let caught = null;
      await limiter.add(() => Promise.reject(new Error("fail"))).catch(e => (caught = e));
      this.assertNotNull(caught);
      this.assertEquals("fail", caught.message);
    },

    async testLimitEnforced() {
      const limit = 3;
      const limiter = new qx.util.ConcurrencyLimiter(limit);
      let running = 0;
      let maxRunning = 0;

      const tasks = Array.from({ length: 8 }, () =>
        limiter.add(async () => {
          running++;
          maxRunning = Math.max(maxRunning, running);
          await new Promise(resolve => setTimeout(resolve, 10));
          running--;
        })
      );

      await Promise.all(tasks);
      this.assertTrue(maxRunning <= limit, `maxRunning=${maxRunning} should be <= ${limit}`);
    },

    async testAllTasksExecuted() {
      const limiter = new qx.util.ConcurrencyLimiter(2);
      const executed = [];

      await Promise.all(
        [1, 2, 3, 4, 5].map(i =>
          limiter.add(async () => {
            executed.push(i);
          })
        )
      );

      this.assertEquals(5, executed.length);
      this.assertArrayEquals([1, 2, 3, 4, 5], executed.sort((a, b) => a - b));
    },

    async testLimit1IsSequential() {
      const limiter = new qx.util.ConcurrencyLimiter(1);
      const order = [];

      await Promise.all(
        [1, 2, 3].map(i =>
          limiter.add(async () => {
            order.push(i);
            await new Promise(resolve => setTimeout(resolve, 10));
          })
        )
      );

      this.assertArrayEquals([1, 2, 3], order);
    },

    async testInfinityLimitRunsAllConcurrently() {
      const limiter = new qx.util.ConcurrencyLimiter();
      let maxRunning = 0;
      let running = 0;

      await Promise.all(
        Array.from({ length: 5 }, () =>
          limiter.add(async () => {
            running++;
            maxRunning = Math.max(maxRunning, running);
            await new Promise(resolve => setTimeout(resolve, 10));
            running--;
          })
        )
      );

      this.assertEquals(5, maxRunning);
    },

    async testRejectionDoesNotBlockQueue() {
      const limiter = new qx.util.ConcurrencyLimiter(1);
      const results = [];

      await Promise.all([
        limiter.add(() => Promise.reject(new Error("fail"))).catch(() => results.push("error")),
        limiter.add(() => Promise.resolve("ok")).then(v => results.push(v))
      ]);

      this.assertEquals(2, results.length);
      this.assertEquals("error", results[0]);
      this.assertEquals("ok", results[1]);
    }
  }
});
