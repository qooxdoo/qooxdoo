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
      var heights = [];
      var widths = [];
      var hints = [];
      var usedGaps = this._getGaps();
      var usedHeight = usedGaps;
      var percentHeight;

      for (var i=0, l=children.length; i<l; i++)
      {
        child = children[i];
        hint = child.getSizeHint();
        percentHeight = options[i].height;

        hints[i] = hint;
        heights[i] = percentHeight ? Math.floor((parentHeight - usedGaps) * parseFloat(percentHeight) / 100) : hint.height;

        if (child.canStretchY()) {
          widths[i] = Math.max(hint.minWidth, Math.min(parentWidth, hint.width));
        } else {
          widths[i] = hint.width;
        }

        usedHeight += heights[i];
      }

      // this.debug("Initial heights: avail=" + parentHeight + ", used=" + usedHeight);


      // Process heights for flex stretching/shrinking
      if (usedHeight != parentHeight)
      {
        var flexCandidates = [];
        var grow = usedHeight < parentHeight;

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
                potential : grow ? hint.maxHeight - hint.height : hint.height - hint.minHeight,
                flex : grow ? flex : 1 / flex
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

            heights[key] += flexibleOffsets[key];
            usedHeight += flexibleOffsets[key];
          }
        }
      }

      // this.debug("Corrected heights: avail=" + height + ", used=" + usedHeight);


      // Calculate vertical alignment offset
      var alignOffset = 0;
      if (usedHeight < parentHeight && align != "top")
      {
        alignOffset = parentHeight - usedHeight;

        if (align === "middle") {
          alignOffset = Math.round(alignOffset / 2);
        }
      }

      // this.debug("Alignment offset: value=" + alignOffset);


      // Iterate over children
      var spacing = this.getSpacing();
      var top = alignOffset + (options[0].marginTop || 0);
      var thisMargin, nextMargin;

      for (var i=0, l=children.length; i<l; i++)
      {
        child = children[i];

        if (top < parentHeight)
        {
          // Respect horizontal alignment
          left = qx.ui2.layout.Util.computeHorizontalAlignOffset(options[i].align || "left", widths[i], parentWidth);

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

        // Compute top position of next child
        thisMargin = options[i].marginBottom || 0;
        nextMargin = options[i+1].marginTop || 0;
        top += heights[i] + spacing + this._collapseMargin(thisMargin, nextMargin);
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
      var minHeight=gaps, height=gaps, maxHeight=32000;
      var minWidth=0, width=0, maxWidth=32000;

      // Iterate over children
      var maxPercentHeight = 0;
      for (var i=0, l=children.length; i<l; i++)
      {
        var child = children[i];
        var hint = child.getSizeHint();

        // Respect percent height (up calculate height by using preferred height)
        var percentHeight = options[i].height;
        if (percentHeight) {
          maxPercentHeight = Math.max(maxPercentHeight, hint.height / parseFloat(percentHeight) * 100);
        } else {
          height += hint.height;
        }

        // Sum up min/max height
        minHeight += hint.minHeight;
        maxHeight += hint.maxHeight;

        // Find maximium minWidth and width
        minWidth = Math.max(0, minWidth, hint.minWidth);
        width = Math.max(0, width, hint.width);

        // Find minimum maxWidth
        maxWidth = Math.min(32000, maxWidth, hint.maxWidth);
      }

      // Apply max percent height
      height += Math.round(maxPercentHeight);

      // Limit height to integer range
      minHeight = Math.min(32000, Math.max(0, minHeight));
      height = Math.min(32000, Math.max(0, height));
      maxHeight = Math.min(32000, Math.max(0, maxHeight));

      // Return hint
      return {
        minHeight : minHeight,
        height : height,
        maxHeight : maxHeight,
        minWidth : minWidth,
        width : width,
        maxWidth : maxWidth
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
