qx.Class.define("performance.test.widget.Label",
{
  extend : performance.test.widget.AbstractWidget,

  members :
  {
    _createWidget : function() {
      return new qx.ui.basic.Label("juhu");
    }
  }
});