/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

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
 * Other names (for comparable layouts in other systems):
 *
 * * QHBoxLayout (Qt)
 * * StackPanel (XAML)
 * * RowLayout (SWT) (with wrapping support like a FlowLayout)
 *
 * Supports:
 *
 * * Integer dimensions (using widget properties)
 * * Additional percent width (using layout property)
 * * Min and max dimensions (using widget properties)
 * * Priorized growing/shrinking (flex) (using layout properties)
 * * Left and right margins (even negative ones) with margin collapsing support (using layout properties)
 * * Auto sizing
 * * Horizontal align
 * * Horizontal spacing
 * * Reversed children ordering
 *
 * Layout properties: flex, align, marginLeft, marginRight, verticalAlign
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
    /** Spacing between two children */
    spacing :
    {
      check : "Integer",
      init : 5,
      apply : "_applyLayoutProperty"
    },


    /** Horizontal alignment of the whole children block */
    align :
    {
      check : [ "left", "center", "right" ],
      init : "left",
      apply : "_applyLayoutProperty"
    },


    /** Whether the actual children data should be reversed for layout (right-to-left) */
    reversed :
    {
      check : "Boolean",
      init : false,
      apply : "_applyLayoutProperty"
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
    invalidateLayoutCache : function()
    {
      if (this._sizeHint) {
        this._sizeHint = null;
      }
    },


    // overridden
    renderLayout : function(parentWidth, parentHeight)
    {
      // Initialize
      var children = this._children;

      if (children.length == 0) {
        return;
      }

      var options = this._options;
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
        childWidthPercent = options[i].percent;

        childHints[i] = childHint;
        childWidths[i] = childWidthPercent ? Math.floor((parentWidth - usedGaps) * parseFloat(childWidthPercent) / 100) : childHint.width;

        if (child.canStretchY()) {
          childHeights[i] = Math.max(childHint.minHeight, Math.min(parentHeight, childHint.height));
        } else {
          childHeights[i] = childHint.height;
        }

        usedWidth += childWidths[i];
      }

      // this.debug("Initial widths: avail=" + parentWidth + ", used=" + usedWidth);


      // Process widths for flex stretching/shrinking
      if (usedWidth != parentWidth)
      {
        var flexCandidates = [];
        var childGrow = usedWidth < parentWidth;

        for (var i=0, l=children.length; i<l; i++)
        {
          child = children[i];

          if (child.canStretchX())
          {
            childFlex = options[i].flex;

            if (childFlex > 0)
            {
              childHint = childHints[i];

              flexCandidates.push({
                id : i,
                potential : childGrow ? childHint.maxWidth - childHint.width : childHint.width - childHint.minWidth,
                flex : childGrow ? childFlex : 1 / childFlex
              });
            }
          }
        }

        if (flexCandidates.length > 0)
        {
          var flexibleOffsets = qx.ui2.layout.Util.computeFlexOffsets(flexCandidates, parentWidth - usedWidth);

          for (var key in flexibleOffsets)
          {
            // this.debug(" - Correcting child[" + key + "] by: " + flexibleOffsets[key]);

            childWidths[key] += flexibleOffsets[key];
            usedWidth += flexibleOffsets[key];
          }
        }
      }

      // this.debug("Corrected widths: avail=" + width + ", used=" + usedWidth);


      // Calculate horizontal alignment offset
      var childAlignOffset = 0;
      if (usedWidth < parentWidth && align != "left")
      {
        childAlignOffset = parentWidth - usedWidth;

        if (align === "center") {
          childAlignOffset = Math.round(childAlignOffset / 2);
        }
      }

      // this.debug("Alignment offset: value=" + childAlignOffset);


      // Iterate over children
      var spacing = this.getSpacing();
      var childLeft = childAlignOffset + (options[0].marginLeft || 0);

      for (var i=0, l=children.length; i<l; i++)
      {
        child = children[i];

        if (childLeft < parentWidth)
        {
          // Respect vertical alignment
          childTop = qx.ui2.layout.Util.computeVerticalAlignOffset(options[i].align || "top", childHeights[i], parentHeight);

          // Layout child
          child.renderLayout(childLeft, childTop, childWidths[i], childHeights[i]);

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
        thisMargin = options[i].marginRight || 0;
        nextMargin = options[i+1].marginLeft || 0;
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
      var children = this._children;
      var options = this._options;
      var gaps = this._getGaps();
      var minWidth=gaps, width=gaps, maxWidth=32000;
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
        var childPercentWidth = options[i].width;
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

      this._sizeHint = hint;

      return hint;
    },







    /*
    ---------------------------------------------------------------------------
      LAYOUT HELPERS
    ---------------------------------------------------------------------------
    */

    /**
     * Computes the spacing sum plus margin. Supports margin collapsing.
     *
     * @type member
     * @return {void}
     */
    _getGaps : function()
    {
      var options = this._options;
      var length = options.length;

      if (length == 0) {
        return 0;
      }

      var gaps = this.getSpacing() * (length - 1);

      // Support for reversed children
      if (this.getReversed()) {
        options = options.concat().reverse();
      }

      // Add margin left of first child (no collapsing here)
      gaps += (options[0].marginLeft || 0);

      // Add inner margins (with collapsing support)
      if (length > 0)
      {
        var thisMargin, nextMargin;
        for (var i=0; i<length-1; i++)
        {
          thisMargin = (options[i].marginRight || 0);
          nextMargin = (options[i+1].marginLeft || 0);

          gaps += this._collapseMargin(thisMargin, nextMargin);
        }
      }

      // Add margin right of last child (no collapsing here)
      gaps += (options[length-1].marginRight || 0);

      return gaps;
    },


    /**
     * Collapses a right and left margin of two widgets.
     *
     * @type member
     * @param right {Integer} Right margin
     * @param left {Integer} Left margin
     * @return {Integer} The collapsed margin
     */
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
    },





    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    _applyLayoutProperty : function(value, old) {
      this.invalidateLayoutCache();
    }
  }
});
