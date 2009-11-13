qx.Class.define("performance.test.widget.WidgetWithoutProtector",
{
  extend : performance.test.widget.AbstractWidget,
  
  members :
  {
    CREATE_ITERATIONS : 500,
    RESIZE_ITERATIONS : 250,
    DISPOSE_ITERATIONS : 500,

    _createWidget : function() {
      return new performance.test.mock.NoProtector().set({decorator: "window"});
    }
  }  
});