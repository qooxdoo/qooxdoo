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
 * A atom layout. Used to place an image and label in relation
 * to each other. Useful to create buttons, list items, etc.
 *
 * *Features*
 *
 * * Gap between icon and text (using {@link #gap})
 * * Vertical and horizontal mode (using {@link #align})
 * * Sorting options to place first child on top/left or bottom/right (using {@link #align})
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
 * *External Documentation*
 *
 * <a href='http://qooxdoo.org/documentation/0.8/layout/atom'>
 * Extended documentation</a> and links to demos of this layout in the qooxdoo wiki.
 *
 * *Alternative Names*
 *
 * None
 */
qx.Class.define("qx.ui.layout.Atom",
{
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
    align :
    {
      check : [ "left", "top", "right", "bottom" ],
      init : "left",
      apply  : "_applyLayoutChange"
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
    verifyLayoutProperty : qx.core.Variant.select("qx.debug",
    {
      "on" : function(item, name, value) {
        this.assert(false, "The property '"+name+"' is not supported by the atom layout!");
      },

      "off" : null
    }),


    // overridden
    renderLayout : function(availWidth, availHeight)
    {
      var Util = qx.ui.layout.Util;

      var align = this.getAlign();
      var children = this._getLayoutChildren();
      var length = children.length;

      var left, top, width, height;
      var child, hint;
      var gap = this.getGap();

      // reverse ordering
      if (align === "bottom" || align === "right")
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
      if (align == "top" || align == "bottom")
      {
        top = 0;
        for (var i=start; i!=end; i+=increment)
        {
          child = children[i];

          hint = child.getSizeHint();
          width = Math.min(hint.maxWidth, Math.max(availWidth, hint.minWidth));
          height = hint.height;

          left = Util.computeHorizontalAlignOffset("center", width, availWidth);
          child.renderLayout(left, top, width, height);

          if (height > 0) {
            top += height + gap;
          }
        }
      }

      // horizontal
      // in this way it also supports shrinking of the first label
      else
      {
        var remainingWidth = availWidth;
        var shrinkTarget = null;

        for (var i=start; i!=end; i+=increment)
        {
          child = children[i];
          width = child.getSizeHint().width;

          if (width > 0)
          {
            if (!shrinkTarget && child instanceof qx.ui.basic.Label)
            {
              shrinkTarget = child;
            }
            else
            {
              remainingWidth -= width;
            }

            if (i < (length - 1)) {
              remainingWidth -= gap;
            }
          }
        }

        left = 0;
        for (var i=start; i!=end; i+=increment)
        {
          child = children[i];

          hint = child.getSizeHint();
          height = Math.min(hint.maxHeight, Math.max(availHeight, hint.minHeight));

          if (child === shrinkTarget) {
            width = Math.max(hint.minWidth, Math.min(remainingWidth, hint.width));
          } else {
            width = hint.width;
          }

          top = Util.computeVerticalAlignOffset("middle", hint.height, availHeight);
          child.renderLayout(left, top, width, height);

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

        var align = this.getAlign();
        var gap = this.getGap();

        if (align === "top" || align === "bottom")
        {
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

              if (i < (length-1))
              {
                height += gap;
                minHeight += gap;
              }
            }
          }
        }
        else
        {
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

              if (i < (length-1))
              {
                width += gap;
                minWidth += gap;
              }
            }
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
