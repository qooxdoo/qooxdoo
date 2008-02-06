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
 * A atom layout. Used to place an Image/Flash and label in relation
 * to each other. Useful to create buttons etc.
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
    iconPosition :
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
    /**
     * Sets the icon widget of the atom layout. If the icon is <code>null</code>,
     * the icon is removed from the layout.
     *
     * @param icon {qx.ui.core.Widget|null} The icon widget.
     */
    setIcon : function(icon)
    {
      if (this._icon) {
        this._removeHelper(this._icon);
      }

      if (icon) {
        this.add(icon);
      }

      this._icon = icon;
    },


    /**
     * Sets the text widget of the atom layout. If the icon is <code>null</code>,
     * the icon is removed from the layout.
     *
     * @param icon {qx.ui.core.Widget|null} The icon widget.
     */
    setText : function(text)
    {
      if (this._text) {
        this._removeHelper(this._text);
      }

      if (text) {
        this.add(text);
      }

      this._text = text;
    },





    /*
    ---------------------------------------------------------------------------
      LAYOUT INTERFACE
    ---------------------------------------------------------------------------
    */

    // overridden
    renderLayout : function(availWidth, availHeight)
    {
      var Util = qx.ui.layout.Util;

      var iconPosition = this.getIconPosition();
      var children;

      if (iconPosition == "top" || iconPosition == "left") {
        children = [this._icon, this._text];
      }

      if (iconPosition == "bottom" || iconPosition == "right") {
        children = [this._text, this._icon];
      }

      if (iconPosition == "top" || iconPosition == "bottom")
      {
        // vertical
        var top = 0;
        for (var i=0,l=children.length; i<l; i++)
        {
          var child = children[i];
          if (!child) {
            continue;
          }
          var childHint = child.getSizeHint();

          if (child == this._text) {
            var childWidth = Math.max(childHint.minWidth, Math.min(childHint.width, availWidth));
          } else {
            childWidth = childHint.width;
          }
          var childHeight = childHint.height;
          var childLeft = Util.computeHorizontalAlignOffset("center", childWidth, availWidth);

          child.renderLayout(childLeft, top, childWidth, childHeight);

          top += this.getGap() + childHeight;
        }
      }
      else
      {
        // horizontal
        var left = 0;
        for (var i=0,l=children.length; i<l; i++)
        {
          var child = children[i];
          if (!child) {
            continue;
          }
          var childHint = child.getSizeHint();

          if (child == this._text) {
            var childWidth = Math.max(childHint.minWidth, Math.min(childHint.width, availWidth));
          } else {
            childWidth = childHint.width;
          }
          var childTop = Util.computeVerticalAlignOffset("middle", childHint.height, availHeight);

          child.renderLayout(left, childTop, childWidth, childHint.height);

          left += this.getGap() + childWidth;
        }
      }
    },


    // overridden
    _computeSizeHint : function()
    {
      var hint;

      if (this._icon && this._text)
      {
        var minWidth=0, width=0, maxWidth=0;
        var minHeight=0, height=0, maxHeight=0;

        var iconHint = this._icon.getSizeHint();
        var textHint = this._text.getSizeHint();

        var iconPosition = this.getIconPosition();
        var gap = this.getGap();

        if (iconPosition === "top" || iconPosition === "bottom")
        {
          // Max of text and icon
          width = Math.max(iconHint.width, textHint.width);
          minWidth = Math.max(iconHint.minWidth, textHint.minWidth);

          // Sum of text, icon and gap
          height = iconHint.height + textHint.height + gap;
          minHeight = iconHint.minHeight + textHint.minHeight + gap;
        }
        else
        {
          // Max of text and icon
          height = Math.max(iconHint.height, textHint.height);
          minHeight = Math.max(iconHint.minHeight, textHint.minHeight);

          // Sum of text, icon and gap
          width = iconHint.width + textHint.width + gap;
          minWidth = iconHint.minWidth + textHint.minWidth + gap;
        }


        // Limit to integer and min/max range
        /*
        minWidth = Math.min(Math.max(0, minWidth));
        width = Math.min(minWidth, Math.max(0, width, maxWidth));
        minHeight = Math.min(Math.max(0, minHeight));
        height = Math.min(minHeight, Math.max(0, height, maxHeight));
        */


        // Build hint
        hint = {
          minWidth : minWidth,
          width : width,
          maxWidth : Infinity,
          minHeight : minHeight,
          height : height,
          maxHeight : Infinity
        };
      }
      else if (this._icon)
      {
        hint = this._icon.getSizeHint();
      }
      else if (this._text)
      {
        hint = this._text.getSizeHint();
      }
      else
      {
        hint = {
          minWidth : 0,
          width : 0,
          maxWidth : Infinity,
          minHeight : 0,
          height : 0,
          maxHeight : Infinity
        };
      }

      return hint;
    }
  }
});
