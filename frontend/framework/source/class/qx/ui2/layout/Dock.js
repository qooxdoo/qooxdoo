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
 * A feature rich dock layout. Docks children to one of the sides.
 *
 * Other names (for comparable layouts in other systems):
 *
 * * BorderLayout (Qt)
 * * DockPanel (XAML)
 * * BorderLayout (Java)
 *
 * Supports:
 *
 * * Integer dimensions (using widget properties)
 * * Additional percent width for left/right/center attached widgets (using layout properties)
 * * Additional percent height for top/bottom/center attached widgets (using layout properties)
 * * Min and max dimensions (using widget properties)
 * * Priorized growing/shrinking (flex) (using layout properties)
 * * Auto sizing (not together with percent dimensions for the children)
 * * Different sort options (to priorize x- or y-axis in layout)
 *
 * Notes:
 *
 * * For left/right attached childs the height is ignored.
 * * For top/bottom attached childs the width is ignored.
 * * However: In both cases the min/max dimensions are respected.
 *
 * Layout Properties: width, height, flexX, flexY, dock/edge
 */
qx.Class.define("qx.ui2.layout.Dock",
{
  extend : qx.ui2.layout.Abstract,




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /**
     * The way the widgets should be displayed (in conjunction with their
     * position in the childrens array).
     */
    sort :
    {
      check : [ "auto", "yfirst", "xfirst" ],
      init : "auto",
      apply : "_applyLayoutProperty"
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
      CHILDREN MANAGMENT
    ---------------------------------------------------------------------------
    */

    /**
     * Adds a new widget to this layout.
     *
     * @type member
     * @param widget {qx.ui2.core.Widget} Widget to add
     * @param edge {String?null} Edge to attach. Could be anyone of
     *   <code>north</code>, <code>west</code>, <code>south</code>,
     *   <code>east</code> or <code>center</code>.
     * @return {qx.ui2.layout.HBox} This object (for chaining support)
     */
    add : function(widget, edge, options)
    {
      this.base(arguments, widget, options);

      this.setLayoutProperty(widget, "edge", edge)

      // Chaining support
      return this;
    },





    /*
    ---------------------------------------------------------------------------
      LAYOUT INTERFACE
    ---------------------------------------------------------------------------
    */

    // overridden
    invalidateLayoutCache : function()
    {
      if (this._sizeHint)
      {
        this.debug("Clear layout cache");
        this._sizeHint = null;
      }
    },


    // overridden
    renderLayout : function(width, height)
    {
      var children = this._getSortedChildren();
      var child, childEdge, childHint, childFlex;
      var childWidth, childHeight, childWidthPercent, childHeightPercent;
      var childHints = [];
      var childWidths = [];
      var childHeights = [];

      // Sum of width used by all left/right attached widgets
      var usedWidth = 0;

      // Sum of height used by all top/bottom attached widgets
      var usedHeight = 0;


      // Analyse children
      for (var i=0, l=children.length; i<l; i++)
      {
        child = children[i];
        childEdge = child.getLayoutProperty("dock.edge");
        childHint = child.getSizeHint();
        childWidthPercent = child.getLayoutProperty("dock.width");
        childHeightPercent = child.getLayoutProperty("dock.height");

        childWidth = childWidthPercent ? Math.floor(width * parseFloat(childWidthPercent) / 100) : childHint.width;
        childHeight = childHeightPercent ? Math.floor(height * parseFloat(childHeightPercent) / 100) : childHint.height;

        childHints[i] = childHint;
        childWidths[i] = childWidth
        childHeights[i] = childHeight;

        if (childEdge === "north" || childEdge === "south")
        {
          usedHeight += childHeight;
        }
        else if (childEdge === "west" || childEdge === "east")
        {
          usedWidth += childWidth;
        }
        else
        {
          usedWidth += childWidth;
          usedHeight += childHeight;
        }
      }

      // console.debug("Used width: " + usedWidth + "/" + width);
      // console.debug("Used height: " + usedHeight + "/" + height);


      // Process widths for flex stretching/shrinking
      if (usedWidth != width)
      {
        var flexCandidates = [];
        var childGrow = usedWidth < width;

        for (var i=0, l=children.length; i<l; i++)
        {
          child = children[i];
          childEdge = child.getLayoutProperty("dock.edge");

          if (childEdge === "west" || childEdge === "east" || childEdge === "center")
          {
            if (child.canStretchX())
            {
              childFlex = child.getLayoutProperty("dock.flexX");

              if (childFlex == null || childFlex > 0)
              {
                childHint = childHints[i];

                flexCandidates.push({
                  id : i,
                  potential : childGrow ? childHint.maxWidth - childHint.width : childHint.width - childHint.minWidth,
                  flex : childGrow ? (childFlex || 1) : 1 / (childFlex || 1)
                });
              }
            }
          }
        }

        if (flexCandidates.length > 0)
        {
          var flexibleOffsets = qx.ui2.layout.Util.computeFlexOffsets(flexCandidates, width - usedWidth);

          for (var key in flexibleOffsets)
          {
            // this.debug(" - Correcting child[" + key + "] width by: " + flexibleOffsets[key]);

            childWidths[key] += flexibleOffsets[key];
            usedWidth += flexibleOffsets[key];
          }
        }
      }


      // Process height for flex stretching/shrinking
      if (usedHeight != height)
      {
        var flexCandidates = [];
        var childGrow = usedHeight < height;

        for (var i=0, l=children.length; i<l; i++)
        {
          child = children[i];
          childEdge = child.getLayoutProperty("dock.edge");

          if (childEdge === "north" || childEdge === "south" || childEdge === "center")
          {
            if (child.canStretchY())
            {
              childFlex = child.getLayoutProperty("dock.flexY");

              if (childFlex == null || childFlex > 0)
              {
                childHint = childHints[i];

                flexCandidates.push({
                  id : i,
                  potential : childGrow ? childHint.maxHeight - childHint.height : childHint.height - childHint.minHeight,
                  flex : childGrow ? (childFlex || 1) : 1 / (childFlex || 1)
                });
              }
            }
          }
        }

        if (flexCandidates.length > 0)
        {
          var flexibleOffsets = qx.ui2.layout.Util.computeFlexOffsets(flexCandidates, height - usedHeight);

          for (var key in flexibleOffsets)
          {
            // this.debug(" - Correcting child[" + key + "] height by: " + flexibleOffsets[key]);

            childHeights[key] += flexibleOffsets[key];
            usedHeight += flexibleOffsets[key];
          }
        }
      }

      // console.debug("Used width: " + usedWidth + "/" + width);
      // console.debug("Used height: " + usedHeight + "/" + height);


      // Apply children layout
      var nextTop=0, nextLeft=0, nextBottom=0, nextRight=0;
      var childLeft, childTop, childWidth, childHeight;

      for (var i=0, l=children.length; i<l; i++)
      {
        child = children[i];
        childEdge = child.getLayoutProperty("dock.edge");


        // Calculate child layout
        if (childEdge === "west")
        {
          // Simple top/left coordinates
          childLeft = nextLeft;
          childTop = nextTop;

          // Child preferred width
          childWidth = childWidths[i];

          // Full available height
          childHeight = height - nextTop - nextBottom;

          // Update coordinates, for next children
          nextLeft += childWidth;
        }
        else if (childEdge === "north")
        {
          // Simple top/left coordinates
          childLeft = nextLeft;
          childTop = nextTop;

          // Full available width
          childWidth = width - nextLeft - nextRight;

          // Child preferred height
          childHeight = childHeights[i];

          // Update coordinates, for next children
          nextTop += childHeight;
        }
        else if (childEdge === "east")
        {
          // Simple top coordinate + calculated left position
          childLeft = width - nextRight - childWidths[i];
          childTop = nextTop;

          // Child preferred width
          childWidth = childWidths[i];

          // Full available height
          childHeight = height - nextTop - nextBottom;

          // Update coordinates, for next children
          nextRight += childWidth;
        }
        else if (childEdge === "south")
        {
          // Simple left coordinate + calculated top position
          childLeft = nextLeft;
          childTop = height - nextBottom - childHeights[i];

          // Full available width
          childWidth = width - nextLeft - nextRight;

          // Child preferred height
          childHeight = childHeights[i];

          // Update coordinates, for next children
          nextBottom += childHeight;
        }
        else if (childEdge === "center")
        {
          // Simple top/left coordinates
          childLeft = nextLeft;
          childTop = nextTop;

          // Calculated width/height
          childWidth = width - nextLeft - nextRight;
          childHeight = height - nextTop - nextBottom;
        }

        // Apply layout
        child.renderLayout(childLeft, childTop, childWidth, childHeight);
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
    },





    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    _applyLayoutProperty : function(value, old)
    {
      this.invalidateLayoutCache();

      // Anything else TODO here?
    },




    /*
    ---------------------------------------------------------------------------
      LAYOUT HELPERS
    ---------------------------------------------------------------------------
    */

    /**
     * Returns the list of children, preprocessed by the value of the
     * {@link #sort} property.
     *
     * @type member
     * @return {qx.ui2.core.Widget[]} Presorted array of widgets
     */
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
          if (center) {
            throw new Error("It is not allowed to have more than one child aligned to 'center'!");
          }

          center = child;
        }
        else if (xfirst || yfirst)
        {
          if (childEdge === "north" || childEdge === "south") {
            yfirst ? high.push(child) : low.push(child);
          } else if (childEdge === "west" || childEdge === "east") {
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
    }
  }
});
