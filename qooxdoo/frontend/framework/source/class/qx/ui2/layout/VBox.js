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
      var children = this._children;
      var length = children.length;

      if (this.getReversed())
      {
        var start = length;
        var end = 0;
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
      var child;
      var heights = [];
      var gaps = this._getGaps();
      var percentHeight;

      for (var i=start; i!=end; i+=increment)
      {
        child = children[i];
        percentHeight = this.getLayoutProperty(child, "height");

        heights[i] = percentHeight ?
          Math.floor((availHeight - gaps) * parseFloat(percentHeight) / 100) :
          child.getSizeHint().height;
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
            flex = this.getLayoutProperty(child, "flex", 0);
            hint = child.getSizeHint();

            if (flex > 0)
            {
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
          var flexibleOffsets = qx.ui2.layout.Util.computeFlexOffsets(flexibles, availHeight - allocatedHeight);

          for (var key in flexibleOffsets) {
            heights[key] += flexibleOffsets[key];
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
      var util = qx.ui2.layout.Util;

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
            width = Math.max(hint.minWidth, Math.min(availWidth, hint.width));
          } else {
            width = hint.width;
          }

          // Respect horizontal alignment
          left = util.computeHorizontalAlignOffset(this.getLayoutProperty(child, "align", "left"), width, availWidth);

          // Load height
          height = heights[i];

          // Layout child
          child.renderLayout(top, left, height, width);

          // Include again (if excluded before)
          child.include();

          // Remember previous child
          prev = child;
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

      if (this.getReversed())
      {
        var start = length;
        var end = 0;
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
      for (var i=0; i!=end; i+=increment)
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

      // Add margin top of first child (no collapsing here)
      gaps += this.getLayoutProperty(children[0], "marginTop", 0);

      // Add inner margins (with collapsing support)
      if (length > 0)
      {
        var marginEnd, marginStart;

        // Ignore last child here (will be added later)
        for (var i=0; i<length-1; i++)
        {
          marginEnd = this.getLayoutProperty(children[i], "marginBottom", 0);
          marginStart = this.getLayoutProperty(children[i+1], "marginTop", 0);

          gaps += util.collapseMargins(marginEnd, marginStart);
        }
      }

      // Add margin bottom of last child (no collapsing here)
      gaps += this.getLayoutProperty(children[length-1], "marginBottom", 0);

      return gaps;
    }
  }
});
