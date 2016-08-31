/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * A atom layout. Used to place an image and label in relation
 * to each other. Useful to create buttons, list items, etc.
 *
 * *Features*
 *
 * * Gap between icon and text (using {@link #gap})
 * * Vertical and horizontal mode (using {@link #iconPosition})
 * * Sorting options to place first child on top/left or bottom/right (using {@link #iconPosition})
 * * Automatically middles/centers content to the available space
 * * Auto-sizing
 * * Supports more than two children (will be processed the same way like the previous ones)
 *
 * *Item Properties*
 *
 * None
 *
 * *Notes*
 *
 * * Does not support margins and alignment of {@link qx.ui.core.LayoutItem}.
 *
 * *Alternative Names*
 *
 * None
 */
qx.Class.define("qx.ui.layout.Atom", {
  extend : qx.ui.layout.Abstract,




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** The gap between the icon and the text */
    gap :
    {
      check : "Integer",
      init : 4,
      apply : "_applyLayoutChange"
    },


    /** The position of the icon in relation to the text */
    iconPosition :
    {
      check : ["left", "top", "right", "bottom", "top-left", "bottom-left", "top-right", "bottom-right"],
      init : "left",
      apply  : "_applyLayoutChange"
    },


    /**
     * Whether the content should be rendered centrally when to much space
     * is available. Enabling this property centers in both axis. The behavior
     * when disabled of the centering depends on the {@link #iconPosition} property.
     * If the icon position is <code>left</code> or <code>right</code>, the X axis
     * is not centered, only the Y axis. If the icon position is <code>top</code>
     * or <code>bottom</code>, the Y axis is not centered. In case of e.g. an
     * icon position of <code>top-left</code> no axis is centered.
     */
    center :
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
    verifyLayoutProperty : qx.core.Environment.select("qx.debug",
    {
      "true" : function(item, name, value) {
        this.assert(false, "The property '"+name+"' is not supported by the Atom layout!");
      },

      "false" : null
    }),


    // overridden
    renderLayout : function(availWidth, availHeight, padding)
    {
      var left = padding.left;
      var top = padding.top;
      var Util = qx.ui.layout.Util;

      var iconPosition = this.getIconPosition();
      var children = this._getLayoutChildren();
      var length = children.length;

      var width, height;
      var child, hint;
      var gap = this.getGap();
      var center = this.getCenter();

      // reverse ordering
      var allowedPositions = ["bottom", "right", "top-right", "bottom-right"];
      if (allowedPositions.indexOf(iconPosition) != -1)
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

      // vertical
      if (iconPosition == "top" || iconPosition == "bottom")
      {
        if (center)
        {
          var allocatedHeight = 0;
          for (var i=start; i!=end; i+=increment)
          {
            height = children[i].getSizeHint().height;

            if (height > 0)
            {
              allocatedHeight += height;

              if (i != start) {
                allocatedHeight += gap;
              }
            }
          }

          top += Math.round((availHeight - allocatedHeight) / 2);
        }

        var childTop = top;
        for (var i=start; i!=end; i+=increment)
        {
          child = children[i];

          hint = child.getSizeHint();
          width = Math.min(hint.maxWidth, Math.max(availWidth, hint.minWidth));
          height = hint.height;

          left = Util.computeHorizontalAlignOffset("center", width, availWidth) + padding.left;
          child.renderLayout(left, childTop, width, height);

          // Ignore pseudo invisible elements
          if (height > 0) {
            childTop = top + height + gap;
          }
        }
      }

      // horizontal
      // in this way it also supports shrinking of the first label
      else
      {
        var remainingWidth = availWidth;
        var shrinkTarget = null;

        var count=0;
        for (var i=start; i!=end; i+=increment)
        {
          child = children[i];
          width = child.getSizeHint().width;

          if (width > 0)
          {
            if (!shrinkTarget && child instanceof qx.ui.basic.Label) {
              shrinkTarget = child;
            } else {
              remainingWidth -= width;
            }

            count++;
          }
        }

        if (count > 1)
        {
          var gapSum = (count - 1) * gap;
          remainingWidth -= gapSum;
        }

        if (shrinkTarget)
        {
          var hint = shrinkTarget.getSizeHint();
          var shrinkTargetWidth = Math.max(hint.minWidth, Math.min(remainingWidth, hint.maxWidth));
          remainingWidth -= shrinkTargetWidth;
        }

        if (center && remainingWidth > 0) {
          left += Math.round(remainingWidth / 2);
        }

        for (var i=start; i!=end; i+=increment)
        {
          child = children[i];

          hint = child.getSizeHint();
          height = Math.min(hint.maxHeight, Math.max(availHeight, hint.minHeight));

          if (child === shrinkTarget) {
            width = shrinkTargetWidth;
          } else {
            width = hint.width;
          }

          var align = "middle";
          if(iconPosition == "top-left" || iconPosition == "top-right"){
            align = "top";
          } else if (iconPosition == "bottom-left" || iconPosition == "bottom-right") {
            align = "bottom";
          }
          var childTop = top + Util.computeVerticalAlignOffset(align, hint.height, availHeight);
          child.renderLayout(left, childTop, width, height);

          // Ignore pseudo invisible childs for gap e.g.
          // empty text or unavailable images
          if (width > 0) {
            left += width + gap;
          }
        }
      }
    },


    // overridden
    _computeSizeHint : function()
    {
      var children = this._getLayoutChildren();
      var length = children.length;
      var hint, result;

      // Fast path for only one child
      if (length === 1)
      {
        var hint = children[0].getSizeHint();

        // Work on a copy, but do not respect max
        // values as a Atom can be rendered bigger
        // than its content.
        result = {
          width : hint.width,
          height : hint.height,
          minWidth : hint.minWidth,
          minHeight : hint.minHeight
        };
      }
      else
      {
        var minWidth=0, width=0;
        var minHeight=0, height=0;

        var iconPosition = this.getIconPosition();
        var gap = this.getGap();

        if (iconPosition === "top" || iconPosition === "bottom")
        {
          var count = 0;
          for (var i=0; i<length; i++)
          {
            hint = children[i].getSizeHint();

            // Max of widths
            width = Math.max(width, hint.width);
            minWidth = Math.max(minWidth, hint.minWidth);

            // Sum of heights
            if (hint.height > 0)
            {
              height += hint.height;
              minHeight += hint.minHeight;
              count++;
            }
          }

          if (count > 1)
          {
            var gapSum = (count-1) * gap;
            height += gapSum;
            minHeight += gapSum;
          }
        }
        else
        {
          var count=0;
          for (var i=0; i<length; i++)
          {
            hint = children[i].getSizeHint();

            // Max of heights
            height = Math.max(height, hint.height);
            minHeight = Math.max(minHeight, hint.minHeight);

            // Sum of widths
            if (hint.width > 0)
            {
              width += hint.width;
              minWidth += hint.minWidth;
              count++;
            }
          }

          if (count > 1)
          {
            var gapSum = (count-1) * gap;
            width += gapSum;
            minWidth += gapSum;
          }
        }

        // Build hint
        result = {
          minWidth : minWidth,
          width : width,
          minHeight : minHeight,
          height : height
        };
      }

      return result;
    }
  }
});
