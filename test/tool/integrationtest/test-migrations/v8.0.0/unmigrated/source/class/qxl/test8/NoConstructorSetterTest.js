/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2024 The authors

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Migration Test

************************************************************************ */

/**
 * Test fixture for constructor setter order detection.
 * This demonstrates the CORRECT v8 pattern where super() / this.base()
 * is called before any property setters.
 */
qx.Class.define("qxl.test8.NoConstructorSetterTest", {
  extend: qx.core.Object,

  properties: {
    width: {
      init: 0,
      check: "Number"
    },

    height: {
      init: 0,
      check: "Number"
    }
  },

  construct(width, height) {
    // CORRECT: super() called first
    this.base(arguments);
    // Now it's safe to set properties
    this.setWidth(width);
    this.setHeight(height);
  }
});
