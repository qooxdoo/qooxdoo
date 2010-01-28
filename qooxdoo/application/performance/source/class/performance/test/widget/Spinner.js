qx.Class.define("performance.test.widget.Spinner",
{
  extend : performance.test.widget.AbstractWidget,
  
  members :
  {
    CREATE_ITERATIONS : 20,
    RESIZE_ITERATIONS : 10,
    DISPOSE_ITERATIONS : 20,
  
    _createWidget : function() {
      return new qx.ui.form.Spinner(20);
    }
  }  
});