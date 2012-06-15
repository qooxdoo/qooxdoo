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

qx.Class.define("qx.test.event.Messaging",
{
  extend : qx.dev.unit.TestCase,
  include : qx.dev.unit.MMock,

  members : {
    __m : null,

    setUp : function() {
      this.__m = new qx.event.Messaging();
    },

    testTwoChannels : function() {
      var handlerGet = this.spy();
      var handlerPost = this.spy();
      var ctx = {a: 12};
      var data = {data: "test"};
      this.__m.on("GET", "/get", handlerGet, ctx);
      this.__m.emit("GET", "/get", null, data);
      this.assertCalledOnce(handlerGet);
      this.assertCalledOn(handlerGet, ctx);
      this.assertCalledWith(handlerGet, {customData: data, params: {}, path: "/get"});
      this.assertNotCalled(handlerPost);

      this.__m.on("POST", "/post", handlerPost, ctx);
      this.__m.emit("POST", "/post", null, data);
      this.assertCalledOnce(handlerPost);
      this.assertCalledOn(handlerPost, ctx);
      this.assertCalledWith(handlerPost, {customData: data, params: {}, path: "/post"});
      this.assertCalledOnce(handlerGet);
    },


    testGet : function() {
      var handler = this.spy();
      var ctx = {a: 12};
      var data = {data: "test"};
      this.__m.on("get", "/", handler, ctx);
      this.__m.emit("get", "/", null, data);
      this.assertCalledOnce(handler);
      this.assertCalledOn(handler, ctx);
      this.assertCalledWith(handler, {customData: data, params: {}, path: "/"});
    },


    testRegExp : function() {
      var handler = this.spy();
      var ctx = {a: 12};
      var data = {data: "abcdef"};
      this.__m.on("xyz", /^xyz/g, handler, ctx);
      this.__m.emit("xyz", "xyzabc", null, data);
      this.__m.emit("xyz", "abcxyz", null, data);
      this.assertCalledOnce(handler);
      this.assertCalledOn(handler, ctx);
      this.assertCalledWith(handler, {customData: data, params: {}, path: "xyzabc"});
    },


    testGetAll : function() {
      var handler = this.spy();
      this.__m.on("a", /.*/, handler);
      this.__m.emit("a", "xyzabc");
      this.__m.emit("a", "abcxyz");
      this.assertCalledTwice(handler);
    },


    testAny : function() {
      var handler = this.spy();
      this.__m.onAny(/.*/, handler);
      this.__m.emit("a", "xyzabc");
      this.__m.emit("b", "abcxyz");
      this.assertCalledTwice(handler);
    },


    testTwice : function() {
      var handler = this.spy();
      var ctx = {a: 12};
      var data = {data: "test"};
      this.__m.on("GET", "/", handler, ctx);
      this.__m.emit("GET", "/", null, data);
      this.__m.emit("GET", "/", null, data);
      this.assertCalledTwice(handler);
      this.assertCalledOn(handler, ctx);
      this.assertCalledWith(handler, {customData: data, params: {}, path: "/"});
    },


    testParam : function() {
      var handler = this.spy();
      var ctx = {a: 12};
      var data = {data: "test"};
      this.__m.on("POST", "/{id}/affe", handler, ctx);
      this.__m.emit("POST", "/123456/affe", data);
      this.assertCalledOnce(handler);
      this.assertCalledOn(handler, ctx);
      this.assertCalledWith(handler,
        {customData: undefined, params: {id: "123456", data: "test"}, path: "/123456/affe"}
      );
    },


    testMultipleParam : function() {
      var handler = this.spy();
      var data = {data: "test"};
      this.__m.on("POST", "/{id}-{name}/affe", handler);
      this.__m.emit("POST", "/123456-xyz/affe", data);
      this.assertCalledOnce(handler);
      this.assertCalledWith(handler,
        {customData: undefined, params: {id: "123456", name: "xyz", data: "test"}, path: "/123456-xyz/affe"}
      );
    },


    testRemove : function() {
      var handler = this.spy();
      var id = this.__m.on("GET", "/", handler);
      this.__m.emit("GET", "/");
      this.assertCalledOnce(handler);

      this.__m.remove(id);
      this.__m.emit("GET", "/");
      this.assertCalledOnce(handler);
    }
  }
});