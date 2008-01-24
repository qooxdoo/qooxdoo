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

    /**
     * Adds a new widget to this layout. This layout supports both, stretching
     * between <code>left</code> and <code>right</code> as well as streching between
     * <code>top</code> and <code>bottom</code>.
     *
     * Please note: <code>left</code> is optional when <code>right</code> is given.
     * <code>top</code> is optional when <code>bottom</code> is given. This is also
     * true for the opposite cases.
     *
     * @type member
     * @param child {qx.ui2.core.Widget} the widget to add.
     * @param left {Integer?null} Left position of the child.
     * @param top {Integer?null} Top position of the child.
     * @param right {Integer?null} Right position of the child.
     * @param bottom {Integer?null} Bottom position of the child.
     * @param options {Map?null} Optional layout data for widget.
     * @return {qx.ui2.layout.Abstract} This object (for chaining support)
     */
    add : function(child, left, top, right, bottom, options)
    {
      this.base(arguments, child, options);

      if (left != null) {
        this.addLayoutProperty(child, "left", left);
      }

      if (top != null) {
        this.addLayoutProperty(child, "top", top);
      }

      if (right != null) {
        this.addLayoutProperty(child, "right", right);
      }

      if (bottom != null) {
        this.addLayoutProperty(child, "bottom", bottom);
      }

      // Chaining support
      return this;
    },


    // overridden
    renderLayout : function(parentWidth, parentHeight)
    {
      var children = this.getLayoutChildren();
      var percent = qx.ui2.layout.Util.PERCENT_VALUE;

      var child, size, layout;
      var left, top, right, bottom, width, height;

      for (var i=0, l=children.length; i<l; i++)
      {
        child = children[i];
        size = child.getSizeHint();
        layout = this.getLayoutProperties(child);



        // **************************************
        //   Processing location
        // **************************************

        left = layout.left;
        if (left && typeof left === "string")
        {
          if (!percent.test(left)) {
            throw new Error("Invalid percent value for left position: " + left);
          }

          left = Math.round(parseFloat(left) * parentWidth / 100);
        }

        right = layout.right;
        if (right && typeof right === "string")
        {
          if (!percent.test(right)) {
            throw new Error("Invalid percent value for right position: " + right);
          }

          right = Math.round(parseFloat(right) * parentWidth / 100);
        }

        top = layout.top;
        if (top && typeof top === "string")
        {
          if (!percent.test(top)) {
            throw new Error("Invalid percent value for top position: " + top);
          }

          top = Math.round(parseFloat(top) * parentWidth / 100);
        }

        bottom = layout.bottom;
        if (bottom && typeof bottom === "string")
        {
          if (!percent.test(bottom)) {
            throw new Error("Invalid percent value for bottom position: " + bottom);
          }

          bottom = Math.round(parseFloat(bottom) * parentWidth / 100);
        }



        // **************************************
        //   Processing dimension
        // **************************************

        // Stretching has higher priority than dimension data
        if (left != null && right != null)
        {
          width = parentWidth - left - right;

          // Limit computed value
          width = Math.max(Math.min(width, size.maxWidth), size.minWidth);
        }
        else
        {
          // Layout data has higher priority than data from size hint
          width = layout.width;

          if (width == null)
          {
            width = size.width;
          }
          else if (typeof width === "string")
          {
            if (!percent.test(width)) {
              throw new Error("Invalid percent value for width: " + width);
            }

            width = Math.round(parseFloat(width) * parentWidth / 100);

            // (Re-)Limit resolved percent value
            width = Math.max(Math.min(width, size.maxWidth), size.minWidth);
          }
          else
          {
            throw new Error("Unexpected layout data for width: " + width);
          }

          if (right != null) {
            left = parentWidth - width - right;
          } else if (left == null) {
            left = 0;
          }
        }

        // Stretching has higher priority than dimension data
        if (top != null && bottom != null)
        {
          height = parentHeight - top - bottom;

          // Limit computed value
          height = Math.max(Math.min(height, size.maxHeight), size.minHeight);
        }
        else
        {
          // Layout data has higher priority than data from size hint
          height = layout.height;

          if (height == null)
          {
            height = size.height;
          }
          else if (typeof height === "string")
          {
            if (!percent.test(height)) {
              throw new Error("Invalid percent value for height: " + height);
            }

            height = Math.round(parseFloat(height) * parentHeight / 100);

            // (Re-)Limit resolved percent value
            height = Math.max(Math.min(height, size.maxHeight), size.minHeight);
          }
          else
          {
            throw new Error("Unexpected layout data for height: " + height);
          }

          if (bottom != null) {
            top = parentHeight - height - bottom;
          } else if (top == null) {
            top = 0;
          }
        }



        // **************************************
        //   Render child
        // **************************************

        child.renderLayout(left, top, width, height);
      }
    }
  }
});
