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
 * Supports the following features:
 *
 * * Percent and flex heights
 * * Minimum and maximum dimensions
 * * Priorized growing/shrinking (flex)
 * * Top and bottom margins
 * * Vertical align
 * * Vertical spacing
 * * Reversed children layout
 * * Horizontal children stretching
 * * Auto sizing
 *
 * Names used by other toolkits:
 *
 * * QVBoxLayout (Qt)
 * * StackPanel (XAML)
 * * RowLayout (SWT)
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
      init : 0,
      apply : "_applyLayoutChange"
    },


    /** Vertical alignment of the whole children block */
    align :
    {
      check : [ "top", "middle", "bottom" ],
      init : "top",
      apply : "_applyLayoutChange"
    },


    /** Whether the actual children data should be reversed for layout (bottom-to-top) */
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

      // First run to cache children data and compute allocated height
      var child, layoutHeight;
      var heights = [];
      var gaps = this._getGaps();

      for (var i=start; i!=end; i+=increment)
      {
        child = children[i];

        layoutHeight = this.getLayoutProperty(child, "height");
        if (layoutHeight)
        {
          if (util.PERCENT_VALUE.test(layoutHeight))
          {
            heights[i] = Math.floor((availHeight - gaps) * parseFloat(layoutHeight) / 100);
          }
          else if (util.FLEX_VALUE.test(layoutHeight))
          {
            // Flex values here are a shortcut for height+flex (height should start at the minheight)
            heights[i] = child.getSizeHint().minHeight;
          }
          else
          {
            throw new Error("Invalid layout height: " + layoutHeight);
          }
        }
        else
        {
          heights[i] = child.getSizeHint().height;
        }
      }

      var allocatedHeight = qx.lang.Array.sum(heights) + gaps;

      // this.debug("Initial heights: avail=" + availHeight + ", allocatedHeight=" + allocatedHeight);




      // **************************************
      //   Flex support (growing/shrinking)
      // **************************************

      if (allocatedHeight != availHeight)
      {
        var flexibles = [];
        var grow = allocatedHeight < availHeight;
        var flex;

        for (var i=start; i!=end; i+=increment)
        {
          child = children[i];

          if (child.canStretchY())
          {
            layoutHeight = this.getLayoutProperty(child, "height");
            if (layoutHeight && util.FLEX_VALUE.test(layoutHeight))
            {
              flex = parseInt(layoutHeight);
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
                potential : grow ? hint.maxHeight - hint.height : hint.height - hint.minHeight,
                flex : grow ? flex : 1 / flex
              });
            }
          }
        }

        if (flexibles.length > 0)
        {
          var offsets = qx.ui2.layout.Util.computeFlexOffsets(flexibles, availHeight - allocatedHeight);

          for (var key in offsets) {
            heights[key] += offsets[key];
          }

          // Update allocated height
          allocatedHeight = qx.lang.Array.sum(heights) + gaps;
        }
      }

      // this.debug("Corrected heights: avail=" + height + ", used=" + allocatedHeight);




      // **************************************
      //   Alignment support
      // **************************************

      var top = 0;
      if (allocatedHeight < availHeight && this.getAlign() != "top")
      {
        top = availHeight - allocatedHeight;

        if (this.getAlign() === "middle") {
          top = Math.round(top / 2);
        }
      }




      // **************************************
      //   Layouting children
      // **************************************

      var prev, hint, left, width, height, marginEnd, marginStart;
      var spacing = this.getSpacing();

      for (var i=start; i!=end; i+=increment)
      {
        child = children[i];

        // Compute top position of this child
        if (top < availHeight)
        {
          if (i === start)
          {
            top += this.getLayoutProperty(child, "marginTop", 0);
          }
          else
          {
            // "prev" is the previous child from the previous interation
            marginEnd = this.getLayoutProperty(prev, "marginBottom", 0);
            marginStart = this.getLayoutProperty(child, "marginTop", 0);

            // "height" is still the height of the previous child
            top += height + spacing + util.collapseMargins(marginEnd, marginStart);
          }
        }

        // Detect if the child is still (partly) visible
        if (top < availHeight)
        {
          hint = child.getSizeHint();
          if (child.canStretchX()) {
            width = Math.max(hint.minWidth, Math.min(availWidth, hint.maxWidth));
          } else {
            width = hint.width;
          }

          // Respect horizontal alignment
          left = util.computeHorizontalAlignOffset(this.getLayoutProperty(child, "align", "left"), width, availWidth);

          // Load height
          height = heights[i];

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
      var minHeight=0, height=0;
      var minWidth=0, width=0;
      var hint;

      // Iterate over children
      for (var i=start; i!=end; i+=increment)
      {
        hint = children[i].getSizeHint();

        // Sum up heights
        height += hint.height;
        minHeight += hint.minHeight;

        // Find maximum widths
        if (hint.width > width) {
          width = hint.width;
        }

        if (hint.minWidth > minWidth) {
          minWidth = hint.minWidth;
        }
      }

      // Respect gaps
      var gaps = this._getGaps();

      // Return hint
      return {
        minHeight : minHeight + gaps,
        height : height + gaps,
        maxHeight : Infinity,
        minWidth : minWidth,
        width : width,
        maxWidth : Infinity
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
      var child;
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

      // Add margin top of first child (no collapsing here)
      child = children[start];
      gaps += this.getLayoutProperty(child, "marginTop", 0);

      // Ignore last child here (will be added later)
      for (var i=start+increment; i!=end; i+=increment)
      {
        marginEnd = this.getLayoutProperty(child, "marginBottom", 0);

        child = children[i];

        marginStart = this.getLayoutProperty(child, "marginTop", 0);

        gaps += util.collapseMargins(marginEnd, marginStart);
      }

      // Add margin bottom of last child (no collapsing here)
      gaps += this.getLayoutProperty(child, "marginBottom", 0);

      return gaps;
    }
  }
});
