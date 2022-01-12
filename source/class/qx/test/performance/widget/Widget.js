qx.Class.define("qx.test.performance.widget.Widget", {
  extend: qx.test.performance.widget.AbstractWidget,

  members: {
    _createWidget() {
      return new qx.ui.core.Widget();
    }
  }
});
