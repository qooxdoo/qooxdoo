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
     * Sets the text widget of the atom layout. If the text is <code>null</code>,
     * the text is removed from the layout.
     *
     * @param text {qx.ui.core.Widget|null} The text widget.
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

      var align = this.getAlign();
      var children;

      if (align == "top" || align == "left") {
        children = [this._icon, this._text];
      }

      if (align == "bottom" || align == "right") {
        children = [this._text, this._icon];
      }

      var left, top, width, height;
      var child, hint;

      if (align == "top" || align == "bottom")
      {
        // vertical
        top = 0;
        for (var i=0,l=children.length; i<l; i++)
        {
          child = children[i];
          if (!child) {
            continue;
          }

          hint = child.getSizeHint();
          if (child == this._text) {
            width = Math.max(hint.minWidth, Math.min(hint.width, availWidth));
          } else {
            width = hint.width;
          }

          left = Util.computeHorizontalAlignOffset("center", width, availWidth);
          child.renderLayout(left, top, width, hint.height);

          top += this.getGap() + hint.height;
        }
      }
      else
      {
        // horizontal
        left = 0;
        for (var i=0,l=children.length; i<l; i++)
        {
          var child = children[i];
          if (!child) {
            continue;
          }

          hint = child.getSizeHint();
          if (child == this._text) {
            width = Math.max(hint.minWidth, Math.min(hint.width, availWidth));
          } else {
            width = hint.width;
          }

          top = Util.computeVerticalAlignOffset("middle", hint.height, availHeight);
          child.renderLayout(left, top, width, hint.height);

          left += this.getGap() + width;
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

        var align = this.getAlign();
        var gap = this.getGap();

        if (align === "top" || align === "bottom")
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
