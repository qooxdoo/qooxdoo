qx.Class.define("performance.test.widget.Composite",
{
  extend : performance.test.widget.AbstractWidget,

  members :
  {
    _createWidget : function() {
      return new qx.ui.container.Composite();
    }
  }
});