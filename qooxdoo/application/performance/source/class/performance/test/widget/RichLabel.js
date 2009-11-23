qx.Class.define("performance.test.widget.RichLabel",
{
  extend : performance.test.widget.AbstractWidget,
  
  members :
  {
    CREATE_ITERATIONS : 100,
    RESIZE_ITERATIONS : 25,
    DISPOSE_ITERATIONS : 100,

    _createWidget : function() {
      return new qx.ui.basic.Label("<b>juhu</b>").set({rich: true});
    }
  }  
});