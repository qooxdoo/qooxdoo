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

qx.Class.define("qx.ui2.layout.HBox",
{
  extend : qx.ui2.layout.Abstract,






  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    spacing :
    {
      check : "Integer",
      init : 5
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /*
    ---------------------------------------------------------------------------
      LAYOUT INTERFACE
    ---------------------------------------------------------------------------
    */

    // overridden
    add : function(widget, hFlex, vAlign)
    {
      this.base(arguments, widget);
      this._importProperties(widget, arguments, "hFlex", "vAlign");
    },


    // overridden
    layout : function(availWidth, availHeight)
    {
      // Initialize
      var children = this.getChildren();
      var child, childHint;
      var childHeight, childAlign, childTop, childLeft=0;


      // Get flex offsets
      var offsets = this._getFlexOffsets(availWidth);


      // Iterate
      var spacing = this.getSpacing();
      for (var i=0, l=children.length; i<l; i++)
      {
        child = children[i];

        childHint = child.getSizeHint();
        childWidth = childHint.width + (offsets[i] || 0);

        if (childLeft < availWidth)
        {
          // Get top position (through alignment)
          childHeight = childHint.height;
          childAlign = child.getLayoutProperty("vAlign") || "top";
          childTop = qx.ui2.layout.Util.computeVerticalAlignOffset(childAlign, childHeight, availHeight);

          // Layout child
          child.layout(childLeft, childTop, childWidth, childHeight);
          child.include();
        }
        else
        {
          // Exclude (completely) hidden children
          child.exclude();
        }

        childLeft += childWidth + spacing;
      }
    },


    // overridden
    getSizeHint : function()
    {
      if (this._sizeHint) {
        return this._sizeHint;
      }

      // Start with spacing
      var children = this.getChildren();
      var spacing = this.getSpacing() * (children.length - 1);

      // Initialize
      var minWidth=spacing, width=spacing, maxWidth=spacing;
      var minHeight=0, height=0, maxHeight=32000;


      // Iterate
      // - sum children width
      // - find max heights
      for (var i=0, l=children.length; i<l; i++)
      {
        var child = children[i];
        var childHint = child.getSizeHint();

        minWidth += childHint.minWidth;
        width += childHint.width;
        maxWidth += childHint.maxWidth;

        minHeight = Math.max(minHeight, childHint.minHeight);
        height = Math.max(height, childHint.height);
        maxHeight = Math.min(maxHeight, childHint.maxHeight);
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

      this.debug("Compute size hint: ", hint);
      this._sizeHint = hint;

      return hint;
    },






    /*
    ---------------------------------------------------------------------------
      HELPERS
    ---------------------------------------------------------------------------
    */

    _getFlexOffsets : function(availWidth)
    {
      var hint = this.getSizeHint();
      var diff = availWidth - hint.width;

      if (diff == 0) {
        return {};
      }

      // collect all flexible children
      var children = this.getChildren();
      var flexibles = [];

      for (var i=0, l=children.length; i<l; i++)
      {
        child = children[i];

        if (child.canStretchX())
        {
          childFlex = child.getLayoutProperty("hFlex");

          if (childFlex == null || childFlex > 0)
          {
            hint = child.getSizeHint();

            flexibles.push({
              id : i,
              potential : diff > 0 ? hint.maxWidth - hint.width : hint.width - hint.minWidth,
              flex : childFlex || 1
            });
          }
        }
      }

      return qx.ui2.layout.Util.computeFlexOffsets(flexibles, diff);
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