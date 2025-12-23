
/**
 * Test fixture for constructor setter order detection.
 * This demonstrates the BROKEN v7 pattern where property setters
 * are called before super() / this.base().
 */
qx.Class.define("qxl.test8.ConstructorSetterTest", {
  extend: qx.core.Object,

  properties: {
    width: {
      init: 0,
      check: "Number"
    },

    height: {
      init: 0,
      check: "Number"
    },

    title: {
      init: "",
      check: "String"
    }
  },

  construct(width, height, title) {
    // BROKEN: Setting properties before super()
    // These values will be reset when this.base() executes!
    this.setWidth(width);
    this.setHeight(height);
    this.setTitle(title);
    this.base(arguments);
  }
});
