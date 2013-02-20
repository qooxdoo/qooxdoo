qx.Class.define("qx.test.performance.widget.Button",
{
  extend : qx.test.performance.widget.AbstractWidget,

  members :
  {
    _createWidget : function() {
      return new qx.ui.form.Button();
    }
  }
});