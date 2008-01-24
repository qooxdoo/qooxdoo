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
 * Supports the following features:
 *
 * * Percent and flex widths
 * * Minimum and maximum dimensions
 * * Priorized growing/shrinking (flex)
 * * Left and right margins
 * * Horizontal align
 * * Horizontal spacing
 * * Reversed children layout
 * * Vertical children stretching
 * * Auto sizing
 *
 * Names used by other toolkits:
 *
 * * QHBoxLayout (Qt)
 * * StackPanel (XAML)
 * * RowLayout (SWT)
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
      init : 0,
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
      var children = this.getLayoutChildren();
      var length = children.length;
      var util = qx.ui2.layout.Util;

      if (this.getReversed())
      {
        var start = length-1;
        var end = -1;
        var increment = -1;
      }
      else
      {
        var start = 0;
        var end = length;
        var increment = 1;
      }



      // **************************************
      //   Caching children data
      // **************************************

      // First run to cache children data and compute allocated width
      var child, layoutWidth;
      var widths = [];
      var gaps = this._getGaps();

      for (var i=start; i!=end; i+=increment)
      {
        child = children[i];

        layoutWidth = this.getLayoutProperty(child, "width");
        if (layoutWidth)
        {
          if (util.PERCENT_VALUE.test(layoutWidth))
          {
            widths[i] = Math.floor((availWidth - gaps) * parseFloat(layoutWidth) / 100);
          }
          else if (util.FLEX_VALUE.test(layoutWidth))
          {
            // Flex values here are a shortcut for width+flex (width should start at the minwidth)
            widths[i] = child.getSizeHint().minWidth;
          }
          else
          {
            throw new Error("Invalid layout width: " + layoutWidth);
          }
        }
        else
        {
          widths[i] = child.getSizeHint().width;
        }
      }

      var allocatedWidth = qx.lang.Array.sum(widths) + gaps;

      // this.debug("Initial widths: avail=" + availWidth + ", allocatedWidth=" + allocatedWidth);




      // **************************************
      //   Flex support (growing/shrinking)
      // **************************************

      if (allocatedWidth != availWidth)
      {
        var flexibles = [];
        var grow = allocatedWidth < availWidth;
        var flex;

        for (var i=start; i!=end; i+=increment)
        {
          child = children[i];

          if (child.canStretchX())
          {
            layoutWidth = this.getLayoutProperty(child, "width");
            if (layoutWidth && util.FLEX_VALUE.test(layoutWidth))
            {
              flex = parseInt(layoutWidth);
            }
            else
            {
              flex = this.getLayoutProperty(child, "flex", 0);
            }

            if (flex > 0)
            {
              hint = child.getSizeHint();

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

          for (var key in flexibleOffsets) {
            widths[key] += flexibleOffsets[key];
          }

          // Update allocated width
          allocatedWidth = qx.lang.Array.sum(widths) + gaps;
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




      // **************************************
      //   Layouting children
      // **************************************

      var prev, hint, top, height, width, marginEnd, marginStart;
      var spacing = this.getSpacing();

      for (var i=start; i!=end; i+=increment)
      {
        child = children[i];

        // Compute left position of this child
        if (left < availWidth)
        {
          if (i === start)
          {
            left += this.getLayoutProperty(child, "marginLeft", 0);
          }
          else
          {
            // "prev" is the previous child from the previous interation
            marginEnd = this.getLayoutProperty(prev, "marginRight", 0);
            marginStart = this.getLayoutProperty(child, "marginLeft", 0);

            // "width" is still the width of the previous child
            left += width + spacing + util.collapseMargins(marginEnd, marginStart);
          }
        }

        // Detect if the child is still (partly) visible
        if (left < availWidth)
        {
          hint = child.getSizeHint();
          if (child.canStretchY()) {
            height = Math.max(hint.minHeight, Math.min(availHeight, hint.height));
          } else {
            height = hint.height;
          }

          // Respect vertical alignment
          top = util.computeVerticalAlignOffset(this.getLayoutProperty(child, "align", "top"), height, availHeight);

          // Load width
          width = widths[i];

          // Layout child
          child.renderLayout(left, top, width, height);

          // Include again (if excluded before)
          child.setLayoutVisible(true);

          // Remember previous child
          prev = child;
        }
        else
        {
          // Exclude (completely) hidden children
          child.setLayoutVisible(false);
        }
      }
    },


    // overridden
    _computeSizeHint : function()
    {
      // Read children
      var children = this.getLayoutChildren();
      var length = children.length;

      if (this.getReversed())
      {
        var start = length-1;
        var end = -1;
        var increment = -1;
      }
      else
      {
        var start = 0;
        var end = length;
        var increment = 1;
      }

      // Initialize
      var minWidth=0, width=0;
      var minHeight=0, height=0;
      var hint;

      // Iterate over children
      for (var i=start; i!=end; i+=increment)
      {
        hint = children[i].getSizeHint();

        // Sum up widths
        width += hint.width;
        minWidth += hint.minWidth;

        // Find maximum heights
        if (hint.height > height) {
          height = hint.height;
        }

        if (hint.minHeight > minHeight) {
          minHeight = hint.minHeight;
        }
      }

      // Respect gaps
      var gaps = this._getGaps();

      // Return hint
      return {
        minWidth : minWidth + gaps,
        width : width + gaps,
        maxWidth : Infinity,
        minHeight : minHeight,
        height : height,
        maxHeight : Infinity
      };
    },







    /*
    ---------------------------------------------------------------------------
      LAYOUT HELPERS
    ---------------------------------------------------------------------------
    */

    /**
     * Computes the area occopied by spacing and margin.
     *
     * @type member
     * @return {Integer} The computed sum
     */
    _getGaps : function()
    {
      var util = qx.ui2.layout.Util;

      // Cache children data
      var children = this.getLayoutChildren();
      var length = children.length;

      if (this.getReversed())
      {
        var start = length-1;
        var end = -1;
        var increment = -1;
      }
      else
      {
        var start = 0;
        var end = length;
        var increment = 1;
      }

      // Initialize gaps
      var gaps = this.getSpacing() * (length - 1);

      // Add inner margins (with collapsing support)
      var marginEnd, marginStart;

      // Add margin left of first child (no collapsing here)
      child = children[start];
      gaps += this.getLayoutProperty(child, "marginLeft", 0);

      // Ignore last child here (will be added later)
      for (var i=start+increment; i!=end; i+=increment)
      {
        marginEnd = this.getLayoutProperty(child, "marginRight", 0);

        child = children[i];

        marginStart = this.getLayoutProperty(child, "marginLeft", 0);

        gaps += util.collapseMargins(marginEnd, marginStart);
      }

      // Add margin right of last child (no collapsing here)
      gaps += this.getLayoutProperty(child, "marginRight", 0);

      return gaps;
    }
  }
});
