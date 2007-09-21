qx.Class.define("qx.ui2.border.CssRoundedBorder",
{
  extend : qx.core.Object,
  implement : qx.ui2.border.IBorderRenderer,

  type : "singleton",

  members :
  {
    createBorderElement : function(widget)
    {
      var border = new qx.html.Element("div");
      border.setStyles({
        height : "100%",
        width : "100%"
      });
      if (widget.getBorderData()) {
        this.update(widget, border);
      }
      return border;
    },

    update : function(widget, borderElement)
    {
      var borderData = widget.getBorderData();
      var radius = (borderData.radius || 5) + "px";
      borderElement.setStyles({
        "MozBorderRadius": radius,
        "WebkitBorderRadius": radius,
        "border": "1px solid black"
      });
    },

    updateEdge : function(widget, borderElement)
    {
      this.update(widget, borderElement);
    }
  }
});