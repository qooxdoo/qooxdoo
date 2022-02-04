/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("qx.test.ui.core.SizeHint", {
  extend: qx.dev.unit.TestCase,
  type: "abstract",

  members: {
    setUp() {
      this.widget = new qx.ui.core.Widget();
    },

    tearDown() {
      this.widget.dispose();
    },

    getHint() {
      this.widget.invalidateLayoutCache();
      return this.widget.getSizeHint();
    },

    assertHint(min, size, max) {
      throw new Error("abstract method call");
    },

    getDefaultSize() {
      throw new Error("abstract method call");
    },

    setSize(min, size, max) {
      throw new Error("abstract method call");
    },

    setStretching(shrink, grow) {
      throw new Error("abstract method call");
    },

    testDefaultSize() {
      this.assertHint(0, this.getDefaultSize(), Infinity);
    },

    testSize() {
      this.setStretching(true, true);
      this.setSize(null, 200, null);
      this.assertHint(0, 200, Infinity);
    },

    testMinLargerThanSize() {
      this.setStretching(true, true);
      this.setSize(200, 100, null);
      this.assertHint(200, 200, Infinity);
    },

    testMinSmallerThanSize() {
      this.setStretching(true, true);
      this.setSize(50, 150, null);
      this.assertHint(50, 150, Infinity);
    },

    testMaxSmallerThanSize() {
      this.setStretching(true, true);
      this.setSize(null, 100, 10);
      this.assertHint(0, 10, 10);
    },

    testMaxLargerThanSize() {
      this.setStretching(true, true);
      this.setSize(null, 100, 150);
      this.assertHint(0, 100, 150);
    },

    testNoGrow() {
      this.setStretching(true, false);
      this.setSize(null, 100, null);
      this.assertHint(0, 100, 100);
    },

    testNoShrink() {
      this.setStretching(false, true);
      this.setSize(null, 100, null);
      this.assertHint(100, 100, Infinity);
    },

    testNoStretch() {
      this.setStretching(false, false);
      this.setSize(null, 100, null);
      this.assertHint(100, 100, 100);
    },

    testNoGrowAndMaxLargerThanSize() {
      this.setStretching(true, false);
      this.setSize(null, 100, 150);
      this.assertHint(0, 100, 100);
    },

    testNoGrowAndMaxSmallerThanSize() {
      this.setStretching(true, false);
      this.setSize(null, 100, 50);
      this.assertHint(0, 50, 50);
    },

    testNoGrowAndMinLargerThanSize() {
      this.setStretching(true, false);
      this.setSize(150, 100, null);
      this.assertHint(150, 150, 150);
    },

    testNoShrinkAndMinLargerSize() {
      this.setStretching(false, true);
      this.setSize(150, 100, null);
      this.assertHint(150, 150, Infinity);
    },

    testNoShrinkAndMinSmallerSize() {
      this.setStretching(false, true);
      this.setSize(50, 100, null);
      this.assertHint(100, 100, Infinity);
    },

    testNoShrinkAndMaxSmallerSize() {
      this.setStretching(false, true);
      this.setSize(null, 100, 50);
      this.assertHint(50, 50, 50);
    },

    testMinLargerThanMax() {
      this.setStretching(true, true);
      this.setSize(200, 100, 150);
      if (this.isDebugOn()) {
        var that = this;
        this.assertException(function () {
          that.getHint();
        }, qx.core.AssertionError);
      }
    },

    testMinAndMaxLargerThanSize() {
      this.setStretching(true, true);
      this.setSize(150, 100, 200);
      this.assertHint(150, 150, 200);
    },

    testMinAndMaxSmallerThanSize() {
      this.setStretching(true, true);
      this.setSize(150, 300, 200);
      this.assertHint(150, 200, 200);
    }
  }
});
