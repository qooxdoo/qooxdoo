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
     STATICS
  *****************************************************************************
  */

  statics :
  {
    LAYOUT_DEFAULTS : {
      left : 0,
      top : 0
    }
  },




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
      if (this._sizeHint)
      {
        this.debug("Clear layout cache");
        this._sizeHint = null;
      }
    },


    // overridden
    renderLayout : function(width, height)
    {
      var children = this.getChildren();
      var child, childProps;

      for (var i=0, l=children.length; i<l; i++)
      {
        child = children[i];

        // Only (re-)render modified children
        if (!child.hasValidLayout())
        {
          childProps = this._getChildProperties(child);
          child.renderLayout(childProps.left, childProps.top, childProps.width, childProps.height);
        }
      }
    },


    // overridden
    getSizeHint : function()
    {
      if (this._sizeHint)
      {
        this.debug("Cached size hint: ", this._sizeHint);
        return this._sizeHint;
      }

      var children = this.getChildren();
      var childProps;
      var childMaxNeededWidth=0, childMaxNeededHeight=0;


      // Iterate over children
      for (var i=0, l=children.length; i<l; i++)
      {
        childProps = this._getChildProperties(children[i]);

        childMaxNeededWidth = Math.max(0, childMaxNeededWidth, childProps.left + childProps.width);
        childMaxNeededHeight = Math.max(0, childMaxNeededHeight, childProps.top + childProps.height);
      }


      // Limit needed dimensions
      if (childMaxNeededWidth > 32000) {
        childMaxNeededWidth = 32000;
      }

      if (childMaxNeededHeight > 32000) {
        childMaxNeededHeight = 32000;
      }


      // Build hint
      var hint = {
        minWidth : 0,
        width : childMaxNeededWidth,
        maxWidth : 32000,
        minHeight : 0,
        height : childMaxNeededHeight,
        maxHeight : 32000
      };


      // Return hint
      this.debug("Computed size hint: ", hint);
      return this._sizeHint = hint;
    }
  }
});
