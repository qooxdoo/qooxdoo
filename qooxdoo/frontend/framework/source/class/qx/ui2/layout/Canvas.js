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

        if (!child.isLayoutValid())
        {
          childHint = child.getSizeHint();


          // Processing location data
          childLeft = child.getLayoutProperty("left");
          childTop = child.getLayoutProperty("top");
          childRight = child.getLayoutProperty("right");
          childBottom = child.getLayoutProperty("bottom");

          if (typeof childLeft === "string" && percent.test(childLeft)) {
            childLeft = Math.round(parseFloat(childLeft) * availWidth / 100);
          } else if (childLeft != null) {
            throw new Error("Could not parse percent value for left position: " + childLeft);
          }

          if (typeof childTop === "string" && percent.test(childTop)) {
            childTop = Math.round(parseFloat(childTop) * availHeight / 100);
          } else if (childTop != null) {
            throw new Error("Could not parse percent value for top position: " + childTop);
          }

          if (typeof childRight === "string" && percent.test(childRight)) {
            childRight = Math.round(parseFloat(childRight) * availWidth / 100);
          } else if (childRight != null) {
            throw new Error("Could not parse percent value for right position: " + childRight);
          }

          if (typeof childBottom === "string" && percent.test(childBottom)) {
            childBottom = Math.round(parseFloat(childBottom) * availHeight / 100);
          } else if (childBottom != null) {
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


          // Layout child
          child.layout(childLeft, childTop, childWidth, childHeight);
        }
      }
    },




    /*
    ---------------------------------------------------------------------------
      LAYOUT PROPERTIES
    ---------------------------------------------------------------------------
    */

    setWidth : function(widget, value) {
      widget.addLayoutProperty("width", value);
    },

    resetWidth : function(widget) {
      widget.removeLayoutProperty("width");
    },

    getWidth : function(widget) {
      return widget.getLayoutProperty("width");
    },

    setHeight : function(widget, value) {
      widget.addLayoutProperty("height", value);
    },

    resetHeight : function(widget) {
      widget.removeLayoutProperty("height");
    },

    getHeight : function(widget) {
      return widget.getLayoutProperty("height");
    }
  },




  /*
  *****************************************************************************
     DESTRUCT
  *****************************************************************************
  */

  destruct : function()
  {


  }
});