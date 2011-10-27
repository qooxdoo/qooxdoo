qx.Class.define("qx.test.performance.widget.CompositeWithoutContent",
{
  extend : qx.test.performance.widget.AbstractWidget,

  members :
  {
    _createWidget : function() {
      return new qx.test.performance.mock.SlimComposite();
    }
  }
});