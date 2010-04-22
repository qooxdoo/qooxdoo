qx.Class.define("performance.test.widget.Widget",
{
  extend : performance.test.widget.AbstractWidget,

  members :
  {
    _createWidget : function() {
      return new qx.ui.core.Widget();
    }
  }
});