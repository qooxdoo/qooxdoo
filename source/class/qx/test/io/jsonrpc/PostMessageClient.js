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
qx.Class.define("qx.test.io.jsonrpc.PostMessageClient", {
  extend: qx.dev.unit.TestCase,

  include: [qx.dev.unit.MMock, qx.test.io.MAssert],

  members: {
    setUp() {
      qx.io.jsonrpc.protocol.Request.resetId();
      // qx.Promise has a bug/incompatibiity that leads to uncaught promise rejection errors
      qx.io.jsonrpc.protocol.Request.useNativePromise();
    },

    tearDown() {
      this.getSandbox().restore();
    },

    resetId() {
      qx.io.jsonrpc.protocol.Request.resetId();
    },

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
    },

    async "test: receive out-of-order jsonrpc responses from server, using postMessage transport"() {
      this.resetId();
      const createWorker = (fn) => {
        let blob = new Blob(["self.onmessage = ", fn.toString()], {
          type: "text/javascript"
        });
        return new Worker(URL.createObjectURL(blob));
      }
      // create server worker which sends a response with random delay
      const server = createWorker(evt => {
        let request = JSON.parse(evt.data)
        let id = request.id;
        let response = JSON.stringify({
          jsonrpc: "2.0",
          result: `Result for #${id}`,
          id
        });
        setTimeout(() => {
          console.log(`Sending response for request #${id}`);
          self.postMessage(response);
        }, Math.random() * 1000);
      });
      const transport = new qx.io.transport.PostMessage(server);
      const client = new qx.io.jsonrpc.Client(transport);
      const promises = [];
      // send 10 requests without waiting for the response
      for (let i = 0; i < 10; i++) {
        let request = new qx.io.jsonrpc.protocol.Request("someMethod", ["foo"]);
        await client.send(request);
        promises.push(request.getPromise());
      }
      // Make sure that alle requests have been responded to, i.e. that their promises have
      // been settled.
      const allSettledPromise = Promise.allSettled(promises);
      this.observePromise(allSettledPromise);
      this.assertPromisePending(allSettledPromise);
      this.wait(2000, () => {
        this.assertPromiseFulfilled(allSettledPromise, "Request promises were not settled");
      });
    }
  }
});
