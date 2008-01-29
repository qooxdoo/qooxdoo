qx.Class.define("qx.ui2.core.ScrollPane",
{
  extend : qx.ui2.core.Widget,


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    this.setLayout(new qx.ui2.layout.Basic());
  },





  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    setScrollLeft : function(value, direct) {
      this._contentElement.setAttribute("scrollLeft", value, direct);
    },

    getScrollLeft : function() {
      return this._contentElement.getAttribute("scrollLeft") || 0;
    },

    setScrollTop : function(value, direct) {
      this._contentElement.setAttribute("scrollTop", value, direct);
    },

    getScrollTop : function() {
      return this._contentElement.getAttribute("scrollTop") || 0;
    },

    scrollLeftBy : function(left, direct)
    {
      if (!left) {
        return;
      }

      var oldLeft = this.getScrollLeft();
      this.setScrollLeft(oldLeft + left, direct);
    },

    scrollTopBy : function(top, direct)
    {
      if (!top) {
        return;
      }

      var oldTop = this.getScrollTop();
      this.setScrollTop(oldTop + top, direct);
    }
  }
});
