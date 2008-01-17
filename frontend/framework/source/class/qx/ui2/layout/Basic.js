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
      var child, childHint, childLeft, childTop;

      for (var i=0, l=children.length; i<l; i++)
      {
        child = children[i];

        // Only (re-)render modified children
        if (!child.hasValidLayout())
        {
          childHint = child.getSizeHint();

          childLeft = Math.max(0, child.getLayoutProperty("basic.left") || 0);
          childTop = Math.max(0, child.getLayoutProperty("basic.top") || 0);

          child.renderLayout(childLeft, childTop, childHint.width, childHint.height);
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
      var child, childHint, childLeft, childTop;
      var childWidth=0, childHeight=0;


      // Iterate over children
      for (var i=0, l=children.length; i<l; i++)
      {
        child = children[i];

        childHint = child.getSizeHint();
        childLeft = child.getLayoutProperty("basic.left") || 0;
        childTop = child.getLayoutProperty("basic.top") || 0;

        childWidth = Math.max(childWidth, childLeft + childHint.width);
        childHeight = Math.max(childHeight, childTop + childHint.height);
      }


      // Limit dimensions to min/max dimensions
      childWidth = Math.max(Math.min(childWidth, childHint.maxWidth), childHint.minWidth);
      childHeight = Math.max(Math.min(childHeight, childHint.maxHeight), childHint.minHeight);


      // Build hint
      var hint = {
        minWidth : childWidth,
        width : childWidth,
        maxWidth : 32000,
        minHeight : childHeight,
        height : childHeight,
        maxHeight : 32000
      };


      // Return hint
      this.debug("Computed size hint: ", hint);
      return this._sizeHint = hint;
    },





    /*
    ---------------------------------------------------------------------------
      LAYOUT PROPERTIES: LOCATION: LEFT
    ---------------------------------------------------------------------------
    */

    /**
     * Sets the left position on the layout.
     *
     * @type member
     * @param widget {qx.ui2.core.Widget} Widget to modify
     * @param value {Integer} The left position to apply
     * @return {qx.ui2.layout.Basic} This layout (for chaining support)
     */
    setLeft : function(widget, value)
    {
      widget.addLayoutProperty("basic.left", value);

      // Chaining support
      return this;
    },


    /**
     * Resets the left position on the layout.
     *
     * @type member
     * @param widget {qx.ui2.core.Widget} Widget to modify
     * @return {qx.ui2.layout.Basic} This layout (for chaining support)
     */
    resetLeft : function(widget)
    {
      widget.removeLayoutProperty("basic.left");

      // Chaining support
      return this;
    },


    /**
     * Returns the currently configured left position on the layout.
     *
     * @type member
     * @param widget {qx.ui2.core.Widget} Widget to query
     * @return {Integer} The currently configured left position
     */
    getLeft : function(widget) {
      return widget.getLayoutProperty("basic.left");
    },





    /*
    ---------------------------------------------------------------------------
      LAYOUT PROPERTIES: LOCATION: TOP
    ---------------------------------------------------------------------------
    */

    /**
     * Sets the top position on the layout.
     *
     * @type member
     * @param widget {qx.ui2.core.Widget} Widget to modify
     * @param value {Integer} The top position to apply
     * @return {qx.ui2.layout.Basic} This layout (for chaining support)
     */
    setTop : function(widget, value)
    {
      widget.addLayoutProperty("basic.top", value);

      // Chaining support
      return this;
    },


    /**
     * Resets the top position on the layout.
     *
     * @type member
     * @param widget {qx.ui2.core.Widget} Widget to modify
     * @return {qx.ui2.layout.Basic} This layout (for chaining support)
     */
    resetTop : function(widget)
    {
      widget.removeLayoutProperty("basic.top");

      // Chaining support
      return this;
    },


    /**
     * Returns the currently configured top position on the layout.
     *
     * @type member
     * @param widget {qx.ui2.core.Widget} Widget to query
     * @return {Integer} The currently configured top position
     */
    getTop : function(widget) {
      return widget.getLayoutProperty("basic.top");
    }
  }
});
