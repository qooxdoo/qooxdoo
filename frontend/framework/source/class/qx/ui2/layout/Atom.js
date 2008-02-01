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
qx.Class.define("qx.ui2.layout.Atom",
{
  extend : qx.ui2.layout.Abstract,




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
    setIcon : function(icon)
    {
      if (this._icon) {
        this._removeHelper(icon);
      }
      this._addHelper(icon);

      this._icon = icon;
    },


    setText : function(text)
    {
      if (this._text) {
        this._removeHelper(_text);
      }
      this._addHelper(text);

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
      var child, childHint;
      var childWidth, childHeight, childLeft, childTop;

      if (this._icon && this._text)
      {
        child = this._icon;
        child.renderLayout(childLeft, childTop, childWidth, childHeight);


        child = this._text;
        child.renderLayout(childLeft, childTop, childWidth, childHeight);
      }
      else if (this._text || this._icon)
      {
        child = this._text || this._icon;

        childHint = child.getSizeHint();

        childWidth = Math.max(0, childHint.minWidth, Math.min(childHint.width, childHint.maxWidth));
        childHeight = Math.max(0, childHint.minHeight, Math.min(childHint.height, childHint.maxHeight));

        childLeft = Math.round((availWidth - childWidth) / 2);
        childTop = Math.round((availHeight - childHeight) / 2);

        child.renderLayout(childLeft, childTop, childWidth, childHeight);
      }
    },


    // overridden
    getSizeHint : function()
    {
      if (this._sizeHint) {
        return this._sizeHint;
      }

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
        minWidth = Math.min(Math.max(0, minWidth));
        width = Math.min(minWidth, Math.max(0, width, maxWidth));
        minHeight = Math.min(Math.max(0, minHeight));
        height = Math.min(minHeight, Math.max(0, height, maxHeight));


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

      this.debug("Compute size hint: ", hint);
      this._sizeHint = hint;

      return hint;
    }
  }
});
