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
    renderLayout : function(parentWidth, parentHeight)
    {
      // Initialize
      var children = this._children;
      var options = this._options;
      var align = this.getAlign();
      var child, hint, flex;
      var grow;


      // Support for reversed children
      if (this.getReversed()) {
        children = children.concat().reverse();
      }


      // Creating dimension working data
      var widths = [];
      var heights = [];
      var hints = [];
      var usedGaps = this._getGaps();
      var usedWidth = usedGaps;
      var percentWidth;

      for (var i=0, l=children.length; i<l; i++)
      {
        child = children[i];
        hint = child.getSizeHint();
        percentWidth = options[i].width;

        hints[i] = hint;
        widths[i] = percentWidth ? Math.floor((parentWidth - usedGaps) * parseFloat(percentWidth) / 100) : hint.width;

        if (child.canStretchY()) {
          heights[i] = Math.max(hint.minHeight, Math.min(parentHeight, hint.height));
        } else {
          heights[i] = hint.height;
        }

        usedWidth += widths[i];
      }

      // this.debug("Initial widths: avail=" + parentWidth + ", used=" + usedWidth);


      // Process widths for flex stretching/shrinking
      if (usedWidth != parentWidth)
      {
        var flexCandidates = [];
        var grow = usedWidth < parentWidth;

        for (var i=0, l=children.length; i<l; i++)
        {
          child = children[i];

          if (child.canStretchX())
          {
            flex = options[i].flex;

            if (flex > 0)
            {
              hint = hints[i];

              flexCandidates.push({
                id : i,
                potential : grow ? hint.maxWidth - hint.width : hint.width - hint.minWidth,
                flex : grow ? flex : 1 / flex
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

            widths[key] += flexibleOffsets[key];
            usedWidth += flexibleOffsets[key];
          }
        }
      }

      // this.debug("Corrected widths: avail=" + width + ", used=" + usedWidth);


      // Calculate horizontal alignment offset
      var alignOffset = 0;
      if (usedWidth < parentWidth && align != "left")
      {
        alignOffset = parentWidth - usedWidth;

        if (align === "center") {
          alignOffset = Math.round(alignOffset / 2);
        }
      }

      // this.debug("Alignment offset: value=" + alignOffset);


      // Iterate over children
      var spacing = this.getSpacing();
      var left = alignOffset + (options[0].marginLeft || 0);
      var thisMargin, nextMargin;

      for (var i=0, l=children.length; i<l; i++)
      {
        child = children[i];

        if (left < parentWidth)
        {
          // Respect vertical alignment
          top = qx.ui2.layout.Util.computeVerticalAlignOffset(options[i].align || "top", heights[i], parentHeight);

          // Layout child
          child.renderLayout(left, top, widths[i], heights[i]);

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
        left += widths[i] + spacing + this._collapseMargin(thisMargin, nextMargin);
      }
    },


    // overridden
    _computeSizeHint : function()
    {
      // Read children
      var children = this._children;
      if (this.getReversed()) {
        children = children.concat().reverse();
      }

      // Initialize
      var options = this._options;
      var gaps = this._getGaps();
      var minWidth=gaps, width=gaps, maxWidth=32000;
      var minHeight=0, height=0, maxHeight=32000;

      // Iterate over children
      var maxPercentWidth = 0;
      for (var i=0, l=children.length; i<l; i++)
      {
        var child = children[i];
        var hint = child.getSizeHint();

        // Respect percent width (up calculate width by using preferred width)
        var percentWidth = options[i].width;
        if (percentWidth) {
          maxPercentWidth = Math.max(maxPercentWidth, hint.width / parseFloat(percentWidth) * 100);
        } else {
          width += hint.width;
        }

        // Sum up min/max width
        minWidth += hint.minWidth;
        maxWidth += hint.maxWidth;

        // Find maximium minHeight and height
        minHeight = Math.max(0, minHeight, hint.minHeight);
        height = Math.max(0, height, hint.height);

        // Find minimum maxHeight
        maxHeight = Math.min(32000, maxHeight, hint.maxHeight);
      }

      // Apply max percent width
      width += Math.round(maxPercentWidth);

      // Limit width to integer range
      minWidth = Math.min(32000, Math.max(0, minWidth));
      width = Math.min(32000, Math.max(0, width));
      maxWidth = Math.min(32000, Math.max(0, maxWidth));

      // Return hint
      return {
        minWidth : minWidth,
        width : width,
        maxWidth : maxWidth,
        minHeight : minHeight,
        height : height,
        maxHeight : maxHeight
      };
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
