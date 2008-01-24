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
 * A feature rich dock layout. Docks children to one of the edges.
 *
 * Supports the following features:
 *
 * * Percent width for left/right/center attached children
 * * Percent height for top/bottom/center attached children
 * * Minimum and maximum dimensions
 * * Priorized growing/shrinking (flex)
 * * Auto sizing
 * * Different sort options for children
 *
 * Notes:
 *
 * * For left/right attached childs the height is ignored.
 * * For top/bottom attached childs the width is ignored.
 * * However: In both cases the min/max dimensions are respected.
 *
 * Names used by other toolkits:
 *
 * * BorderLayout (Qt)
 * * DockPanel (XAML)
 * * BorderLayout (Java)
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
      check : [ "auto", "y", "x" ],
      init : "auto",
      apply : "_applyLayoutChange"
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
     * @param child {qx.ui2.core.Widget} Widget to add
     * @param edge {String} Edge to attach. Could be anyone of
     *   <code>north</code>, <code>west</code>, <code>south</code>,
     *   <code>east</code> or <code>center</code>.
     * @param options {Map?null} Optional layout data for widget.
     * @return {qx.ui2.layout.HBox} This object (for chaining support)
     */
    add : function(child, edge, options)
    {
      this.base(arguments, child, options);
      this.addLayoutProperty(child, "edge", edge);

      // Chaining support
      return this;
    },





    /*
    ---------------------------------------------------------------------------
      LAYOUT INTERFACE
    ---------------------------------------------------------------------------
    */

    // overridden
    renderLayout : function(availWidth, availHeight)
    {
      var children = this._getSortedChildren();
      var length = children.length;
      var flexibles, child, hint, props, flex, grow, width, height;

      var widths = [];
      var heights = [];

      var allocatedWidth = 0;
      var allocatedHeight = 0;





      // **************************************
      //   Caching children data
      // **************************************

      for (var i=0; i<length; i++)
      {
        child = children[i];
        props = this.getLayoutProperties(child);
        hint = child.getSizeHint();

        width = props.width ? Math.floor(availWidth * parseFloat(props.width) / 100) : hint.width;
        height = props.height ? Math.floor(availHeight * parseFloat(props.height) / 100) : hint.height;

        widths[i] = width
        heights[i] = height;

        if (props.edge === "north" || props.edge === "south")
        {
          allocatedHeight += height;
        }
        else if (props.edge === "west" || props.edge === "east")
        {
          allocatedWidth += width;
        }
        else
        {
          allocatedWidth += width;
          allocatedHeight += height;
        }
      }

      // console.debug("Used width: " + allocatedWidth + "/" + availWidth);
      // console.debug("Used height: " + allocatedHeight + "/" + availHeight);




      // **************************************
      //   Horizontal flex support
      // **************************************

      if (allocatedWidth != availWidth)
      {
        flexibles = [];
        grow = allocatedWidth < availWidth;

        for (var i=0; i<length; i++)
        {
          child = children[i];
          props = this.getLayoutProperties(child);

          if (props.edge === "west" || props.edge === "east" || props.edge === "center")
          {
            if (child.canStretchX())
            {
              flex = props.flexX;

              if (flex == null || flex > 0)
              {
                hint = child.getSizeHint();

                flexibles.push({
                  id : i,
                  potential : grow ? hint.maxWidth - hint.width : hint.width - hint.minWidth,
                  flex : grow ? (flex || 1) : 1 / (flex || 1)
                });
              }
            }
          }
        }

        if (flexibles.length > 0)
        {
          var flexibleOffsets = qx.ui2.layout.Util.computeFlexOffsets(flexibles, availWidth - allocatedWidth);

          for (var key in flexibleOffsets)
          {
            widths[key] += flexibleOffsets[key];
            allocatedWidth += flexibleOffsets[key];
          }
        }
      }




      // **************************************
      //   Vertical flex support
      // **************************************

      // Process height for flex stretching/shrinking
      if (allocatedHeight != availHeight)
      {
        flexibles = [];
        grow = allocatedHeight < availHeight;

        for (var i=0; i<length; i++)
        {
          child = children[i];
          props = this.getLayoutProperties(child);

          if (props.edge === "north" || props.edge === "south" || props.edge === "center")
          {
            if (child.canStretchY())
            {
              flex = props.flexY;

              if (flex == null || flex > 0)
              {
                hint = child.getSizeHint();

                flexibles.push({
                  id : i,
                  potential : grow ? hint.maxHeight - hint.height : hint.height - hint.minHeight,
                  flex : grow ? (flex || 1) : 1 / (flex || 1)
                });
              }
            }
          }
        }

        if (flexibles.length > 0)
        {
          var flexibleOffsets = qx.ui2.layout.Util.computeFlexOffsets(flexibles, availHeight - allocatedHeight);

          for (var key in flexibleOffsets)
          {
            heights[key] += flexibleOffsets[key];
            allocatedHeight += flexibleOffsets[key];
          }
        }
      }

      // console.debug("Used width: " + allocatedWidth + "/" + availWidth);
      // console.debug("Used height: " + allocatedHeight + "/" + availHeight);




      // **************************************
      //   Layout children
      // **************************************

      var nextTop=0, nextLeft=0, nextBottom=0, nextRight=0;
      var left, top, width, height;

      for (var i=0; i<length; i++)
      {
        // Calculate child layout
        switch(this.getLayoutProperty(children[i], "edge"))
        {
          case "west":
            // Simple top/left coordinates
            left = nextLeft;
            top = nextTop;

            // Child preferred width
            width = widths[i];

            // Full available height
            height = availHeight - nextTop - nextBottom;

            // Update coordinates, for next children
            nextLeft += width;

            break;

          case "north":
            // Simple top/left coordinates
            left = nextLeft;
            top = nextTop;

            // Full available width
            width = availWidth - nextLeft - nextRight;

            // Child preferred height
            height = heights[i];

            // Update coordinates, for next children
            nextTop += height;

            break;

          case "east":
            // Simple top coordinate + calculated left position
            left = availWidth - nextRight - widths[i];
            top = nextTop;

            // Child preferred width
            width = widths[i];

            // Full available height
            height = availHeight - nextTop - nextBottom;

            // Update coordinates, for next children
            nextRight += width;

            break;

          case "south":
            // Simple left coordinate + calculated top position
            left = nextLeft;
            top = availHeight - nextBottom - heights[i];

            // Full available width
            width = availWidth - nextLeft - nextRight;

            // Child preferred height
            height = heights[i];

            // Update coordinates, for next children
            nextBottom += height;

            break;

          default:
            // Simple top/left coordinates
            left = nextLeft;
            top = nextTop;

            // Calculated width/height
            width = availWidth - nextLeft - nextRight;
            height = availHeight - nextTop - nextBottom;
        }

        // Apply layout
        children[i].renderLayout(left, top, width, height);
      }
    },


    // overridden
    _computeSizeHint : function()
    {
      var children = this._getSortedChildren();
      var length = children.length;
      var hint, child;

      var widthX=0, minWidthX=0;
      var heightX=0, minHeightX=0;
      var widthY=0, minWidthY=0;
      var heightY=0, minHeightY=0;

      // Detect children sizes
      for (var i=0; i<length; i++)
      {
        child = children[i];
        hint = child.getSizeHint();

        // Ok, this part is a bit complicated :)
        switch(this.getLayoutProperty(child, "edge"))
        {
          case "north":
          case "south":
            // Find the maximum width used by these fully stretched items
            // The recommended width used by these must add the currently
            // occupied width by the ortogonal ordered children.
            widthY = Math.max(widthY, hint.width + widthX);
            minWidthY = Math.max(minWidthY, hint.minWidth + minWidthX);

            // Add the needed heights of this widget
            heightY += hint.height;
            minHeightY += hint.minHeight;

            break;

          case "west":
          case "east":
            // Find the maximum height used by these fully stretched items
            // The recommended height used by these must add the currently
            // occupied height by the ortogonal ordered children.
            heightX = Math.max(heightX, hint.height + heightY);
            minHeightX = Math.max(minHeightX, hint.minHeight + minHeightY);

            // Add the needed widths of this widget
            widthX += hint.width;
            minWidthX += hint.minWidth;

            break;

          default:
            // A centered widget must be added to both sums as
            // it stretches into the remaining available space.
            widthX += hint.width;
            minWidthX += hint.minWidth;

            heightY += hint.height;
            minHeightY += hint.minHeight;
        }
      }

      // Return hint
      return {
        minWidth : Math.max(minWidthX, minWidthY),
        width : Math.max(widthX, widthY),
        maxWidth : Infinity,
        minHeight : Math.max(minHeightX, minHeightY),
        height : Math.max(heightX, heightY),
        maxHeight : Infinity
      };
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
      var children = this.getLayoutChildren();
      var child, edge, center;
      var length = children.length;

      var high = [];
      var low = [];
      var center;
      var yfirst = this.getSort() === "y";
      var xfirst = this.getSort() === "x";

      for (var i=0; i<length; i++)
      {
        child = children[i];
        edge = this.getLayoutProperty(child, "edge");

        if (edge === "center")
        {
          if (center) {
            throw new Error("It is not allowed to have more than one child aligned to 'center'!");
          }

          center = child;
        }
        else if (xfirst || yfirst)
        {
          if (edge === "north" || edge === "south") {
            yfirst ? high.push(child) : low.push(child);
          } else if (edge === "west" || edge === "east") {
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
