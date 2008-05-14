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
     * Jonathan Rass (jonathan_rass)

************************************************************************ */

/**
 * A atom layout. Used to place an image and label in relation
 * to each other. Useful to create buttons, list items, etc.
 *
 * *Features*
 *
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
qx.Class.define("qx.ui.layout.Split",
{
  extend : qx.ui.layout.Abstract,




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** The position of the icon in relation to the text */
    align :
    {
      check : [ "vertical", "horizontal" ],
      init : "vertical",
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
      "on" : function(item, name, value)
      {
        this.assert(name == "mode" || name == "size", "The property '"+name+"' is not supported by the split layout!");
        // TODO
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

      var start = 0;
      var end = length;
      var increment = 1;

      var left, top, width, height;
      var child, hint;

      // vertical
      if (align == "vertical")
      {
        top = 0;
        for (var i=start; i!=end; i+=increment)
        {
          child = children[i];

          hint = child.getSizeHint();
          width = Math.min(hint.maxWidth, Math.max(availWidth, hint.minWidth));

          left = Util.computeHorizontalAlignOffset("center", width, availWidth);
          child.renderLayout(left, top, width, hint.height);

          top += hint.height;
        }
      }

      // horizontal
      else
      {
        left = 0;
        for (var i=start; i!=end; i+=increment)
        {
          child = children[i];

          hint = child.getSizeHint();
          height = Math.min(hint.maxHeight, Math.max(availHeight, hint.minHeight));

          top = Util.computeVerticalAlignOffset("middle", hint.height, availHeight);
          child.renderLayout(left, top, hint.width, height);

          left += hint.width;
        }
      }
    },


    // overridden
    _computeSizeHint : function()
    {
      var children = this._getLayoutChildren();
      var length = children.length;
      var hint, result, child;

      var minWidth=0, width=0;
      var minHeight=0, height=0;

      var align = this.getAlign();

      for (var i=0; i<length; i++)
      {
        hint = children[i].getSizeHint();

        // Max of widths
        width = Math.max(width, hint.width);
        minWidth = Math.max(minWidth, hint.minWidth);

        // Sum of heights
        height += hint.height;
        minHeight += hint.minHeight;
      }

      // Build hint
      result = {
        minWidth : minWidth,
        width : width,
        minHeight : minHeight,
        height : height
      };

      return result;
    }
  }
});
