/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("qx.ui2.layout.HBox",
{
  extend : qx.ui2.layout.AbstractLayout,






  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    this._children = [];
    this._sizeHint = null;
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    spacing :
    {
      check : "Integer",
      init : 5
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // overridden
    add : function(widget, hFlex, vAlign)
    {
      this._children.push(widget);

      if (hFlex != null) {
        widget.addLayoutProperty("hFlex", hFlex);
      }

      if (vAlign != null) {
        widget.addLayoutProperty("vAlign", vAlign);
      }
    },

    // overridden
    remove : function(widget) {
      qx.lang.Array.remove(this._children, widget);
    },

    // overridden
    getChildren : function() {
      return this._children;
    },


    _getFlexOffsets : function(width, height)
    {
      var hint = this.getSizeHint();
      var diff = width - hint.width;

      console.debug("Flex offsets diff: " + diff + " (" + width + " != " + hint.width + ")");

      if (diff == 0) {
        return {};
      }

      // collect all flexible children
      var children = this._children;
      var flexibles = [];

      for (var i=0, l=children.length; i<l; i++)
      {
        child = children[i];

        if (child.canStretchX())
        {
          childFlex = child.getLayoutProperty("hFlex");

          if (childFlex == null || childFlex > 0)
          {
            hint = child.getSizeHint();

            flexibles.push({
              id : i,
              potential : diff > 0 ? hint.maxWidth - hint.width : hint.width - hint.minWidth,
              flex : child.getLayoutProperty("hFlex") || 1
            });
          }
        }
      }

      return qx.ui2.layout.Util.computeFlexOffsets(flexibles, diff);
    },


    // overridden
    layout : function(width, height)
    {
      var left = 0;
      var top = 0;

      var spacing = this.getSpacing();
      var offsets = this._getFlexOffsets(width, height);

      var children = this._children;
      var child, childHint, childOffset;

      for (var i=0, l=children.length; i<l; i++)
      {
        child = children[i];
        childHint = child.getSizeHint();
        childOffset = offsets[i] || 0;

        if (left < width)
        {
          child.layout(left, top, childHint.width + childOffset, childHint.height);
          child.include();
        }
        else
        {
          child.exclude();
        }

        left += childHint.width + childOffset + spacing;
      }
    },

    // overridden
    invalidate : function()
    {
      this.debug("Clear layout cache.");

      this._preferredWidth = null;
      this._preferredHeight = null;
    },


    // overridden
    invalidate : function()
    {
      this.debug("Clear layout cache.");
      this._sizeHint = null;
    },

    // overridden
    getSizeHint : function()
    {
      if (this._sizeHint) {
        return this._sizeHint;
      }

      // Start with spacing
      var spacing = this.getSpacing() * (this._children.length - 1);


      // Initialize
      var minWidth=spacing, width=spacing, maxWidth=spacing;
      var minHeight=0, height=0, maxHeight=32000;


      // Iterate
      // - sum children width
      // - find max heights
      for (var i=0, l=this._children.length; i<l; i++)
      {
        var child = this._children[i];
        var childHint = child.getSizeHint();

        minWidth += childHint.minWidth;
        width += childHint.width;
        maxWidth += childHint.maxWidth;

        minHeight = Math.max(minHeight, childHint.minHeight);
        height = Math.max(height, childHint.height);
        maxHeight = Math.min(maxHeight, childHint.maxHeight);
      }


      // Limit integer range
      minWidth = Math.max(0, minWidth);
      maxWidth = Math.min(32000, maxWidth);


      // Build hint
      var hint = {
        minWidth : minWidth,
        width : width,
        maxWidth : maxWidth,
        minHeight : minHeight,
        height : height,
        maxHeight : maxHeight
      };

      this.debug("Compute size hint: ", hint);
      this._sizeHint = hint;

      return hint;
    }

  },




  /*
  *****************************************************************************
     DESTRUCT
  *****************************************************************************
  */

  destruct : function()
  {


  }
});