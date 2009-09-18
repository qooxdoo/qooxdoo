/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Schmidt (chris_schmidt)

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
      
      bus.dispatch("MyMessage", 10);
      this.assertEquals(2, calls, "Wrong callbacks!");
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
      
      bus.dispatch("MyMessage", 10);
      this.assertEquals(2, calls, "Wrong callbacks!");
    }
  }
});