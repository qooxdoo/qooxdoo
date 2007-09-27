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
  extend : qx.ui2.layout.AbstractLayout,





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
      this._children.push(widget);

      if (left != null) {
        widget.addLayoutProperty("left", left);
      }

      if (top != null) {
        widget.addLayoutProperty("top", top);
      }

      this._addToParent(widget);
    },


    // overridden
    layout : function(width, height)
    {
      for (var i=0, l=this._children.length; i<l; i++)
      {
        var child = this._children[i];

        if (child.isLayoutValid()) {
          continue;
        }

        var childHint = child.getSizeHint();
        var childLeft = child.getLayoutProperty("left") || 0;
        var childTop = child.getLayoutProperty("top") || 0;

        child.layout(childLeft, childTop, childHint.width, childHint.height);
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

      var children = this._children;
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
      width = Math.min(32000, Math.max(0, width));
      height = Math.min(32000, Math.max(0, height));


      // Build hint
      var hint = {
        minWidth : 0,
        width : width,
        maxWidth : 32000,
        minHeight : 0,
        height : height,
        maxHeight : 32000
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