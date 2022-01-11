qx.Class.define("qx.test.performance.widget.WidgetWithDecorator", {
  extend: qx.test.performance.widget.AbstractWidget,

  construct() {
    super();
    this.__decorator = new qx.ui.decoration.Decorator().set({
      width: 1,
      style: "solid",
      color: "red"
    });
  },

  members: {
    _createWidget() {
      return new qx.ui.core.Widget().set({ decorator: this.__decorator });
    }
  }
});
