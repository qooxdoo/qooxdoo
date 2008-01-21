/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copybottom:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's left-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * A full featured vertical box layout. It lays out widgets in a
 * vertical column, from top to bottom.
 *
 * Other names (for comparable layouts in other systems):
 *
 * * QVBoxLayout (Qt)
 * * StackPanel (XAML)
 * * RowLayout (SWT) (with wrapping support like a FlowLayout)
 *
 * Supports:
 *
 * * Integer dimensions (using widget properties)
 * * Additional percent height (using layout property)
 * * Min and max dimensions (using widget properties)
 * * Priorized growing/shrinking (flex) (using layout properties)
 * * Top and bottom margins (even negative ones) with margin collapsing support (using layout properties)
 * * Auto sizing
 * * Vertical align
 * * Vertical spacing
 * * Reversed children ordering
 *
 * Layout properties: flex, align, marginTop, marginBottom, horizontalAlign
 */
qx.Class.define("qx.ui2.layout.VBox",
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


    /** Vertical alignment of the whole children block */
    align :
    {
      check : [ "top", "middle", "bottom" ],
      init : "top",
      apply : "_applyLayoutProperty"
    },


    /** Whether the actual children data should be reversed for layout (bottom-to-top) */
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
    renderLayout : function(parentHeight, parentWidth)
    {
      // Initialize
      var children = this._children;

      if (children.length == 0) {
        return;
      }

      var options = this._options;
      var align = this.getAlign();
      var child, childHint;
      var childWidth, childAlign, childLeft, childTop;
      var childLeft, childRight;
      var childGrow;


      // Support for reversed children
      if (this.getReversed()) {
        children = children.concat().reverse();
      }


      // Creating dimension working data
      var childHeights = [];
      var childWidths = [];
      var childHints = [];
      var usedGaps = this._getGaps();
      var usedHeight = usedGaps;
      var childHeightPercent;

      for (var i=0, l=children.length; i<l; i++)
      {
        child = children[i];
        childHint = child.getSizeHint();
        childHeightPercent = options[i].height;

        childHints[i] = childHint;
        childHeights[i] = childHeightPercent ? Math.floor((parentHeight - usedGaps) * parseFloat(childHeightPercent) / 100) : childHint.height;

        if (child.canStretchY()) {
          childWidths[i] = Math.max(childHint.minWidth, Math.min(parentWidth, childHint.width));
        } else {
          childWidths[i] = childHint.width;
        }

        usedHeight += childHeights[i];
      }

      // this.debug("Initial heights: avail=" + parentHeight + ", used=" + usedHeight);


      // Process heights for flex stretching/shrinking
      if (usedHeight != parentHeight)
      {
        var flexCandidates = [];
        var childGrow = usedHeight < parentHeight;

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
                potential : childGrow ? childHint.maxHeight - childHint.height : childHint.height - childHint.minHeight,
                flex : childGrow ? childFlex : 1 / childFlex
              });
            }
          }
        }

        if (flexCandidates.length > 0)
        {
          var flexibleOffsets = qx.ui2.layout.Util.computeFlexOffsets(flexCandidates, parentHeight - usedHeight);

          for (var key in flexibleOffsets)
          {
            // this.debug(" - Correcting child[" + key + "] by: " + flexibleOffsets[key]);

            childHeights[key] += flexibleOffsets[key];
            usedHeight += flexibleOffsets[key];
          }
        }
      }

      // this.debug("Corrected heights: avail=" + height + ", used=" + usedHeight);


      // Calculate vertical alignment offset
      var childAlignOffset = 0;
      if (usedHeight < parentHeight && align != "top")
      {
        childAlignOffset = parentHeight - usedHeight;

        if (align === "middle") {
          childAlignOffset = Math.round(childAlignOffset / 2);
        }
      }

      // this.debug("Alignment offset: value=" + childAlignOffset);


      // Iterate over children
      var spacing = this.getSpacing();
      var childTop = childAlignOffset + (options[0].marginTop || 0);

      for (var i=0, l=children.length; i<l; i++)
      {
        child = children[i];

        if (childTop < parentHeight)
        {
          // Respect horizontal alignment
          childLeft = qx.ui2.layout.Util.computeHorizontalAlignOffset(options[i].align || "left", childWidths[i], parentWidth);

          console.info("Hooray...");
          console.info("Left " + childLeft + ", Top: " + childTop);

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

        // Compute top position of next child
        thisMargin = options[i].marginBottom || 0;
        nextMargin = options[i+1].marginTop || 0;
        childTop += childHeights[i] + spacing + this._collapseMargin(thisMargin, nextMargin);
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
      var minHeight=gaps, height=gaps, maxHeight=32000;
      var minWidth=0, width=0, maxWidth=32000;

      // Support for reversed children
      if (this.getReversed()) {
        children = children.concat().reverse();
      }

      // Iterate over children
      var maxPercentHeight = 0;
      for (var i=0, l=children.length; i<l; i++)
      {
        var child = children[i];
        var childHint = child.getSizeHint();

        // Respect percent height (up calculate height by using preferred height)
        var childPercentHeight = options[i].height;
        if (childPercentHeight) {
          maxPercentHeight = Math.max(maxPercentHeight, childHint.height / parseFloat(childPercentHeight) * 100);
        } else {
          height += childHint.height;
        }

        // Sum up min/max height
        minHeight += childHint.minHeight;
        maxHeight += childHint.maxHeight;

        // Find maximium minWidth and width
        minWidth = Math.max(0, minWidth, childHint.minWidth);
        width = Math.max(0, width, childHint.width);

        // Find minimum maxWidth
        maxWidth = Math.min(32000, maxWidth, childHint.maxWidth);
      }

      // Apply max percent height
      height += Math.round(maxPercentHeight);

      // Limit height to integer range
      minHeight = Math.min(32000, Math.max(0, minHeight));
      height = Math.min(32000, Math.max(0, height));
      maxHeight = Math.min(32000, Math.max(0, maxHeight));

      // Build hint
      var hint = {
        minHeight : minHeight,
        height : height,
        maxHeight : maxHeight,
        minWidth : minWidth,
        width : width,
        maxWidth : maxWidth
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

      // Add margin top of first child (no collapsing here)
      gaps += (options[0].marginTop || 0);

      // Add inner margins (with collapsing support)
      if (length > 0)
      {
        var thisMargin, nextMargin;
        for (var i=0; i<length-1; i++)
        {
          thisMargin = (options[i].marginBottom || 0);
          nextMargin = (options[i+1].marginTop || 0);

          gaps += this._collapseMargin(thisMargin, nextMargin);
        }
      }

      // Add margin bottom of last child (no collapsing here)
      gaps += (options[length-1].marginBottom || 0);

      return gaps;
    },


    /**
     * Collapses a bottom and top margin of two widgets.
     *
     * @type member
     * @param bottom {Integer} Bottom margin
     * @param top {Integer} Top margin
     * @return {Integer} The collapsed margin
     */
    _collapseMargin : function(bottom, top)
    {
      // Math.max detects 'null' as more ('0') than '-1'
      // we need to work around this
      if (bottom && top) {
        return Math.max(bottom, top);
      } else if (top) {
        return top;
      } else if (bottom) {
        return bottom;
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
