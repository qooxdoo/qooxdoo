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
qx.Class.define("qx.ui.layout.VBox",
{
  extend : qx.ui.layout.Abstract,






  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** Vertical alignment of the whole children block */
    align :
    {
      check : [ "top", "middle", "bottom" ],
      init : "top",
      apply : "_applyLayoutChange"
    },


    /** Spacing between two children */
    spacing :
    {
      check : "Integer",
      init : 0,
      apply : "_applyLayoutChange"
    },


    /** Whether the actual children data should be reversed for layout */
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
      var children = this._getLayoutChildren();
      var length = children.length;
      var util = qx.ui.layout.Util;



      // **************************************
      //   Caching children data
      // **************************************

      // First run to cache children data and compute allocated height
      var child, layoutHeight;
      var heights = [];
      var gaps = util.computeVerticalGaps(children, this.getSpacing());

      for (var i=0; i<length; i+=1)
      {
        child = children[i];

        layoutHeight = child.getLayoutProperties().height;
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

        for (var i=0; i<length; i+=1)
        {
          child = children[i];

          layoutHeight = child.getLayoutProperties().height;
          if (layoutHeight && util.FLEX_VALUE.test(layoutHeight)) {
            flex = parseInt(layoutHeight, 10);
          } else {
            flex = child.getLayoutProperties().flex || 0;
          }

          if (flex > 0)
          {
            hint = child.getSizeHint();
            var potential = grow ? hint.maxHeight - hint.height : hint.height - hint.minHeight;

            if (potential != 0)
            {
              flexibles.push({
                id : i,
                potential : potential,
                flex : grow ? flex : 1 / flex
              });
            }
          }
        }

        if (flexibles.length > 0)
        {
          var offsets = qx.ui.layout.Util.computeFlexOffsets(flexibles, availHeight - allocatedHeight);

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

      var hint, left, width, height, marginEnd, marginStart;
      var spacing = this.getSpacing();
      var align;

      for (var i=0; i<length; i+=1)
      {
        child = children[i];

        // Compute top position of this child
        if (i === 0)
        {
          top += child.getMarginTop();
        }
        else
        {
          // "height" is still the height of the previous child
          top += height + util.collapseMargins(spacing, children[i-1].getMarginBottom(), child.getMarginTop());
        }

        // Do the real rendering
        hint = child.getSizeHint();
        width = Math.max(hint.minWidth, Math.min(availWidth, hint.maxWidth));

        // Respect horizontal alignment
        align = child.getLayoutProperties().align || "left";
        left = util.computeHorizontalAlignOffset(align, width, availWidth);

        // Load height
        height = heights[i];

        // Layout child
        child.renderLayout(left, top, width, height);
      }
    },


    // overridden
    _computeSizeHint : function()
    {
      var util = qx.ui.layout.Util;

      // Read children
      var children = this._getLayoutChildren();
      var length = children.length;

      // Initialize
      var minHeight=0, height=0;
      var minWidth=0, width=0;
      var hint, flex, child;

      // Iterate over children
      for (var i=0; i<length; i+=1)
      {
        child = children[i];
        hint = child.getSizeHint();

        // Sum up heights
        height += hint.height;

        // Detect if child is shrinkable and update minHeight
        layoutHeight = child.getLayoutProperties().height;
        if (layoutHeight && util.FLEX_VALUE.test(layoutHeight)) {
          flex = parseInt(layoutHeight, 10);
        } else {
          flex = child.getLayoutProperties().flex || 0;
        }

        minHeight += flex > 0 ? hint.minHeight : hint.height;

        // Find maximum widths
        if (hint.width > width) {
          width = hint.width;
        }

        if (hint.minWidth > minWidth) {
          minWidth = hint.minWidth;
        }
      }

      // Respect gaps
      var gaps = util.computeVerticalGaps(children, this.getSpacing());

      // Return hint
      return {
        minHeight : minHeight + gaps,
        height : height + gaps,
        minWidth : minWidth,
        width : width
      };
    }
  }
});
