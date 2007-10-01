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

/**
 * A full featured horizontal box layout. It lays out widgets in a
 * horizontal row, from left to right.
 *
 * Supports:
 *
 * * Integer dimensions (using widget properties)
 * * Additional percent width (using layout property)
 * * Min and max dimensions (using widget properties)
 * * Priorized stretching/shrinking (flex) (using layout properties)
 * * Left and right margins (even negative ones) with margin collapsing support (using layout properties)
 * * Auto sizing
 * * Horizontal align
 * * Horizontal spacing
 * * Reversed children ordering
 */
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
      var childTop, childBottom;
      var childGrow;


      // Support for reversed children
      if (this.getReversed()) {
        children = children.concat().reverse();
      }


      // Creating dimension working data
      var childWidths = [];
      var childHeights = [];
      var childHints = [];
      var usedGaps = this._getGaps();
      var usedWidth = usedGaps;
      var childWidthPercent;

      for (var i=0, l=children.length; i<l; i++)
      {
        child = children[i];
        childHint = child.getSizeHint();

        childWidthPercent = child.getLayoutProperty("hbox.width");

        childHints[i] = childHint;
        childWidths[i] = childWidthPercent ? Math.floor((availWidth - usedGaps) * parseFloat(childWidthPercent) / 100) : childHint.width;
        childHeights[i] = childHint.height;

        usedWidth += childWidths[i];
      }

      // this.debug("Initial widths: avail=" + availWidth + ", used=" + usedWidth);


      // Process widths for flex stretching/shrinking
      if (usedWidth != availWidth)
      {
        var flexCandidates = [];
        var childGrow = usedWidth < availWidth;

        for (var i=0, l=children.length; i<l; i++)
        {
          child = children[i];
          childWidthPercent = child.getLayoutProperty("hbox.width");

          if (child.canStretchX())
          {
            childFlex = child.getLayoutProperty("hbox.flex");

            if (childFlex == null || childFlex > 0)
            {
              childHint = childHints[i];

              flexCandidates.push({
                id : i,
                potential : childGrow ? childHint.maxWidth - childHint.width : childHint.width - childHint.minWidth,
                flex : childFlex || 1
              });
            }
          }
        }

        if (flexCandidates.length > 0)
        {
          var flexibleOffsets = qx.ui2.layout.Util.computeFlexOffsets(flexCandidates, availWidth - usedWidth);

          for (var key in flexibleOffsets)
          {
            // this.debug(" - Correcting child[" + key + "] by: " + flexibleOffsets[key]);

            childWidths[key] += flexibleOffsets[key];
            usedWidth += flexibleOffsets[key];
          }
        }
      }

      // this.debug("Corrected widths: avail=" + availWidth + ", used=" + usedWidth);


      // Calculate horizontal alignment offset
      var childAlignOffset = 0;
      if (usedWidth < availWidth && align != "left")
      {
        childAlignOffset = availWidth - usedWidth;

        if (align === "center") {
          childAlignOffset = Math.round(childAlignOffset / 2);
        }
      }

      // this.debug("Alignment offset: value=" + childAlignOffset);


      // Iterate over children
      var spacing = this.getSpacing();
      var childLeft = childAlignOffset + (children[0].getLayoutProperty("hbox.marginLeft") || 0);

      for (var i=0, l=children.length; i<l; i++)
      {
        child = children[i];

        if (childLeft < availWidth)
        {
          // Respect vertical alignment
          childTop = qx.ui2.layout.Util.computeVerticalAlignOffset(child.getLayoutProperty("hbox.align"), childHeights[i], availHeight);

          // Layout child
          child.layout(childLeft, childTop, childWidths[i], childHeights[i]);

          // Include again (if excluded before)
          child.include();
        }
        else
        {
          // Exclude (completely) hidden children
          child.exclude();
        }

        // If this is the last one => exit here
        if (i==(l-1)) {
          break;
        }

        // Compute left position of next child
        thisMargin = child.getLayoutProperty("hbox.marginRight");
        nextMargin = children[i+1].getLayoutProperty("hbox.marginLeft");
        childLeft += childWidths[i] + spacing + this._collapseMargin(thisMargin, nextMargin);
      }
    },


    // overridden
    getSizeHint : function()
    {
      if (this._sizeHint) {
        return this._sizeHint;
      }

      // Initialize
      var children = this.getChildren();
      var gaps = this._getGaps();
      var minWidth=gaps, width=gaps, maxWidth=gaps;
      var minHeight=0, height=0, maxHeight=32000;

      // Support for reversed children
      if (this.getReversed()) {
        children = children.concat().reverse();
      }

      // Iterate over children
      var maxPercentWidth = 0;
      for (var i=0, l=children.length; i<l; i++)
      {
        var child = children[i];
        var childHint = child.getSizeHint();

        // Respect percent width (up calculate width by using preferred width)
        var childPercentWidth = child.getLayoutProperty("hbox.width");
        if (childPercentWidth) {
          maxPercentWidth = Math.max(maxPercentWidth, childHint.width / parseFloat(childPercentWidth) * 100);
        } else {
          width += childHint.width;
        }

        // Sum up min/max width
        minWidth += childHint.minWidth;
        maxWidth += childHint.maxWidth;

        // Find maximium minHeight and height
        minHeight = Math.max(0, minHeight, childHint.minHeight);
        height = Math.max(0, height, childHint.height);

        // Find minimum maxHeight
        maxHeight = Math.min(32000, maxHeight, childHint.maxHeight);
      }

      // Apply max percent width
      width += Math.round(maxPercentWidth);

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


    /** Computes the spacing sum plus margin. Supports margin collapsing. */
    _getGaps : function()
    {
      var children = this.getChildren();
      var length = children.length;
      var gaps = this.getSpacing() * (length - 1);

      // Support for reversed children
      if (this.getReversed()) {
        children = children.concat().reverse();
      }

      // Add margin left of first child (no collapsing here)
      gaps += children[0].getLayoutProperty("hbox.marginLeft") || 0;

      // Add inner margins (with collapsing support)
      if (length > 0)
      {
        var thisMargin, nextMargin;
        for (var i=0; i<length-1; i++)
        {
          thisMargin = children[i].getLayoutProperty("hbox.marginRight");
          nextMargin = children[i+1].getLayoutProperty("hbox.marginLeft");

          gaps += this._collapseMargin(thisMargin, nextMargin);
        }
      }

      // Add margin right of last child (no collapsing here)
      gaps += children[length-1].getLayoutProperty("hbox.marginRight") || 0;

      return gaps;
    },


    _collapseMargin : function(right, left)
    {
      // Math.max detects 'null' as more ('0') than '-1'
      // we need to work around this
      if (right && left) {
        return Math.max(right, left);
      } else if (left) {
        return left;
      } else if (right) {
        return right;
      }

      return 0;
    }
  }
});
