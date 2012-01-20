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

qx.Class.define("qx.test.event.Emitter",
{
  extend : qx.dev.unit.TestCase,
  include : qx.dev.unit.MMock,

  members : {
    __ee : null,

    setUp : function() {
      this.__ee = new qx.event.Emitter();
    },


    testOnOff : function() {
      var spy = this.spy();
      this.__ee.on("test", spy, this);
      this.__ee.emit("test");
      this.assertCalledOnce(spy);
      this.assertCalledOn(spy, this);

      this.__ee.off("test", spy, this);
      this.__ee.emit("test");
      this.assertCalledOnce(spy);
    },


    testOnOffById : function() {
      var spy = this.spy();
      var id = this.__ee.on("test", spy, this);
      this.__ee.emit("test");
      this.assertCalledOnce(spy);

      this.__ee.offById(id);
      this.__ee.emit("test");
      this.assertCalledOnce(spy);
    },


    testAddRemove : function() {
      var spy = this.spy();
      this.__ee.addListener("test", spy, this);
      this.__ee.emit("test");
      this.assertCalledOnce(spy);

      this.__ee.removeListener("test", spy, this);
      this.__ee.emit("test");
      this.assertCalledOnce(spy);
    },


    testAddRemoveById : function() {
      var spy = this.spy();
      var id = this.__ee.addListener("test", spy, this);
      this.__ee.emit("test");
      this.assertCalledOnce(spy);

      this.__ee.removeListenerById(id);
      this.__ee.emit("test");
      this.assertCalledOnce(spy);
    },


    testOnTwoListeners : function() {
      var spy1 = this.spy();
      var spy2 = this.spy();

      this.__ee.on("test", spy1);
      this.__ee.on("test", spy2);
      this.__ee.emit("test");
      this.assertCalledOnce(spy1);
      this.assertCalledOnce(spy2);

      this.__ee.off("test", spy1);
      this.__ee.emit("test");
      this.assertCalledOnce(spy1);
      this.assertCalledTwice(spy2);
    },


    testTwoEvents : function() {
      var spy1 = this.spy();
      var spy2 = this.spy();

      this.__ee.on("test1", spy1);
      this.__ee.on("test2", spy2);
      this.__ee.emit("test1");
      this.assertCalledOnce(spy1);
      this.assertNotCalled(spy2);

      this.__ee.emit("test2");
      this.assertCalledOnce(spy1);
      this.assertCalledOnce(spy2);
    },


    testOnce : function() {
      var spy = this.spy();

      this.__ee.once("test", spy);
      this.__ee.emit("test");
      this.assertCalledOnce(spy);

      this.__ee.emit("test");
      this.assertCalledOnce(spy);
    },


    testAddListenerOnce : function() {
      var spy = this.spy();

      this.__ee.addListenerOnce("test", spy);
      this.__ee.emit("test");
      this.assertCalledOnce(spy);

      this.__ee.emit("test");
      this.assertCalledOnce(spy);
    },

    testOnAny : function() {
      var spy = this.spy();

      this.__ee.on("*", spy);
      this.__ee.emit("test");
      this.assertCalledOnce(spy);

      this.__ee.emit("test2");
      this.assertCalledTwice(spy);
    },


    testAddListenerAny : function() {
      var spy = this.spy();

      this.__ee.addListener("*", spy);
      this.__ee.emit("test");
      this.assertCalledOnce(spy);

      this.__ee.emit("test2");
      this.assertCalledTwice(spy);
    },


    testEmitData : function() {
      var spy = this.spy();
      this.__ee.on("test", spy);
      this.__ee.emit("test", 123);
      this.assertCalledWith(spy, 123);
    }
  }
});