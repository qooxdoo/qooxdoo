/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * The Canvas is an extended Basic layout.
 *
 * It is possible to position a widget relative to the right or bottom edge of
 * the available space. It further supports stretching between left and right
 * or top and bottom e.g. <code>left=20</code> and <code>right=20</code> would
 * keep a margin of 20 pixels to both edges. The Canvas layout has support for
 * percent dimensions and locations.
 *
 * *Features*
 *
 * * Pixel dimensions and locations
 * * Percent dimensions and locations
 * * Stretching between left+right and top+bottom
 * * Minimum and maximum dimensions
 * * Children are automatically shrunk to their minimum dimensions if not enough space is available
 * * Auto sizing (ignoring percent values)
 * * Margins (also negative ones)
 *
 * *Item Properties*
 *
 * <ul>
 * <li><strong>left</strong> <em>(Integer|String)</em>: The left coordinate in pixel or as a percent string e.g. <code>20</code> or <code>30%</code>.</li>
 * <li><strong>top</strong> <em>(Integer|String)</em>: The top coordinate in pixel or as a percent string e.g. <code>20</code> or <code>30%</code>.</li>
 * <li><strong>right</strong> <em>(Integer|String)</em>: The right coordinate in pixel or as a percent string e.g. <code>20</code> or <code>30%</code>.</li>
 * <li><strong>bottom</strong> <em>(Integer|String)</em>: The bottom coordinate in pixel or as a percent string e.g. <code>20</code> or <code>30%</code>.</li>
 * <li><strong>edge</strong> <em>(Integer|String)</em>: The coordinate in pixels or as a percent string to be used for all four edges.
 * <li><strong>width</strong> <em>(String)</em>: A percent width e.g. <code>40%</code>.</li>
 * <li><strong>height</strong> <em>(String)</em>: A percent height e.g. <code>60%</code>.</li>
 * </ul>
 *
 * *Notes*
 *
 * <ul>
 * <li>Stretching (<code>left</code>-><code>right</code> or <code>top</code>-><code>bottom</code>)
 *   has a higher priority than the preferred dimensions</li>
 * <li>Stretching has a lower priority than the min/max dimensions.</li>
 * <li>Percent values have no influence on the size hint of the layout.</li>
 * </ul>
 *
 * *Example*
 *
 * Here is a little example of how to use the canvas layout.
 *
 * <pre class="javascript">
 * var container = new qx.ui.container.Composite(new qx.ui.layout.Canvas());
 *
 * // simple positioning
 * container.add(new qx.ui.core.Widget(), {top: 10, left: 10});
 *
 * // stretch vertically with 10 pixel distance to the parent's top
 * // and bottom border
 * container.add(new qx.ui.core.Widget(), {top: 10, left: 10, bottom: 10});
 *
 * // percent positioning and size
 * container.add(new qx.ui.core.Widget(), {left: "50%", top: "50%", width: "25%", height: "40%"});
 * </pre>
 *
 * *External Documentation*
 *
 * <a href='http://manual.qooxdoo.org/${qxversion}/pages/layout/canvas.html'>
 * Extended documentation</a> and links to demos of this layout in the qooxdoo manual.
 */
qx.Class.define("qx.ui.layout.Canvas",
{
  extend : qx.ui.layout.Abstract,




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties : {

    /**
     * If desktop mode is active, the children's minimum sizes are ignored
     * by the layout calculation. This is necessary to prevent the desktop
     * from growing if e.g. a window is moved beyond the edge of the desktop
     */
    desktop :
    {
      check : "Boolean",
      init: false
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
    verifyLayoutProperty : qx.core.Environment.select("qx.debug",
    {
      "true" : function(item, name, value)
      {
        var layoutProperties =
        {
          top : 1,
          left : 1,
          bottom : 1,
          right : 1,
          width : 1,
          height : 1,
          edge : 1
        };

        this.assert(layoutProperties[name] == 1, "The property '"+name+"' is not supported by the Canvas layout!");

        if (name =="width" || name == "height")
        {
          this.assertMatch(value, qx.ui.layout.Util.PERCENT_VALUE);
        }
        else
        {
          if (typeof value === "number") {
            this.assertInteger(value);
          } else if (qx.lang.Type.isString(value)) {
            this.assertMatch(value, qx.ui.layout.Util.PERCENT_VALUE);
          } else {
            this.fail(
              "Bad format of layout property '" + name + "': " + value +
              ". The value must be either an integer or an percent string."
            );
          }
        }
      },

      "false" : null
    }),


    // overridden
    renderLayout : function(availWidth, availHeight, padding)
    {
      var children = this._getLayoutChildren();

      var child, size, props;
      var left, top, right, bottom, width, height;
      var marginTop, marginRight, marginBottom, marginLeft;

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

        left = props.left != null ? props.left : props.edge;
        if (qx.lang.Type.isString(left)) {
          left = Math.round(parseFloat(left) * availWidth / 100);
        }

        right = props.right != null ? props.right : props.edge;
        if (qx.lang.Type.isString(right)) {
          right = Math.round(parseFloat(right) * availWidth / 100);
        }

        top = props.top != null ? props.top : props.edge;
        if (qx.lang.Type.isString(top)) {
          top = Math.round(parseFloat(top) * availHeight / 100);
        }

        bottom = props.bottom != null ? props.bottom : props.edge;
        if (qx.lang.Type.isString(bottom)) {
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

          // Add margin
          left += marginLeft;
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
            left = availWidth - width - right - marginRight - marginLeft;
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
          } else if (height > size.maxHeight) {
            height = size.maxHeight;
          }

          // Add margin
          top += marginTop;
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
            } else if (height > size.maxHeight) {
              height = size.maxHeight;
            }
          }

          if (bottom != null) {
            top = availHeight - height - bottom - marginBottom - marginTop;
          } else if (top == null) {
            top = marginTop;
          } else {
            top += marginTop;
          }
        }

        left += padding.left;
        top += padding.top;

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
      var desktop = this.isDesktop();

      var left, top, right, bottom;

      for (var i=0,l=children.length; i<l; i++)
      {
        child = children[i];
        props = child.getLayoutProperties();
        hint = child.getSizeHint();


        // Cache margins
        var marginX = child.getMarginLeft() + child.getMarginRight();
        var marginY = child.getMarginTop() + child.getMarginBottom();


        // Compute width
        width = hint.width+marginX;
        minWidth = hint.minWidth+marginX;

        left = props.left != null ? props.left : props.edge;
        if (left && typeof left === "number")
        {
          width += left;
          minWidth += left;
        }

        right = props.right != null ? props.right : props.edge;
        if (right && typeof right === "number")
        {
          width += right;
          minWidth += right;
        }

        neededWidth = Math.max(neededWidth, width);
        neededMinWidth = desktop ? 0 : Math.max(neededMinWidth, minWidth);


        // Compute height
        height = hint.height+marginY;
        minHeight = hint.minHeight+marginY;

        top = props.top != null ? props.top : props.edge;
        if (top && typeof top === "number")
        {
          height += top;
          minHeight += top;
        }

        bottom = props.bottom != null ? props.bottom : props.edge;
        if (bottom && typeof bottom === "number")
        {
          height += bottom;
          minHeight += bottom;
        }

        neededHeight = Math.max(neededHeight, height);
        neededMinHeight = desktop ? 0 : Math.max(neededMinHeight, minHeight);
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
