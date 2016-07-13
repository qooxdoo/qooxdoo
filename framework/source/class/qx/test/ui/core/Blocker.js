/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */
qx.Class.define("qx.test.ui.core.Blocker",
{
  extend : qx.test.ui.LayoutTestCase,

  members :
  {
    __blocker : null,

    setUp : function() {
      this.base(arguments);

      this.__blocker = new qx.ui.core.Blocker(this.getRoot());
      this.__blocker.setColor("green");
      this.__blocker.setOpacity(0.5);
    },

    tearDown : function() {
      this.base(arguments);

      this.__blocker.dispose();
    },

    testBlocker : function()
    {
      var blockerElement = this.__blocker.getBlockerElement();

      this.__blocker.block();
      this.flush();
      this.assertTrue(this.__blocker.isBlocked(), "isBlocked()");
      this.assertTrue(blockerElement.isIncluded(), "isIncluded()");

      this.__blocker.unblock();
      this.flush();
      this.assertFalse(this.__blocker.isBlocked(), "isBlocked()");
      this.assertFalse(blockerElement.isIncluded(), "isIncluded()");
    },

    testBlockerThrice : function()
    {
      var blockerElement = this.__blocker.getBlockerElement();

      this.__blocker.block();
      this.flush();
      this.assertTrue(this.__blocker.isBlocked(), "isBlocked()");
      this.assertTrue(blockerElement.isIncluded(), "isIncluded()");

      this.__blocker.block();
      this.flush();
      this.assertTrue(this.__blocker.isBlocked(), "isBlocked()");
      this.assertTrue(blockerElement.isIncluded(), "isIncluded()");

      this.__blocker.block();
      this.flush();
      this.assertTrue(this.__blocker.isBlocked(), "isBlocked()");
      this.assertTrue(blockerElement.isIncluded(), "isIncluded()");

      this.__blocker.unblock();
      this.flush();
      this.assertTrue(this.__blocker.isBlocked(), "isBlocked()");
      this.assertTrue(blockerElement.isIncluded(), "isIncluded()");

      this.__blocker.unblock();
      this.flush();
      this.assertTrue(this.__blocker.isBlocked(), "isBlocked()");
      this.assertTrue(blockerElement.isIncluded(), "isIncluded()");

      this.__blocker.unblock();
      this.flush();
      this.assertFalse(this.__blocker.isBlocked(), "isBlocked()");
      this.assertFalse(blockerElement.isIncluded(), "isIncluded()");
    },

    testForceUnblock : function()
    {
      var blockerElement = this.__blocker.getBlockerElement();

      this.__blocker.block();
      this.flush();
      this.assertTrue(this.__blocker.isBlocked(), "isBlocked()");
      this.assertTrue(blockerElement.isIncluded(), "isIncluded()");

      this.__blocker.block();
      this.flush();
      this.assertTrue(this.__blocker.isBlocked(), "isBlocked()");
      this.assertTrue(blockerElement.isIncluded(), "isIncluded()");

      this.__blocker.forceUnblock();
      this.flush();
      this.assertFalse(this.__blocker.isBlocked(), "isBlocked()");
      this.assertFalse(blockerElement.isIncluded(), "isIncluded()");
    },

    testBlockedEvent : function()
    {
      this.__blockedEventFired = false;
      this.__unblockedEventFired = false;

      this.__blocker.addListenerOnce("blocked", function(e){
        this.__blockedEventFired = true;
      }, this);

      this.__blocker.addListenerOnce("unblocked", function(e){
        this.__unblockedEventFired = true;
      }, this);

      this.__blocker.block();
      this.__blocker.unblock();

      this.wait(100, function() {
        this.assertTrue(this.__blockedEventFired, "'blocked' event was not fired, after block() was executed!");
        this.assertTrue(this.__unblockedEventFired, "'unblocked' event was not fired, after unblock() was executed!");
      }, this);
    },

    testRestoreActiveAndFocusedWidgets : function()
    {
      var activeWidget, focusedWidget;
      var focusHandler = qx.event.Registration.getManager(window).getHandler(qx.event.handler.Focus);

      var txt2 = new qx.ui.form.TextField();
      this.getRoot().add(txt2, {left: 100, top:0});
      txt2.focus();

      var txt1 = new qx.ui.form.TextField();
      this.getRoot().add(txt1);
      // set active widget after focusing a widget, because focus() sets the same widget as active one.
      txt1.activate();

      this.flush();

      var blockerElement = this.__blocker.getBlockerElement();

      this.__blocker.block();
      this.flush();
      this.assertTrue(this.__blocker.isBlocked(), "isBlocked()");
      this.assertTrue(blockerElement.isIncluded(), "isIncluded()");

      activeWidget = qx.ui.core.Widget.getWidgetByElement(focusHandler.getActive());
      this.assertFalse(activeWidget === txt1, "text field 1 must not be active");

      focusedWidget = qx.ui.core.Widget.getWidgetByElement(focusHandler.getFocus());
      this.assertFalse(focusedWidget === txt2, "text field 2 must not be focused");

      this.__blocker.unblock();
      this.flush();
      this.assertFalse(this.__blocker.isBlocked(), "isBlocked()");
      this.assertFalse(blockerElement.isIncluded(), "isIncluded()");

      activeWidget = qx.ui.core.Widget.getWidgetByElement(focusHandler.getActive());
      this.assertTrue(activeWidget === txt1, "text field 1 must be active");

      focusedWidget = qx.ui.core.Widget.getWidgetByElement(focusHandler.getFocus());
      this.assertTrue(focusedWidget === txt2, "text field 2 must be focused");

      // clear
      txt1.destroy();
      txt2.destroy();
      this.flush();
    },


    testRestoreDisposedWidget : function()
    {
      var widget;
      var focusHandler = qx.event.Registration.getManager(window).getHandler(qx.event.handler.Focus);
      var txt = new qx.ui.form.TextField();
      this.getRoot().add(txt);
      txt.focus();
      this.flush();

      var blockerElement = this.__blocker.getBlockerElement();

      this.__blocker.block();
      this.flush();
      this.assertTrue(this.__blocker.isBlocked(), "isBlocked()");
      this.assertTrue(blockerElement.isIncluded(), "isIncluded()");

      // destroy text field
      txt.destroy();
      this.flush();

      this.__blocker.unblock();
      this.flush();
      this.assertFalse(this.__blocker.isBlocked(), "isBlocked()");
      this.assertFalse(blockerElement.isIncluded(), "isIncluded()");

      // text field must not be focused
      widget = qx.ui.core.Widget.getWidgetByElement(focusHandler.getFocus());
      this.assertFalse(widget === txt, "text field must be focused, because it is destroyed");

      txt.destroy();
      this.flush();
    }
  }
});
