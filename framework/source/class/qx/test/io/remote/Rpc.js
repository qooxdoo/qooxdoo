/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tristan Koch (tristankoch)

************************************************************************ */

qx.Class.define("qx.test.io.remote.Rpc",
{
  extend : qx.dev.unit.TestCase,

  include : qx.dev.unit.MMock,

  members :
  {

    setUp : function() {
      this.useFakeServer();
    },

    tearDown: function() {
      this.getSandbox().restore();
    },

    skip: function(msg) {
      throw new qx.dev.unit.RequirementError(null, msg);
    },

    setUpFakeRequest : function() {
      var req = this.request = new qx.io.remote.Request();

      // In prototype chain
      req.setState = req.getSequenceNumber =
        req.setData = req.send = function() {};

      // Stub
      this.stub(req);
      req.addListener.restore();
      req.dispatchEvent.restore();
      req.getSequenceNumber.returns(undefined);

      // Inject
      this.injectStub(qx.io.remote, "Request", req);
    },

    setServerResponse : function(value) {
      this.getServer().respondWith("POST", /.*/,[200, { "Content-Type": "application/json" },value]);
    },

    /**
     * Deep equal comparison, using Sinon's `deepEqual` comparison.
     * Two values are "deep equal" if:
     *
     *   - They are equal, according to samsam.identical
     *   (https://sinonjs.github.io/samsam/)
     *   - They are both date objects representing the same time
     *   - They are both arrays containing elements that are all deepEqual
     *   - They are objects with the same set of properties, and each property
     *     in obj1 is deepEqual to the corresponding property in obj2
     *
     * Supports cyclic objects.
     * @param expected {*}
     * @param actual {*}
     * @param msg
     */
    assertDeepEqual : function(expected, actual, msg) {
      msg = msg || "Failed to assert that " + qx.lang.Json.stringify(actual) +
        " is deeply equal to " + qx.lang.Json.stringify(expected) + "."
      this.assertTrue(qx.dev.unit.Sinon.getSinon().deepEqual(expected, actual), msg);
    },

    assertValidRequest : function(method, params, isNotification) {
      this.setUpFakeRequest();
      var client = new qx.io.remote.Rpc("jsonrpc");
      client.addRequest(method, params, isNotification||false);
      client.send();
      var requestData = this.request.setData.getCall(0).args[0];
      var expected = {
        jsonrpc: "2.0",
        method: method,
        params: params
      };
      if (!isNotification) {
        expected['id'] = qx.io.remote.Rpc.getRequestId()
      }
      this.assertDeepEqual(expected, qx.lang.Json.parse(requestData));
    },

    assertResponseIs : function(method, params, response) {
      this.setServerResponse(response);
      var client = new qx.io.remote.Rpc("jsonrpc");
      var requestCallback = this.spy();
      var sendCallback = this.spy();
      client.addRequest(method, params).then(requestCallback);
      client.send().then(sendCallback);
      this.getServer().respond();
      this.wait(100, function(){
        var parsedResponse = qx.lang.Json.parse(response);
        this.assertCalledWith(requestCallback, parsedResponse.result);
        this.assertCalledWith(sendCallback, parsedResponse);
      },this);
    },

    assertResponseThrowsException : function(method, params, isNotification, response, exceptions) {
      var sendExceptionClazz = exceptions.send, requestExceptionClazz = exceptions.request;
      this.setServerResponse(response);
      var client = new qx.io.remote.Rpc("jsonrpc");
      var that = this;
      var requestErrorCallback = this.spy(function(err){
        console.warn("Caught: " + err.name + ": " + err.message);
        that.assertInstance(err, Error);
        that.assertTrue("exception" in err, "Error has no 'exception' property" );
        if (requestExceptionClazz) {
          that.assertInstance(err.exception, requestExceptionClazz);
        }
      });
      client.addRequest(method, params, isNotification).catch(requestErrorCallback);
      var sendErrorCallback = this.spy(function(err){
        console.warn("Caught: " + err.name + ": " + err.message);
        that.assertInstance(err, Error);
        that.assertTrue("exception" in err, "Error has no 'exception' property" );
        if (sendExceptionClazz) {
          that.assertInstance(err.exception, sendExceptionClazz);
        }
      });
      client.send().catch(sendErrorCallback);
      this.getServer().respond();
      this.wait(100, function(){
        if (sendExceptionClazz) {
          this.assertCalled(sendErrorCallback);
        }
        if (requestExceptionClazz) {
          this.assertCalled(requestErrorCallback);
        }
      },this);
    },

    "test: send request": function() {
      this.setUpFakeRequest();
      var rpc = new qx.io.remote.Rpc("/foo");
      rpc.callAsync();
      this.assertCalledOnce(this.request.send);
    },

    "test: call jsonrpc method with positional parameters" : function() {
      this.assertValidRequest("subtract", [42, 23]);
    },

    "test: call jsonrpc method with named parameters" : function() {
      this.assertValidRequest("subtract", {"minuend": 42, "subtrahend": 23});
    },

    "test: send notification" : function() {
      this.assertValidRequest("logout", [], true);
    },

    "test: send notification and throw on response" : function() {
      qx.io.remote.Rpc.reset();
      var response = qx.lang.Json.stringify({"jsonrpc": "2.0", "result": 19, "id": 1});
      this.assertResponseThrowsException("logout", [], true, response, {
        send: qx.io.remote.exception.Transport
      });
    },

    "test: call jsonrpc method and validate reponse" : function() {
      qx.io.remote.Rpc.reset();
      var response = qx.lang.Json.stringify({"jsonrpc": "2.0", "result": 19, "id": 1});
      this.assertResponseIs("subtract", [42, 23], response);
    },

    "test: call jsonrpc method and expect error on invalid reponse - not array or object" : function() {
      qx.io.remote.Rpc.reset();
      var response = qx.lang.Json.stringify("foo");
      this.assertResponseThrowsException("doStuff", [], false, response, {
        send: qx.io.remote.exception.Transport
      });
    },

    "test: call jsonrpc method and expect error on invalid reponse - missing result" : function() {
      qx.io.remote.Rpc.reset();
      var response = qx.lang.Json.stringify({"jsonrpc": "2.0", "id": 1});
      this.assertResponseThrowsException("doStuff", [], false, response, {
        request: qx.io.remote.exception.Transport
      });
    },

    "test: call jsonrpc method and expect error on invalid reponse - unknown id" : function() {
      qx.io.remote.Rpc.reset();
      var response = qx.lang.Json.stringify({"jsonrpc": "2.0", result: "foo", "id": 5});
      this.assertResponseThrowsException("doStuff", [], false, response, {
        send: qx.io.remote.exception.Transport
      });
    },

    "test: call jsonrpc method and expect error response" : function() {
      qx.io.remote.Rpc.reset();
      var response = qx.lang.Json.stringify({"jsonrpc": "2.0", "error" : {"code": -32600, "message": "Division by zero!"}, "id": 1});
      this.assertResponseThrowsException("divide", [42, 0], false, response, {
        request: qx.io.remote.exception.JsonRpc
      });
    },

    "test: send batched requests" : function() {
      qx.io.remote.Rpc.reset();
      var response = qx.lang.Json.stringify([
        {"jsonrpc": "2.0", "result": 7, "id": 1},
        {"jsonrpc": "2.0", "result": "foo", "id": 2},
        {"jsonrpc": "2.0", "error": {"code": -32600, "message": "Invalid Request"}, "id": 3},
        {"jsonrpc": "2.0", "error": {"code": -32601, "message": "Method not found"}, "id": 4},
        {"jsonrpc": "2.0", "result": ["hello", 5], "id": 5}]);
      this.setServerResponse(response);
      var client = new qx.io.remote.Rpc("jsonrpc");
      var spies = [];
      for( var i=1; i < 6; i++) {
        spies[i] = { result: this.spy(), error: this.spy() };
        client.addRequest("someMethod", [])
          .then(spies[i].result)
          .catch(spies[i].error);
      }
      client.send();
      this.getServer().respond();
      this.wait(100, function(){
        this.assertCalledWith(spies[1].result, 7);
        this.assertCalledWith(spies[2].result, "foo");
        this.assertCalled(spies[3].error);
        this.assertCalled(spies[4].error);
        this.assertCalledWith(spies[5].result, ["hello", 5]);
      },this);
    },


    //
    // legacy tests, will be removed in v7.0.0
    //
/*
    "test: request data for params with date contains date literal when convert dates": function() {
      this.setUpFakeRequest();
      var obj = { date: new Date(Date.UTC(2020,0,1,0,0,0,123)) },
          msg,
          data;

      var rpc = new qx.io.remote.Rpc();
      rpc.setProtocol("qx1");
      this.stub(rpc, "_isConvertDates").returns(true);
      this.stub(rpc, "createRpcData").returns({"params": obj});
      rpc.callAsync();

      data = this.request.setData.getCall(0).args[0];
      msg = "Must contain converted date literal";
      this.assertMatch(data, /"new Date\(Date.UTC\(2020,0,1,0,0,0,123\)\)"/, msg);
    },

    "test: request data for params with nested date contains date literal when convert dates": function() {
      this.setUpFakeRequest();
      var obj = {nested: {date: new Date(Date.UTC(2020,0,1,0,0,0,123))} },
          msg,
          data;

      var rpc = new qx.io.remote.Rpc();
      rpc.setProtocol("qx1");
      this.stub(rpc, "_isConvertDates").returns(true);
      this.stub(rpc, "createRpcData").returns({"params": obj});
      rpc.callAsync();

      data = this.request.setData.getCall(0).args[0];
      msg = "Must contain converted date literal";
      this.assertMatch(data, /"new Date\(Date.UTC\(2020,0,1,0,0,0,123\)\)"/, msg);
    },

    "test: response contains date from literal when convert dates": function() {
      this.setUpFakeRequest();
      var rpc = new qx.io.remote.Rpc(),
          req = this.request,
          evt = qx.event.Registration.createEvent("completed", qx.io.remote.Response),
          str = '{"result": {"date": new Date(Date.UTC(2020,0,1,0,0,0,123))} }',
          that = this;


      this.stub(rpc, "_isConvertDates").returns(true);

      var callback = this.spy(function(result) {
        var msg = "Expected value to be date but found " + typeof result.date;
        that.assertTrue(qx.lang.Type.isDate(result.date), msg);
      });

      rpc.setProtocol("qx1");
      rpc.callAsync(callback);

      // Fake JSON-like (JavaScript) response
      evt.setContent(str);
      req.dispatchEvent(evt);

      this.assertCalled(callback);
    },

    "test: response contains date from literal when convert dates and json response": function() {
      this.setUpFakeRequest();
      var rpc = new qx.io.remote.Rpc(),
          req = this.request,
          evt = qx.event.Registration.createEvent("completed", qx.io.remote.Response),
          str = '{"result": {"date": "new Date(Date.UTC(2020,0,1,0,0,0,123))"} }',
          that = this;

      this.stub(rpc, "_isConvertDates").returns(true);
      this.stub(rpc, "_isResponseJson").returns(true);
      this.spy(qx.lang.Json, "parse");

      var callback = this.spy(function(result) {
        var msg;

        that.assertCalled(qx.lang.Json.parse);

        msg = "Expected value to be date but found " + typeof result.date;
        that.assertTrue(qx.lang.Type.isDate(result.date), msg);
      });

      rpc.setProtocol("qx1");
      rpc.callAsync(callback);

      // Fake JSON (String) response
      evt.setContent(str);
      req.dispatchEvent(evt);

      this.assertCalled(callback);
    },

    "test: response is parsed as JSON": function() {
      this.setUpFakeRequest();
      var rpc = new qx.io.remote.Rpc(),
          req = this.request,
          evt = qx.event.Registration.createEvent("completed", qx.io.remote.Response),
          str = '{"result": { "json" : true} }',
          that = this;


      this.stub(rpc, "_isConvertDates").returns(false);
      this.spy(qx.lang.Json, "parse");

      var callback = this.spy(function(result) {
        that.assertCalledWith(qx.lang.Json.parse, str);
      });

      rpc.setProtocol("qx1");
      rpc.callAsync(callback);

      // Fake JSON (String) response
      evt.setContent(str);
      req.dispatchEvent(evt);

      this.assertCalled(callback);
    },

    "test: response is not parsed when already object": function() {
      this.setUpFakeRequest();
      var rpc = new qx.io.remote.Rpc(),
          req = this.request,
          evt = qx.event.Registration.createEvent("completed", qx.io.remote.Response),
          obj = {"result": { "json" : true} },
          that = this;

      this.stub(rpc, "_isConvertDates").returns(false);
      this.spy(qx.lang.Json, "parse");

      var callback = this.spy(function(result) {
        that.assertNotCalled(qx.lang.Json.parse);
      });

      rpc.setProtocol("qx1");
      rpc.callAsync(callback);

      // Object response
      evt.setContent(obj);
      req.dispatchEvent(evt);

      this.assertCalled(callback);
    },

    //
    // isConvertDates()
    //

    "test: isConvertDates() returns true when Rpc true": function() {
      var rpc = new qx.io.remote.Rpc();
      rpc.setProtocol("qx1");
      this.stub(qx.io.remote.Rpc, "CONVERT_DATES", true);
      this.assertEquals(true, rpc._isConvertDates());
    }

 */
  }
});
