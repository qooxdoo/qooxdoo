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
    },

    tearDown() {
      this.getSandbox().restore();
    },

    /**
     * Given a function, return a `Worker` object which calls the function
     * with the function whenever the Worker receives a message from the main
     * thread.
     * @param {Function} fn
     * @returns {Worker}
     */
    createOnMessageWorker(fn) {
      let blob = new Blob(["self.onmessage = ", fn.toString()], {
        type: "text/javascript"
      });
      return new Worker(URL.createObjectURL(blob));
    },

    async "test: receive 10 out-of-order jsonrpc responses from server, all successful"() {
      qx.io.jsonrpc.protocol.Request.resetId();

      // create server worker which sends a response with random delay
      const server = this.createOnMessageWorker(evt => {
        let request = JSON.parse(evt.data);
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
        this.assertPromiseFulfilled(
          allSettledPromise,
          "Some request promises were not fulfilled"
        );
      });
    },

    async "test: receive 100 out-of-order jsonrpc responses from server, with jsonrpc errors"() {
      qx.io.jsonrpc.protocol.Request.resetId();

      // create server worker which sends a response with random delay
      // some requests fail
      const server = this.createOnMessageWorker(evt => {
        let request = JSON.parse(evt.data);
        let id = request.id;
        let response = JSON.stringify(
          Math.random() > 0.5
            ? {
                jsonrpc: "2.0",
                result: "OK",
                id
              }
            : {
                jsonrpc: "2.0",
                error: {
                  code: -1,
                  message: "error",
                },
                id
              }
        );
        setTimeout(() => {
          self.postMessage(response);
        }, Math.random() * 1000);
      });
      const transport = new qx.io.transport.PostMessage(server);
      const client = new qx.io.jsonrpc.Client(transport);
      const promises = [];
      const spies = [];
      // send 100 requests without waiting for the response
      for (let i = 0; i < 100; i++) {
        let request = new qx.io.jsonrpc.protocol.Request("someMethod", ["foo"]);
        await client.send(request);
        // create a spy to receive error objects
        let spy = this.spy()
        spies.push(spy)
        promises.push(request.getPromise().then(spy,spy));
      }
      // Make sure that alle requests have been responded to, i.e. that their promises have
      // been settled.
      const allSettledPromise = Promise.allSettled(promises);
      this.observePromise(allSettledPromise);
      this.assertPromisePending(allSettledPromise);
      this.wait(2000, () => {
        this.assertPromiseSettled(
          allSettledPromise,
          "Some request promises were not settled"
        );
        for(let spy of spies){
          const firstCallArg = spy.getCall(0)?.args[0];
          this.assert(
            (firstCallArg instanceof qx.io.exception.Protocol || typeof firstCallArg == "string"),
            `An unexpected error occurred: "${firstCallArg}"`
          );
        }
      });
    }
  }
});
