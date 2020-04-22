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
 * The grid layout manager arranges the items in a two dimensional
 * grid. Widgets can be placed into the grid's cells and may span multiple rows
 * and columns.
 *
 * *Features*
 *
 * * Flex values for rows and columns
 * * Minimal and maximal column and row sizes
 * * Manually setting of column and row sizes
 * * Horizontal and vertical alignment
 * * Horizontal and vertical spacing
 * * Column and row spans
 * * Auto-sizing
 *
 * *Item Properties*
 *
 * <ul>
 * <li><strong>row</strong> <em>(Integer)</em>: The row of the cell the
 *   widget should occupy. Each cell can only containing one widget. This layout
 *   property is mandatory.
 * </li>
 * <li><strong>column</strong> <em>(Integer)</em>: The column of the cell the
 *   widget should occupy. Each cell can only containing one widget. This layout
 *   property is mandatory.
 * </li>
 * <li><strong>rowSpan</strong> <em>(Integer)</em>: The number of rows, the
 *   widget should span, starting from the row specified in the <code>row</code>
 *   property. The cells in the spanned rows must be empty as well.
 * </li>
 * <li><strong>colSpan</strong> <em>(Integer)</em>: The number of columns, the
 *   widget should span, starting from the column specified in the <code>column</code>
 *   property. The cells in the spanned columns must be empty as well.
 * </li>
 * </ul>
 *
 * *Example*
 *
 * Here is a little example of how to use the grid layout.
 *
 * <pre class="javascript">
 * var layout = new qx.ui.layout.Grid();
 * layout.setRowFlex(0, 1); // make row 0 flexible
 * layout.setColumnWidth(1, 200); // set with of column 1 to 200 pixel
 *
 * var container = new qx.ui.container.Composite(layout);
 * container.add(new qx.ui.core.Widget(), {row: 0, column: 0});
 * container.add(new qx.ui.core.Widget(), {row: 0, column: 1});
 * container.add(new qx.ui.core.Widget(), {row: 1, column: 0, rowSpan: 2});
 * </pre>
 *
 * *External Documentation*
 *
 * <a href='http://qooxdoo.org/docs/#layout/grid.md'>
 * Extended documentation</a> and links to demos of this layout in the qooxdoo manual.
 */
