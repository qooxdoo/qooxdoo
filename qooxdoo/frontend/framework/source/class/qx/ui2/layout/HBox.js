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

      this._addToParent(widget);
    },

    _addFlexOffsets : function(availWidth, childWidths)
    {
      var hint = this.getSizeHint();
      var diff = availWidth - hint.width;

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
              potential : diff > 0 ? hint.maxWidth - childWidths[i] : childWidths[i] - hint.minWidth,
              flex : childFlex || 1
            });
          }
        }
      }

      var offsets = qx.ui2.layout.Util.computeFlexOffsets(flexibles, diff);

      for (var i=0, l=flexibles.length; i<l; i++) {
        childWidths[i] += offsets[i];
      }
    },


    // overridden
    layout : function(availWidth, availHeight)
    {
      // Initialize
      var left = 0;
      var children = this._children;
      var child;


      // Preprocess children width data
      var childWidths = [];
      for (var i=0, l=children.length; i<l; i++) {
        childWidths[i] = children[i].getSizeHint().width;
      }

      this._addFlexOffsets(availWidth, childWidths);


      // Iterate
      var spacing = this.getSpacing();
      for (var i=0, l=children.length; i<l; i++)
      {
        child = children[i];

        if (left < availWidth)
        {
          child.layout(left, 0, childWidths[i], child.getSizeHint().height);
          child.include();
        }
        else
        {
          child.exclude();
        }

        left += childWidths[i] + spacing;
      }
    },

    // overridden
    invalidate : function()
    {
      if (this._sizeHint)
      {
        this.debug("Clear layout cache");
        this._sizeHint = null;
      }
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


      // Limit to integer range
      minWidth = Math.min(32000, Math.max(0, minWidth));
      width = Math.min(32000, Math.max(0, width));
      maxWidth = Math.min(32000, Math.max(0, maxWidth));

      minHeight = Math.min(32000, Math.max(0, minHeight));
      height = Math.min(32000, Math.max(0, height));
      maxHeight = Math.min(32000, Math.max(0, maxHeight));


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