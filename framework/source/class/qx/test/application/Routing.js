/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)

************************************************************************ */

qx.Class.define("qx.test.application.Routing",
{
  extend : qx.dev.unit.TestCase,
  include : qx.dev.unit.MMock,

  members : {
    __r : null,
    __initialState : null,

    setUp : function() {
      this.__initialState = qx.bom.History.getInstance().getState();
      this.__r = new qx.application.Routing();
    },


    tearDown : function() {
      qx.bom.History.getInstance().setState(this.__initialState);
      this.__r.dispose();
    },


    testGet : function() {
      var handler = this.spy();
      this.__r.onGet("/abc", handler);
      this.__r.executeGet("/abc");
      this.assertCalledOnce(handler);
    },


    testBack : function() {
      var aHandler = this.spy();
      var bHandler = this.spy();
      this.__r.onGet("/a", aHandler);
      this.__r.onGet("/b", bHandler);
      this.__r.executeGet("/a");
      this.__r.executeGet("/b");
      this.__r.back();
      this.assertCalledTwice(aHandler);
      this.assertCalledOnce(bHandler);
    },

    /**
    * Tests the ability of app routing to detect and remove route cycles.
    * After A >> B >> C >> B >> routing.back(), the routing should display A and not C.
    */
    testBackCycle : function() {
      var aHandler = this.spy();
      var bHandler = this.spy();
      var cHandler = this.spy();
      this.__r.onGet("/a", aHandler);
      this.__r.onGet("/b", bHandler);
      this.__r.onGet("/c", cHandler);
      this.__r.executeGet("/a");
      this.__r.executeGet("/b");
      this.__r.executeGet("/c");
      this.__r.executeGet("/b");
      this.__r.back();
      this.assertCalledTwice(aHandler);
      this.assertCalledTwice(bHandler);
      this.assertCalledOnce(cHandler);
    },

    testGetCustomData : function() {
      var handler = this.spy();
      this.__r.onGet("/abc", handler);
      this.__r.executeGet("/abc", {a: true});
      this.assertCalledOnce(handler);
      this.assertTrue(handler.args[0][0].customData.a);
    },


    testGetCustomDataTwoInstances : function() {
      var r2 = new qx.application.Routing();
      var handler = this.spy();
      this.__r.onGet("/abc", handler);
      r2.executeGet("/abc", {a: true});
      this.assertCalledOnce(handler);
      this.assertTrue(handler.args[0][0].customData.a);
      r2.dispose();
    },


    testOn : function() {
      var handler = this.spy();
      this.__r.on("/", handler);
      this.__r.execute("/");
      this.assertCalledOnce(handler);
    },


    testPost : function() {
      var handler = this.spy();
      this.__r.onPost("/abc", handler);
      this.__r.executePost("/abc");
      this.assertCalledOnce(handler);
    },


    testPostParam : function() {
      var handler = this.spy();
      var data = {data: "test"};
      this.__r.onPost("/{id}/affe", handler);
      this.__r.executePost("/123456/affe", data, "custom data");
      this.assertCalledOnce(handler);
      this.assertCalledWith(handler,
        {customData: "custom data", params: {id: "123456", data: "test"}, path: "/123456/affe"}
      );
    },


    testDelete : function() {
      var handler = this.spy();
      this.__r.onDelete("/abc", handler);
      this.__r.executeDelete("/abc");
      this.assertCalledOnce(handler);
    },


    testPut : function() {
      var handler = this.spy();
      this.__r.onPut("/abc", handler);
      this.__r.executePut("/abc");
      this.assertCalledOnce(handler);
    },


    testAny : function() {
      var handler = this.spy();
      this.__r.onAny("/abc", handler);
      this.__r.executePost("/abc");
      this.__r.executeDelete("/abc");
      this.assertCalledTwice(handler);
    },

    testInit : function() {
      var handler = this.spy();
      var defaultHandler = this.spy();

      this.__r.dispose();
      this.__r = new qx.application.Routing();

      this.__r.onGet("/a/b/c", handler);
      this.assertNotCalled(handler);
      this.__r.onGet("/", defaultHandler);
      this.assertNotCalled(defaultHandler);

      this.__r.init();
      this.assertNotCalled(handler);
      this.assertCalledOnce(defaultHandler);

      qx.bom.History.getInstance().setState("/a/b/c");
      this.assertCalledOnce(handler);
    },

    testGetPathOrFallback : function() {
      this.__r.on("/registered", function(){});

      this.assertEquals("/", this.__r._getPathOrFallback(""));
      this.assertEquals("/", this.__r._getPathOrFallback(null));
      this.assertEquals("/", this.__r._getPathOrFallback("/not/registered"));
      this.assertEquals("/given/default", this.__r._getPathOrFallback("use_default_instead_of_this", "/given/default"));
      this.assertEquals("/registered", this.__r._getPathOrFallback("/registered"));
    }
  }
});
