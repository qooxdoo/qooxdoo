qx.Class.define("performance.test.widget.RichLabel",
{
  extend : performance.test.widget.AbstractWidget,
  
  members :
  {
    CREATE_ITERATIONS : 500,
    RESIZE_ITERATIONS : 250,
    DISPOSE_ITERATIONS : 500,

    _createWidget : function() {
      return new qx.ui.basic.Label("<b>juhu</b>").set({rich: true});
    }
  }  
});