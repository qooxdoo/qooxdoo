qx.Class.define("qx.test.performance.widget.RichLabel", {
  extend: qx.test.performance.widget.AbstractWidget,

  members: {
    _createWidget() {
      return new qx.ui.basic.Label("<b>juhu</b>").set({ rich: true });
    }
  }
});
