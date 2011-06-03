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
      var req = this.request = this.injectStub(qx.io.remote, "Request");
      req.getSequenceNumber.returns(undefined);
    },

    setUpMockRequest : function() {
      var req = this.request = new qx.io.remote.Request;
      this.stub(req);
      return this.revealMock(qx.io.remote, "Request", req);
    },

    tearDown: function() {
      this.getSandbox().restore();
    },

    "test: send request": function() {
      var mock = this.setUpMockRequest(),
          req = this.request,
          rpc = new qx.io.remote.Rpc();

      mock.expects("send").once();
      rpc.callAsync();
      mock.verify();
    },

    "test: request data contains pseudo date literal when convert dates": function() {
      this.setUpFakeRequest();
      var req = this.request,
          obj = { date: new Date(Date.UTC(2020,0,1,0,0,0,123)) },
          msg,
          data;

      var rpc = new qx.io.remote.Rpc();
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
          literal = "new Date(Date.UTC(2020,0,1,0,0,0,123))",
          that = this;

      this.stub(rpc, "_isConvertDates").returns(true);

      rpc.callAsync(function(result) {
        var msg = "Expected value to be date but found " + typeof result;
        that.assertTrue(qx.lang.Type.isDate(result), msg);
      });

      // Fake JSON string response
      evt.setContent({result: literal});
      req.dispatchEvent(evt);
    },

    "test: response is parsed as JSON": function() {
      this.setUpFakeRequest();
      var rpc = new qx.io.remote.Rpc(),
          req = this.request,
          evt = qx.event.Registration.createEvent("completed", qx.io.remote.Response),
          str = '{"json": true}',
          that = this;

      this.stub(rpc, "_isConvertDates").returns(false);
      this.spy(qx.lang.Json, "parse");

      rpc.callAsync(function(result) {
        that.assertCalledWith(qx.lang.Json.parse, str);
      });

      // Fake JSON string response
      evt.setContent({result: str});
      req.dispatchEvent(evt);
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
