qx.Class.define("qx.test.performance.widget.WidgetWithDecorator",
{
  extend : qx.test.performance.widget.AbstractWidget,

  construct : function() {
    this.base(arguments);
    this.__decorator = new qx.ui.decoration.Single(1, "solid", "red");
  },

  members :
  {
    _createWidget : function() {
      return new qx.ui.core.Widget().set({decorator: this.__decorator});
    }
  }
});