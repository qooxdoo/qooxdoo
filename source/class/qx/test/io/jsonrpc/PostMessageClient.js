/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2025 1&1 Internet AG, Germany, http://www.1und1.de & contributors

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

    async "toast: receive out-of-order jsonrpc responses from server, using postMessage transport"() {
      this.resetId();
      function createWorker(fn) {
        let blob = new Blob(["self.onmessage = ", fn.toString()], {
          type: "text/javascript"
        });
        return new Worker(URL.createObjectURL(blob));
      }
      // create server which sends a response with random delay
      const worker = createWorker(evt => {
        for (let request of evt.data) {
          let id = request.id;
          let response = JSON.stringify({
            jsonrpc: "2.0",
            result: `Result for #${id}`,
            id
          });
          setTimeout(() => self.postMessage(response), Math.random() * 1000);
        }
      });
      const transport = new qx.io.transport.PostMessage(worker);
      const client = new qx.io.jsonrpc.Client(transport);
      const requests = [];
      // send 100 requests
      for (let i = 0; i < 100; i++) {
        requests.push(await client.sendRequest("someMethod", ["foo"]));
      }
      this.wait(1100, () => {});
    }
  }
});
