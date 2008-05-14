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
 * ...
 *
 * *Features*
 *
 * * ...
 *
 * *Item Properties*
 *
 * None
 *
 * *Notes*
 *
 * * ...
 *
 * *External Documentation*
 *
 * <a href='http://qooxdoo.org/documentation/0.8/layout/split'>
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
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(orientation)
  {
    this.base(arguments);

    this.__orientation = (orientation == "vertical") ? "vertical" : "horizontal";
  },





  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */





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

      var children = this._getLayoutChildren();
      var length = children.length;

      var start = 0;
      var end = length;
      var increment = 1;

      var left, top, width, height;
      var child, hint;

      // vertical
      if (this.__orientation === "vertical")
      {
        top = 0;
        for (var i=start; i!=end; i+=increment)
        {
          child = children[i];

          hint = child.getSizeHint();
          
          console.info(i, hint)
          
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
      var hint, result, child, i;
      var flexibles = [];
      var flexOffsets;
      
      var minWidth=0, width=0;
      var minHeight=0, height=0;

      var allocatedWidth = 0, allocatedHeight = 0;

      if (this.__orientation === "horizontal")
      {
        for (i=0; i<length; i++)
        {
          hint = children[i].getSizeHint();
          var props = children[i].getLayoutProperties();

          if (props.size != null)
          {
            if (typeof props.size == "number")
            {
              // Sum of widths
              width += props.size;
              minWidth += props.size;
            }
            else
            {
              // Sum of widths
              width += hint.width;
              minWidth += hint.minWidth;
            }
          }

          // Max of heights
          height = Math.max(height, hint.height);
          minHeight = Math.max(minWidth, hint.minHeight);
        }
      }
      else
      {
        for (i=0; i<length; i++)
        {
          hint = children[i].getSizeHint();
          var props = children[i].getLayoutProperties();

          if (props.size != null)
          {
            if (typeof props.size == "number")
            {
              // Sum of heights
              height += props.size;
              minHeight += props.size;
            }
            else
            {
              // Sum of heights
              height += hint.height;
              minHeight += hint.minHeight;
            }
          }

          // Max of widths
          width = Math.max(width, hint.width);
          minWidth = Math.max(minWidth, hint.minWidth);
        }
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
