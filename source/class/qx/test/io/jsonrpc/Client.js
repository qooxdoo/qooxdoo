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
          this.assertEquals(exception, err.code, `Error code does not match.  Expected ${exception}, got ${err.code}.`);
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
        // in case of a transport error, ...
        const n = qx.core.Environment.select("qx.io.jsonrpc.forwardTransportPromiseRejectionToRequest", {
          true: 1, // ... we are rejecting the request promise only, v8 default
          false: 2 // ... both request promise and transport promise are rejected, v7 default
        })
        if (
          // the request promise will not be rejected because it already is rejected in this special case
          exception === qx.io.exception.Transport.DUPLICATE_ID ||
          // or the send promise will not be rejected because we have a server-side error, v7 default only
          (exception === qx.io.exception.Protocol && !qx.core.Environment.get("qx.io.jsonrpc.forwardTransportPromiseRejectionToRequest"))
        ) {
          this.assertCallCount(errorCallback, n);
        } else {
          this.assertCallCount(errorCallback, n+1);
        }
      });
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
      this.wait(100, () => this.assertCalledTwice(spy) );
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
    }
  }
});
