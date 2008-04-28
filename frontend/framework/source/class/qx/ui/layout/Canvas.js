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
 * * Integer dimensions
 * * Integer locations
 * * Percent dimensions and locations
 * * Stretching between left+right and top+bottom
 * * Min and max dimensions
 * * Children are automatically shrinked to their minimum dimensions if not enough space is available
 * * Auto sizing
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
 * * Stretching (left->right/top->bottom) has a higher priority than the preferred dimensions
 * * Stretching has a lower priority than the min/max dimensions.
 */
qx.Class.define("qx.ui.layout.Canvas",
{
  extend : qx.ui.layout.Abstract,




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
    renderLayout : function(availWidth, availHeight)
    {
      var children = this._getLayoutChildren();
      var percent = qx.ui.layout.Util.PERCENT_VALUE;

      var child, size, props;
      var left, top, right, bottom, width, height;

      for (var i=0, l=children.length; i<l; i++)
      {
        child = children[i];
        size = child.getSizeHint();
        props = child.getLayoutProperties();

        // Cache margins
        marginTop = child.getMarginTop();
        marginRight = child.getMarginRight();
        marginBottom = child.getMarginBottom();
        marginLeft = child.getMarginLeft();



        // **************************************
        //   Processing location
        // **************************************

        left = props.left;
        if (left && typeof left === "string") {
          left = Math.round(parseFloat(left) * availWidth / 100);
        }

        right = props.right;
        if (right && typeof right === "string") {
          right = Math.round(parseFloat(right) * availWidth / 100);
        }

        top = props.top;
        if (top && typeof top === "string") {
          top = Math.round(parseFloat(top) * availHeight / 100);
        }

        bottom = props.bottom;
        if (bottom && typeof bottom === "string") {
          bottom = Math.round(parseFloat(bottom) * availHeight / 100);
        }



        // **************************************
        //   Processing dimension
        // **************************************

        // Stretching has higher priority than dimension data
        if (left != null && right != null)
        {
          width = availWidth - left - right - marginLeft - marginRight;

          // Limit computed value
          if (width < size.minWidth) {
            width = size.minWidth;
          } else if (width > size.maxWidth) {
            width = size.maxWidth;
          }
        }
        else
        {
          // Layout data has higher priority than data from size hint
          width = props.width;

          if (width == null)
          {
            width = size.width;
          }
          else
          {
            width = Math.round(parseFloat(width) * availWidth / 100);

            // Limit computed value
            if (width < size.minWidth) {
              width = size.minWidth;
            } else if (width > size.maxWidth) {
              width = size.maxWidth;
            }
          }

          if (right != null) {
            left = availWidth - width - right - marginRight;
          } else if (left == null) {
            left = marginLeft;
          } else {
            left += marginLeft;
          }
        }

        // Stretching has higher priority than dimension data
        if (top != null && bottom != null)
        {
          height = availHeight - top - bottom - marginTop - marginBottom;

          // Limit computed value
          if (height < size.minHeight) {
            height = size.minHeight;
          } else if (width > size.maxHeight) {
            height = size.maxHeight;
          }
        }
        else
        {
          // Layout data has higher priority than data from size hint
          height = props.height;

          if (height == null)
          {
            height = size.height;
          }
          else
          {
            height = Math.round(parseFloat(height) * availHeight / 100);

            // Limit computed value
            if (height < size.minHeight) {
              height = size.minHeight;
            } else if (width > size.maxHeight) {
              height = size.maxHeight;
            }
          }

          if (bottom != null) {
            top = availHeight - height - bottom - marginBottom;
          } else if (top == null) {
            top = marginTop;
          } else {
            top += marginTop;
          }
        }

        // Apply layout
        child.renderLayout(left, top, width, height);
      }
    },


    // overridden
    _computeSizeHint : function()
    {
      var neededWidth=0, neededMinWidth=0;
      var neededHeight=0, neededMinHeight=0;

      var width, minWidth;
      var height, minHeight;

      var children = this._getLayoutChildren();
      var child, props, hint;

      for (var i=0,l=children.length; i<l; i++)
      {
        child = children[i];
        props = child.getLayoutProperties();
        hint = child.getSizeHint();


        // Cache margins
        marginX = child.getMarginLeft() + child.getMarginRight();
        marginY = child.getMarginTop() + child.getMarginBottom();


        // Compute width
        width = hint.width+marginX;
        minWidth = hint.minWidth+marginX;

        if (props.left && typeof props.left === "number")
        {
          width += props.left;
          minWidth += props.left;
        }

        if (props.right && typeof props.right === "number")
        {
          width += props.right;
          minWidth += props.right;
        }

        neededWidth = Math.max(neededWidth, width);
        neededMinWidth = Math.max(neededMinWidth, minWidth);


        // Compute height
        height = hint.height+marginY;
        minHeight = hint.minHeight+marginY;

        if (props.top && typeof props.top === "number")
        {
          height += props.top;
          minHeight += props.top;
        }

        if (props.bottom && typeof props.bottom === "number")
        {
          height += props.bottom;
          minHeight += props.bottom;
        }

        neededHeight = Math.max(neededHeight, height);
        neededMinHeight = Math.max(neededMinHeight, minHeight);
      }

      return {
        width : neededWidth,
        minWidth : neededMinWidth,
        height : neededHeight,
        minHeight : neededMinHeight
      };
    }
  }
});
