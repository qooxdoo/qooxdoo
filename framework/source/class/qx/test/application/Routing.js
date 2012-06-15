/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
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
      qx.bom.History.getInstance().setState("/a/b/c");

      this.__r.dispose();
      this.__r = new qx.application.Routing();

      this.__r.onGet("/a/b/c", handler);
      this.assertNotCalled(handler);
      this.__r.init();
      this.assertCalledOnce(handler);
    }

  }
});
