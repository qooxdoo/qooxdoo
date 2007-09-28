/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("qx.ui2.layout.Basic",
{
  extend : qx.ui2.layout.Abstract,





  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // overridden
    add : function(widget, left, top)
    {
      this.base(arguments, widget);
      this._importProperties(widget, arguments, "left", "top");
    },


    // overridden
    layout : function(availWidth, availHeight)
    {
      var children = this.getChildren();
      var child, childHint, childLeft, childTop;

      for (var i=0, l=children.length; i<l; i++)
      {
        child = children[i];

        if (!child.isLayoutValid())
        {
          childHint = child.getSizeHint();

          childLeft = child.getLayoutProperty("left") || 0;
          childTop = child.getLayoutProperty("top") || 0;

          child.layout(childLeft, childTop, childHint.width, childHint.height);
        }
      }
    },


    // overridden
    invalidate : function()
    {
      if (this._sizeHint)
      {
        this.debug("Clear layout cache");
        this._sizeHint = null;
      }
    },


    // overridden
    getSizeHint : function()
    {
      if (this._sizeHint)
      {
        this.debug("Cached size hint: ", this._sizeHint);
        return this._sizeHint;
      }

      var children = this.getChildren();
      var child, childHint, childLeft, childTop;
      var width=0, height=0;


      // Iterate over children
      for (var i=0, l=children.length; i<l; i++)
      {
        child = children[i];
        childHint = child.getSizeHint();

        childLeft = child.getLayoutProperty("left") || 0;
        childTop = child.getLayoutProperty("top") || 0;

        width = Math.max(width, childLeft + childHint.width);
        height = Math.max(height, childTop + childHint.height);
      }


      // Limit to integer range
      minWidth = Math.min(32000, Math.max(0, minWidth));
      width = Math.min(32000, Math.max(0, width));
      maxWidth = Math.min(32000, Math.max(0, maxWidth));

      minHeight = Math.min(32000, Math.max(0, minHeight));
      height = Math.min(32000, Math.max(0, height));
      maxHeight = Math.min(32000, Math.max(0, maxHeight));


      // Build hint
      var hint = {
        minWidth : minWidth,
        width : width,
        maxWidth : maxWidth,
        minHeight : minHeight,
        height : height,
        maxHeight : maxHeight
      };

      this.debug("Computed size hint: ", hint);
      return this._sizeHint = hint;
    }
  },




  /*
  *****************************************************************************
     DESTRUCT
  *****************************************************************************
  */

  destruct : function()
  {


  }
});