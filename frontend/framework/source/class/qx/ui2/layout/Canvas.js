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
 * * Children are automatically shrinked to their minimum dimensions if not enough space is available
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
      CHILDREN MANAGMENT
    ---------------------------------------------------------------------------
    */

    /**
     * Adds a new widget to this layout.
     *
     * @type member
     * @param widget {qx.ui2.core.Widget} the widget to add
     * @param left {Integer|String?null} Left position of the widget (accepts
     *   both, integer(pixel) and string(percent) values.
     * @param top {Integer|String?null} Top position of the widget (accepts
     *   both, integer(pixel) and string(percent) values.
     * @param right {Integer|String?null} Right position of the widget (accepts
     *   both, integer(pixel) and string(percent) values.
     * @param bottom {Integer|String?null} Bottom position of the widget (accepts
     *   both, integer(pixel) and string(percent) values.
     * @return {qx.ui2.layout.Canvas} This object (for chaining support)
     */
    add : function(widget, left, top, right, bottom)
    {
      this.base(arguments, widget);
      this._importProperties(widget, arguments, "canvas.left", "canvas.top", "canvas.right", "canvas.bottom");

      // Chaining support
      return this;
    },





    /*
    ---------------------------------------------------------------------------
      LAYOUT INTERFACE
    ---------------------------------------------------------------------------
    */

    // overridden
    renderLayout : function(width, height)
    {
      var children = this.getChildren();
      var child, childHint;
      var childLeft, childTop, childRight, childBottom;
      var childWidth, childHeight;
      var childLimitWidth, childLimitHeight;
      var percent = /[0-9.]+%/;

      for (var i=0, l=children.length; i<l; i++)
      {
        child = children[i];
        childHint = child.getSizeHint();


        // Processing location data
        childLeft = child.getLayoutProperty("canvas.left");
        childTop = child.getLayoutProperty("canvas.top");
        childRight = child.getLayoutProperty("canvas.right");
        childBottom = child.getLayoutProperty("canvas.bottom");

        if (typeof childLeft === "string" && percent.test(childLeft)) {
          childLeft = Math.round(parseFloat(childLeft) * width / 100);
        } else if (childLeft != null && typeof childLeft !== "number") {
          throw new Error("Could not parse percent value for left position: " + childLeft);
        }

        if (typeof childTop === "string" && percent.test(childTop)) {
          childTop = Math.round(parseFloat(childTop) * height / 100);
        } else if (childTop != null && typeof childTop !== "number") {
          throw new Error("Could not parse percent value for top position: " + childTop);
        }

        if (typeof childRight === "string" && percent.test(childRight)) {
          childRight = Math.round(parseFloat(childRight) * width / 100);
        } else if (childRight != null && typeof childRight !== "number") {
          throw new Error("Could not parse percent value for right position: " + childRight);
        }

        if (typeof childBottom === "string" && percent.test(childBottom)) {
          childBottom = Math.round(parseFloat(childBottom) * height / 100);
        } else if (childBottom != null && typeof childBottom !== "number") {
          throw new Error("Could not parse percent value for bottom position: " + childBottom);
        }


        // Processing dimension data
        childWidth = child.getLayoutProperty("canvas.width");
        childHeight = child.getLayoutProperty("canvas.height");

        if (typeof childWidth === "string" && percent.test(childWidth)) {
          childWidth = Math.round(parseFloat(childWidth) * width / 100);
        } else if (childWidth != null) {
          throw new Error("Could not parse percent value for width: " + childWidth);
        } else {
          childWidth = childHint.width;
        }

        if (typeof childHeight === "string" && percent.test(childHeight)) {
          childHeight = Math.round(parseFloat(childHeight) * height / 100);
        } else if (childHeight != null) {
          throw new Error("Could not parse percent value for width: " + childHeight);
        } else {
          childHeight = childHint.height;
        }


        // Normalize right
        if (childRight != null)
        {
          if (childLeft != null)
          {
            childWidth = width - childLeft - childRight;
          }
          else if (childWidth != null)
          {
            childLeft = width - childWidth - childRight;

            // Reduce the width to keep left edge visible
            if (childLeft < 0)
            {
              // Detect minimum width vs. calculated width
              childLimitWidth = Math.max(childWidth + childLeft, childHint.minWidth);

              childLeft += (childWidth - childLimitWidth);
              childWidth = childLimitWidth
            }
          }
        }


        // Normalize bottom
        if (childBottom != null)
        {
          if (childTop != null)
          {
            childHeight = height - childTop - childBottom;
          }
          else if (childHeight != null)
          {
            childTop = height - childHeight - childBottom;

            // Reduce the height to keep top edge visible
            if (childTop < 0)
            {
              // Detect minimum height vs. calculated height
              childLimitHeight = Math.max(childHeight + childTop, childHint.minHeight);

              childTop += (childHeight - childLimitHeight);
              childHeight = childLimitHeight
            }
          }
        }


        // Limit dimensions to min/max dimensions and parent size
        childWidth = Math.max(Math.min(childWidth, childHint.maxWidth, width - childLeft), childHint.minWidth);
        childHeight = Math.max(Math.min(childHeight, childHint.maxHeight, height - childTop), childHint.minHeight);


        // Layout child
        child.renderLayout(childLeft, childTop, childWidth, childHeight);
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
     * @return {qx.ui2.layout.Canvas} This layout (for chaining support)
     */
    setWidth : function(widget, value)
    {
      widget.addLayoutProperty("canvas.width", value);

      // Chaining support
      return this;
    },


    /**
     * Resets the width of the given widget.
     *
     * @type member
     * @param widget {qx.ui2.core.Widget} Widget to modify
     * @return {qx.ui2.layout.Canvas} This layout (for chaining support)
     */
    resetWidth : function(widget)
    {
      widget.removeLayoutProperty("canvas.width");

      // Chaining support
      return this;
    },


    /**
     * Returns the currently configured width of the given widget.
     *
     * @type member
     * @param widget {qx.ui2.core.Widget} Widget to query
     * @return {String} The currently configured width
     */
    getWidth : function(widget) {
      return widget.getLayoutProperty("canvas.width");
    },


    /**
     * Sets the height of the given widget.
     * Supports percent values (string). For integer values please
     * use the <code>height</code> property of the widget itself.
     *
     * @type member
     * @param widget {qx.ui2.core.Widget} Widget to modify
     * @param value {String} The height to apply
     * @return {qx.ui2.layout.Canvas} This layout (for chaining support)
     */
    setHeight : function(widget, value)
    {
      widget.addLayoutProperty("canvas.height", value);

      // Chaining support
      return this;
    },


    /**
     * Resets the height of the given widget.
     *
     * @type member
     * @param widget {qx.ui2.core.Widget} Widget to modify
     * @return {qx.ui2.layout.Canvas} This layout (for chaining support)
     */
    resetHeight : function(widget)
    {
      widget.removeLayoutProperty("canvas.height");

      // Chaining support
      return this;
    },


    /**
     * Returns the currently configured height of the given widget.
     *
     * @type member
     * @param widget {qx.ui2.core.Widget} Widget to query
     * @return {String} The currently configured height
     */
    getHeight : function(widget) {
      return widget.getLayoutProperty("canvas.height");
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
     * @return {qx.ui2.layout.Canvas} This layout (for chaining support)
     */
    setLeft : function(widget, value)
    {
      widget.addLayoutProperty("canvas.left", value);

      // Chaining support
      return this;
    },


    /**
     * Resets the left position on the canvas.
     *
     * @type member
     * @param widget {qx.ui2.core.Widget} Widget to modify
     * @return {qx.ui2.layout.Canvas} This layout (for chaining support)
     */
    resetLeft : function(widget)
    {
      widget.removeLayoutProperty("canvas.left");

      // Chaining support
      return this;
    },


    /**
     * Returns the currently configured left position on the canvas.
     *
     * @type member
     * @param widget {qx.ui2.core.Widget} Widget to query
     * @return {String|Integer} The currently configured left position
     */
    getLeft : function(widget) {
      return widget.getLayoutProperty("canvas.left");
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
     * @return {qx.ui2.layout.Canvas} This layout (for chaining support)
     */
    setTop : function(widget, value)
    {
      widget.addLayoutProperty("canvas.top", value);

      // Chaining support
      return this;
    },


    /**
     * Resets the top position on the canvas.
     *
     * @type member
     * @param widget {qx.ui2.core.Widget} Widget to modify
     * @return {qx.ui2.layout.Canvas} This layout (for chaining support)
     */
    resetTop : function(widget)
    {
      widget.removeLayoutProperty("canvas.top");

      // Chaining support
      return this;
    },


    /**
     * Returns the currently configured top position on the canvas.
     *
     * @type member
     * @param widget {qx.ui2.core.Widget} Widget to query
     * @return {String|Integer} The currently configured top position
     */
    getTop : function(widget) {
      return widget.getLayoutProperty("canvas.top");
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
     * @return {qx.ui2.layout.Canvas} This layout (for chaining support)
     */
    setRight : function(widget, value)
    {
      widget.addLayoutProperty("canvas.right", value);

      // Chaining support
      return this;
    },


    /**
     * Resets the right position on the canvas.
     *
     * @type member
     * @param widget {qx.ui2.core.Widget} Widget to modify
     * @return {qx.ui2.layout.Canvas} This layout (for chaining support)
     */
    resetRight : function(widget)
    {
      widget.removeLayoutProperty("canvas.right");

      // Chaining support
      return this;
    },


    /**
     * Returns the currently configured right position on the canvas.
     *
     * @type member
     * @param widget {qx.ui2.core.Widget} Widget to query
     * @return {String|Integer} The currently configured right position
     */
    getRight : function(widget) {
      return widget.getLayoutProperty("canvas.right");
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
     * @return {qx.ui2.layout.Canvas} This layout (for chaining support)
     */
    setBottom : function(widget, value)
    {
      widget.addLayoutProperty("canvas.bottom", value);

      // Chaining support
      return this;
    },


    /**
     * Resets the bottom position on the canvas.
     *
     * @type member
     * @param widget {qx.ui2.core.Widget} Widget to modify
     * @return {qx.ui2.layout.Canvas} This layout (for chaining support)
     */
    resetBottom : function(widget)
    {
      widget.removeLayoutProperty("canvas.bottom");

      // Chaining support
      return this;
    },


    /**
     * Returns the currently configured bottom position on the canvas.
     *
     * @type member
     * @param widget {qx.ui2.core.Widget} Widget to query
     * @return {String|Integer} The currently configured bottom position
     */
    getBottom : function(widget) {
      return widget.getLayoutProperty("canvas.bottom");
    }
  }
});
