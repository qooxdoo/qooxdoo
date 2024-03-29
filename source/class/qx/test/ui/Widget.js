/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
qx.Class.define("qx.test.ui.Widget", {
  extend: qx.dev.unit.TestCase,

  members: {
    __widget: null,

    setUp() {
      this.__widget = new qx.ui.core.Widget();
    },

    tearDown() {
      this.__widget.destroy();
    },

    testAddState() {
      this.__widget.addState("test");
      this.assertTrue(this.__widget.hasState("test"));
    },

    testRemoveState() {
      this.__widget.addState("test");
      this.assertTrue(this.__widget.hasState("test"));
      this.__widget.removeState("test");
      this.assertFalse(this.__widget.hasState("test"));
    },

    testReplaceState() {
      this.__widget.addState("test");
      this.assertTrue(this.__widget.hasState("test"));
      this.__widget.replaceState("test", "affe");
      this.assertTrue(this.__widget.hasState("affe"));
      this.assertFalse(this.__widget.hasState("test"));
    },

    testWidgetThatContainsItself() {
      this.assertFalse(
        qx.ui.core.Widget.contains(this.__widget, this.__widget)
      );
    }
  }
});
