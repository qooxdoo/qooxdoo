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


    // overridden
    layout : function(availWidth, availHeight)
    {
      var children = this._children;
      var child;
      var childEdge;
      var childWidths = [];
      var childHeights = [];

      // Sum of width used by all left/right attached widgets
      var usedWidth = 0;

      // Sum of height used by all top/bottom attached widgets
      var usedHeight = 0;


      // Dynamically reorder children
      if (this.getSort() !== "auto")
      {
        var first = [];
        var last = [];
        var yfirst = this.getSort() === "yfirst";

        for (var i=0, l=children.length; i<l; i++)
        {
          child = children[i];
          childEdge = child.getLayoutProperty("dock.edge");

          if (childEdge === "north" || childEdge === "south")
          {
            yfirst ? first.push(child) : last.push(child);
          }
          else if (childEdge === "west" || childEdge === "east")
          {
            yfirst ? last.push(child) : first.push(child);
          }
        }

        children = first.concat(last);
      }


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
      var children = this.getChildren();
      var width=0, minWidth=0, maxWidth=32000;
      var height=0, minHeight=0, maxHeight=32000;





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
