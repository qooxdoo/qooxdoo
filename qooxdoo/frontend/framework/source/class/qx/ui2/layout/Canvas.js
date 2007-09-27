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

      for (var i=0, l=children.length; i<l; i++)
      {
        child = children[i];

        if (!child.isLayoutValid())
        {
          childHint = child.getSizeHint();

          childLeft = child.getLayoutProperty("left");
          childTop = child.getLayoutProperty("top");
          childRight = child.getLayoutProperty("right");
          childBottom = child.getLayoutProperty("bottom");

          if (typeof childLeft === "string") {
            childLeft = Math.round(parseFloat(childLeft) * availWidth / 100);
          }

          if (typeof childTop === "string") {
            childTop = Math.round(parseFloat(childTop) * availHeight / 100);
          }

          if (typeof childRight === "string") {
            childRight = Math.round(parseFloat(childRight) * availWidth / 100);
          }

          if (typeof childBottom === "string") {
            childBottom = Math.round(parseFloat(childBottom) * availHeight / 100);
          }

          childWidth = child.getLayoutProperty("width");
          childHeight = child.getLayoutProperty("height");

          if (typeof childWidth === "string") {
            childWidth = Math.round(parseFloat(childWidth) * availWidth / 100);
          } else {
            childWidth = childHint.width;
          }

          if (typeof childHeight === "string") {
            childHeight = Math.round(parseFloat(childHeight) * availHeight / 100);
          } else {
            childHeight = childHint.height;
          }

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

    setHeight : function(widget, value) {
      widget.addLayoutProperty("height", value);
    },

    resetHeight : function(widget) {
      widget.removeLayoutProperty("height");
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