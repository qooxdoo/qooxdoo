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

    setUpDoubleRequest : function() {
      var req = new qx.io.remote.Request();
      this.request = req;
      this.stub(qx.io.remote, "Request").returns(this.request);
    },

    tearDown: function() {
      qx.io.remote.Rpc.CONVERT_DATES = null;
      qx.util.Json.CONVERT_DATES = null;
      this.getSandbox().restore();
    },

    "test: request data contains pseudo date literal when convert dates": function() {
      this.setUpFakeRequest();

      var obj = { date: new Date(Date.UTC(2020,0,1,0,0,0,123)) },
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
      qx.util.Json.CONVERT_DATES = true;
      var rpc = new qx.io.remote.Rpc();
      this.assertEquals(true, rpc._isConvertDates());
    },

    "test: isConvertDates() returns true when Rpc true and no util.Json": function() {
      var tmp = qx.util.Json;
      qx.util.Json = null;

      qx.io.remote.Rpc.CONVERT_DATES = true;
      var rpc = new qx.io.remote.Rpc();
      this.assertEquals(true, rpc._isConvertDates());

      qx.util.Json = tmp;
    },

    "test: isConvertDates() returns true when Json true, Rpc false": function() {
      qx.util.Json.CONVERT_DATES = true;
      qx.io.remote.Rpc.CONVERT_DATES = false;
      var rpc = new qx.io.remote.Rpc();
      this.assertEquals(true, rpc._isConvertDates());
    },

    skip: function(msg) {
      throw new qx.dev.unit.RequirementError(null, msg);
    }
  }
});
