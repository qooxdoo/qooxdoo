/* ************************************************************************

   qooxdoo - the javascript framework for coders

   http://qooxdoo.org

   Copyright:
     2025 qooxdoo contributors

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Boulanger (cboulanger)

************************************************************************ */

/**
 * Tests for qx.io.jsonrpc.Client with qx.test.io.request.PostMessage transport
 * @ignore(Worker)
 * @ignore(self)
 */
qx.Class.define("qx.test.io.TestMAssert", {
  extend: qx.dev.unit.TestCase,

  include: [qx.test.io.MAssert],

  members: {

    /**
     * Test the promise Assertion API
     */
    testPromiseAssertions() {
      let p1 = new Promise(resolve => setTimeout(resolve, 10));
      this.observePromise(p1);
      this.assertPromisePending(p1);
      this.wait(100, () => this.assertPromiseFulfilled(p1));
      let p2 = new Promise((_, reject) => setTimeout(reject, 10));
      this.observePromise(p2);
      this.wait(100, () => {
        this.assertPromiseRejected(p2);
        this.assertPromiseSettled(p2);
      });
    }
  }
});
