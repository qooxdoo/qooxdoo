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
    },

    align :
    {
      check : [ "left", "center", "right" ],
      init : "left"
    },

    reversed :
    {
      check : "Boolean",
      init : false
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
    add : function(widget, flex, align)
    {
      this.base(arguments, widget);
      this._importProperties(widget, arguments, "hbox.flex", "hbox.align");
    },


    // overridden
    layout : function(availWidth, availHeight)
    {
      // Initialize
      var children = this.getChildren();
      var align = this.getAlign();
      var child, childHint;
      var childHeight, childAlign, childTop, childLeft;


      // Get flex offsets
      var offsets = this._getFlexOffsets(availWidth);


      // Pre compute widths
      var childWidths = [];
      var childWidthSum = 0;
      for (var i=0, l=children.length; i<l; i++)
      {
        child = children[i];

        childHint = child.getSizeHint();
        childWidth = childHint.width + (offsets[i] || 0);
        childWidths[i] = childWidth;
        childWidthSum += childWidth;
      }


      // Calculate horizontal alignment offset
      var spacingSum = this._getHorizontalSpacing();
      var childAlignOffset = 0;
      if (align != "left" && (childWidthSum + spacingSum) < availWidth)
      {
        childAlignOffset = availWidth - childWidthSum - spacingSum;

        if (align === "center") {
          childAlignOffset = Math.round(childAlignOffset / 2);
        }
      }


      // Iterate over children
      var spacing = this.getSpacing();
      var childLeft = children[0].getLayoutProperty("hbox.marginleft") || 0;

      for (var i=0, l=children.length; i<l; i++)
      {
        child = children[i];
        childWidth = childWidths[i];

        if (childLeft < availWidth)
        {
          // Get top position (through alignment)
          childHeight = child.getSizeHint().height;
          childAlign = child.getLayoutProperty("hbox.align") || "top";
          childTop = qx.ui2.layout.Util.computeVerticalAlignOffset(childAlign, childHeight, availHeight);

          // Layout child
          child.layout(childLeft + childAlignOffset, childTop, childWidths[i], childHeight);
          child.include();
        }
        else
        {
          // Exclude (completely) hidden children
          child.exclude();
        }

        // last one => exit here
        if (i==(l-1)) {
          break;
        }

        // otherwise add width, spacing and margin
        thisMargin = children[i].getLayoutProperty("hbox.marginRight") || 0;
        nextMargin = children[i+1].getLayoutProperty("hbox.marginLeft") || 0;

        childLeft += childWidths[i] + spacing + Math.max(thisMargin, nextMargin);
      }
    },


    /** Computes the spacing sum plus margin. Supports margin collapsing. */
    _getHorizontalSpacing : function()
    {
      var children = this.getChildren();
      var length = children.length;
      var spacing = this.getSpacing() * (length - 1);

      spacing += children[0].getLayoutProperty("hbox.marginLeft") || 0;

      if (length > 0)
      {
        for (var i=0; i<length-1; i++)
        {
          marginThis = children[i].getLayoutProperty("hbox.marginRight");
          marginNext = children[i+1].getLayoutProperty("hbox.marginLeft");

          spacing += Math.max(0, marginThis, marginNext);
        }
      }

      spacing += children[length-1].getLayoutProperty("hbox.marginRight") || 0;

      return spacing;
    },


    // overridden
    getSizeHint : function()
    {
      if (this._sizeHint) {
        return this._sizeHint;
      }

      // Start with spacing
      var children = this.getChildren();
      var spacing = this._getHorizontalSpacing();

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

        minHeight = Math.max(0, minHeight, childHint.minHeight);
        height = Math.max(0, height, childHint.height);
        maxHeight = Math.min(32000, maxHeight, childHint.maxHeight);
      }


      // Limit width to integer range
      minWidth = Math.min(32000, Math.max(0, minWidth));
      width = Math.min(32000, Math.max(0, width));
      maxWidth = Math.min(32000, Math.max(0, maxWidth));


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
          childFlex = child.getLayoutProperty("hbox.flex");

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
  }
});
