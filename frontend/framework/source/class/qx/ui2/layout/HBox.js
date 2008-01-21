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
      apply : "_applyLayoutChange"
    },


    /** Horizontal alignment of the whole children block */
    align :
    {
      check : [ "left", "center", "right" ],
      init : "left",
      apply : "_applyLayoutChange"
    },


    /** Whether the actual children data should be reversed for layout (right-to-left) */
    reversed :
    {
      check : "Boolean",
      init : false,
      apply : "_applyLayoutChange"
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
    renderLayout : function(availWidth, availHeight)
    {
      // Cache children
      var children = this._children;
      var length = children.length;

      if (this.getReversed()) {
        children = children.concat().reverse();
      }

      // Initialize variables
      var child, hint;



      // **************************************
      //   Caching children data
      // **************************************

      // Creating caching fields
      var widths = [];
      var heights = [];

      // First run to cache children data and compute allocated width
      var gaps = this._getGaps();
      var allocatedWidth = gaps;
      var percentWidth;

      for (var i=0, l=children.length; i<l; i++)
      {
        child = children[i];
        hint = child.getSizeHint();
        percentWidth = this.getLayoutProperty(child, "width");

        widths[i] = percentWidth ?
          Math.floor((availWidth - gaps) * parseFloat(percentWidth) / 100) :
          hint.width;

        allocatedWidth += widths[i];

        if (child.canStretchY()) {
          heights[i] = Math.max(hint.minHeight, Math.min(availHeight, hint.height));
        } else {
          heights[i] = hint.height;
        }
      }

      // this.debug("Initial widths: avail=" + availWidth + ", allocatedWidth=" + allocatedWidth);




      // **************************************
      //   Flex support (growing/shrinking)
      // **************************************

      if (allocatedWidth != availWidth)
      {
        var flexibles = [];
        var grow = allocatedWidth < availWidth;
        var flex;

        for (var i=0; i<length; i++)
        {
          child = children[i];

          if (child.canStretchX())
          {
            flex = this.getLayoutProperty(child, "flex", 0);
            hint = child.getSizeHint();

            if (flex > 0)
            {
              flexibles.push({
                id : i,
                potential : grow ? hint.maxWidth - hint.width : hint.width - hint.minWidth,
                flex : grow ? flex : 1 / flex
              });
            }
          }
        }

        if (flexibles.length > 0)
        {
          var flexibleOffsets = qx.ui2.layout.Util.computeFlexOffsets(flexibles, availWidth - allocatedWidth);

          for (var key in flexibleOffsets)
          {
            // this.debug(" - Correcting child[" + key + "] by: " + flexibleOffsets[key]);

            widths[key] += flexibleOffsets[key];
            allocatedWidth += flexibleOffsets[key];
          }
        }
      }

      // this.debug("Corrected widths: avail=" + width + ", used=" + allocatedWidth);



      // **************************************
      //   Alignment support
      // **************************************

      var left = 0;
      if (allocatedWidth < availWidth && this.getAlign() != "left")
      {
        left = availWidth - allocatedWidth;

        if (this.getAlign() === "center") {
          left = Math.round(left / 2);
        }
      }

      // this.debug("Alignment offset: value=" + left);



      // **************************************
      //   Layouting children
      // **************************************

      var top, marginEnd, marginStart;
      var spacing = this.getSpacing();
      var util = qx.ui2.layout.Util;

      for (var i=0; i<length; i++)
      {
        child = children[i];

        if (i === 0)
        {
          left += this.getLayoutProperty(child, "marginLeft", 0);
        }
        else
        {
          marginEnd = this.getLayoutProperty(children[i-1], "marginRight", 0);
          marginStart = this.getLayoutProperty(child, "marginLeft", 0);

          left += widths[i-1] + spacing + util.collapseMargins(marginEnd, marginStart);
        }

        if (left < availWidth)
        {
          // Respect vertical alignment
          top = util.computeVerticalAlignOffset(this.getLayoutProperty(child, "align", "top"), heights[i], availHeight);

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
      }
    },


    // overridden
    _computeSizeHint : function()
    {
      // Read children
      var children = this._children;
      var length = children.length;
      if (this.getReversed()) {
        children = children.concat().reverse();
      }

      // Initialize
      var gaps = this._getGaps();
      var minWidth=gaps, width=gaps, maxWidth=32000;
      var minHeight=0, height=0, maxHeight=32000;

      // Iterate over children
      var maxPercentWidth = 0;
      for (var i=0; i<length; i++)
      {
        var child = children[i];
        var hint = child.getSizeHint();

        // Respect percent width (up calculate width by using preferred width)
        var percentWidth = this.getLayoutProperty(child, "width");
        if (percentWidth) {
          maxPercentWidth = Math.max(maxPercentWidth, hint.width / parseFloat(percentWidth) * 100);
        } else {
          width += hint.width;
        }

        // Sum up min/max width
        minWidth += hint.minWidth;
        maxWidth += hint.maxWidth;

        // Find maximium minHeight and height
        minHeight = Math.max(minHeight, hint.minHeight);
        height = Math.max(height, hint.height);

        // Find minimum maxHeight
        maxHeight = Math.min(maxHeight, hint.maxHeight);
      }

      // Apply max percent width
      width += Math.round(maxPercentWidth);

      // Limit width to integer range
      minWidth = Math.max(0, minWidth);
      width = Math.max(0, width);
      maxWidth = Math.max(0, maxWidth);

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
      var util = qx.ui2.layout.Util;

      // Cache children data
      var children = this._children;
      var length = children.length;
      if (this.getReversed()) {
        children = children.concat().reverse();
      }

      // Initialize gaps
      var gaps = this.getSpacing() * (length - 1);

      // Add margin left of first child (no collapsing here)
      gaps += this.getLayoutProperty(children[0], "marginLeft", 0);

      // Add inner margins (with collapsing support)
      if (length > 0)
      {
        var marginEnd, marginStart;

        for (var i=0; i<length-1; i++)
        {
          marginEnd = this.getLayoutProperty(children[i], "marginRight", 0);
          marginStart = this.getLayoutProperty(children[i+1], "marginLeft", 0);

          gaps += util.collapseMargins(marginEnd, marginStart);
        }
      }

      // Add margin right of last child (no collapsing here)
      gaps += this.getLayoutProperty(children[length-1], "marginRight", 0);

      return gaps;
    }
  }
});
