qx.Class.define("performance.test.widget.WidgetWithSingle",
{
  extend : performance.test.widget.AbstractWidget,
  
  members :
  {
    CREATE_ITERATIONS : 500,
    RESIZE_ITERATIONS : 250,
    DISPOSE_ITERATIONS : 500,

    _createWidget : function() {
      return new qx.ui.core.Widget().set({decorator: "window"});
    }
  }  
});