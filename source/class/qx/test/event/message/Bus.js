/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

qx.Class.define("qx.test.event.message.Bus",
{
  extend : qx.dev.unit.TestCase,


  members :
  {
    __subscriberOne : null,
    __subscriberTwo : null,
    __subscriberThree : null,

    setUp : function() {
      this.__subscriberOne = new qx.core.Object();
      this.__subscriberTwo = new qx.core.Object();
      this.__subscriberThree = new qx.core.Object();
    },

    tearDown : function()
    {
      this.__subscriberOne.dispose();
      this.__subscriberTwo.dispose();
      this.__subscriberThree.dispose();

      var subscribers = qx.event.message.Bus.getSubscriptions();
      for (var key in subscribers) {
        delete subscribers[key];
      }

      this.assertJsonEquals({}, qx.event.message.Bus.getSubscriptions());
    },


    testDispatch : function()
    {
      var bus = qx.event.message.Bus;
      var calls = 0;

      var that = this;
      bus.subscribe("*", function(message) {
        calls++;
        that.assertEquals("MyMessage", message.getName());
        that.assertEquals(10, message.getData());
      }, this.__subscriberOne);

      bus.subscribe("MyMessage2", function(message) {
        that.assertFalse(true, "Wrong subscriber called!");
      }, this.__subscriberTwo);

      bus.subscribe("MyMessage", function(message) {
        calls++;
        that.assertEquals("MyMessage", message.getName());
        that.assertEquals(10, message.getData());
      }, this.__subscriberThree);

      var msg = new qx.event.message.Message("MyMessage", 10);
      this.assertTrue(bus.dispatch(msg), "Message not dispatched");
      this.assertEquals(2, calls, "Wrong callbacks!");
      msg.dispose();
    },

    testDispatchWithDisposed : function()
    {
      var bus = qx.event.message.Bus;
      var calls = 0;

      var that = this;
      bus.subscribe("*", function(message) {
        calls++;
        that.assertEquals("MyMessage", message.getName());
        that.assertEquals(10, message.getData());
      }, this.__subscriberOne);

      this.__subscriberTwo.dispose();
      bus.subscribe("MyMessage", function(message) {
        that.assertFalse(true, "Wrong subscriber called!");
      }, this.__subscriberTwo);

      bus.subscribe("MyMessage", function(message) {
        calls++;
        that.assertEquals("MyMessage", message.getName());
        that.assertEquals(10, message.getData());
      }, this.__subscriberThree);

      var msg = new qx.event.message.Message("MyMessage", 10);
      this.assertTrue(bus.dispatch(msg), "Message not dispatched");
      this.assertEquals(2, calls, "Wrong callbacks!");
      msg.dispose();
    },

    // see http://bugzilla.qooxdoo.org/show_bug.cgi?id=2996
    testWildcard : function()
    {
      var flag1 = false;
      var flag2 = false;
      function handler1() {
        flag1 = true;
      }
      function handler2() {
        flag2 = true;
      }

      var messageBus = qx.event.message.Bus.getInstance();
      messageBus.subscribe("*", handler1, this);
      messageBus.subscribe("mess*", handler2, this);

      var msg1 = new qx.event.message.Message("message", true);
      this.assertTrue(messageBus.dispatch(msg1), "Message not dispatched");
      this.assertTrue(flag1, "Handler1 (filter '*') was not called for message 'message'.");
      this.assertTrue(flag2, "Handler2 (filter 'mess*') was not called for message 'message'.");

      flag1 = false;
      flag2 = false;
      var msg2 = new qx.event.message.Message("massage", true);
      this.assertTrue(messageBus.dispatch(msg2), "Message not dispatched");
      this.assertTrue(flag1, "Handler1 (filter '*') was not called for message 'massage'.");
      this.assertFalse(flag2, "Handler2 (filter 'mess*') was wrongly called for message 'massage'.");
      msg1.dispose();
      msg2.dispose();

    },

    testRegex : function()
    {
      var flag1 = false;
      function handler1() {
        flag1 = true;
      }
      var messageBus = qx.event.message.Bus.getInstance();
      messageBus.subscribe(/^test\.[a-z]+$/, handler1, this);
      var msg1 = new qx.event.message.Message("test.abc", true);
      this.assertTrue(messageBus.dispatch(msg1), "Message not dispatched");
      this.assertTrue(flag1, "Handler1 (filter /^test\\.[a-z]+$/) was not called for message '" + msg1.getName() +"'");

      var msg2 = new qx.event.message.Message("test.123", true);
      this.assertFalse(messageBus.dispatch(msg2), "Message was dispatched and shouldn't have been");

      msg1.dispose();
      msg2.dispose();
    },

    testSubscribeOnce : function()
    {
      var flag1 = false;
      function handler1() {
        flag1 = true;
      }
      var messageBus = qx.event.message.Bus.getInstance();
      messageBus.subscribeOnce("testSubscribeOnce", handler1, this);
      var msg1 = new qx.event.message.Message("testSubscribeOnce", true);
      this.assertTrue(messageBus.dispatch(msg1), "Message not dispatched");
      this.assertTrue(flag1, "Handler (filter \"testSubscribeOnce\") was not called for message '" + msg1.getName() +"'");

      flag1 = false;
      var msg2 = new qx.event.message.Message("testSubscribeOnce", true);
      this.assertFalse(messageBus.dispatch(msg2), "Message was dispatched but shouldn't have been.");

      msg1.dispose();
      msg2.dispose();
    },


    // see http://bugzilla.qooxdoo.org/show_bug.cgi?id=2996
    testUnsubscribe : function()
    {
      var flag = false;
      function handler() {
         flag = true;
      }

      function anotherHandler() {
      }

      var messageBus = qx.event.message.Bus.getInstance();
      messageBus.subscribe("message", handler, this);
      messageBus.unsubscribe("message", anotherHandler, this);
      var msg1 = new qx.event.message.Message("message", true);
      this.assertTrue(messageBus.dispatch(msg1), "Message not dispatched");
      this.assertTrue(flag, "Handler was not called.");
      flag = false;
      messageBus.unsubscribe("message", handler, this);
      var msg2 = new qx.event.message.Message("message", true);
      this.assertFalse(messageBus.dispatch(msg2), "Message not dispatched");
      this.assertFalse(flag, "Handler was called although unsubscribed.");
      msg1.dispose();
      msg2.dispose();
    },

    testUnsubscribeAll : function()
    {
      var flag = false;
      function handler() {
         flag = true;
      };

      function anotherHandler() {};

      var messageBus = qx.event.message.Bus.getInstance();
      messageBus.subscribe("message", handler, this);
      var msg1 = new qx.event.message.Message("message", true);
      this.assertTrue(messageBus.dispatch(msg1), "Message not dispatched");
      this.assertTrue(flag, "Handler was not called.");

      flag = false;
      messageBus.unsubscribe("message");
      var msg2 = new qx.event.message.Message("message", true);
      this.assertFalse(messageBus.dispatch(msg2), "Message not dispatched");
      this.assertFalse(flag, "Handler was called although unsubscribed.");

      msg1.dispose();
      msg2.dispose();
    },

    testWrongDispatch : function() {
      var flag = false;
      function handler() {
         flag = true;
      }

      var messageBus = qx.event.message.Bus.getInstance();
      messageBus.subscribe("message", handler, this);
      messageBus.subscribe("massage", handler, this);

      var msg = new qx.event.message.Message("trash", true);
      this.assertFalse(messageBus.dispatch(msg), "Message was dispatched");
      this.assertFalse(flag, "Handler was called.");
      msg.dispose();
    }
  }
});
