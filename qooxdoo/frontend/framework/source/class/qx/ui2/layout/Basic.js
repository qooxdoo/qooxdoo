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
 * A basic layout, which supports positioning of child widgets by static
 * left/top coordinates. This layout is extremely basic but should also
 * perform best and is the ideal candidate for all animations and things
 * like this.
 *
 * Supports:
 *
 * * Integer dimensions (using widget properties)
 * * Integer locations (using layout properties)
 * * Min and max dimensions (using widget properties)
 *
 * Does not:
 *
 * * Shrink or grow children automatically depending on the available space
 * * Support other than integer units
 *
 * Notes:
 *
 * * Does not support flex factors (recommended width/height is used)
 * * The default min size of a basic layout is the same as its preferred size and ensures that all child widgets are visible and have their preferred size.
 */
qx.Class.define("qx.ui2.layout.Basic",
{
  extend : qx.ui2.layout.Abstract,



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
    invalidateLayoutCache : function()
    {
      if (this._sizeHint) {
        this._sizeHint = null;
      }
    },


    // overridden
    renderLayout : function(parentWidth, parentHeight)
    {
      var children = this.getChildren();
      var child, size, layout;

      for (var i=0, l=children.length; i<l; i++)
      {
        child = children[i];

        size = child.getSizeHint();
        layout = this._layoutProperties[child.toHashCode()];

        child.renderLayout(layout.left || 0, layout.top || 0, size.width, size.height);
      }
    },


    // overridden
    getSizeHint : function()
    {
      if (this._sizeHint) {
        return this._sizeHint;
      }

      var children = this.getChildren();
      var child, layout, size;
      var neededWidth=0, neededHeight=0;


      // Iterate over children
      for (var i=0, l=children.length; i<l; i++)
      {
        child = children[i];

        layout = this._layoutProperties[child.toHashCode()];
        size = child.getSizeHint();

        neededWidth = Math.max(neededWidth, (layout.left || 0) + size.width);
        neededHeight = Math.max(neededHeight, (layout.top || 0) + size.height);
      }


      // Limit needed dimensions
      if (neededWidth > 32000) {
        neededWidth = 32000;
      }

      if (neededHeight > 32000) {
        neededHeight = 32000;
      }


      // Build hint
      var hint = {
        minWidth : 0,
        width : neededWidth,
        maxWidth : 32000,
        minHeight : 0,
        height : neededHeight,
        maxHeight : 32000
      };


      // Return hint
      return this._sizeHint = hint;
    }
  }
});
