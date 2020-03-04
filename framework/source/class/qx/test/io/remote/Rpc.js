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

    serverRespondsWith : function(value) {
      this.getServer().respondWith("POST", /.*/,[200, { "Content-Type": "application/json" },value]);
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


    "test: send request": function() {
      this.setUpFakeRequest();
      var rpc = new qx.io.remote.Rpc("/foo");

      rpc.callAsync();
      this.assertCalledOnce(this.request.send);
    },

    "test: call simple jsonrpc method" : async function() {
      var response = qx.lang.Json.stringify({
        jsonrpc: "2.0",
        id: 1,
        result: "foo"
      });
      this.serverRespondsWith(response);
      var client = new qx.io.remote.Rpc("/jsonrpc");
      var that = this;
      var requestCallback = this.spy();
      var sendCallback = this.spy();
      client.addRequest("getFoo",[]).then(requestCallback);
      client.send().then(sendCallback);
      this.getServer().respond();
      this.wait(100, function(){
        this.assertCalledWith(requestCallback,"foo");
        this.assertCalledWith(sendCallback, qx.lang.Json.parse(response));
      },this);

    },


    //
    // legacy tests, will be removed in v7.0.0
    //

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
  }
});
