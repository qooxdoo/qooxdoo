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
 * Docks children to one of the edges.
 *
 * *Features*
 *
 * * Percent width for left/right/center attached children
 * * Percent height for top/bottom/center attached children
 * * Minimum and maximum dimensions
 * * Priorized growing/shrinking (flex)
 * * Auto sizing
 * * Margins and Spacings
 * * Alignment in orthogonal axis (e.g. alignX of north attached)
 * * Different sort options for children
 *
 * *Item Properties*
 *
 * <ul>
 * <li><strong>edge</strong> <em>(String)</em>: The edge where the layout item
 *   should be docked. This may be one of <code>north</code>, <code>east</code>,
 *   <code>south</code>, <code>west</code> or <code>center</code>.</li>
 * <li><strong>width</strong> <em>(String)</em>: Defines a percent
 *   width for the item. The percent width,
 *   when specified, is used instead of the width defined by the size hint.
 *   This is only supported for children added to the north or south edge or
 *   are centered in the middle of the layout.
 *   The minimum and maximum width still takes care of the elements limitations.
 *   It has no influence on the layout's size hint. Percents are mainly useful for
 *   widgets which are sized by the outer hierarchy.
 * </li>
 * <li><strong>height</strong> <em>(String)</em>: Defines a percent
 *   height for the item. The percent height,
 *   when specified, is used instead of the height defined by the size hint.
 *   This is only supported for children added to the west or east edge or
 *   are centered in the middle of the layout.
 *   The minimum and maximum height still takes care of the elements limitations.
 *   It has no influence on the layout's size hint. Percents are mainly useful for
 *   widgets which are sized by the outer hierarchy.
 * </li>
 * </ul>
 *
 * *Example*
 *
 * <pre class="javascript">
 * var layout = new qx.ui.layout.Dock();
 *
 * var w1 = new qx.ui.core.Widget();
 * var w2 = new qx.ui.core.Widget();
 * var w3 = new qx.ui.core.Widget();
 *
 * w1.setHeight(200);
 * w2.setWidth(150);
 *
 * var container = new qx.ui.container.Composite(layout);
 * container.add(w1, {edge:"north"});
 * container.add(w2, {edge:"west"});
 * container.add(w3, {edge:"center"});
 * </pre>
 *
 * *Detailed Description*
 *
 * Using this layout, items may be "docked" to a specific side
 * of the available space. Each displayed item reduces the available space
 * for the following children. Priorities depend on the position of
 * the child in the internal children list.
 *
 * *External Documentation*
 *
 * <a href='http://qooxdoo.org/documentation/0.8/layout/dock'>
 * Extended documentation</a> and links to demos of this layout in the qooxdoo wiki.
 *
 * *Alternative Names*
 *
 * * BorderLayout (Qt)
 * * DockPanel (XAML)
 * * BorderLayout (Java)
 * * BorderLayout (ExtJS)
 */
