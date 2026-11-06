/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de & contributors

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tristan Koch (tristankoch)
     * Christian Boulanger (cboulanger)

************************************************************************ */

/**
 * Tests for qx.io.jsonrpc.Client with a qx.test.io.request.Xhr transport
 */
qx.Class.define("qx.test.io.jsonrpc.Client", {
  extend: qx.dev.unit.TestCase,

  include: [qx.dev.unit.MMock, qx.test.io.MAssert],

  members: {
    setUp() {
      this.sinon = qx.dev.unit.Sinon.getSinon();
      this.setUpRequest();
      this.setUpFakeTransport();
      qx.io.jsonrpc.protocol.Request.resetId();
    },

    setUpRequest() {
      this.req && this.req.dispose();
      this.req = new qx.io.request.Xhr();
      this.req.setUrl("url");
    },

    setUpFakeTransport() {
      if (this.transport && this.transport.send.restore) {
        return;
      }
      this.transport = this.injectStub(
        qx.io.request.Xhr.prototype,
        "_createTransport",
        this.deepStub(qx.io.request.Xhr.prototype._createTransport())
      );

      this.setUpRequest();
    },

    setUpFakeXhr() {
      // Not fake transport
      this.getSandbox().restore();
      this.useFakeXMLHttpRequest();
      this.setUpRequest();
    },

    /**
     * Sets up the fake server and instructs it to send the given response
     * @param {String} response Optional server response
     */
    setUpFakeServer(response) {
      // Not fake transport
      this.getSandbox().restore();
      this.useFakeServer();
      this.setUpRequest();
      if (response) {
        this.setServerResponse(response);
      }
      this.getServer().autoRespond = true;
    },

    /**
     * Set the fake server's response
     * @param {{String|Object} } response Server response. Will be stringified to a JSON string if not a string
     */
    setServerResponse(response) {
      if (typeof response != "string") {
        response = JSON.stringify(response);
      }
      this.getServer().respondWith("POST", /.*/, [
        200,
        { "Content-Type": "application/json; charset=utf-8" },
        response
      ]);
    },

    /**
     * Assert that the given exception is thrown on receiving the given result
     * @param {String} response
     * @param {Class|Number} exception If class, the exception class, which must
     * be a subclass of qx.io.exception.Exception. If number, the error number
     */
    assertExceptionThrown(response, exception) {
      if (
        !(
          qx.lang.Type.isNumber(exception) ||
          qx.Class.isSubClassOf(exception, qx.io.exception.Exception)
        )
      ) {
        throw new Error(
          "Second argument must be a Number or a subclass of qx.io.exception.Exception"
        );
      }
      this.setUpFakeServer(response);
      const message_out = new qx.io.jsonrpc.protocol.Request("foo", [1, 2, 3]);
      const client = new qx.io.jsonrpc.Client("http://jsonrpc");
      const errorCallback = this.spy(err => {
        //console.warn(err);
        if (qx.lang.Type.isNumber(exception)) {
          if (!(err instanceof qx.io.exception.Exception)) {
            throw err;
          }
          this.assertEquals(
            exception,
            err.code,
            `Error code does not match.  Expected ${exception}, got ${err.code}.`
          );
        } else {
          this.assertInstance(
            err,
            exception,
            `Exception class does not match. Expected ${exception.classname}, got ${err}.`
          );
        }
      });
      // check message promise
      message_out.getPromise().catch(errorCallback);
      // check event
      client.addListener("error", evt => errorCallback(evt.getData()));
      // check transport promise
      client.send(message_out).catch(errorCallback);
      this.wait(100, () => {
        // in case of a transport error, only the request promise is rejected
        if (
          // the request promise will not be rejected because it already is rejected in this special case
          exception === qx.io.exception.Transport.DUPLICATE_ID
        ) {
          this.assertCallCount(errorCallback, 1);
        } else {
          this.assertCallCount(errorCallback, 2);
        }
      });
    },

    /**
     * Returns a transport which is not connected to a server: its `send()` is
     * a stub which the test configures, and responses are injected by firing
     * the transport's "message" event.
     * @return {qx.io.transport.Xhr}
     */
    createStubbedTransport() {
      const transport = new qx.io.transport.Xhr("http://test.local");
      this.stub(transport, "send");
      return transport;
    },

    /**
     * Returns an exception with which a stubbed transport can fail a request
     * @return {qx.io.exception.Transport}
     */
    createTransportException() {
      return new qx.io.exception.Transport(
        "Transport failed",
        qx.io.exception.Transport.FAILED
      );
    },

    /**
     * Makes the given stubbed transport accept a message and fail it only after
     * a delay, i.e. while the request is still in flight
     * @param {qx.io.transport.Xhr} transport
     */
    failTransportAfterDelay(transport) {
      transport.send.callsFake(
        () =>
          new Promise((resolve, reject) =>
            qx.event.Timer.once(
              () => reject(this.createTransportException()),
              this,
              50
            )
          )
      );
    },

    tearDown() {
      this.getSandbox().restore();
      this.req.dispose();
    },

    resetId() {
      qx.io.jsonrpc.protocol.Request.resetId();
    },

    //
    // Auth, should be moved into qx.test.io.request.Xhr
    //

    "test: Bearer authentication"() {
      this.setUpFakeTransport();

      var transport = this.transport,
        auth,
        call,
        key,
        credentials;

      auth = new qx.io.request.authentication.Bearer("TOKEN");
      this.req.setAuthentication(auth);
      this.req.send();

      call = transport.setRequestHeader.getCall(1);
      key = "Authorization";
      credentials = /Bearer\s(.*)/.exec(call.args[1])[1];
      this.assertEquals(key, call.args[0]);
      this.assertEquals("TOKEN", credentials);
    },

    //
    // JSON-RPC
    //

    "test: throw on invalid response id"() {
      this.resetId();
      var response = qx.lang.Json.stringify({
        jsonrpc: "2.0",
        result: 19,
        id: 2
      });

      this.assertExceptionThrown(
        response,
        qx.io.exception.Transport.UNKNOWN_ID
      );
    },

    "test: throw on duplicate response id"() {
      this.resetId();
      var response = qx.lang.Json.stringify([
        { jsonrpc: "2.0", result: 19, id: 1 },
        { jsonrpc: "2.0", result: 19, id: 1 }
      ]);

      this.assertExceptionThrown(
        response,
        qx.io.exception.Transport.DUPLICATE_ID
      );
    },

    async "test: call jsonrpc method and receive response with single result"() {
      this.resetId();
      let message_out = new qx.io.jsonrpc.protocol.Request("foo", ["bar"]);
      let result = "Hello World!";
      let message_in = new qx.io.jsonrpc.protocol.Result(
        message_out.getId(),
        result
      );

      this.setUpFakeServer(message_in.toString());
      const client = new qx.io.jsonrpc.Client("http://jsonrpc");
      await client.send(message_out);
      const value = await message_out.getPromise();
      this.assertEquals(result, value);
    },

    async "test: call jsonrpc method and receive batched response"() {
      this.resetId();
      let message_out = new qx.io.jsonrpc.protocol.Request("foo", ["bar"]);
      let result = "Hello World!";
      let response = new qx.io.jsonrpc.protocol.Batch()
        .add(new qx.io.jsonrpc.protocol.Result(message_out.getId(), result))
        .addRequest("foo", ["bar"])
        .addNotification("logout")
        .toString();
      this.setUpFakeServer(response);
      const client = new qx.io.jsonrpc.Client("http://jsonrpc");
      await client.send(message_out);
      const value = await message_out.getPromise();
      this.assertEquals(result, value);
    },

    "test: call jsonrpc method and expect error on invalid reponse "() {
      this.assertExceptionThrown(
        "helloworld!",
        qx.io.exception.Transport.INVALID_JSON
      );
    },

    "test: call jsonrpc method and expect error on invalid reponse - missing result"() {
      this.assertExceptionThrown("null", qx.io.exception.Transport.NO_DATA);
    },

    "test: call jsonrpc method and expect error response"() {
      this.resetId();
      var response = qx.lang.Json.stringify({
        jsonrpc: "2.0",
        error: { code: -32600, message: "Division by zero!" },
        id: 1
      });

      this.assertExceptionThrown(response, qx.io.exception.Protocol);
    },

    "test: send batched requests"() {
      this.resetId();
      var response = qx.lang.Json.stringify([
        { jsonrpc: "2.0", result: 7, id: 1 },
        { jsonrpc: "2.0", result: "foo", id: 2 },
        {
          jsonrpc: "2.0",
          error: { code: -32600, message: "Invalid Request" },
          id: 3
        },

        {
          jsonrpc: "2.0",
          error: { code: -32601, message: "Method not found" },
          id: 4
        },

        { jsonrpc: "2.0", result: ["hello", 5], id: 5 }
      ]);

      this.setUpFakeServer(response);
      var client = new qx.io.jsonrpc.Client("http://jsonrpc");
      var spies = [];
      var batch = new qx.io.jsonrpc.protocol.Batch();
      for (var i = 1; i < 6; i++) {
        spies[i] = { result: this.spy(), error: this.spy() };
        let request = new qx.io.jsonrpc.protocol.Request("someMethod", []);
        request.getPromise().then(spies[i].result).catch(spies[i].error);
        batch.add(request);
      }
      client.sendBatch(batch).catch(err => {
        this.assertInstance(err, qx.io.exception.Protocol);
      });
      this.wait(
        100,
        function () {
          this.assertCalledWith(spies[1].result, 7);
          this.assertCalledWith(spies[2].result, "foo");
          this.assertCalled(spies[3].error);
          this.assertCalled(spies[4].error);
          this.assertCalledWith(spies[5].result, ["hello", 5]);
        },
        this
      );
    },

    "test: receive jsonrpc requests from server"() {
      this.resetId();
      var response = [
        {
          jsonrpc: "2.0",
          method: "clientMethod",
          params: ["foo", "bar"],
          id: 1
        },

        { jsonrpc: "2.0", method: "clientNotification", params: [] }
      ];

      this.setUpFakeServer(qx.lang.Json.stringify(response));
      var client = new qx.io.jsonrpc.Client("http://jsonrpc");
      var spy = this.spy();
      client.addListener("incomingRequest", evt => {
        let message = evt.getData().toObject();
        this.assertDeepEquals(response.shift(), message);
        spy(message);
      });
      client.sendNotification("ping");
      this.wait(100, () => this.assertCalledTwice(spy));
    },

    /**
     * Creates a client with a PostMessage transport whose endpoint discards
     * all outgoing messages; incoming messages are passed to `handleIncoming()`
     * @return {qx.io.jsonrpc.Client}
     */
    createPostMessageClient() {
      const endpoint = {
        addEventListener() {},
        postMessage() {}
      };
      return new qx.io.jsonrpc.Client(
        new qx.io.transport.PostMessage(endpoint)
      );
    },

    /**
     * Passes the given data to the client's `handleIncoming()` method
     * @param {qx.io.jsonrpc.Client} client
     * @param {String} json
     * @return {Error|null} The exception thrown, if any
     */
    receive(client, json) {
      try {
        client.handleIncoming(json);
      } catch (e) {
        return e;
      }
      return null;
    },

    async "test: incoming error without a pending request does not reject other requests"() {
      this.resetId();
      const client = this.createPostMessageClient();
      const errorSpy = this.spy();
      client.addListener("error", evt => errorSpy(evt.getData()));
      const request1 = new qx.io.jsonrpc.protocol.Request("foo", []);
      const request2 = new qx.io.jsonrpc.protocol.Request("bar", []);
      await client.send(request1);
      await client.send(request2);
      const promise1 = request1.getPromise();
      const promise2 = request2.getPromise();
      this.observePromise(promise1);
      this.observePromise(promise2);
      promise1.catch(() => {});
      promise2.catch(() => {});
      const exceptions = [
        "helloworld!",
        JSON.stringify({ jsonrpc: "2.0", result: 1, id: 99 })
      ].map(json => this.receive(client, json));
      await new Promise(resolve => setTimeout(resolve, 10));
      this.assertPromisePending(promise1);
      this.assertPromisePending(promise2);
      this.assertCallCount(errorSpy, 2);
      // an error which concerns no pending request is thrown for the transport
      exceptions.forEach(e => this.assertInstance(e, qx.io.exception.Transport));
      // a malformed response to request 2 rejects request 2 only
      this.assertNull(
        this.receive(client, JSON.stringify({ jsonrpc: "2.0", id: 2 }))
      );
      this.assertCallCount(errorSpy, 3);
      this.receive(
        client,
        JSON.stringify({ jsonrpc: "2.0", result: "OK", id: 1 })
      );
      await new Promise(resolve => setTimeout(resolve, 10));
      this.assertPromiseFulfilled(promise1);
      this.assertEquals("OK", await promise1);
      this.assertPromiseRejected(promise2);
    },

    async "test: an unknown id in a batch does not stop the other responses"() {
      this.resetId();
      const client = this.createPostMessageClient();
      client.addListener("error", () => {});
      const request = new qx.io.jsonrpc.protocol.Request("foo", []);
      await client.send(request);
      const promise = request.getPromise();
      this.observePromise(promise);
      promise.catch(() => {});
      this.receive(
        client,
        JSON.stringify([
          { jsonrpc: "2.0", result: 1, id: 99 },
          { jsonrpc: "2.0", result: "OK", id: 1 }
        ])
      );
      await new Promise(resolve => setTimeout(resolve, 10));
      this.assertPromiseFulfilled(promise);
      this.assertEquals("OK", await promise);
    },

    "test: an invalid HTTP response rejects only the requests sent with it"() {
      this.resetId();
      this.setUpFakeServer();
      // the response to request 1 is invalid, request 2 is answered later
      this.getServer().respondWith("POST", /.*/, xhr => {
        const id = JSON.parse(xhr.requestBody).id;
        xhr.respond(
          200,
          { "Content-Type": "application/json; charset=utf-8" },
          id === 1
            ? "helloworld!"
            : JSON.stringify({ jsonrpc: "2.0", result: "OK", id })
        );
      });
      this.getServer().autoRespond = false;
      const client = new qx.io.jsonrpc.Client("http://jsonrpc");
      const errorSpy = this.spy();
      client.addListener("error", evt => errorSpy(evt.getData()));
      const request1 = new qx.io.jsonrpc.protocol.Request("foo", []);
      const request2 = new qx.io.jsonrpc.protocol.Request("bar", []);
      const promise1 = request1.getPromise();
      const promise2 = request2.getPromise();
      this.observePromise(promise1);
      this.observePromise(promise2);
      promise1.catch(() => {});
      promise2.catch(() => {});
      client.send(request1);
      client.send(request2);
      this.getServer().respond();
      this.wait(100, () => {
        this.assertPromiseRejected(promise1);
        this.assertPromiseFulfilled(promise2);
        this.assertCalledOnce(errorSpy);
        this.assertEquals(
          qx.io.exception.Transport.INVALID_JSON,
          errorSpy.getCall(0).args[0].code
        );
      });
    },

    /**
     * Issue #10739
     */
    testIssue10739() {
      this.resetId();
      this.setUpFakeServer();
      const successCallback = this.spy(result =>
        this.debug(`Server response is "${result}"`)
      );
      const errorCallback = this.spy(error => console.error(error.message));
      const client = new qx.io.jsonrpc.Client("http://test.local");
      const auth = new qx.io.request.authentication.Bearer("TOKEN");
      client.getTransport().getTransportImpl().setAuthentication(auth);
      this.setServerResponse({
        jsonrpc: "2.0",
        error: {
          code: 8,
          message: "stale or uninitialized auth token/rune"
        },
        id: 1
      });
      const sendRequest = this.spy(() => {
        this.debug("sendRequest() was called");
        client
          .sendRequest("service.method", ["foo"])
          .then(successCallback)
          .catch(err => {
            if (err.code == 8) {
              this.debug(`Received expected error message.`);
              this.setServerResponse({
                jsonrpc: "2.0",
                result: "OK",
                id: 2
              });
              sendRequest(); // second request
            } else {
              errorCallback(err);
            }
          });
      });
      sendRequest();
      this.wait(
        250,
        function () {
          this.assertCalledTwice(sendRequest);
          this.assertCalledOnce(successCallback);
          this.assertNotCalled(errorCallback);
        },
        this
      );
    },

    /**
     * Issue #10889
     */
    "test: dispose removes the listener on the transport"() {
      const transport = new qx.io.transport.Xhr("http://test.local");
      const client = new qx.io.jsonrpc.Client(transport);
      this.assertTrue(
        transport.hasListener("message"),
        "Client should listen for messages on its transport."
      );

      client.dispose();
      this.assertFalse(
        transport.hasListener("message"),
        "A disposed client must not be left reachable through its transport."
      );

      transport.dispose();
    },

    /**
     * Issue #10889
     */
    async "test: a request which fails at the transport is released"() {
      this.resetId();
      const transport = this.createStubbedTransport();
      transport.send.callsFake(() =>
        Promise.reject(this.createTransportException())
      );

      const client = new qx.io.jsonrpc.Client(transport);
      client.addListener("error", () => {});
      const request = new qx.io.jsonrpc.protocol.Request("foo", ["bar"]);
      await client.send(request);
      try {
        await request.getPromise();
        throw new Error("The request should have been rejected.");
      } catch (e) {
        this.assertInstance(e, qx.io.exception.Transport);
      }

      // the failed request must no longer be pending, so a late response
      // carrying its id is reported as a duplicate instead of resolving it
      const response = new qx.io.jsonrpc.protocol.Result(
        request.getId(),
        "too late"
      );

      let exception;
      try {
        transport.fireDataEvent("message", response.toString());
      } catch (e) {
        exception = e;
      }
      this.assertInstance(
        exception,
        qx.io.exception.Transport,
        "A response to a request which already failed should be rejected."
      );

      this.assertEquals(
        qx.io.exception.Transport.DUPLICATE_ID,
        exception.code,
        "The failed request should have been marked as handled."
      );

      client.dispose();
      transport.dispose();
    },

    /**
     * Issue #10890
     */
    async "test: every request which fails at the transport is rejected"() {
      this.resetId();
      const transport = this.createStubbedTransport();
      transport.send.callsFake(() =>
        Promise.reject(this.createTransportException())
      );

      const client = new qx.io.jsonrpc.Client(transport);
      const promises = [];
      for (let i = 1; i <= 3; i++) {
        let promise = client.sendRequest("foo", [i]);
        this.observePromise(promise);
        promises.push(promise);
        // let each failure be handled before the next request is sent
        await new Promise(resolve => qx.event.Timer.once(resolve, null, 20));
      }
      this.wait(300, () => {
        promises.forEach((promise, index) =>
          this.assertPromiseRejected(
            promise,
            `The promise of failed request ${index + 1} should be rejected.`
          )
        );

        client.dispose();
        transport.dispose();
      });
    },

    /**
     * Issue #10890
     */
    async "test: a transport failure does not reject other pending requests"() {
      this.resetId();
      const transport = this.createStubbedTransport();
      const client = new qx.io.jsonrpc.Client(transport);

      // this request is sent out fine and is waiting for its response
      transport.send.returns(qx.Promise.resolve());
      const pending = new qx.io.jsonrpc.protocol.Request("foo", ["bar"]);
      await client.send(pending);
      this.observePromise(pending.getPromise());

      // this one fails at the transport
      transport.send.callsFake(() =>
        Promise.reject(this.createTransportException())
      );
      const failing = new qx.io.jsonrpc.protocol.Request("foo", ["baz"]);
      await client.send(failing);
      this.observePromise(failing.getPromise());

      // the response to the first request only arrives after that failure
      const response = new qx.io.jsonrpc.protocol.Result(
        pending.getId(),
        "Hello World!"
      );

      qx.event.Timer.once(
        () => transport.fireDataEvent("message", response.toString()),
        this,
        50
      );

      this.wait(300, () => {
        this.assertPromiseRejected(
          failing.getPromise(),
          "The promise of the failed request should be rejected."
        );

        this.assertPromiseFulfilled(
          pending.getPromise(),
          "A transport failure must not reject a request which is still in flight."
        );

        client.dispose();
        transport.dispose();
      });
    },

    /**
     * Issue #10890
     */
    "test: a transport failure after dispose does not re-settle the request"() {
      this.resetId();
      const transport = this.createStubbedTransport();
      this.failTransportAfterDelay(transport);

      const client = new qx.io.jsonrpc.Client(transport);
      const request = new qx.io.jsonrpc.protocol.Request("foo", ["bar"]);
      let rejectedWith;
      request.getPromise().catch(error => (rejectedWith = error));
      const settle = this.spy(request, "handleTransportException");
      client.send(request);

      // the client is gone before the transport fails, as it is when the user
      // navigates away from a page with a request in flight
      client.dispose();

      this.wait(300, () => {
        // the dispose cancelled it first, and a promise settles only once, so
        // the later failure must not reject it again - that throws inside the
        // rejection handler and escapes as an unhandled rejection
        this.assertCalledOnce(settle);
        this.assertInstance(
          rejectedWith,
          qx.io.exception.Cancel,
          "A request in flight when its client was disposed must be settled."
        );

        transport.dispose();
      });
    },

    /**
     * Issue #10889
     */
    async "test: a request in flight when the client is disposed is settled"() {
      this.resetId();
      const transport = this.createStubbedTransport();
      // the transport accepts the message and the endpoint never answers it
      transport.send.callsFake(() => Promise.resolve());

      const client = new qx.io.jsonrpc.Client(transport);
      const pending = client.sendRequest("foo", ["bar"]);

      client.dispose();

      const timeout = new qx.Promise(resolve =>
        window.setTimeout(() => resolve("NEVER SETTLED"), 500)
      );

      let outcome;
      try {
        outcome = await qx.Promise.race([pending, timeout]);
      } catch (e) {
        outcome = e;
      }

      this.assertInstance(
        outcome,
        qx.io.exception.Cancel,
        "A request left in flight by a disposed client must be cancelled."
      );

      transport.dispose();
    },

    /**
     * Issue #10890
     */
    async "test: a transport failure after dispose does not fail the disposed client"() {
      this.resetId();
      const transport = this.createStubbedTransport();
      this.failTransportAfterDelay(transport);

      const client = new qx.io.jsonrpc.Client(transport);
      const request = new qx.io.jsonrpc.protocol.Request("foo", ["bar"]);
      await client.send(request);
      client.dispose();

      let exception;
      try {
        await request.getPromise();
      } catch (e) {
        exception = e;
      }
      this.assertInstance(
        exception,
        qx.io.exception.Cancel,
        "The request must be cancelled by dispose()."
      );

      // the transport fails only now, which must not throw from the
      // disposed client
      await new qx.Promise(resolve => window.setTimeout(resolve, 100));

      transport.dispose();
    }
  }
});
