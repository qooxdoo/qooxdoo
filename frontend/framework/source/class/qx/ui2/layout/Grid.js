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
 * This layout manager lays out its children in a two dimensional grid.
 *
 * Other names (for comparable layouts in other systems):
 *
 * * QGridLayout (Qt)
 * * Grid (XAML)
 *
 * Supports:
 *
 * * flex values for rows and columns
 * * minimal and maximal column and row sizes
 * * horizontal and vertical alignment
 * * col/row spans
 * * auto-sizing
 */
qx.Class.define("qx.ui2.layout.Grid",
{
  extend : qx.ui2.layout.Abstract,






  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    this._grid = [];
    this._rowData = [];
    this._colData = [];

    this._colSpans = [];
    this._rowSpans = [];

    this._maxRowIndex = 0;
    this._maxColIndex = 0;
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
    horizontalSpacing :
    {
      check : "Integer",
      init : 5,
      apply : "_applyLayoutChange"
    },


    /**
     * The vertical spacing between grid cells.
     */
    verticalSpacing :
    {
      check : "Integer",
      init : 5,
      apply : "_applyLayoutChange"
    }
  },




  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    LAYOUT_DEFAULTS :
    {
      colSpan : 0,
      rowSpan : 0,
      row : null,
      column : null
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Adds a new widget to this layout.
     *
     * @type member
     * @param widget {qx.ui2.core.Widget} The widget to add
     * @param row {Integer} The cell's row index
     * @param column {Integer} The cell's column index
     * @param rowSpan {Integer?1} How many rows the widget should span
     * @param colSpan {Integer?1} How many columns the widget should span
     * @return {qx.ui2.layout.Grid} This object (for chaining support)
     */
    add : function(widget, row, column, options)
    {
      // validate arguments
      var cell = this.getCellWidget(row, column);

      if (row == null || column == null) {
        throw new Error("The arguments 'row' and 'column' must be defined!");
      }

      if (cell != null) {
        throw new Error("There is already a widget in this cell (" + row + ", " + column + ")");
      }

      options = options || {};
      options.row = row;
      options.column = column;
      options.rowSpan = options.rowSpan || 1;
      options.colSpan = options.colSpan || 1;

      for (var x=0; x<options.colSpan; x++)
      {
        for (var y=0; y<options.rowSpan; y++) {
          this._setCellData(row + y, column + x, "widget", widget);
        }
      }

      if (options.rowSpan > 1) {
        this._rowSpans.push(widget);
      }

      if (options.colSpan > 1) {
        this._colSpans.push(widget);
      }

      this._maxRowIndex = Math.max(this._maxRowIndex, row + options.rowSpan - 1);
      this._maxColIndex = Math.max(this._maxColIndex, column + options.colSpan - 1);

      this.base(arguments, widget, options);

      // Chaining support
      return this;
    },


    /**
     * Checks whether a string arguments matches one of the provided strings.
     * Throws an exception if the argument is invalid.
     *
     * @param arg {String} string argument to check
     * @param validValues {String[]} Array of valid argument values
     */
    _validateArgument : function(arg, validValues)
    {
      if (validValues.indexOf(arg) == -1)
      {
        throw new Error(
          "Invalid argument '" + arg +"'! Valid arguments are: '" +
          validValues.join(", ") + "'"
        );
      }
    },


    /**
     * Stores data for a grid cell
     *
     * @param row {Integer} The cell's row index
     * @param column {Integer} The cell's column index
     * @param key {String} The key under which the data should be stored
     * @param value {var} data to store
     */
    _setCellData : function(row, column, key, value)
    {
      var grid = this._grid;

      if (grid[row] == undefined) {
         grid[row] = [];
      }

      var gridData = grid[row][column];

      if (!gridData)
      {
        grid[row][column] = {}
        grid[row][column][key] = value;
      }
      else
      {
        gridData[key] = value;
      }
    },


    /**
     * Clears all data stored for a grid cell
     *
     * @param row {Integer} The cell's row index
     * @param column {Integer} The cell's column index
     */
    _clearCellData : function(row, column)
    {
      var grid = this._grid;

      if (grid[row] == undefined) {
         return;
      }

      var gridData = grid[row][column];

      if (!gridData) {
        return;
      } else {
        grid[row][column] = {};
      }
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
      var rowData = this._rowData[row];

      if (!rowData)
      {
        this._rowData[row] = {};
        this._rowData[row][key] = value;
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
      var colData = this._colData[column];

      if (!colData)
      {
        this._colData[column] = {};
        this._colData[column][key] = value;
      }
      else
      {
        colData[key] = value;
      }
    },


    /**
     * Set the default cell alignment for a column. This alignmnet can be
     * overridden on a per cell basis by using {@link #setCellAlign}.
     *
     * @param column {Integer} Column index
     * @param hAlign {String} The horizontal alignment. Valid values are
     *    "left", "center" and "right".
     * @param vAlign {String} The vertical alignment. Valid values are
     *    "top", "middle", "bottom"
     * @return {qx.ui2.layout.Grid} This object (for chaining support)
     */
    setColumnAlign : function(column, hAlign, vAlign)
    {
      this._validateArgument(hAlign, ["left", "center", "right"]);
      this._validateArgument(vAlign, ["top", "middle", "bottom"]);

      this._setColumnData(column, "hAlign", hAlign);
      this._setColumnData(column, "vAlign", vAlign);

      this.scheduleLayoutUpdate();

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
      var colData = this._colData[column] || {};

      return {
        vAlign : colData.vAlign || "top",
        hAlign : colData.hAlign || "left"
      };
    },


    /**
     * Get the widget located in the cell. If a the cell
     *
     * @param row {Integer} The cell's row index
     * @param column {Integer} The cell's column index
     * @return {qx.ui2.core.Widget|null}The cell's widget. The value may be null.
     */
    getCellWidget : function(row, column)
    {
      var gridData = this._grid[row] ? this._grid[row][column] || {} : {};
      return gridData.widget;
    },


    /**
     * Set the cell's alignment. This alignmnet overrides the default
     * alignmnet set unsing {@link #setColumnAlign}.
     *
     * @param row {Integer} The cell's row index
     * @param column {Integer} The cell's column index
     * @param hAlign {String} The horizontal alignment. Valid values are
     *    "left", "center" and "right".
     * @param vAlign {String} The vertical alignment. Valid values are
     *    "top", "middle", "bottom"
     * @return {qx.ui2.layout.Grid} This object (for chaining support)
     */
    setCellAlign : function(row, column, hAlign, vAlign)
    {
      this._validateArgument(hAlign, ["left", "center", "right"]);
      this._validateArgument(vAlign, ["top", "middle", "bottom"]);

      this._setCellData(column, "hAlign", hAlign);
      this._setCellData(column, "vAlign", vAlign);

      this.scheduleLayoutUpdate();

      return this;
    },


    /**
     * Get a map of the cell's alignment.
     *
     * @param row {Integer} The cell's row index
     * @param column {Integer} The cell's column index
     * @return {Map} A map with the keys <code>vAlign</code> and <code>hAlign</code>
     *     containing the vertical and horizontal cell alignment.
     */
    getCellAlign : function(row, column)
    {
      var rowData = this._rowData[row] || {};
      var colData = this._colData[column] || {};
      var gridData = this._grid[row] ? this._grid[row][column] || {} : {};

      return {
        vAlign : gridData.vAlign || colData.vAlign || "top",
        hAlign : gridData.hAlign || colData.hAlign || "left"
      }
    },


    /**
     * Set the flex value for a grid column.
     * By default the column flex value is <code>1</code>.
     *
     * @param column {Integer} The column index
     * @param flex {Integer} The column's flex value
     * @return {qx.ui2.layout.Grid} This object (for chaining support)
     */
    setColumnFlex : function(column, flex)
    {
      this._setColumnData(column, "flex", flex);
      this.scheduleLayoutUpdate();
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
      var colData = this._colData[column] || {};
      return colData.flex !== undefined ? colData.flex : 0;
    },


    /**
     * Set the flex value for a grid row.
     * By default the row flex value is <code>1</code>.
     *
     * @param row {Integer} The row index
     * @param flex {Integer} The row's flex value
     * @return {qx.ui2.layout.Grid} This object (for chaining support)
     */
    setRowFlex : function(row, flex)
    {
      this._setRowData(row, "flex", flex);
      this.scheduleLayoutUpdate();
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
      var rowData = this._rowData[row] || {};
      return rowData.flex !== undefined ? rowData.flex : 0;
    },


    /**
     * Set the maximum width of a grid column.
     * The default value is <code>32000</code>.
     *
     * @param column {Integer} The column index
     * @param maxWidth {Integer} The column's maximum width
     * @return {qx.ui2.layout.Grid} This object (for chaining support)
     */
    setColumnMaxWidth : function(column, maxWidth)
    {
      this._setColumnData(column, "maxWidth", maxWidth);
      this.scheduleLayoutUpdate();
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
      var colData = this._colData[column] || {};
      return colData.maxWidth !== undefined ? colData.maxWidth : 32000;
    },


    /**
     * Set the minimum width of a grid column.
     * The default value is <code>0</code>.
     *
     * @param column {Integer} The column index
     * @param minWidth {Integer} The column's minimum width
     * @return {qx.ui2.layout.Grid} This object (for chaining support)
     */
    setColumnMinWidth : function(column, minWidth)
    {
      this._setColumnData(column, "minWidth", minWidth);
      this.scheduleLayoutUpdate();
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
      var colData = this._colData[column] || {};
      return colData.minWidth || 0;
    },


    /**
     * Set the maximum height of a grid row.
     * The default value is <code>32000</code>.
     *
     * @param row {Integer} The row index
     * @param maxHeight {Integer} The row's maximum width
     * @return {qx.ui2.layout.Grid} This object (for chaining support)
     */
    setRowMaxHeight : function(row, maxHeight)
    {
      this._setRowData(row, "maxHeight", maxHeight);
      this.scheduleLayoutUpdate();
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
      var rowData = this._rowData[row] || {};
      return rowData.maxHeight || 32000;
    },


    /**
     * Set the minimum height of a grid row.
     * The default value is <code>0</code>.
     *
     * @param row {Integer} The row index
     * @param minHeight {Integer} The row's minimum width
     * @return {qx.ui2.layout.Grid} This object (for chaining support)
     */
    setRowMinHeight : function(row, minHeight)
    {
      this._setRowData(row, "minHeight", minHeight);
      this.scheduleLayoutUpdate();
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
      var rowData = this._rowData[row] || {};
      return rowData.minHeight || 0;
    },


    // overridden
    remove : function(widget)
    {
      var childProps = this.getLayoutProperties(widget);

      for (var x=0; x<childProps.colSpan; x++)
      {
        for (var y=0; y<childProps.rowSpan; y++) {
          this._clearCellData(childProps.row + y, childProps.column + x);
        }
      }

      return this.base(arguments, widget);
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
      var vSpacing = this.getVerticalSpacing();

      for (var i=0, l=this._rowSpans.length; i<l; i++)
      {
        var widget = this._rowSpans[i];
        var hint = widget.getSizeHint();

        var widgetProps = this.getLayoutProperties(widget);

        var prefSpanHeight = vSpacing * (widgetProps.rowSpan - 1);
        var minSpanHeight = prefSpanHeight;

        var prefRowFlex = [];
        var minRowFlex = [];

        for (var j=0; j<widgetProps.rowSpan; j++)
        {
          var row = widgetProps.row+j;
          var rowHeight = rowHeights[row];
          var rowFlex = this.getRowFlex(row);

          if (rowFlex > 0)
          {
            // compute flex array for the preferred height
            prefRowFlex.push({
              id: row,
              potential: rowHeight.maxHeight - rowHeight.height,
              flex: rowFlex
            });

            // compute flex array for the min height
            minRowFlex.push({
              id: row,
              potential: rowHeight.maxHeight - rowHeight.minHeight,
              flex: rowFlex
            });
          }

          prefSpanHeight += rowHeight.height;
          minSpanHeight += rowHeight.minHeight;
        }

        // If there is not enought space for the preferred size
        // increment the preferred row sizes.
        if (prefSpanHeight < hint.height)
        {
          var rowIncrements = qx.ui2.layout.Util.computeFlexOffsets(
            prefRowFlex, hint.height - prefSpanHeight
          );

          for (var j=0; j<widgetRowSpan; j++) {
            rowHeights[widgetRow+j].height += rowIncrements[widgetRow+j];
          }
        }

        // If there is not enought space for the min size
        // increment the min row sizes.
        if (minSpanHeight < hint.minHeight)
        {
          var rowIncrements = qx.ui2.layout.Util.computeFlexOffsets(
            minRowFlex, hint.minHeight - minSpanHeight
          );

          for (var j=0; j<widgetRowSpan; j++) {
            rowHeights[widgetRow+j].minHeight += rowIncrements[widgetRow+j] || 0;
          }
        }
      }
    },


    /**
     * Check whether all col spans fit with their prefferred width into the
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
      var hSpacing = this.getHorizontalSpacing();

      for (var i=0, l=this._colSpans.length; i<l; i++)
      {
        var widget = this._colSpans[i];
        var hint = widget.getSizeHint();

        var widgetProps = this.getLayoutProperties(widget);

        var prefSpanWidth = hSpacing * (widgetProps.colSpan - 1);
        var minSpanWidth = prefSpanWidth;

        var prefColFlex = [];
        var minColFlex = [];

        for (var j=0; j<widgetProp.colSpan; j++)
        {
          var col = widgetProps.column+j;
          var colWidth = colWidths[col];
          var colFlex = this.getColumnFlex(col);

          // compute flex array for the preferred width
          if (colFlex > 0)
          {
            prefColFlex.push({
              id: col,
              potential: colWidth.maxWidth - colWidth.width,
              flex: colFlex
            });

            // compute flex array for the min width
            minColFlex.push({
              id: col,
              potential: colWidth.maxWidth - colWidth.minWidth,
              flex: colFlex
            });
          }

          prefSpanWidth += colWidth.width;
          minSpanWidth += colWidth.minWidth;
        }

        // If there is not enought space for the preferred size
        // increment the preferred column sizes.
        if (prefSpanWidth < hint.width)
        {
          var colIncrements = qx.ui2.layout.Util.computeFlexOffsets(
            prefColFlex, hint.width - prefSpanWidth
          );

          for (var j=0; j<widgetColSpan; j++) {
            colWidths[widgetColumn+j].width += colIncrements[widgetColumn+j] || 0;
          }
        }

        // If there is not enought space for the min size
        // increment the min column sizes.
        if (minSpanWidth < hint.minWidth)
        {
          var colIncrements = qx.ui2.layout.Util.computeFlexOffsets(
            minColFlex, hint.minWidth - minSpanWidth
          );

          for (var j=0; j<widgetColSpan; j++) {
            colWidths[widgetColumn+j].minWidth += colIncrements[widgetColumn+j] || 0;
          }
        }
      }
    },


    /**
     * Compute the min/pref/max row heights.
     *
     * @return {Map[]} An array containg height information for each row. The
     *     entries have the keys <code>minHeight</code>, <code>maxHeight</code> and
     *     <code>height</code>.
     */
    _getRowHeights : function()
    {
      if (this._rowHeights != null) {
        return this._rowHeights;
      }

      var rowHeights = [];

      for (var row=0; row<=this._maxRowIndex; row++)
      {
        var minHeight = 0;
        var height = 0;
        var maxHeight = 0;

        for (var col=0; col<=this._maxColIndex; col++)
        {
          var widget = this.getCellWidget(row, col);
          if (!widget) {
            continue;
          }

          var widgetRowSpan = this.getLayoutProperty(widget, "rowSpan");
          if (widgetRowSpan > 1) {
            continue;
          }

          var cellSize = widget.getSizeHint();

          minHeight = Math.max(minHeight, cellSize.minHeight);
          height = Math.max(height, cellSize.height);
          maxHeight = Math.max(maxHeight, cellSize.maxHeight);
        }

        var minHeight = Math.max(minHeight, this.getRowMinHeight(row));
        var maxHeight = Math.min(maxHeight, this.getRowMaxHeight(row));
        var height = Math.max(minHeight, Math.min(height, maxHeight));

        rowHeights[row] = {
          minHeight : minHeight,
          height : height,
          maxHeight : maxHeight
        };
      }

      this._fixHeightsRowSpan(rowHeights);

      this._rowHeights = rowHeights;
      return rowHeights;
    },


    /**
     * Compute the min/pref/max column widths.
     *
     * @return {Map[]} An array containg width information for each column. The
     *     entries have the keys <code>minWidth</code>, <code>maxWidth</code> and
     *     <code>width</code>.
     */
    _getColWidths : function()
    {
      if (this._colWidths != null) {
        return this._colWidths;
      }

      var colWidths = [];

      for (var col=0; col<=this._maxColIndex; col++)
      {
        var width = 0;
        var minWidth = 0;
        var maxWidth = 32000;

        for (var row=0; row<=this._maxRowIndex; row++)
        {
          var widget = this.getCellWidget(row, col);
          if (!widget) {
            continue;
          }

          var widgetColSpan = this.getLayoutProperty(widget, "colSpan");
          if (widgetColSpan > 1) {
            continue;
          }

          var cellSize = widget.getSizeHint();

          minWidth = Math.max(minWidth, cellSize.minWidth);
          width = Math.max(width, cellSize.width);
          maxWidth = Math.max(maxWidth, cellSize.maxWidth);
        }

        var minWidth = Math.max(minWidth, this.getColumnMinWidth(col));
        var maxWidth = Math.min(maxWidth, this.getColumnMaxWidth(col));
        var width = Math.max(minWidth, Math.min(width, maxWidth));

        colWidths[col] = {
          minWidth: minWidth,
          width : width,
          maxWidth : maxWidth
        };
      }

      this._fixWidthsColSpan(colWidths);

      this._colWidths = colWidths;
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
      var flexibles = [];

      for (var i=0, l=colWidths.length; i<l; i++)
      {
        var col = colWidths[i];

        if (col.width == col.maxWidth && col.Width == col.minWidth) {
          continue;
        }

        var colFlex = this.getColumnFlex(i);

        if (colFlex > 0)
        {
          flexibles.push({
            id : i,
            potential : diff > 0 ? col.maxWidth - col.width : col.width - col.minWidth,
            flex : diff > 0 ? colFlex : (1 / colFlex)
          });
        }
      }

      return qx.ui2.layout.Util.computeFlexOffsets(flexibles, diff);
    },


    /**
     * Computes for each row by how many pixels it must grow or shrink, taking
     * the row flex values and min/max heights into account.
     *
     * @param height {Integer} The grid height
     * @return {Integer[]} Sparse array of offsets to add to each row heigth. If
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
      var flexibles = [];

      for (var i=0, l=rowHeights.length; i<l; i++)
      {
        var row = rowHeights[i];

        if (
          (row.height == row.maxHeight && diff > 0) ||
          (row.height == row.minHeight && diff < 0)
        ) {
          continue;
        }

        var rowFlex = this.getRowFlex(i);

        if (rowFlex > 0)
        {
          flexibles.push({
            id : i,
            potential : diff > 0 ? row.maxHeight - row.height : row.height - row.minHeight,
            flex : diff > 0 ? rowFlex : (1 / rowFlex)
          });
        }
      }

      return qx.ui2.layout.Util.computeFlexOffsets(flexibles, diff);
    },


    // overridden
    renderLayout : function(width, height)
    {
      var Util = qx.ui2.layout.Util;
      var hSpacing = this.getHorizontalSpacing();
      var vSpacing = this.getVerticalSpacing();

      // calculate column widths
      var prefWidths = this._getColWidths();
      var colStretchOffsets = this._getColumnFlexOffsets(width);
      var colWidths = [];
      for (var col=0; col<=this._maxColIndex; col++) {
        colWidths[col] = prefWidths[col].width + (colStretchOffsets[col] || 0);
      }

      // calculate row heights
      var prefHeights = this._getRowHeights();
      var rowStretchOffsets = this._getRowFlexOffsets(height);
      var rowHeights = [];
      for (var row=0; row<=this._maxRowIndex; row++) {
        rowHeights[row] = prefHeights[row].height + (rowStretchOffsets[row] || 0);
      }

      // do the layout
      var left = 0;
      for (var col=0; col<=this._maxColIndex; col++)
      {
        var top = 0;

        for (var row=0; row<=this._maxRowIndex; row++)
        {
          var widget = this.getCellWidget(row, col);

          // ignore empty cells
          if (!widget)
          {
            top += rowHeights[row] + vSpacing;
            continue;
          }

          var widgetProps = this.getLayoutProperties(widget);

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

          var cellWidth = Math.min(spanWidth, cellHint.maxWidth);
          var cellHeight = Math.min(spanHeight, cellHint.maxHeight);

          var cellAlign = this.getCellAlign(row, col);
          var cellLeft = left + Util.computeHorizontalAlignOffset(cellAlign.hAlign, cellWidth, spanWidth);
          var cellTop = top + Util.computeVerticalAlignOffset(cellAlign.vAlign, cellHeight, spanHeight);

          widget.renderLayout(
            cellLeft,
            cellTop,
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
      if (this._sizeHint || this._rowHeights || this._colHeights)
      {
        // this.debug("Clear layout cache");

        this._sizeHint = null;
        this._rowHeights = null;
        this._colHeights = null;
      }
    },


    // overridden
    getSizeHint : function()
    {
      if (this._sizeHint != null)
      {
        // this.debug("Cached size hint: ", this._sizeHint);
        return this._sizeHint;
      }

      // calculate col widths
      var colWidths = this._getColWidths();

      var minWidth=0, width=0, maxWidth=0;

      for (var i=0, l=colWidths.length; i<l; i++)
      {
        var col = colWidths[i];
        minWidth += col.minWidth;
        width += col.width;
        maxWidth += col.maxWidth;
      }

      // calculate row heights
      var rowHeights = this._getRowHeights();
      var minHeight=0, height=0, maxHeight=0;

      for (var i=0, l=rowHeights.length; i<l; i++)
      {
        var row = rowHeights[i];

        minHeight += row.minHeight;
        height += row.height;
        maxHeight += row.maxHeight;
      }

      var spacingX = this.getHorizontalSpacing() * (colWidths.length - 1);
      var spacingY = this.getVerticalSpacing() * (rowHeights.length - 1);

      var hint = {
        minWidth : minWidth + spacingX,
        width : width + spacingX,
        maxWidth : maxWidth + spacingX,
        minHeight : minHeight + spacingY,
        height : height + spacingY,
        maxHeight : maxHeight + spacingY
      };

      // this.debug("Computed size hint: ", hint);
      this._sizeHint = hint;

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
    this._disposeFields(
      "_grid", "_rowData", "_colData", "_colSpans", "_rowSpans"
    );
  }
});
