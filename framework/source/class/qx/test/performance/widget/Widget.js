qx.Class.define("qx.test.performance.widget.Widget",
{
  extend : qx.test.performance.widget.AbstractWidget,

  members :
  {
    _createWidget : function() {
      return new qx.ui.core.Widget();
    }
  }
});