qx.Class.define("qx.test.performance.widget.Label",
{
  extend : qx.test.performance.widget.AbstractWidget,

  members :
  {
    _createWidget : function() {
      return new qx.ui.basic.Label("juhu");
    }
  }
});