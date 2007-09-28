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
 * Advanced canvas layout. Children will be positioned by coordinates
 * which should be given by the user.
 *
 * Supports:
 *
 * * Integer dimensions (using widget properties)
 * * Integer locations (using layout properties)
 * * Percent dimensions and locations (using layout properties)
 * * Stretching between left+right and top+bottom
 * * Min and max dimensions (using widget properties)
 *
 * Notes:
 *
 * * Stretching has a higher priority than the preferred dimensions
 * * Stretching has a lower priority than the min/max dimensions.
 */
qx.Class.define("qx.ui2.layout.Canvas",
{
  extend : qx.ui2.layout.Basic,






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
    add : function(widget, left, top, right, bottom)
    {
      this.base(arguments, widget);
      this._importProperties(widget, arguments, "left", "top", "right", "bottom");
    },


    // overridden
    layout : function(availWidth, availHeight)
    {
      var children = this.getChildren();
      var child, childHint;
      var childLeft, childTop, childRight, childBottom;
      var childWidth, childHeight;
      var percent = /[0-9.]+%/;

      for (var i=0, l=children.length; i<l; i++)
      {
        child = children[i];

        childHint = child.getSizeHint();


        // Processing location data
        childLeft = child.getLayoutProperty("left");
        childTop = child.getLayoutProperty("top");
        childRight = child.getLayoutProperty("right");
        childBottom = child.getLayoutProperty("bottom");

        if (typeof childLeft === "string" && percent.test(childLeft)) {
          childLeft = Math.round(parseFloat(childLeft) * availWidth / 100);
        } else if (childLeft != null && typeof childLeft !== "number") {
          throw new Error("Could not parse percent value for left position: " + childLeft);
        }

        if (typeof childTop === "string" && percent.test(childTop)) {
          childTop = Math.round(parseFloat(childTop) * availHeight / 100);
        } else if (childTop != null && typeof childTop !== "number") {
          throw new Error("Could not parse percent value for top position: " + childTop);
        }

        if (typeof childRight === "string" && percent.test(childRight)) {
          childRight = Math.round(parseFloat(childRight) * availWidth / 100);
        } else if (childRight != null && typeof childRight !== "number") {
          throw new Error("Could not parse percent value for right position: " + childRight);
        }

        if (typeof childBottom === "string" && percent.test(childBottom)) {
          childBottom = Math.round(parseFloat(childBottom) * availHeight / 100);
        } else if (childBottom != null && typeof childBottom !== "number") {
          throw new Error("Could not parse percent value for bottom position: " + childBottom);
        }


        // Processing dimension data
        childWidth = child.getLayoutProperty("width");
        childHeight = child.getLayoutProperty("height");

        if (typeof childWidth === "string" && percent.test(childWidth)) {
          childWidth = Math.round(parseFloat(childWidth) * availWidth / 100);
        } else if (childWidth != null) {
          throw new Error("Could not parse percent value for width: " + childWidth);
        } else {
          childWidth = childHint.width;
        }

        if (typeof childHeight === "string" && percent.test(childHeight)) {
          childHeight = Math.round(parseFloat(childHeight) * availHeight / 100);
        } else if (childHeight != null) {
          throw new Error("Could not parse percent value for width: " + childHeight);
        } else {
          childHeight = childHint.height;
        }


        // Normalize right
        if (childRight != null)
        {
          if (childLeft != null) {
            childWidth = availWidth - childLeft - childRight;
          } else if (childWidth != null) {
            childLeft = availWidth - childWidth - childRight;
          } else {
            throw new Error("Could not lay out child (width missing): ", child);
          }
        }


        // Normalize bottom
        if (childBottom != null)
        {
          if (childTop != null) {
            childHeight = availHeight - childTop - childBottom;
          } else if (childHeight != null) {
            childTop = availHeight - childHeight - childBottom;
          } else {
            throw new Error("Could not lay out child (height missing): ", child);
          }
        }



        // Limit dimensions TODO (min/max)



        // Layout child
        child.layout(childLeft, childTop, childWidth, childHeight);
      }
    },




    /*
    ---------------------------------------------------------------------------
      LAYOUT PROPERTIES: DIMENSION
    ---------------------------------------------------------------------------
    */

    /**
     * Sets the width of the given widget.
     * Supports percent values (string). For integer values please
     * use the <code>width</code> property of the widget itself.
     *
     * @type member
     * @param widget {qx.ui2.core.Widget} Widget to modify
     * @param value {String} The width to apply
     * @return {qx.ui2.layout.Abstract} This layout (for chaining support)
     */
    setWidth : function(widget, value)
    {
      widget.addLayoutProperty("width", value);
      return this;
    },


    /**
     * Resets the width of the given widget.
     *
     * @type member
     * @param widget {qx.ui2.core.Widget} Widget to modify
     * @return {qx.ui2.layout.Abstract} This layout (for chaining support)
     */
    resetWidth : function(widget)
    {
      widget.removeLayoutProperty("width");
      return this;
    },


    /**
     * Returns the currently configured width of the given widget.
     *
     * @type member
     * @param widget {qx.ui2.core.Widget} Widget to query
     * @return {String|null} The currently configured width
     */
    getWidth : function(widget) {
      return widget.getLayoutProperty("width");
    },


    /**
     * Sets the height of the given widget.
     * Supports percent values (string). For integer values please
     * use the <code>height</code> property of the widget itself.
     *
     * @type member
     * @param widget {qx.ui2.core.Widget} Widget to modify
     * @param value {String} The height to apply
     * @return {qx.ui2.layout.Abstract} This layout (for chaining support)
     */
    setHeight : function(widget, value)
    {
      widget.addLayoutProperty("height", value);
      return this;
    },


    /**
     * Resets the height of the given widget.
     *
     * @type member
     * @param widget {qx.ui2.core.Widget} Widget to modify
     * @return {qx.ui2.layout.Abstract} This layout (for chaining support)
     */
    resetHeight : function(widget)
    {
      widget.removeLayoutProperty("height");
      return this;
    },


    /**
     * Returns the currently configured height of the given widget.
     *
     * @type member
     * @param widget {qx.ui2.core.Widget} Widget to query
     * @return {String|null} The currently configured height
     */
    getHeight : function(widget) {
      return widget.getLayoutProperty("height");
    },




    /*
    ---------------------------------------------------------------------------
      LAYOUT PROPERTIES: LOCATION: LEFT
    ---------------------------------------------------------------------------
    */

    /**
     * Sets the left position on the canvas.
     * Supports pixel values (integer) and percent values (string).
     *
     * @type member
     * @param widget {qx.ui2.core.Widget} Widget to modify
     * @param value {String|Integer} The left position to apply
     * @return {qx.ui2.layout.Abstract} This layout (for chaining support)
     */
    setLeft : function(widget, value)
    {
      widget.addLayoutProperty("left", value);
      return this;
    },


    /**
     * Resets the left position on the canvas.
     *
     * @type member
     * @param widget {qx.ui2.core.Widget} Widget to modify
     * @return {qx.ui2.layout.Abstract} This layout (for chaining support)
     */
    resetLeft : function(widget)
    {
      widget.removeLayoutProperty("left");
      return this;
    },


    /**
     * Returns the currently configured left position on the canvas.
     *
     * @type member
     * @param widget {qx.ui2.core.Widget} Widget to query
     * @return {String|Integer|null} The currently configured left position
     */
    getLeft : function(widget) {
      return widget.getLayoutProperty("left");
    },





    /*
    ---------------------------------------------------------------------------
      LAYOUT PROPERTIES: LOCATION: TOP
    ---------------------------------------------------------------------------
    */

    /**
     * Sets the top position on the canvas.
     * Supports pixel values (integer) and percent values (string).
     *
     * @type member
     * @param widget {qx.ui2.core.Widget} Widget to modify
     * @param value {String|Integer} The top position to apply
     * @return {qx.ui2.layout.Abstract} This layout (for chaining support)
     */
    setTop : function(widget, value)
    {
      widget.addLayoutProperty("top", value);
      return this;
    },


    /**
     * Resets the top position on the canvas.
     *
     * @type member
     * @param widget {qx.ui2.core.Widget} Widget to modify
     * @return {qx.ui2.layout.Abstract} This layout (for chaining support)
     */
    resetTop : function(widget)
    {
      widget.removeLayoutProperty("top");
      return this;
    },


    /**
     * Returns the currently configured top position on the canvas.
     *
     * @type member
     * @param widget {qx.ui2.core.Widget} Widget to query
     * @return {String|Integer|null} The currently configured top position
     */
    getTop : function(widget) {
      return widget.getLayoutProperty("top");
    },




    /*
    ---------------------------------------------------------------------------
      LAYOUT PROPERTIES: LOCATION: RIGHT
    ---------------------------------------------------------------------------
    */

    /**
     * Sets the right position on the canvas.
     * Supports pixel values (integer) and percent values (string).
     *
     * @type member
     * @param widget {qx.ui2.core.Widget} Widget to modify
     * @param value {String|Integer} The right position to apply
     * @return {qx.ui2.layout.Abstract} This layout (for chaining support)
     */
    setRight : function(widget, value)
    {
      widget.addLayoutProperty("right", value);
      return this;
    },


    /**
     * Resets the right position on the canvas.
     *
     * @type member
     * @param widget {qx.ui2.core.Widget} Widget to modify
     * @return {qx.ui2.layout.Abstract} This layout (for chaining support)
     */
    resetRight : function(widget)
    {
      widget.removeLayoutProperty("right");
      return this;
    },


    /**
     * Returns the currently configured right position on the canvas.
     *
     * @type member
     * @param widget {qx.ui2.core.Widget} Widget to query
     * @return {String|Integer|null} The currently configured right position
     */
    getRight : function(widget) {
      return widget.getLayoutProperty("right");
    },



    /*
    ---------------------------------------------------------------------------
      LAYOUT PROPERTIES: LOCATION: BOTTOM
    ---------------------------------------------------------------------------
    */

    /**
     * Sets the bottom position on the canvas.
     * Supports pixel values (integer) and percent values (string).
     *
     * @type member
     * @param widget {qx.ui2.core.Widget} Widget to modify
     * @param value {String|Integer} The bottom position to apply
     * @return {qx.ui2.layout.Abstract} This layout (for chaining support)
     */
    setBottom : function(widget, value)
    {
      widget.addLayoutProperty("bottom", value);
      return this;
    },


    /**
     * Resets the bottom position on the canvas.
     *
     * @type member
     * @param widget {qx.ui2.core.Widget} Widget to modify
     * @return {qx.ui2.layout.Abstract} This layout (for chaining support)
     */
    resetBottom : function(widget)
    {
      widget.removeLayoutProperty("bottom");
      return this;
    },


    /**
     * Returns the currently configured bottom position on the canvas.
     *
     * @type member
     * @param widget {qx.ui2.core.Widget} Widget to query
     * @return {String|Integer|null} The currently configured bottom position
     */
    getBottom : function(widget) {
      return widget.getLayoutProperty("bottom");
    }
  }
});
