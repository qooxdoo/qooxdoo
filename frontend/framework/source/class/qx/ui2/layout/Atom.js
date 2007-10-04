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
    invalidate : function()
    {
      if (this._sizeHint)
      {
        this.debug("Clear layout cache");
        this._sizeHint = null;
      }
    },

    // overridden
    layout : function(width, height)
    {


    },

    getSizeHint : function()
    {
      if (this._sizeHint) {
        return this._sizeHint;
      }

      var minWidth=0, width=0, maxWidth=0;
      var minHeight=0, height=0, maxHeight=32000;

      // Add icon


      // Add text


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




  }
});
