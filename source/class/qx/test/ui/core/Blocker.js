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
qx.Class.define("qx.test.ui.core.Blocker", {
  extend: qx.test.ui.LayoutTestCase,

  members: {
    __blocker: null,

    setUp() {
      super.setUp();

      this.__blocker = new qx.ui.core.Blocker(this.getRoot());
      this.__blocker.setColor("green");
      this.__blocker.setOpacity(0.5);
    },

    tearDown() {
      super.tearDown();

      this.__blocker.dispose();
    },

    testBlocker() {
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

    testBlockerThrice() {
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

    testForceUnblock() {
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

    testBlockedEvent() {
      this.__blockedEventFired = false;
      this.__unblockedEventFired = false;

      this.__blocker.addListenerOnce("blocked", e => {
        this.__blockedEventFired = true;
      });

      this.__blocker.addListenerOnce("unblocked", e => {
        this.__unblockedEventFired = true;
      });

      this.__blocker.block();
      this.__blocker.unblock();

      this.wait(
        100,
        function () {
          this.assertTrue(
            this.__blockedEventFired,
            "'blocked' event was not fired, after block() was executed!"
          );

          this.assertTrue(
            this.__unblockedEventFired,
            "'unblocked' event was not fired, after unblock() was executed!"
          );
        },
        this
      );
    },

    testRestoreActiveAndFocusedWidgets() {
      var activeWidget, focusedWidget;
      var focusHandler = qx.event.Registration.getManager(window).getHandler(
        qx.event.handler.Focus
      );

      var txt2 = new qx.ui.form.TextField();
      this.getRoot().add(txt2, { left: 100, top: 0 });
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

      activeWidget = qx.ui.core.Widget.getWidgetByElement(
        focusHandler.getActive()
      );

      this.assertFalse(
        activeWidget === txt1,
        "text field 1 must not be active"
      );

      focusedWidget = qx.ui.core.Widget.getWidgetByElement(
        focusHandler.getFocusedElement()
      );

      this.assertFalse(
        focusedWidget === txt2,
        "text field 2 must not be focused"
      );

      this.__blocker.unblock();
      this.flush();
      this.assertFalse(this.__blocker.isBlocked(), "isBlocked()");
      this.assertFalse(blockerElement.isIncluded(), "isIncluded()");

      activeWidget = qx.ui.core.Widget.getWidgetByElement(
        focusHandler.getActive()
      );

      this.assertTrue(activeWidget === txt1, "text field 1 must be active");

      focusedWidget = qx.ui.core.Widget.getWidgetByElement(
        focusHandler.getFocusedElement()
      );

      this.assertTrue(focusedWidget === txt2, "text field 2 must be focused");

      // clear
      txt1.destroy();
      txt2.destroy();
      this.flush();
    },

    testRestoreDisposedWidget() {
      var widget;
      var focusHandler = qx.event.Registration.getManager(window).getHandler(
        qx.event.handler.Focus
      );

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
      widget =
        qx.ui.core.Widget.getWidgetByElement(focusHandler.getFocusedElement());
      this.assertFalse(
        widget === txt,
        "text field must be focused, because it is destroyed"
      );

      txt.destroy();
      this.flush();
    },

    testBlockContent() {
      // Create a container widget with specific position
      var container = new qx.ui.container.Composite(new qx.ui.layout.Canvas());
      this.getRoot().add(container, { left: 100, top: 50 });
      container.setWidth(200);
      container.setHeight(150);
      this.flush();

      // Create blocker for the container
      var blocker = new qx.ui.core.Blocker(container);
      var blockerElement = blocker.getBlockerElement();

      // Block content
      blocker.blockContent(10);
      this.flush();

      this.assertTrue(blocker.isBlocked(), "blocker should be blocked");
      this.assertTrue(blockerElement.isIncluded(), "blocker element should be included");

      // Verify blocker dimensions match container
      var styles = blockerElement.getStyles();
      this.assertEquals("200px", styles.width, "blocker width should match container width");
      this.assertEquals("150px", styles.height, "blocker height should match container height");

      // Verify blocker position is 0,0 (relative to container, not layout parent)
      // This is the fix for issue #10411
      this.assertEquals("0px", styles.left, "blocker left should be 0 when blocking content");
      this.assertEquals("0px", styles.top, "blocker top should be 0 when blocking content");

      // Cleanup
      blocker.unblock();
      blocker.dispose();
      container.destroy();
      this.flush();
    },

    testBlockContentPositioning() {
      // Create a container at a non-zero position
      var container = new qx.ui.container.Composite(new qx.ui.layout.Canvas());
      this.getRoot().add(container, { left: 150, top: 100 });
      container.setWidth(300);
      container.setHeight(200);
      this.flush();

      var blocker = new qx.ui.core.Blocker(container);
      var blockerElement = blocker.getBlockerElement();

      // Block the content
      blocker.blockContent(5);
      this.flush();

      var styles = blockerElement.getStyles();

      // The blocker should be positioned at 0,0 relative to the container
      // NOT at the container's position (150, 100)
      this.assertEquals("0px", styles.left, "blocker should be at left: 0");
      this.assertEquals("0px", styles.top, "blocker should be at top: 0");
      this.assertEquals("300px", styles.width, "blocker width should match container");
      this.assertEquals("200px", styles.height, "blocker height should match container");

      // Cleanup
      blocker.unblock();
      blocker.dispose();
      container.destroy();
      this.flush();
    },

    testNormalBlockVsBlockContent() {
      // Create two containers to compare normal block vs blockContent
      var container1 = new qx.ui.container.Composite(new qx.ui.layout.Canvas());
      var container2 = new qx.ui.container.Composite(new qx.ui.layout.Canvas());

      this.getRoot().add(container1, { left: 50, top: 50 });
      this.getRoot().add(container2, { left: 300, top: 50 });

      container1.setWidth(100);
      container1.setHeight(100);
      container2.setWidth(100);
      container2.setHeight(100);

      this.flush();

      var blocker1 = new qx.ui.core.Blocker(container1);
      var blocker2 = new qx.ui.core.Blocker(container2);

      // Normal block - blocker is added to layout parent
      blocker1.block();
      this.flush();

      var styles1 = blocker1.getBlockerElement().getStyles();

      // BlockContent - blocker is added to the widget itself
      blocker2.blockContent(5);
      this.flush();

      var styles2 = blocker2.getBlockerElement().getStyles();

      // Normal block: blocker positioned at container's position in layout parent
      this.assertEquals("50px", styles1.left, "normal block uses container's left position");
      this.assertEquals("50px", styles1.top, "normal block uses container's top position");

      // BlockContent: blocker positioned at 0,0 relative to container
      this.assertEquals("0px", styles2.left, "blockContent uses 0 for left position");
      this.assertEquals("0px", styles2.top, "blockContent uses 0 for top position");

      // Both should have same dimensions as their containers
      this.assertEquals("100px", styles1.width);
      this.assertEquals("100px", styles1.height);
      this.assertEquals("100px", styles2.width);
      this.assertEquals("100px", styles2.height);

      // Cleanup
      blocker1.unblock();
      blocker2.unblock();
      blocker1.dispose();
      blocker2.dispose();
      container1.destroy();
      container2.destroy();
      this.flush();
    }
  }
});
