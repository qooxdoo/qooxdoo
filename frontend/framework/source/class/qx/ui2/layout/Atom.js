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
      init : 4
    },


    /** The position of the icon in relation to the text */
    iconPosition :
    {
      check : [ "left", "top", "right", "bottom" ],
      init : "left"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    setIcon : function(icon) {
      this._icon = icon;
    },

    setText : function(text) {
      this._text = text;
    },





    /*
    ---------------------------------------------------------------------------
      LAYOUT INTERFACE
    ---------------------------------------------------------------------------
    */

    // overridden
    invalidateLayoutCache : function()
    {
      if (this._sizeHint)
      {
        this.debug("Clear layout cache");
        this._sizeHint = null;
      }
    },

    // overridden
    renderLayout : function(width, height)
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

        childWidth = Math.max(0, childHint.minWidth, Math.min(childHint.width, childHint.maxWidth, 32000));
        childHeight = Math.max(0, childHint.minHeight, Math.min(childHint.height, childHint.maxHeight, 32000));

        childLeft = Math.round((width - childWidth) / 2);
        childTop = Math.round((height - childHeight) / 2);

        child.renderLayout(childLeft, childTop, childWidth, childHeight);
      }
    },

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
          maxWidth = Math.min(iconHint.maxWidth, textHint.maxWidth);

          // Sum of text, icon and gap
          height = iconHint.height + textHint.height + gap;
          minHeight = iconHint.minHeight + textHint.minHeight + gap;
          maxHeight = iconHint.maxHeight + textHint.maxHeight + gap;
        }
        else
        {
          // Max of text and icon
          height = Math.max(iconHint.height, textHint.height);
          minHeight = Math.max(iconHint.minHeight, textHint.minHeight);
          maxHeight = Math.min(iconHint.maxHeight, textHint.maxHeight);

          // Sum of text, icon and gap
          width = iconHint.width + textHint.width + gap;
          minWidth = iconHint.minWidth + textHint.minWidth + gap;
          maxWidth = iconHint.maxWidth + textHint.maxWidth + gap;
        }


        // Limit to integer and min/max range
        minWidth = Math.min(32000, Math.max(0, minWidth));
        maxWidth = Math.min(32000, Math.max(0, maxWidth));
        width = Math.min(32000, minWidth, Math.max(0, width, maxWidth));
        minHeight = Math.min(32000, Math.max(0, minHeight));
        maxHeight = Math.min(32000, Math.max(0, maxHeight));
        height = Math.min(32000, minHeight, Math.max(0, height, maxHeight));


        // Build hint
        hint = {
          minWidth : minWidth,
          width : width,
          maxWidth : maxWidth,
          minHeight : minHeight,
          height : height,
          maxHeight : maxHeight
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
