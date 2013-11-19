qx.Class.define("qx.test.performance.widget.WidgetWithDecorator",
{
  extend : qx.test.performance.widget.AbstractWidget,

  construct : function() {
    this.base(arguments);
    this.__decorator = new qx.ui.decoration.Decorator().set({
      width: 1,
      style: "solid",
      color: "red"
    });
  },

  members :
  {
    _createWidget : function() {
      return new qx.ui.core.Widget().set({decorator: this.__decorator});
    }
  }
});
