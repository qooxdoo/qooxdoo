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
qx.Class.define("qx.ui.layout.HBox",
{
  extend : qx.ui.layout.Abstract,






  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** Horizontal alignment of the whole children block */
    align :
    {
      check : [ "left", "center", "right" ],
      init : "left",
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
      HELPER METHODS
    ---------------------------------------------------------------------------
    */

    _rebuildCache : function()
    {
      var children = this._getLayoutChildren();
      var length = children.length;
      var enableFlex = false;
      var props;

      // Sparse array
      var widths = new Array(length);
      var flexs = new Array(length);

      // Loop through children to preparse values
      for (var i=0; i<length; i++)
      {
        props = children[i].getLayoutProperties();

        if (props.width != null) {
          widths[i] = parseFloat(props.width) / 100;
        }

        if (props.flex != null)
        {
          flexs[i] = props.flex;
          enableFlex = true;
        }
      }

      // Store data
      this.__widths = widths;
      this.__flexs = flexs;
      this.__enableFlex = enableFlex

      // Clear invalidation marker
      delete this._invalidChildrenCache;
    },





    /*
    ---------------------------------------------------------------------------
      LAYOUT INTERFACE
    ---------------------------------------------------------------------------
    */

    // overridden
    renderLayout : function(availWidth, availHeight)
    {
      // Rebuild flex/width caches
      if (this._invalidChildrenCache) {
        this._rebuildCache();
      }

      // Cache children
      var children = this._getLayoutChildren();
      var length = children.length;
      var util = qx.ui.layout.Util;
      var gaps = util.computeHorizontalGaps(children, this.getSpacing(), true);


      // First run to cache children data and compute allocated width
      var i, child, width, percent;
      var widths = [];
      var allocatedWidth = gaps;

      for (i=0; i<length; i+=1)
      {
        percent = this.__widths[i];

        width = percent != null ?
          Math.floor((availWidth - gaps) * percent) :
          children[i].getSizeHint().width;

        widths.push(width);
        allocatedWidth += width;
      }


      // Flex support (growing/shrinking)
      if (this.__enableFlex && allocatedWidth != availWidth)
      {
        var flexibles = {};
        var flex, offset;

        for (i=0; i<length; i+=1)
        {
          flex = this.__flexs[i];

          if (flex > 0)
          {
            hint = children[i].getSizeHint();

            flexibles[i]=
            {
              min : hint.minWidth,
              value : widths[i],
              max : hint.maxWidth,
              flex : flex
            };
          }
        }

        var result = util.computeFlexOffsets(flexibles, availWidth, allocatedWidth);

        for (i in result)
        {
          offset = result[i].offset;

          widths[i] += offset;
          allocatedWidth += offset;
        }
      }


      // Start with left coordinate
      var left = children[0].getMarginLeft();


      // Alignment support
      if (allocatedWidth < availWidth && this.getAlign() != "left")
      {
        left = availWidth - allocatedWidth;

        if (this.getAlign() === "center") {
          left = Math.round(left / 2);
        }
      }


      // Layouting children
      var hint, top, height, width, align, marginRight, marginTop, marginBottom;
      var spacing = this.getSpacing();

      for (i=0; i<length; i+=1)
      {
        child = children[i];

        hint = child.getSizeHint();
        width = widths[i];

        marginTop = child.getMarginTop();
        marginBottom = child.getMarginBottom();

        // Find usable height
        height = Math.max(hint.minHeight, Math.min(availHeight-marginTop-marginBottom, hint.maxHeight));

        // Respect vertical alignment
        align = child.getLayoutProperties().align || "top";
        top = util.computeVerticalAlignOffset(align, height, availHeight, marginTop, marginBottom);

        // Add collapsed margin
        if (i > 0) {
          left += util.collapseMargins(spacing, marginRight, child.getMarginLeft());
        }

        // Layout child
        child.renderLayout(left, top, width, height);

        // Add width
        left += width;

        // Remember right margin (for collapsing)
        marginRight = child.getMarginRight();
      }
    },


    // overridden
    _computeSizeHint : function()
    {
      // Rebuild flex/width caches
      if (this._invalidChildrenCache) {
        this._rebuildCache();
      }

      var util = qx.ui.layout.Util;
      var children = this._getLayoutChildren();

      // Initialize
      var minWidth=0, width=0;
      var minHeight=0, height=0;
      var child, hint, margin;

      // Iterate over children
      for (var i=0, l=children.length; i<l; i+=1)
      {
        child = children[i];
        hint = child.getSizeHint();

        // Sum up widths
        width += hint.width;

        // Detect if child is shrinkable and update minWidth
        minWidth += this.__flexs[i] > 0 ? hint.minWidth : hint.width;

        // Build vertical margin sum
        margin = child.getMarginTop() + child.getMarginBottom();

        // Find biggest height
        if ((hint.height+margin) > height) {
          height = hint.height + margin;
        }

        // Find biggest minHeight
        if ((hint.minHeight+margin) > minHeight) {
          minHeight = hint.minHeight;
        }
      }

      // Respect gaps
      var gaps = util.computeHorizontalGaps(children, this.getSpacing(), true);

      // Return hint
      return {
        minWidth : minWidth + gaps,
        width : width + gaps,
        minHeight : minHeight,
        height : height
      };
    }
  }
});
