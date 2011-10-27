qx.Class.define("qx.test.performance.widget.Composite",
{
  extend : qx.test.performance.widget.AbstractWidget,

  members :
  {
    _createWidget : function() {
      return new qx.ui.container.Composite();
    }
  }
});