qx.Class.define("qx.ui.layout.Grid",
{
  extend : qx.ui.layout.Abstract,






  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param spacingX {Integer?0} The horizontal spacing between grid cells.
   *     Sets {@link #spacingX}.
   * @param spacingY {Integer?0} The vertical spacing between grid cells.
   *     Sets {@link #spacingY}.
   */
  construct : function(spacingX, spacingY)
  {
    this.base(arguments);

    this.__rowData = [];
    this.__colData = [];

    if (spacingX) {
      this.setSpacingX(spacingX);
    }

    if (spacingY) {
      this.setSpacingY(spacingY);
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
     * The horizontal spacing between grid cells.
     */
    spacingX :
    {
      check : "Integer",
      init : 0,
      apply : "_applyLayoutChange"
    },


    /**
     * The vertical spacing between grid cells.
     */
    spacingY :
    {
      check : "Integer",
      init : 0,
      apply : "_applyLayoutChange"
    },


    /**
     * Allow growing of spanning cells' widths beyond the accumulated widths of the columns.
     * The default behavior (init value false) is that the width of the spanning cell is
     * determined by the accumulated width of the columns (plus spacing).
     * Setting this property to true lets the cell width grow as needed to show
     * the widget in the spanning cell, which also enlarges the width of the spanned columns.
     */
    allowGrowSpannedCellWidth :
    {
      check : "Boolean",
      init : false,
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
    /** @type {Array} 2D array of grid cell data */
    __grid : null,
    __rowData : null,
    __colData : null,

    __colSpans : null,
    __rowSpans : null,
    __maxRowIndex : null,
    __maxColIndex : null,

    /** @type {Array} cached row heights */
    __rowHeights : null,

    /** @type {Array} cached column widths */
    __colWidths : null,



    // overridden
    verifyLayoutProperty : qx.core.Environment.select("qx.debug",
    {
      "true" : function(item, name, value)
      {
        var layoutProperties = {
          "row" : 1,
          "column" : 1,
          "rowSpan" : 1,
          "colSpan" : 1
        };
        this.assert(layoutProperties[name] == 1, "The property '"+name+"' is not supported by the Grid layout!");
        this.assertInteger(value);
        this.assert(value >= 0, "Value must be positive");
      },

      "false" : null
    }),


    /**
     * Rebuild the internal representation of the grid
     */
    __buildGrid : function()
    {
      var grid = [];
      var colSpans = [];
      var rowSpans = [];

      var maxRowIndex = -1;
      var maxColIndex = -1;

      var children = this._getLayoutChildren();

      for (var i=0,l=children.length; i<l; i++)
      {
        var child = children[i];
        var props = child.getLayoutProperties();

        var row = props.row;
        var column = props.column;

        props.colSpan = props.colSpan || 1;
        props.rowSpan = props.rowSpan || 1;

        // validate arguments
        if (row == null || column == null) {
          throw new Error(
            "The layout properties 'row' and 'column' of the child widget '" +
            child + "' must be defined!"
          );
        }

        if (grid[row] && grid[row][column]) {
          throw new Error(
            "Cannot add widget '" + child + "'!. " +
            "There is already a widget '" + grid[row][column] +
            "' in this cell (" + row + ", " + column + ") for '" + this + "'"
          );
        }

        for (var x=column; x<column+props.colSpan; x++)
        {
          for (var y=row; y<row+props.rowSpan; y++)
          {
            if (grid[y] == undefined) {
               grid[y] = [];
            }

            grid[y][x] = child;

            maxColIndex = Math.max(maxColIndex, x);
            maxRowIndex = Math.max(maxRowIndex, y);
          }
        }

        if (props.rowSpan > 1) {
          rowSpans.push(child);
        }

        if (props.colSpan > 1) {
          colSpans.push(child);
        }
      }

      // make sure all columns are defined so that accessing the grid using
      // this.__grid[column][row] will never raise an exception
      for (var y=0; y<=maxRowIndex; y++) {
        if (grid[y] == undefined) {
           grid[y] = [];
        }
      }

      this.__grid = grid;

      this.__colSpans = colSpans;
      this.__rowSpans = rowSpans;

      this.__maxRowIndex = maxRowIndex;
      this.__maxColIndex = maxColIndex;

      this.__rowHeights = null;
      this.__colWidths = null;

      // Clear invalidation marker
      delete this._invalidChildrenCache;
    },


    /**
     * Stores data for a grid row
     *
     * @param row {Integer} The row index
     * @param key {String} The key under which the data should be stored
     * @param value {var} data to store
     */
    _setRowData : function(row, key, value)
    {
      var rowData = this.__rowData[row];

      if (!rowData)
      {
        this.__rowData[row] = {};
        this.__rowData[row][key] = value;
      }
      else
      {
        rowData[key] = value;
      }
    },


    /**
     * Stores data for a grid column
     *
     * @param column {Integer} The column index
     * @param key {String} The key under which the data should be stored
     * @param value {var} data to store
     */
    _setColumnData : function(column, key, value)
    {
      var colData = this.__colData[column];

      if (!colData)
      {
        this.__colData[column] = {};
        this.__colData[column][key] = value;
      }
      else
      {
        colData[key] = value;
      }
    },


    /**
     * Shortcut to set both horizontal and vertical spacing between grid cells
     * to the same value.
     *
     * @param spacing {Integer} new horizontal and vertical spacing
     * @return {qx.ui.layout.Grid} This object (for chaining support).
     */
    setSpacing : function(spacing)
    {
      this.setSpacingY(spacing);
      this.setSpacingX(spacing);
      return this;
    },


    /**
     * Set the default cell alignment for a column. This alignment can be
     * overridden on a per cell basis by setting the cell's content widget's
     * <code>alignX</code> and <code>alignY</code> properties.
     *
     * If on a grid cell both row and a column alignment is set, the horizontal
     * alignment is taken from the column and the vertical alignment is taken
     * from the row.
     *
     * @param column {Integer} Column index
     * @param hAlign {String} The horizontal alignment. Valid values are
     *    "left", "center" and "right".
     * @param vAlign {String} The vertical alignment. Valid values are
     *    "top", "middle", "bottom"
     * @return {qx.ui.layout.Grid} This object (for chaining support)
     */
    setColumnAlign : function(column, hAlign, vAlign)
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        this.assertInteger(column, "Invalid parameter 'column'");
        this.assertInArray(hAlign, ["left", "center", "right"]);
        this.assertInArray(vAlign, ["top", "middle", "bottom"]);
      }

      this._setColumnData(column, "hAlign", hAlign);
      this._setColumnData(column, "vAlign", vAlign);

      this._applyLayoutChange();

      return this;
    },


    /**
     * Get a map of the column's alignment.
     *
     * @param column {Integer} The column index
     * @return {Map} A map with the keys <code>vAlign</code> and <code>hAlign</code>
     *     containing the vertical and horizontal column alignment.
     */
    getColumnAlign : function(column)
    {
      var colData = this.__colData[column] || {};

      return {
        vAlign : colData.vAlign || "top",
        hAlign : colData.hAlign || "left"
      };
    },


    /**
     * Set the default cell alignment for a row. This alignment can be
     * overridden on a per cell basis by setting the cell's content widget's
     * <code>alignX</code> and <code>alignY</code> properties.
     *
     * If on a grid cell both row and a column alignment is set, the horizontal
     * alignment is taken from the column and the vertical alignment is taken
     * from the row.
     *
     * @param row {Integer} Row index
     * @param hAlign {String} The horizontal alignment. Valid values are
     *    "left", "center" and "right".
     * @param vAlign {String} The vertical alignment. Valid values are
     *    "top", "middle", "bottom"
     * @return {qx.ui.layout.Grid} This object (for chaining support)
     */
    setRowAlign : function(row, hAlign, vAlign)
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        this.assertInteger(row, "Invalid parameter 'row'");
        this.assertInArray(hAlign, ["left", "center", "right"]);
        this.assertInArray(vAlign, ["top", "middle", "bottom"]);
      }

      this._setRowData(row, "hAlign", hAlign);
      this._setRowData(row, "vAlign", vAlign);

      this._applyLayoutChange();

      return this;
    },


    /**
     * Get a map of the row's alignment.
     *
     * @param row {Integer} The Row index
     * @return {Map} A map with the keys <code>vAlign</code> and <code>hAlign</code>
     *     containing the vertical and horizontal row alignment.
     */
    getRowAlign : function(row)
    {
      var rowData = this.__rowData[row] || {};

      return {
        vAlign : rowData.vAlign || "top",
        hAlign : rowData.hAlign || "left"
      };
    },


    /**
     * Get the widget located in the cell. If a the cell is empty or the widget
     * has a {@link qx.ui.core.Widget#visibility} value of <code>exclude</code>,
     * <code>null</code> is returned.
     *
     * @param row {Integer} The cell's row index
     * @param column {Integer} The cell's column index
     * @return {qx.ui.core.Widget|null}The cell's widget. The value may be null.
     */
    getCellWidget : function(row, column)
    {
      if (this._invalidChildrenCache) {
        this.__buildGrid();
      }

      var row = this.__grid[row] || {};
      return row[column] ||  null;
    },


    /**
     * Get the number of rows in the grid layout.
     *
     * @return {Integer} The number of rows in the layout
     */
    getRowCount : function()
    {
      if (this._invalidChildrenCache) {
        this.__buildGrid();
      }

      return this.__maxRowIndex + 1;
    },


    /**
     * Get the number of columns in the grid layout.
     *
     * @return {Integer} The number of columns in the layout
     */
    getColumnCount : function()
    {
      if (this._invalidChildrenCache) {
        this.__buildGrid();
      }

      return this.__maxColIndex + 1;
    },


    /**
     * Get a map of the cell's alignment. For vertical alignment the row alignment
     * takes precedence over the column alignment. For horizontal alignment it is
     * the over way round. If an alignment is set on the cell widget using
     * {@link qx.ui.core.LayoutItem#setLayoutProperties}, this alignment takes
     * always precedence over row or column alignment.
     *
     * @param row {Integer} The cell's row index
     * @param column {Integer} The cell's column index
     * @return {Map} A map with the keys <code>vAlign</code> and <code>hAlign</code>
     *     containing the vertical and horizontal cell alignment.
     */
    getCellAlign : function(row, column)
    {
      var vAlign = "top";
      var hAlign = "left";

      var rowData = this.__rowData[row];
      var colData = this.__colData[column];

      var widget = this.__grid[row][column];
      if (widget)
      {
        var widgetProps = {
          vAlign : widget.getAlignY(),
          hAlign : widget.getAlignX()
        };
      }
      else
      {
        widgetProps = {};
      }

      // compute vAlign
      // precedence : widget -> row -> column
      if (widgetProps.vAlign) {
        vAlign = widgetProps.vAlign;
      } else if (rowData && rowData.vAlign) {
        vAlign = rowData.vAlign;
      } else if (colData && colData.vAlign) {
        vAlign = colData.vAlign;
      }

      // compute hAlign
      // precedence : widget -> column -> row
      if (widgetProps.hAlign) {
        hAlign = widgetProps.hAlign;
      } else if (colData && colData.hAlign) {
        hAlign = colData.hAlign;
      } else if (rowData && rowData.hAlign) {
        hAlign = rowData.hAlign;
      }

      return {
        vAlign : vAlign,
        hAlign : hAlign
      };
    },


    /**
     * Set the flex value for a grid column.
     * By default the column flex value is <code>0</code>.
     *
     * @param column {Integer} The column index
     * @param flex {Integer} The column's flex value
     * @return {qx.ui.layout.Grid} This object (for chaining support)
     */
    setColumnFlex : function(column, flex)
    {
      this._setColumnData(column, "flex", flex);
      this._applyLayoutChange();
      return this;
    },


    /**
     * Get the flex value of a grid column.
     *
     * @param column {Integer} The column index
     * @return {Integer} The column's flex value
     */
    getColumnFlex : function(column)
    {
      var colData = this.__colData[column] || {};
      return colData.flex !== undefined ? colData.flex : 0;
    },


    /**
     * Set the flex value for a grid row.
     * By default the row flex value is <code>0</code>.
     *
     * @param row {Integer} The row index
     * @param flex {Integer} The row's flex value
     * @return {qx.ui.layout.Grid} This object (for chaining support)
     */
    setRowFlex : function(row, flex)
    {
      this._setRowData(row, "flex", flex);
      this._applyLayoutChange();
      return this;
    },


    /**
     * Get the flex value of a grid row.
     *
     * @param row {Integer} The row index
     * @return {Integer} The row's flex value
     */
    getRowFlex : function(row)
    {
      var rowData = this.__rowData[row] || {};
      var rowFlex = rowData.flex !== undefined ? rowData.flex : 0;
      return rowFlex;
    },


    /**
     * Set the maximum width of a grid column.
     * The default value is <code>Infinity</code>.
     *
     * @param column {Integer} The column index
     * @param maxWidth {Integer} The column's maximum width
     * @return {qx.ui.layout.Grid} This object (for chaining support)
     */
    setColumnMaxWidth : function(column, maxWidth)
    {
      this._setColumnData(column, "maxWidth", maxWidth);
      this._applyLayoutChange();
      return this;
    },


    /**
     * Get the maximum width of a grid column.
     *
     * @param column {Integer} The column index
     * @return {Integer} The column's maximum width
     */
    getColumnMaxWidth : function(column)
    {
      var colData = this.__colData[column] || {};
      return colData.maxWidth !== undefined ? colData.maxWidth : Infinity;
    },


    /**
     * Set the preferred width of a grid column.
     * The default value is <code>Infinity</code>.
     *
     * @param column {Integer} The column index
     * @param width {Integer} The column's width
     * @return {qx.ui.layout.Grid} This object (for chaining support)
     */
    setColumnWidth : function(column, width)
    {
      this._setColumnData(column, "width", width);
      this._applyLayoutChange();
      return this;
    },


    /**
     * Get the preferred width of a grid column.
     *
     * @param column {Integer} The column index
     * @return {Integer} The column's width
     */
    getColumnWidth : function(column)
    {
      var colData = this.__colData[column] || {};
      return colData.width !== undefined ? colData.width : null;
    },


    /**
     * Set the minimum width of a grid column.
     * The default value is <code>0</code>.
     *
     * @param column {Integer} The column index
     * @param minWidth {Integer} The column's minimum width
     * @return {qx.ui.layout.Grid} This object (for chaining support)
     */
    setColumnMinWidth : function(column, minWidth)
    {
      this._setColumnData(column, "minWidth", minWidth);
      this._applyLayoutChange();
      return this;
    },


    /**
     * Get the minimum width of a grid column.
     *
     * @param column {Integer} The column index
     * @return {Integer} The column's minimum width
     */
    getColumnMinWidth : function(column)
    {
      var colData = this.__colData[column] || {};
      return colData.minWidth || 0;
    },


    /**
     * Set the maximum height of a grid row.
     * The default value is <code>Infinity</code>.
     *
     * @param row {Integer} The row index
     * @param maxHeight {Integer} The row's maximum width
     * @return {qx.ui.layout.Grid} This object (for chaining support)
     */
    setRowMaxHeight : function(row, maxHeight)
    {
      this._setRowData(row, "maxHeight", maxHeight);
      this._applyLayoutChange();
      return this;
    },


    /**
     * Get the maximum height of a grid row.
     *
     * @param row {Integer} The row index
     * @return {Integer} The row's maximum width
     */
    getRowMaxHeight : function(row)
    {
      var rowData = this.__rowData[row] || {};
      return rowData.maxHeight || Infinity;
    },


    /**
     * Set the preferred height of a grid row.
     * The default value is <code>Infinity</code>.
     *
     * @param row {Integer} The row index
     * @param height {Integer} The row's width
     * @return {qx.ui.layout.Grid} This object (for chaining support)
     */
    setRowHeight : function(row, height)
    {
      this._setRowData(row, "height", height);
      this._applyLayoutChange();
      return this;
    },


    /**
     * Get the preferred height of a grid row.
     *
     * @param row {Integer} The row index
     * @return {Integer} The row's width
     */
    getRowHeight : function(row)
    {
      var rowData = this.__rowData[row] || {};
      return rowData.height !== undefined ? rowData.height : null;
    },


    /**
     * Set the minimum height of a grid row.
     * The default value is <code>0</code>.
     *
     * @param row {Integer} The row index
     * @param minHeight {Integer} The row's minimum width
     * @return {qx.ui.layout.Grid} This object (for chaining support)
     */
    setRowMinHeight : function(row, minHeight)
    {
      this._setRowData(row, "minHeight", minHeight);
      this._applyLayoutChange();
      return this;
    },


    /**
     * Get the minimum height of a grid row.
     *
     * @param row {Integer} The row index
     * @return {Integer} The row's minimum width
     */
    getRowMinHeight : function(row)
    {
      var rowData = this.__rowData[row] || {};
      return rowData.minHeight || 0;
    },


    /**
     * Computes the widget's size hint including the widget's margins
     *
     * @param widget {qx.ui.core.LayoutItem} The widget to get the size for
     * @return {Map} a size hint map
     */
    _getOuterSize : function(widget)
    {
      var hint = widget.getSizeHint();
      var hMargins = widget.getMarginLeft() + widget.getMarginRight();
      var vMargins = widget.getMarginTop() + widget.getMarginBottom();

      var outerSize = {
        height: hint.height + vMargins,
        width: hint.width + hMargins,
        minHeight: hint.minHeight + vMargins,
        minWidth: hint.minWidth + hMargins,
        maxHeight: hint.maxHeight + vMargins,
        maxWidth: hint.maxWidth + hMargins
      };

      return outerSize;
    },


    /**
     * Check whether all row spans fit with their preferred height into the
     * preferred row heights. If there is not enough space, the preferred
     * row sizes are increased. The distribution respects the flex and max
     * values of the rows.
     *
     *  The same is true for the min sizes.
     *
     *  The height array is modified in place.
     *
     * @param rowHeights {Map[]} The current row height array as computed by
     *     {@link #_getRowHeights}.
     */
    _fixHeightsRowSpan : function(rowHeights)
    {
      var vSpacing = this.getSpacingY();

      for (var i=0, l=this.__rowSpans.length; i<l; i++)
      {
        var widget = this.__rowSpans[i];

        var hint = this._getOuterSize(widget);

        var widgetProps = widget.getLayoutProperties();
        var widgetRow = widgetProps.row;

        var prefSpanHeight = vSpacing * (widgetProps.rowSpan - 1);
        var minSpanHeight = prefSpanHeight;

        var rowFlexes = {};

        for (var j=0; j<widgetProps.rowSpan; j++)
        {
          var row = widgetProps.row+j;
          var rowHeight = rowHeights[row];
          var rowFlex = this.getRowFlex(row);

          if (rowFlex > 0)
          {
            // compute flex array for the preferred height
            rowFlexes[row] =
            {
              min : rowHeight.minHeight,
              value : rowHeight.height,
              max : rowHeight.maxHeight,
              flex: rowFlex
            };
          }

          prefSpanHeight += rowHeight.height;
          minSpanHeight += rowHeight.minHeight;
        }

        // If there is not enough space for the preferred size
        // increment the preferred row sizes.
        if (prefSpanHeight < hint.height)
        {
          if (!qx.lang.Object.isEmpty(rowFlexes)) {
            var rowIncrements = qx.ui.layout.Util.computeFlexOffsets(
              rowFlexes, hint.height, prefSpanHeight
            );

            for (var k=0; k<widgetProps.rowSpan; k++)
            {
              var offset = rowIncrements[widgetRow+k] ? rowIncrements[widgetRow+k].offset : 0;
              rowHeights[widgetRow+k].height += offset;
            }
          // row is too small and we have no flex value set
          } else {
            var totalSpacing = vSpacing * (widgetProps.rowSpan - 1);
            var availableHeight = hint.height - totalSpacing;

            // get the row height which every child would need to share the
            // available hight equally
            var avgRowHeight =
              Math.floor(availableHeight / widgetProps.rowSpan);

            // get the hight already used and the number of children which do
            // not have at least that avg row height
            var usedHeight = 0;
            var rowsNeedAddition = 0;
            for (var k = 0; k < widgetProps.rowSpan; k++) {
              var currentHeight = rowHeights[widgetRow + k].height;
              usedHeight += currentHeight;
              if (currentHeight < avgRowHeight) {
                rowsNeedAddition++;
              }
            }

            // the difference of available and used needs to be shared among
            // those not having the min size
            var additionalRowHeight =
              Math.floor((availableHeight - usedHeight) / rowsNeedAddition);

            // add the extra height to the too small children
            for (var k = 0; k < widgetProps.rowSpan; k++) {
              if (rowHeights[widgetRow + k].height < avgRowHeight) {
                rowHeights[widgetRow + k].height += additionalRowHeight;
              }
            }
          }
        }

        // If there is not enough space for the min size
        // increment the min row sizes.
        if (minSpanHeight < hint.minHeight)
        {
          var rowIncrements = qx.ui.layout.Util.computeFlexOffsets(
            rowFlexes, hint.minHeight, minSpanHeight
          );

          for (var j=0; j<widgetProps.rowSpan; j++)
          {
            var offset = rowIncrements[widgetRow+j] ? rowIncrements[widgetRow+j].offset : 0;
            rowHeights[widgetRow+j].minHeight += offset;
          }
        }
      }
    },


    /**
     * Check whether all col spans fit with their preferred width into the
     * preferred column widths. If there is not enough space the preferred
     * column sizes are increased. The distribution respects the flex and max
     * values of the columns.
     *
     *  The same is true for the min sizes.
     *
     *  The width array is modified in place.
     *
     * @param colWidths {Map[]} The current column width array as computed by
     *     {@link #_getColWidths}.
     */
    _fixWidthsColSpan : function(colWidths)
    {
      var hSpacing = this.getSpacingX();
      var colSpans = this._getColSpans();

      for (var i=0, l=colSpans.length; i<l; i++)
      {
        var widget = colSpans[i];

        var hint = this._getOuterSize(widget);

        var widgetProps = widget.getLayoutProperties();
        var widgetColumn = widgetProps.column;

        var prefSpanWidth = hSpacing * (widgetProps.colSpan - 1);
        var minSpanWidth = prefSpanWidth;

        var colFlexes = {};

        var offset;

        for (var j=0; j<widgetProps.colSpan; j++)
        {
          var col = widgetProps.column+j;
          var colWidth = colWidths[col];
          var colFlex = this.getColumnFlex(col);

          // compute flex array for the preferred width
          if (colFlex > 0)
          {
            colFlexes[col] =
            {
              min : colWidth.minWidth,
              value : colWidth.width,
              max : colWidth.maxWidth,
              flex: colFlex
            };
          }

          prefSpanWidth += colWidth.width;
          minSpanWidth += colWidth.minWidth;
        }

        // If there is not enough space for the preferred size
        // increment the preferred column sizes.
        if (prefSpanWidth < hint.width)
        {
          // Do not adapt column widths to the width
          // of the spanning cell if allowGrowSpannedCellWidth property
          // is set to false
          // See https://github.com/qooxdoo/qooxdoo/issues/9871
          if (!this.getAllowGrowSpannedCellWidth() || !qx.lang.Object.isEmpty(colFlexes)) {
            var colIncrements = qx.ui.layout.Util.computeFlexOffsets(
              colFlexes, hint.width, prefSpanWidth
            );

            for (var j=0; j<widgetProps.colSpan; j++)
            {
              offset = colIncrements[widgetColumn+j] ? colIncrements[widgetColumn+j].offset : 0;
              colWidths[widgetColumn+j].width += offset;
            }
          // col is too small and we have no flex value set
          } else {
            var totalSpacing = hSpacing * (widgetProps.colSpan - 1);
            var availableWidth = hint.width - totalSpacing;

            // get the col width which every child would need to share the
            // available width equally
            var avgColWidth = Math.floor(availableWidth / widgetProps.colSpan);

            // get the width already used and the number of children which do
            // not have at least that avg col width
            var usedWidth = 0;
            var colsNeedAddition = 0;
            for (var k = 0; k < widgetProps.colSpan; k++) {
              var currentWidth = colWidths[widgetColumn + k].width;
              usedWidth += currentWidth;
              if (currentWidth < avgColWidth) {
                colsNeedAddition++;
              }
            }

            // the difference of available and used needs to be shared among
            // those not having the min size
            var additionalColWidth = Math.floor((availableWidth - usedWidth) / colsNeedAddition);

            // add the extra width to the too small children
            for (var k = 0; k < widgetProps.colSpan; k++) {
              if (colWidths[widgetColumn + k].width < avgColWidth) {
                colWidths[widgetColumn + k].width += additionalColWidth;
              }
            }
          }
        }

        // If there is not enough space for the min size
        // increment the min column sizes.
        if (minSpanWidth < hint.minWidth)
        {
          var colIncrements = qx.ui.layout.Util.computeFlexOffsets(
            colFlexes, hint.minWidth, minSpanWidth
          );

          for (var j=0; j<widgetProps.colSpan; j++)
          {
            offset = colIncrements[widgetColumn+j] ? colIncrements[widgetColumn+j].offset : 0;
            colWidths[widgetColumn+j].minWidth += offset;
          }
        }
      }
    },


    /**
     * Compute the min/pref/max row heights.
     *
     * @return {Map[]} An array containing height information for each row. The
     *     entries have the keys <code>minHeight</code>, <code>maxHeight</code> and
     *     <code>height</code>.
     */
    _getRowHeights : function()
    {
      if (this.__rowHeights != null) {
        return this.__rowHeights;
      }

      var rowHeights = [];

      var maxRowIndex = this.__maxRowIndex;
      var maxColIndex = this.__maxColIndex;

      for (var row=0; row<=maxRowIndex; row++)
      {
        var minHeight = 0;
        var height = 0;
        var maxHeight = 0;

        for (var col=0; col<=maxColIndex; col++)
        {
          var widget = this.__grid[row][col];
          if (!widget) {
            continue;
          }

          // ignore rows with row spans at this place
          // these rows will be taken into account later
          var widgetRowSpan = widget.getLayoutProperties().rowSpan || 0;
          if (widgetRowSpan > 1) {
            continue;
          }

          var cellSize = this._getOuterSize(widget);

          if (this.getRowFlex(row) > 0) {
            minHeight = Math.max(minHeight, cellSize.minHeight);
          } else {
            minHeight = Math.max(minHeight, cellSize.height);
          }

          height = Math.max(height, cellSize.height);
        }

        var minHeight = Math.max(minHeight, this.getRowMinHeight(row));
        var maxHeight = this.getRowMaxHeight(row);

        if (this.getRowHeight(row) !== null) {
          var height = this.getRowHeight(row);
        } else {
          var height = Math.max(minHeight, Math.min(height, maxHeight));
        }

        rowHeights[row] = {
          minHeight : minHeight,
          height : height,
          maxHeight : maxHeight
        };
      }

      if (this.__rowSpans.length > 0) {
        this._fixHeightsRowSpan(rowHeights);
      }

      this.__rowHeights = rowHeights;
      return rowHeights;
    },


    /**
     * Compute the min/pref/max column widths.
     *
     * @return {Map[]} An array containing width information for each column. The
     *     entries have the keys <code>minWidth</code>, <code>maxWidth</code> and
     *     <code>width</code>.
     */
    _getColWidths : function()
    {
      if (this.__colWidths != null) {
        return this.__colWidths;
      }

      var colWidths = [];

      var maxColIndex = this.__maxColIndex;
      var maxRowIndex = this.__maxRowIndex;

      for (var col=0; col<=maxColIndex; col++)
      {
        var width = 0;
        var minWidth = 0;
        var maxWidth = Infinity;

        for (var row=0; row<=maxRowIndex; row++)
        {
          var widget = this.__grid[row][col];
          if (!widget) {
            continue;
          }

          // ignore columns with col spans at this place
          // these columns will be taken into account later
          var widgetColSpan = widget.getLayoutProperties().colSpan || 0;
          if (widgetColSpan > 1) {
            continue;
          }

          var cellSize = this._getOuterSize(widget);

          minWidth = Math.max(minWidth, cellSize.minWidth);

          width = Math.max(width, cellSize.width);
        }

        minWidth = Math.max(minWidth, this.getColumnMinWidth(col));
        maxWidth = this.getColumnMaxWidth(col);

        if (this.getColumnWidth(col) !== null) {
          var width = this.getColumnWidth(col);
        } else {
          var width = Math.max(minWidth, Math.min(width, maxWidth));
        }

        colWidths[col] = {
          minWidth: minWidth,
          width : width,
          maxWidth : maxWidth
        };
      }

      if (this._getColSpans().length > 0) {
        this._fixWidthsColSpan(colWidths);
      }

      this.__colWidths = colWidths;
      return colWidths;
    },


    /**
     * Computes for each column by how many pixels it must grow or shrink, taking
     * the column flex values and min/max widths into account.
     *
     * @param width {Integer} The grid width
     * @return {Integer[]} Sparse array of offsets to add to each column width. If
     *     an array entry is empty nothing should be added to the column.
     */
    _getColumnFlexOffsets : function(width)
    {
      var hint = this.getSizeHint();
      var diff = width - hint.width;

      if (diff == 0) {
        return {};
      }

      // collect all flexible children
      var colWidths = this._getColWidths();
      var flexibles = {};

      for (var i=0, l=colWidths.length; i<l; i++)
      {
        var col = colWidths[i];
        var colFlex = this.getColumnFlex(i);

        if (
          (colFlex <= 0) ||
          (col.width == col.maxWidth && diff > 0) ||
          (col.width == col.minWidth && diff < 0)
        ) {
          continue;
        }

        flexibles[i] ={
          min : col.minWidth,
          value : col.width,
          max : col.maxWidth,
          flex : colFlex
        };
      }

      return qx.ui.layout.Util.computeFlexOffsets(flexibles, width, hint.width);
    },


    /**
     * Computes for each row by how many pixels it must grow or shrink, taking
     * the row flex values and min/max heights into account.
     *
     * @param height {Integer} The grid height
     * @return {Integer[]} Sparse array of offsets to add to each row height. If
     *     an array entry is empty nothing should be added to the row.
     */
    _getRowFlexOffsets : function(height)
    {
      var hint = this.getSizeHint();
      var diff = height - hint.height;

      if (diff == 0) {
        return {};
      }

      // collect all flexible children
      var rowHeights = this._getRowHeights();
      var flexibles = {};

      for (var i=0, l=rowHeights.length; i<l; i++)
      {
        var row = rowHeights[i];
        var rowFlex = this.getRowFlex(i);

        if (
          (rowFlex <= 0) ||
          (row.height == row.maxHeight && diff > 0) ||
          (row.height == row.minHeight && diff < 0)
        ) {
          continue;
        }

        flexibles[i] = {
          min : row.minHeight,
          value : row.height,
          max : row.maxHeight,
          flex : rowFlex
        };
      }

      return qx.ui.layout.Util.computeFlexOffsets(flexibles, height, hint.height);
    },


    /**
     * Returns the internal private __colSpans array in order
     * have a protected getter which can be used other methods
     * to make them overridable
     *
     * @return {Array} the __colSpans array
     */
    _getColSpans : function() {
      return this.__colSpans;
    },


    // overridden
    renderLayout : function(availWidth, availHeight, padding)
    {
      if (this._invalidChildrenCache) {
        this.__buildGrid();
      }

      var Util = qx.ui.layout.Util;
      var hSpacing = this.getSpacingX();
      var vSpacing = this.getSpacingY();

      // calculate column widths
      var prefWidths = this._getColWidths();
      var colStretchOffsets = this._getColumnFlexOffsets(availWidth);

      var colWidths = [];

      var maxColIndex = this.__maxColIndex;
      var maxRowIndex = this.__maxRowIndex;

      var offset;

      for (var col=0; col<=maxColIndex; col++)
      {
        offset = colStretchOffsets[col] ? colStretchOffsets[col].offset : 0;
        colWidths[col] = prefWidths[col].width + offset;
      }

      // calculate row heights
      var prefHeights = this._getRowHeights();
      var rowStretchOffsets = this._getRowFlexOffsets(availHeight);

      var rowHeights = [];

      for (var row=0; row<=maxRowIndex; row++)
      {
        offset = rowStretchOffsets[row] ? rowStretchOffsets[row].offset : 0;
        rowHeights[row] = prefHeights[row].height + offset;
      }

      // do the layout
      var left = 0;
      for (var col=0; col<=maxColIndex; col++)
      {
        var top = 0;

        for (var row=0; row<=maxRowIndex; row++)
        {
          var widget = this.__grid[row][col];

          // ignore empty cells
          if (!widget)
          {
            top += rowHeights[row] + vSpacing;
            continue;
          }

          var widgetProps = widget.getLayoutProperties();

          // ignore cells, which have cell spanning but are not the origin
          // of the widget
          if(widgetProps.row !== row || widgetProps.column !== col)
          {
            top += rowHeights[row] + vSpacing;
            continue;
          }

          // compute sizes width including cell spanning
          var spanWidth = hSpacing * (widgetProps.colSpan - 1);
          for (var i=0; i<widgetProps.colSpan; i++) {
            spanWidth += colWidths[col+i];
          }

          var spanHeight = vSpacing * (widgetProps.rowSpan - 1);
          for (var i=0; i<widgetProps.rowSpan; i++) {
            spanHeight += rowHeights[row+i];
          }

          var cellHint = widget.getSizeHint();
          var marginTop = widget.getMarginTop();
          var marginLeft = widget.getMarginLeft();
          var marginBottom = widget.getMarginBottom();
          var marginRight = widget.getMarginRight();

          var cellWidth = Math.max(cellHint.minWidth, Math.min(spanWidth-marginLeft-marginRight, cellHint.maxWidth));
          var cellHeight = Math.max(cellHint.minHeight, Math.min(spanHeight-marginTop-marginBottom, cellHint.maxHeight));

          var cellAlign = this.getCellAlign(row, col);
          var cellLeft = left + Util.computeHorizontalAlignOffset(cellAlign.hAlign, cellWidth, spanWidth, marginLeft, marginRight);
          var cellTop = top + Util.computeVerticalAlignOffset(cellAlign.vAlign, cellHeight, spanHeight, marginTop, marginBottom);

          widget.renderLayout(
            cellLeft + padding.left,
            cellTop + padding.top,
            cellWidth,
            cellHeight
          );

          top += rowHeights[row] + vSpacing;
        }

        left += colWidths[col] + hSpacing;
      }
    },


    // overridden
    invalidateLayoutCache : function()
    {
      this.base(arguments);

      this.__colWidths = null;
      this.__rowHeights = null;
    },


    // overridden
    _computeSizeHint : function()
    {
      if (this._invalidChildrenCache) {
        this.__buildGrid();
      }

      // calculate col widths
      var colWidths = this._getColWidths();

      var minWidth=0, width=0;

      for (var i=0, l=colWidths.length; i<l; i++)
      {
        var col = colWidths[i];
        if (this.getColumnFlex(i) > 0) {
          minWidth += col.minWidth;
        } else {
          minWidth += col.width;
        }

        width += col.width;
      }

      // calculate row heights
      var rowHeights = this._getRowHeights();

      var minHeight=0, height=0;
      for (var i=0, l=rowHeights.length; i<l; i++)
      {
        var row = rowHeights[i];

        if (this.getRowFlex(i) > 0) {
          minHeight += row.minHeight;
        } else {
          minHeight += row.height;
        }

        height += row.height;
      }

      var spacingX = this.getSpacingX() * (colWidths.length - 1);
      var spacingY = this.getSpacingY() * (rowHeights.length - 1);

      var hint = {
        minWidth : minWidth + spacingX,
        width : width + spacingX,
        minHeight : minHeight + spacingY,
        height : height + spacingY
      };

      return hint;
    }
  },




  /*
  *****************************************************************************
     DESTRUCT
  *****************************************************************************
  */

  destruct : function()
  {
    this.__grid = this.__rowData = this.__colData = this.__colSpans =
      this.__rowSpans = this.__colWidths = this.__rowHeights = null;
  }
});
