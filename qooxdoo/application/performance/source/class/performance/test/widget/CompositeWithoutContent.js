qx.Class.define("performance.test.widget.CompositeWithoutContent",
{
  extend : performance.test.widget.AbstractWidget,
  
  members :
  {
    _createWidget : function() {
      return new performance.test.mock.SlimComposite();
    }
  }  
});