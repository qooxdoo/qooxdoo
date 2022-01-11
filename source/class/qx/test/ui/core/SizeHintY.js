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

qx.Class.define("qx.test.ui.core.SizeHintY", {
  extend: qx.test.ui.core.SizeHint,

  members: {
    assertHint(min, size, max) {
      var hint = this.getHint();
      this.assertEquals(min, hint.minHeight, "min height");
      this.assertEquals(size, hint.height, "height");
      this.assertEquals(max, hint.maxHeight, "max height");
    },

    getDefaultSize() {
      return 50;
    },

    setSize(min, size, max) {
      this.widget.set({
        minHeight: min,
        height: size,
        maxHeight: max
      });
    },

    setStretching(allowShrink, allowGrow) {
      this.widget.setAllowStretchY(allowGrow, allowShrink);
    }
  }
});
