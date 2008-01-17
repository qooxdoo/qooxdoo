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
 * @param left {Integer|String?null} Left position of the widget (accepts
 *   both, integer(pixel) and string(percent) values.
 * @param top {Integer|String?null} Top position of the widget (accepts
 *   both, integer(pixel) and string(percent) values.
 * @param right {Integer|String?null} Right position of the widget (accepts
 *   both, integer(pixel) and string(percent) values.
 * @param bottom {Integer|String?null} Bottom position of the widget (accepts
 *   both, integer(pixel) and string(percent) values.
 *
 * Notes:
 *
 * * Stretching has a higher priority than the preferred dimensions
 * * Stretching has a lower priority than the min/max dimensions.
 */
qx.Class.define("qx.ui2.layout.Canvas",
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
      top : 0,
      right : null,
      bottom : null
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
    getSizeHint : function() {
      return null;
    },


    // overridden
    renderLayout : function(width, height)
    {
      var children = this.getChildren();
      var child, childProps;
      var childLeft, childTop, childRight, childBottom;
      var childWidth, childHeight;
      var childLimitWidth, childLimitHeight;
      var percent = /[0-9.]+%/;

      for (var i=0, l=children.length; i<l; i++)
      {
        child = children[i];
        childProps = this._getChildProperties(child);


        // Processing location data
        childLeft = childProps.left;
        childTop = childProps.top;
        childRight = childProps.right;
        childBottom = childProps.bottom;

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


        // Processing width
        childWidth = childProps.width;
        if (childWidth != null && typeof childWidth === "string")
        {
          if (!percent.test(childWidth)) {
            throw new Error("Could not parse percent value for width: " + childWidth);
          }

          childWidth = Math.round(parseFloat(childWidth) * width / 100);

          // Limit resolved percent value
          childWidth = Math.max(Math.min(childWidth, childProps.maxWidth), childProps.minWidth);
        }


        // Processing height
        childHeight = childProps.height;
        if (childHeight != null && typeof childHeight === "string")
        {
          if (!percent.test(childHeight)) {
            throw new Error("Could not parse percent value for width: " + childHeight);
          }

          childHeight = Math.round(parseFloat(childHeight) * height / 100);

          // Limit resolved percent value
          childHeight = Math.max(Math.min(childHeight, childProps.maxHeight), childProps.minHeight);
        }



        // Normalize right
        if (childRight != null)
        {
          if (childLeft != null)
          {
            childWidth = width - childLeft - childRight;

            // Limit computed value
            childWidth = Math.max(Math.min(childWidth, childProps.maxWidth), childProps.minWidth);
          }
          else if (childWidth != null)
          {
              childLeft = width - childWidth - childRight;
          }
        }


        // Normalize bottom
        if (childBottom != null)
        {
          if (childTop != null)
          {
            childHeight = height - childTop - childBottom;

            // Limit computed value
            childHeight = Math.max(Math.min(childHeight, childProps.maxHeight), childProps.minHeight);
          }
          else if (childHeight != null)
          {
            childTop = height - childHeight - childBottom;
          }
        }


        // Layout child
        child.renderLayout(childLeft, childTop, childWidth, childHeight);
      }
    }
  }
});