qx.Class.define("qx.ui.layout.Dock",
{
  extend : qx.ui.layout.Abstract,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param spacingX {Integer?0} The horizontal spacing. Sets {@link #spacingX}.
   * @param spacingY {Integer?0} The vertical spacing. Sets {@link #spacingY}.
   * @param separatorX {Decorator} Separator to render between columns
   * @param separatorY {Decorator} Separator to render between rows
   */
  construct : function(spacingX, spacingY, separatorX, separatorY)
  {
    this.base(arguments);

    if (spacingX) {
      this.setSpacingX(spacingX);
    }

    if (spacingY) {
      this.setSpacingY(spacingY);
    }

    if (separatorX) {
      this.setSeparatorX(separatorX);
    }

    if (separatorY) {
      this.setSeparatorY(separatorY);
    }
  },





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
      apply : "_applySort"
    },


    /** Separator lines to use between the horizontal objects */
    separatorX :
    {
      check : "Decorator",
      nullable : true,
      apply : "_applyLayoutChange"
    },


    /** Separator lines to use between the vertical objects */
    separatorY :
    {
      check : "Decorator",
      nullable : true,
      apply : "_applyLayoutChange"
    },


    /**
     * Whether separators should be collapsed so when a spacing is
     * configured the line go over into each other
     */
    connectSeparators :
    {
      check : "Boolean",
      init : false,
      apply : "_applyLayoutChange"
    },


    /** Horizontal spacing between two children */
    spacingX :
    {
      check : "Integer",
      init : 0,
      apply : "_applyLayoutChange"
    },


    /** Vertical spacing between two children */
    spacingY :
    {
      check : "Integer",
      init : 0,
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
    __children : null,
    __edges : null,


    // overridden
    verifyLayoutProperty : qx.core.Variant.select("qx.debug",
    {
      "on" : function(item, name, value)
      {
        this.assertInArray(name, ["flex", "edge", "height", "width"], "The property '"+name+"' is not supported by the dock layout!");

        if (name === "edge")
        {
          this.assertInArray(value, ["north", "south", "west", "east", "center"]);
        }
        else if (name === "flex")
        {
          this.assertNumber(value);
          this.assert(value >= 0);
        } else {
          this.assertMatch(value, qx.ui.layout.Util.PERCENT_VALUE);
        }
      },

      "off" : null
    }),


    // property apply
    _applySort : function()
    {
      // easiest way is to invalidate the cache
      this._invalidChildrenCache = true;

      // call normal layout change
      this._applyLayoutChange();
    },


    /** {Map} Maps edge IDs to numeric values */
    __edgeMap :
    {
      north : 1,
      south : 2,
      west : 3,
      east : 4,
      center : 5
    },


    /** {Map} Maps edges to align values */
    __alignMap :
    {
      1 : "top",
      2 : "bottom",
      3 : "left",
      4 : "right"
    },


    /**
     * Rebuilds cache for sorted children list.
     *
     * @return {void}
     */
    __rebuildCache : function()
    {
      var all = this._getLayoutChildren();
      var child, center;
      var length = all.length;

      var high = [];
      var low = [];
      var edge = [];

      var yfirst = this.getSort() === "y";
      var xfirst = this.getSort() === "x";

      for (var i=0; i<length; i++)
      {
        child = all[i];
        edge = child.getLayoutProperties().edge;

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

      // Combine sorted children list
      var result = high.concat(low);
      if (center) {
        result.push(center);
      }

      this.__children = result;

      // Cache edges for faster access
      var edges=[];
      for (var i=0; i<length; i++)
      {
        edge = result[i].getLayoutProperties().edge;
        edges[i] = this.__edgeMap[edge] || 5;
      }

      this.__edges = edges;

      // Clear invalidation marker
      delete this._invalidChildrenCache;
    },




    /*
    ---------------------------------------------------------------------------
      LAYOUT INTERFACE
    ---------------------------------------------------------------------------
    */

    // overridden
    renderLayout : function(availWidth, availHeight)
    {
      // Rebuild flex/width caches
      if (this._invalidChildrenCache) {
        this.__rebuildCache();
      }

      var util = qx.ui.layout.Util;
      var children = this.__children;
      var edges = this.__edges;
      var length = children.length;
      var flexibles, child, hint, props, flex, grow, width, height, offset;

      var widths = [];
      var heights = [];

      var separatorWidths = this._getSeparatorWidths();
      var spacingX = this.getSpacingX();
      var spacingY = this.getSpacingY();




      // **************************************
      //   Caching children data
      // **************************************

      var allocatedWidth = -spacingX;
      var allocatedHeight = -spacingY;

      if (separatorWidths.x) {
        allocatedWidth -= separatorWidths.x + spacingX;
      }

      if (separatorWidths.y) {
        allocatedHeight -= separatorWidths.y + spacingY;
      }

      for (var i=0; i<length; i++)
      {
        child = children[i];
        props = child.getLayoutProperties();
        hint = child.getSizeHint();

        width = hint.width;
        height = hint.height;

        if (props.width != null)
        {
          width = Math.floor(availWidth * parseFloat(props.width) / 100);
          if (width < hint.minWidth) {
            width = hint.minWidth;
          } else if (width > hint.maxWidth) {
            width = hint.maxWidth;
          }
        }

        if (props.height != null)
        {
          height = Math.floor(availHeight * parseFloat(props.height) / 100);
          if (height < hint.minHeight) {
            height = hint.minHeight;
          } else if (height > hint.maxHeight) {
            height = hint.maxHeight;
          }
        }

        widths[i] = width;
        heights[i] = height;

        // Update allocated width
        switch(edges[i])
        {
          // north+south
          case 1:
          case 2:
            allocatedHeight += height + child.getMarginTop() + child.getMarginBottom() + spacingY;
            if (separatorWidths.y) {
              allocatedHeight += separatorWidths.y + spacingY;
            }
            break;

          // west+east
          case 3:
          case 4:
            allocatedWidth += width + child.getMarginLeft() + child.getMarginRight() + spacingX;
            if (separatorWidths.x) {
              allocatedWidth += separatorWidths.x + spacingX;
            }
            break;

          // center
          default:
            allocatedWidth += width + child.getMarginLeft() + child.getMarginRight() + spacingX;
            allocatedHeight += height + child.getMarginTop() + child.getMarginBottom() + spacingY;

            if (separatorWidths.x) {
              allocatedWidth += separatorWidths.x + spacingX;
            }

            if (separatorWidths.y) {
              allocatedHeight += separatorWidths.y + spacingY;
            }
        }
      }





      // **************************************
      //   Horizontal flex support
      // **************************************

      if (allocatedWidth != availWidth)
      {
        flexibles = {};
        grow = allocatedWidth < availWidth;

        for (var i=0; i<length; i++)
        {
          child = children[i];

          switch(edges[i])
          {
            case 3:
            case 4:
            case 5:
              flex = child.getLayoutProperties().flex;

              // Default flex for centered children is '1'
              if (flex == null && edges[i] == 5) {
                flex = 1;
              }

              if (flex > 0)
              {
                hint = child.getSizeHint();

                flexibles[i] =
                {
                  min : hint.minWidth,
                  value : widths[i],
                  max : hint.maxWidth,
                  flex : flex
                };
              }
          }
        }

        var result = util.computeFlexOffsets(flexibles, availWidth, allocatedWidth);
        for (var i in result)
        {
          offset = result[i].offset;

          widths[i] += offset;
          allocatedWidth += offset;
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

          switch(edges[i])
          {
            case 1:
            case 2:
            case 5:
              flex = child.getLayoutProperties().flex;

              // Default flex for centered children is '1'
              if (flex == null && edges[i] == 5) {
                flex = 1;
              }

              if (flex > 0)
              {
                hint = child.getSizeHint();

                flexibles[i] =
                {
                  min : hint.minHeight,
                  value : heights[i],
                  max : hint.maxHeight,
                  flex : flex
                };
              }
          }
        }

        var result = util.computeFlexOffsets(flexibles, availHeight, allocatedHeight);
        for (var i in result)
        {
          offset = result[i].offset;

          heights[i] += offset;
          allocatedHeight += offset;
        }
      }





      // **************************************
      //   Layout children
      // **************************************

      // Pre configure separators
      this._clearSeparators();

      // Prepare loop
      var separatorX=this.getSeparatorX(), separatorY=this.getSeparatorY();
      var connectSeparators=this.getConnectSeparators();
      var nextTop=0, nextLeft=0;
      var left, top, width, height, used, edge;
      var separatorLeft, separatorTop, separatorWidth, separatorHeight;
      var marginTop, marginBottom, marginLeft, marginRight;
      var alignMap = this.__alignMap;

      for (var i=0; i<length; i++)
      {
        // Cache child data
        child = children[i];
        edge = edges[i];
        hint = child.getSizeHint();

        // Cache child margins
        marginTop = child.getMarginTop();
        marginBottom = child.getMarginBottom();
        marginLeft = child.getMarginLeft();
        marginRight = child.getMarginRight();

        // Calculate child layout
        switch(edge)
        {
          // north + south
          case 1:
          case 2:
            // Full available width
            width = availWidth - marginLeft - marginRight;

            // Limit width to min/max
            if (width < hint.minWidth) {
              width = hint.minWidth;
            } else if (width > hint.maxWidth) {
              width = hint.maxWidth;
            }

            // Child preferred height
            height = heights[i];

            // Compute position
            top = nextTop + util.computeVerticalAlignOffset(alignMap[edge], height, availHeight, marginTop, marginBottom);
            left = nextLeft + util.computeHorizontalAlignOffset(child.getAlignX()||"left", width, availWidth, marginLeft, marginRight);

            // Render the separator
            if (separatorWidths.y)
            {
              if (edge == 1) {
                separatorTop = nextTop + height + marginTop + spacingY + marginBottom;
              } else {
                separatorTop = nextTop + availHeight - height - marginTop - spacingY - marginBottom - separatorWidths.y;
              }

              separatorLeft = left;
              separatorWidth = availWidth;

              if (connectSeparators && separatorLeft > 0)
              {
                separatorLeft -= spacingX + marginLeft;
                separatorWidth += (spacingX) * 2;
              }
              else
              {
                separatorLeft -= marginLeft;
              }

              this._renderSeparator(separatorY, {
                left : separatorLeft,
                top : separatorTop,
                width : separatorWidth,
                height : separatorWidths.y
              });
            }

            // Update available height
            used = height + marginTop + marginBottom + spacingY;
            if (separatorWidths.y) {
              used += separatorWidths.y + spacingY;
            }

            availHeight -= used;

            // Update coordinates, for next child
            if (edge == 1) {
              nextTop += used;
            }

            break;


          // west + east
          case 3:
          case 4:
            // Full available height
            height = availHeight - marginTop - marginBottom;

            // Limit height to min/max
            if (height < hint.minHeight) {
              height = hint.minHeight;
            } else if (height > hint.maxHeight) {
              height = hint.maxHeight;
            }

            // Child preferred width
            width = widths[i];

            // Compute position
            left = nextLeft + util.computeHorizontalAlignOffset(alignMap[edge], width, availWidth, marginLeft, marginRight);
            top = nextTop + util.computeVerticalAlignOffset(child.getAlignY()||"top", height, availHeight, marginTop, marginBottom);

            // Render the separator
            if (separatorWidths.x)
            {
              if (edge == 3) {
                separatorLeft = nextLeft + width + marginLeft + spacingX + marginRight;
              } else {
                separatorLeft = nextLeft + availWidth - width - marginLeft - spacingX - marginRight - separatorWidths.x;
              }

              separatorTop = top;
              separatorHeight = availHeight;

              if (connectSeparators && separatorTop > 0)
              {
                separatorTop -= spacingY + marginTop;
                separatorHeight += (spacingY) * 2;
              }
              else
              {
                separatorTop -= marginTop;
              }

              this._renderSeparator(separatorX, {
                left : separatorLeft,
                top : separatorTop,
                width : separatorWidths.x,
                height : separatorHeight
              });
            }

            // Update available height
            used = width + marginLeft + marginRight + spacingX;
            if (separatorWidths.x) {
              used += separatorWidths.x + spacingX;
            }
            availWidth -= used;

            // Update coordinates, for next child
            if (edge == 3) {
              nextLeft += used;
            }

            break;


          // center
          default:
            // Calculated width/height
            width = availWidth - marginLeft - marginRight;
            height = availHeight - marginTop - marginBottom;

            // Limit width to min/max
            if (width < hint.minWidth) {
              width = hint.minWidth;
            } else if (width > hint.maxWidth) {
              width = hint.maxWidth;
            }

            // Limit height to min/max
            if (height < hint.minHeight) {
              height = hint.minHeight;
            } else if (height > hint.maxHeight) {
              height = hint.maxHeight;
            }

            // Compute coordinates (respect margins and alignments for both axis)
            left = nextLeft + util.computeHorizontalAlignOffset(child.getAlignX()||"left", width, availWidth, marginLeft, marginRight);
            top = nextTop + util.computeVerticalAlignOffset(child.getAlignY()||"top", height, availHeight, marginTop, marginBottom);
        }

        // Apply layout
        child.renderLayout(left, top, width, height);
      }
    },


    /**
     * Computes the dimensions each separater on both the <code>x</code> and
     * <code>y</code> axis needs.
     *
     * @return {Map} Map with the keys <code>x</code> and
     *   <code>y</code>
     */
    _getSeparatorWidths : function()
    {
      var separatorX=this.getSeparatorX(), separatorY=this.getSeparatorY();
      if (separatorX || separatorY) {
        var decorationManager = qx.theme.manager.Decoration.getInstance();
      }

      if (separatorX)
      {
        var separatorInstanceX = decorationManager.resolve(separatorX);
        var separatorInsetsX = separatorInstanceX.getInsets();
        var separatorWidthX = separatorInsetsX.left + separatorInsetsX.right;
      }

      if (separatorY)
      {
        var separatorInstanceY = decorationManager.resolve(separatorY);
        var separatorInsetsY = separatorInstanceY.getInsets();
        var separatorWidthY = separatorInsetsY.top + separatorInsetsY.bottom;
      }

      return {
        x : separatorWidthX || 0,
        y : separatorWidthY || 0
      }
    },


    // overridden
    _computeSizeHint : function()
    {
      // Rebuild flex/width caches
      if (this._invalidChildrenCache) {
        this.__rebuildCache();
      }

      var children = this.__children;
      var edges = this.__edges;
      var length = children.length;
      var hint, child;
      var marginX, marginY;

      var widthX=0, minWidthX=0;
      var heightX=0, minHeightX=0;
      var widthY=0, minWidthY=0;
      var heightY=0, minHeightY=0;

      var separatorWidths = this._getSeparatorWidths();
      var spacingX=this.getSpacingX(), spacingY=this.getSpacingY();
      var spacingSumX=-spacingX, spacingSumY=-spacingY;

      if (separatorWidths.x) {
        spacingSumX -= separatorWidths.x + spacingX;
      }

      if (separatorWidths.y) {
        spacingSumY -= separatorWidths.y + spacingY;
      }

      // Detect children sizes
      for (var i=0; i<length; i++)
      {
        child = children[i];
        hint = child.getSizeHint();

        // Pre-cache margin sums
        marginX = child.getMarginLeft() + child.getMarginRight();
        marginY = child.getMarginTop() + child.getMarginBottom();

        // Ok, this part is a bit complicated :)
        switch(edges[i])
        {
          case 1:
          case 2:
            // Find the maximum width used by these fully stretched items
            // The recommended width used by these must add the currently
            // occupied width by the ortogonal ordered children.
            widthY = Math.max(widthY, hint.width + widthX + marginX);
            minWidthY = Math.max(minWidthY, hint.minWidth + minWidthX + marginX);

            // Add the needed heights of this widget
            heightY += hint.height + marginY;
            minHeightY += hint.minHeight + marginY;

            // Add spacing
            spacingSumY += spacingY;
            if (separatorWidths.y) {
              spacingSumY += separatorWidths.y + spacingY;
            }

            break;

          case 3:
          case 4:
            // Find the maximum height used by these fully stretched items
            // The recommended height used by these must add the currently
            // occupied height by the ortogonal ordered children.
            heightX = Math.max(heightX, hint.height + heightY + marginY);
            minHeightX = Math.max(minHeightX, hint.minHeight + minHeightY + marginY);

            // Add the needed widths of this widget
            widthX += hint.width + marginX;
            minWidthX += hint.minWidth + marginX;

            // Add spacing
            spacingSumX += spacingX;
            if (separatorWidths.x) {
              spacingSumX += separatorWidths.x + spacingX;
            }

            break;

          default:
            // A centered widget must be added to both sums as
            // it stretches into the remaining available space.
            widthX += hint.width + marginX;
            minWidthX += hint.minWidth + marginX;

            heightY += hint.height + marginY;
            minHeightY += hint.minHeight + marginY;

            // Add spacing
            spacingSumX += spacingX;
            if (separatorWidths.x) {
              spacingSumX += separatorWidths.x + spacingX;
            }

            spacingSumY += spacingY;
            if (separatorWidths.y) {
              spacingSumY += separatorWidths.y + spacingY;
            }
        }
      }

      var minWidth = Math.max(minWidthX, minWidthY) + spacingSumX;
      var width = Math.max(widthX, widthY) + spacingSumX;
      var minHeight = Math.max(minHeightX, minHeightY) + spacingSumY;
      var height = Math.max(heightX, heightY) + spacingSumY;

      // Return hint
      return {
        minWidth : minWidth,
        width : width,
        minHeight : minHeight,
        height : height
      };
    }
  },



  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this._disposeFields(
      "__edges",
      "__children"
    );
  }
});
