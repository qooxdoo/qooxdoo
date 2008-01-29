qx.Class.define("qx.ui2.layout.Scroll",
{
  extend : qx.ui2.layout.Abstract,

  properties :
  {
    content :
    {
      check : "qx.ui2.core.Widget",
      apply : "_applyContent",
      nullable : true
    }
  },

  members :
  {
    _applyContent : function(value, old)
    {
      if (old)
      {
        qx.lang.Array.remove(this._children, old);
        this._removeHelper(old);
      }

      if (value)
      {
        this._children.push(value);
        this._addHelper(value);
      }
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
