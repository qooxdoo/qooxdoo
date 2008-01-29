qx.Class.define("qx.ui2.layout.Scroll",
{
  extend : qx.ui2.layout.Abstract,

  properties :
  {
    content :
    {
      check : "qx.ui2.core.Widget",
      apply : "_applyContent",
      nullable : false
    }
  },

  members :
  {
    _applyContent : function(value, old)
    {
      if (old) {
        this.remove(old);
      }

      this.add(value);
    },

    _computeSizeHint : function()
    {
      var hint = this.getContent().getSizeHint();

      return {
        minWidth : 0,
        width : hint.width,
        maxWidth : Infinity,
        minHeight : 0,
        height : hint.height,
        maxHeight : Infinity
      };
    },

    renderLayout : function(availWidth, availHeight)
    {
      var content = this.getContent();
      var hint = content.getSizeHint();

      var width = Math.min(hint.width, Math.max(availWidth, hint.minWidth));
      var height = Math.min(hint.height, Math.max(availHeight, hint.minWidth));

      content.renderLayout(0, 0, width, height);
    }
  }
});
