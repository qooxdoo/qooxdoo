qx.Class.define("qx.ui2.core.LayoutQueue",
{
  statics :
  {
    _roots : {},

    add : function(widget)
    {
      while(widget && widget.isLayoutValid())
      {
        qx.core.Log.debug("Add: ", widget, ": ", widget.isLayoutRoot());
        widget.markLayoutInvalid();

        if (widget.isLayoutRoot())
        {
          this._roots[widget.toHashCode()] = widget;
          break;
        }

        widget = widget.getParent();
      }
    },

    flush : function()
    {
      var roots = this._roots;

      for (var hc in roots)
      {
        var root = roots[hc];

        var width = root.getPreferredWidth();
        var height = root.getPreferredHeight();

        root.layout(0, 0, width, height);
      }

      qx.html.Element.flush();
    }
  }
});
