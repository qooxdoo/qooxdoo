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
 * A dock layout.
 */
qx.Class.define("qx.ui2.layout.Dock",
{
  extend : qx.ui2.layout.Abstract,

  properties :
  {
    sort :
    {
      check : [ "auto", "yfirst", "xfirst" ],
      init : "auto"
    }
  },


  members :
  {
    // overridden
    add : function(widget, edge)
    {
      this.base(arguments, widget);
      this._importProperties(widget, arguments, "dock.edge");
    },


    _getSortedChildren : function()
    {
      var children = this._children;

      var high = [];
      var low = [];
      var center;
      var yfirst = this.getSort() === "yfirst";
      var xfirst = this.getSort() === "xfirst";

      for (var i=0, l=children.length; i<l; i++)
      {
        child = children[i];
        childEdge = child.getLayoutProperty("dock.edge");

        if (childEdge === "center")
        {
          center = child;
        }
        else if (xfirst || yfirst)
        {
          if (childEdge === "north" || childEdge === "south")
          {
            yfirst ? high.push(child) : low.push(child);
          }
          else if (childEdge === "west" || childEdge === "east")
          {
            yfirst ? low.push(child) : high.push(child);
          }
        }
        else
        {
          high.push(child);
        }
      }

      children = high.concat(low);

      if (center) {
        children.push(center);
      }

      return children;
    },


    // overridden
    layout : function(availWidth, availHeight)
    {
      var children = this._getSortedChildren();
      var child;
      var childEdge;
      var childWidths = [];
      var childHeights = [];

      // Sum of width used by all left/right attached widgets
      var usedWidth = 0;

      // Sum of height used by all top/bottom attached widgets
      var usedHeight = 0;


      //
      for (var i=0, l=children.length; i<l; i++)
      {
        child = children[i];
        childEdge = child.getLayoutProperty("dock.edge");
        childHint = child.getSizeHint();

        childWidths[i] = childHint.width;
        childHeights[i] = childHint.height;

        if (childEdge === "north" || childEdge === "south")
        {
          usedHeight += childHint.height;
        }
        else
        {
          usedWidth += childHint.width;
        }
      }

      console.debug("Used width: " + usedWidth + "/" + availWidth);
      console.debug("Used height: " + usedHeight + "/" + availHeight);


      var nextTop=0, nextLeft=0, nextBottom=0, nextRight=0;

      for (var i=0, l=children.length; i<l; i++)
      {
        child = children[i];
        childEdge = child.getLayoutProperty("dock.edge");


        // Layout child
        if (childEdge === "west")
        {
          childLeft = nextLeft;
          childTop = nextTop;
          childWidth = childWidths[i];
          childHeight = availHeight - nextTop - nextBottom;
        }
        else if (childEdge === "north")
        {
          childLeft = nextLeft;
          childTop = nextTop;
          childWidth = availWidth - nextLeft - nextRight;
          childHeight = childHeights[i];
        }
        else if (childEdge === "east")
        {
          childLeft = availWidth - nextRight - childWidths[i];
          childTop = nextTop;
          childWidth = childWidths[i];
          childHeight = availHeight - nextTop - nextBottom;
        }
        else if (childEdge === "south")
        {
          childLeft = nextLeft;
          childTop = availHeight - nextBottom - childHeights[i];
          childWidth = availWidth - nextLeft - nextRight;
          childHeight = childHeights[i];
        }
        else if (childEdge === "center")
        {
          childLeft = nextLeft;
          childTop = nextTop;
          childWidth = availWidth - nextLeft - nextRight;
          childHeight = availHeight - nextTop - nextBottom;
        }

        child.layout(childLeft, childTop, childWidth, childHeight);





        // If this is the last one => exit here
        if (i==(l-1)) {
          break;
        }



        if (childEdge === "west")
        {
          nextLeft += childWidths[i];
        }
        else if (childEdge === "north")
        {
          nextTop += childHeights[i];
        }
        else if (childEdge === "east")
        {
          nextRight += childWidths[i];
        }
        else if (childEdge === "south")
        {
          nextBottom += childHeights[i];
        }

        console.debug("STATUS: " + nextLeft + "x" + nextTop + " | " + nextRight + "x" + nextBottom);
      }


    },


    // overridden
    getSizeHint : function()
    {
      if (this._sizeHint) {
        return this._sizeHint;
      }


      // Initialize
      var children = this._getSortedChildren();
      var child, childHint, childEdge;

      var widthX=0, minWidthX=0, maxWidthX=32000;
      var heightX=0, minHeightX=0, maxHeightX=32000;

      var widthY=0, minWidthY=0, maxWidthY=32000;
      var heightY=0, minHeightY=0, maxHeightY=32000;


      // Detect children sizes
      for (var i=0, l=children.length; i<l; i++)
      {
        child = children[i];
        childEdge = child.getLayoutProperty("dock.edge");
        childHint = child.getSizeHint();

        // Ok, this part is a bit complicated :)
        if (childEdge === "north" || childEdge === "south")
        {
          // Find the maximum width used by these fully stretched items
          // The recommended width used by these must add the currently
          // occupied width by the ortogonal ordered children.
          widthY = Math.max(widthY, childHint.width + widthX);
          minWidthY = Math.max(minWidthY, childHint.minWidth + minWidthX);
          maxWidthY = Math.min(maxWidthY, childHint.maxWidth + maxWidthX);

          // Add the needed heights of this widget
          heightY += childHint.height;
          minHeightY += childHint.minHeight;
          maxHeightY += childHint.maxHeight;
        }
        else if (childEdge === "west" || childEdge === "east")
        {
          // Find the maximum height used by these fully stretched items
          // The recommended height used by these must add the currently
          // occupied height by the ortogonal ordered children.
          heightX = Math.max(heightX, childHint.height + heightY);
          minHeightX = Math.max(minHeightX, childHint.minHeight + minHeightY);
          maxHeightX = Math.min(maxHeightX, childHint.maxHeight + maxHeightY);

          // Add the needed widths of this widget
          widthX += childHint.width;
          minWidthX += childHint.minWidth;
          maxWidthX += childHint.maxWidth;
        }
        else if (childEdge === "center")
        {
          // A centered widget must be added to both sums as
          // it stretches into the remaining available space.
          widthX += childHint.width;
          minWidthX += childHint.minWidth;
          maxWidthX += childHint.maxWidth;

          heightY += childHint.height;
          minHeightY += childHint.minHeight;
          maxHeightY += childHint.maxHeight;
        }
      }


      // Sum up and limit to integer region
      var width = Math.max(widthX, widthY, 0);
      var minWidth = Math.max(minWidthX, minWidthY, 0);
      var maxWidth = Math.min(maxWidthX, maxWidthY, 32000);
      var height = Math.max(heightX, heightY, 0);
      var minHeight = Math.max(minHeightX, minHeightY, 0);
      var maxHeight = Math.min(maxHeightX, maxHeightY, 32000);


      // Limit dimensions to integer range
      minWidth = Math.min(32000, Math.max(0, minWidth));
      width = Math.min(32000, Math.max(0, width));
      maxWidth = Math.min(32000, Math.max(0, maxWidth));
      minHeight = Math.min(32000, Math.max(0, minHeight));
      height = Math.min(32000, Math.max(0, height));
      maxHeight = Math.min(32000, Math.max(0, maxHeight));


      // Build hint
      var hint = {
        minWidth : minWidth,
        width : width,
        maxWidth : maxWidth,
        minHeight : minHeight,
        height : height,
        maxHeight : maxHeight
      };

      this.debug("Compute size hint: ", hint);
      this._sizeHint = hint;

      return hint;
    }
  }
});
