/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2020 Christian Boulanger

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Boulanger (cboulanger)

************************************************************************ */

qx.Class.define("qx.test.event.GlobalEventMonitors",
{
  extend : qx.dev.unit.TestCase,
  include : qx.dev.unit.MRequirements,

  events : {
    "test" : "qx.event.type.Event"
  },

  members :
  {


    setUp : function()
    {
      this.called = false;
    },


    tearDown : function ()
    {
      qx.event.Manager.resetGlobalEventMonitors();
    },


    "test: add and call global event monitors" : function()
    {
      qx.event.Manager.addGlobalEventMonitor(function(target, event){
        this.assertEquals(this, target);
        this.assertEquals("test", event.getType());
        this.called = true;
      }, this);
      this.fireEvent("test");
      this.assertTrue(this.called, "Monitor function was not called");
    },

    "test: remove global event monitor" : function()
    {
      this.value = false;
      var fn1 = function(){ this.value = true};
      var fn2 = function(){ this.value = false};
      qx.event.Manager.addGlobalEventMonitor(fn1, this);
      this.fireEvent("test");
      this.assertTrue(this.value, "Value should be true after adding fn1");
      qx.event.Manager.addGlobalEventMonitor(fn2, this);
      this.fireEvent("test");
      this.assertFalse(this.value, "Value should be false after adding fn2");
      qx.event.Manager.removeGlobalEventMonitor(fn2, this);
      this.fireEvent("test");
      this.assertTrue(this.value, "Value should be true after removing fn2");
    },

    "test: disallow event manipulation" : function() {
      var errorWasThrown = false;
      qx.event.Manager.addGlobalEventMonitor(function (target, event) {
        event.preventDefault();
      }, this);
      try {
        this.fireEvent("test");
      } catch (e) {
        errorWasThrown = true;
      }
      this.assertTrue(errorWasThrown, "No error was thrown after manipulating event object");
    }
  }
});
