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
      var spaceDifference = width - hint.width;

      this.debug("Space difference: " + spaceDifference);

      if (spaceDifference == 0) {
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
              id : child.toHashCode(),
              potential : spaceDifference > 0 ? hint.maxWidth - hint.width : hint.width - hint.minWidth,
              flex : child.getLayoutProperty("hFlex") || 1
            });
          }
        }
      }

      return this._computeFlexOffsets(flexibles, spaceDifference);
    },

    _computeFlexOffsets : function(flexibles, spaceDifference)
    {
      var fillUp = spaceDifference > 0;
      var remaining = Math.abs(spaceDifference);

      // Initialialize return field
      var flexOffsets = {};
      for (var i=0, l=flexibles.length; i<l; i++) {
        flexOffsets[flexibles[i].id] = 0;
      }


      while (flexibles.length > 0 && remaining != 0)
      {
        qx.core.Log.debug("!! Flex loop, remaining space: " + remaining);

        var minFlexUnit = 32000;
        var minEntry;
        var flexCount = 0;
        var flexLength = flexibles.length;
        var hasFlexPotential = false;

        for (var i=0; i<flexLength; i++)
        {
          child = flexibles[i];

          if (child.potential == 0) {
            continue;
          }

          hasFlexPotential = true;

          flexCount += child.flex;
          flexUnit = child.potential / child.flex; // pixel per flex unit

          qx.core.Log.debug("  - potential: " + child.potential + ", flex unit: " + flexUnit);

          if (flexUnit < minFlexUnit) {
            minFlexUnit = flexUnit;
          }
        }

        if (!hasFlexPotential) {
          break;
        }

        qx.core.Log.debug("Min Flex Unit: " + minFlexUnit);

        pixelIncrement = minFlexUnit * flexCount // pixel to grow
        pixelTodo = Math.min(remaining, pixelIncrement);
        minFlexUnit = pixelTodo / flexCount; // corrected flex unit minimum
        childRounding = 0;

        qx.core.Log.debug("Pixel to grow: " + pixelIncrement);
        qx.core.Log.debug("Pixel todo: " + pixelTodo);
        qx.core.Log.debug("Corrected minFlexUnit: " + minFlexUnit);

        var roundingError = 0;

        for (var i=flexLength-1; i>=0; i--)
        {
          child = flexibles[i];

          if (child.potential == 0) {
            continue;
          }

          childGrow = Math.min(remaining, child.potential, Math.ceil(minFlexUnit * child.flex));
          roundingError += childGrow - (minFlexUnit * child.flex);

          if (roundingError >= 1)
          {
            roundingError -= 1;
            childGrow -= 1;
          }

          qx.core.Log.debug("Rounding error: ", roundingError);

          flexOffsets[child.id] += (fillUp ? childGrow : -childGrow);

          child.potential -= childGrow;
          remaining -= childGrow;

          qx.core.Log.debug("  - grow by: " + childGrow + " (potential: " + child.potential + ")");
        }
      }

      return flexOffsets;
    },


    // overridden
    layout : function(width, height)
    {
      var left = 0;
      var top = 0;

      var spacing = this.getSpacing();

      var flexOffsets = this._getFlexOffsets(width, height);

      var children = this._children;
      var child, childHint;

      for (var i=0, l=children.length; i<l; i++)
      {
        child = children[i];
        childHint = child.getSizeHint();
        childOffset = flexOffsets[child.toHashCode()] || 0;

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
      if (this._sizeHint != null)
      {
        this.debug("Cached size hint: ", this._sizeHint);
        return this._sizeHint;
      }

      var minWidth=0, width=0, maxWidth=0;
      var minHeight=0, height=0, maxHeight=0;

      for (var i=0, l=this._children.length; i<l; i++)
      {
        var child = this._children[i];
        var childHint = child.getSizeHint();

        minWidth += childHint.minWidth;
        width += childHint.width;
        maxWidth += childHint.maxWidth;

        minHeight = Math.max(minHeight, childHint.minHeight);
        height = Math.max(height, childHint.height);
        maxHeight = Math.max(maxHeight, childHint.maxHeight);
      }

      var spacing = this.getSpacing() * (this._children.length - 1);
      var hint = {
        minWidth : minWidth + spacing,
        width : width + spacing,
        maxWidth : maxWidth + spacing,
        minHeight : minHeight,
        height : height,
        maxHeight : maxHeight
      };

      this.debug("Computed size hint: ", hint);
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