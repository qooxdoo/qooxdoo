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

      if (this.getReversed()) {
        children = children.concat().reverse();
      }



      // **************************************
      //   Caching children data
      // **************************************

      // First run to cache children data and compute allocated height
      var child;
      var heights = [];
      var gaps = this._getGaps();
      var percentHeight;

      for (var i=0; i<length; i++)
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

      var hint, left, width, marginEnd, marginStart;
      var spacing = this.getSpacing();
      var util = qx.ui2.layout.Util;

      for (var i=0; i<length; i++)
      {
        child = children[i];

        // Compute top position of this child
        if (i === 0)
        {
          top += this.getLayoutProperty(child, "marginTop", 0);
        }
        else
        {
          marginEnd = this.getLayoutProperty(children[i-1], "marginBottom", 0);
          marginStart = this.getLayoutProperty(child, "marginTop", 0);

          top += heights[i-1] + spacing + util.collapseMargins(marginEnd, marginStart);
        }

        // Detect if the child is still (partly) visible
        if (top < availHeight)
        {
          hint = child.getSizeHint();
          if (child.canStretchY()) {
            width = Math.max(hint.minWidth, Math.min(availWidth, hint.width));
          } else {
            width = hint.width;
          }

          // Respect horizontal alignment
          left = util.computeHorizontalAlignOffset(this.getLayoutProperty(child, "align", "left"), width, availWidth);

          // Layout child
          child.renderLayout(top, left, heights[i], width);

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
      var minHeight=0, height=0;
      var minWidth=0, width=0;

      // Iterate over children
      var maxPercentHeight = 0;
      for (var i=0; i<length; i++)
      {
        var child = children[i];
        var hint = child.getSizeHint();

        // Respect percent height (extrapolate height by using preferred height)
        var percentHeight = this.getLayoutProperty(child, "height");
        if (percentHeight) {
          maxPercentHeight = Math.max(maxPercentHeight, hint.height / parseFloat(percentHeight) * 100);
        } else {
          height += hint.height;
        }

        // Sum up min/max height
        minHeight += hint.minHeight;

        // Find maximium minWidth and width
        minWidth = Math.max(minWidth, hint.minWidth);
        width = Math.max(width, hint.width);
      }

      // Apply max percent height
      height += Math.round(maxPercentHeight);

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
