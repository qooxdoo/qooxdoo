qx.Class.define("performance.test.widget.EmbedHtml",
{
  extend : performance.test.widget.AbstractWidget,

  members :
  {
    _createWidget : function() {
      return new qx.ui.embed.Html("juhu");
    }
  }
});