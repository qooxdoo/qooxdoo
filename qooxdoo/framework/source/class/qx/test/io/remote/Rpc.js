/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
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
    setUp: function() {

    },

    setUpFakeRequest : function() {
      var req = new qx.io.remote.Request();
      req.setData = req.setState = req.send =
        req.getSequenceNumber = function() {};
      this.request = this.stub(req);
      req.getSequenceNumber.returns(undefined);
      this.stub(qx.io.remote, "Request").returns(this.request);
    },

    setUpMockRequest : function() {
      var req = new qx.io.remote.Request();

      // Defined in inheritance chain
      req.getSequenceNumber = function() {};

      // Stub out methods
      this.stub(req, "getSequenceNumber").returns(undefined);

      // Inject stub to RPC
      this.stub(qx.io.remote, "Request").returns(req);

      // Expose request stub to tests and return mock
      this.request = req;
      return this.mock(req);
    },

    tearDown: function() {
      this.getSandbox().restore();
    },

    "test: request data contains pseudo date literal when convert dates": function() {
      var mockRequest = this.setUpMockRequest(),
          req = this.request,
          obj = { date: new Date(Date.UTC(2020,0,1,0,0,0,123)) },
          msg,
          data;

      this.stub(req, "setData");
      mockRequest.expects("send").once();

      var rpc = new qx.io.remote.Rpc();
      this.stub(rpc, "_isConvertDates").returns(true);
      this.stub(rpc, "createRpcData").returns({"params": obj});
      rpc.callAsync();

      data = this.request.setData.getCall(0).args[0];
      msg = "Must contain converted date literal";
      this.assertMatch(data, /"new Date\(Date.UTC\(2020,0,1,0,0,0,123\)\)"/, msg);

      mockRequest.verify();
    },

    "test: response contains date from literal when convert dates": function() {
      var mockRequest = this.setUpMockRequest(),
          rpc = new qx.io.remote.Rpc(),
          req = this.request,
          evt = qx.event.Registration.createEvent("completed", qx.io.remote.Response),
          literal = "new Date(Date.UTC(2020,0,1,0,0,0,123))",
          that = this;

      this.stub(rpc, "_isConvertDates").returns(true);
      mockRequest.expects("send").once();

      rpc.callAsync(function(result) {
        var msg = "Expected value to be date but found " + typeof result;
        that.assertTrue(qx.lang.Type.isDate(result), msg);
      });

      // Fake JSON string response
      evt.setContent({result: literal});
      req.dispatchEvent(evt);

      mockRequest.verify();
    },

    "test: response is parsed as JSON": function() {
      var mockRequest = this.setUpMockRequest(),
          rpc = new qx.io.remote.Rpc(),
          req = this.request,
          evt = qx.event.Registration.createEvent("completed", qx.io.remote.Response),
          str = '{"json": true}',
          that = this;

      mockRequest.expects("send").once();

      this.stub(rpc, "_isConvertDates").returns(false);
      this.spy(qx.lang.Json, "parse");

      rpc.callAsync(function(result) {
        that.assertCalledWith(qx.lang.Json.parse, str);
      });

      // Fake JSON string response
      evt.setContent({result: str});
      req.dispatchEvent(evt);

      mockRequest.verify();
    },

    //
    // isConvertDates()
    //

    "test: isConvertDates() returns true when Json true": function() {
      var rpc = new qx.io.remote.Rpc();
      this.stub(qx.util.Json, "CONVERT_DATES", true);
      this.assertEquals(true, rpc._isConvertDates());
    },

    "test: isConvertDates() returns true when Rpc true and no util.Json": function() {
      var rpc = new qx.io.remote.Rpc();
      this.stub(qx.io.remote.Rpc, "CONVERT_DATES", true);
      this.assertEquals(true, rpc._isConvertDates());
    },

    "test: isConvertDates() returns true when Json true, Rpc false": function() {
      var rpc = new qx.io.remote.Rpc();
      this.stub(qx.util.Json, "CONVERT_DATES", true);
      this.stub(qx.io.remote.Rpc, "CONVERT_DATES", true);
      this.assertEquals(true, rpc._isConvertDates());
    },

    skip: function(msg) {
      throw new qx.dev.unit.RequirementError(null, msg);
    }
  }
});
