qx.Class.define("qx.test.performance.widget.EmbedHtml",
{
  extend : qx.test.performance.widget.AbstractWidget,

  members :
  {
    _createWidget : function() {
      return new qx.ui.embed.Html("juhu");
    }
  }
});