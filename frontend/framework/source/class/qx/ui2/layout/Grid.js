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
 * This layout manager lays out its children in a two dimensional grid. The
 * grid supports:
 * <ul>
 *   <li>autosizing</li>
 *   <li>flex values for rows and columns</li>
 *   <li>minimal and maximal column and row sizes</li>
 *   <li>horizontal and vertical alignment</li>
 * </ul>
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
    spacing :
    {
      check : "Integer",
      init : 5
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // overridden
    add : function(widget, row, column)
    {
      var cellData = this.getCellData(row, column);
      if (cellData.widget !== undefined) {
        throw new Error("There is already a widget in this cell (" + row + ", " + column + ")");
      }

      this.base(arguments, widget);

      widget.addLayoutProperty("row", row);
      widget.addLayoutProperty("column", column);

      this._setCellData(row ,column, "widget", widget);

      this._maxRowIndex = Math.max(this._maxRowIndex, row);
      this._maxColIndex = Math.max(this._maxColIndex, column);
    },


    _validateArgument : function(arg, validValues)
    {
      if (validValues.indexOf(arg) == -1) {
        throw new Error(
          "Invalid argument '" + arg +"'! Valid arguments are: '" +
          validValues.join(", ") + "'"
        );
      }
    },


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


    _getRowData : function(row)
    {
      var data = this._rowData[row] || {};
      return {
        hAlign : data.hAlign || "left",
        flex : data.flex || 1,
        minHeight : data.minHeight || 0,
        maxHeight : data.maxHeight || 32000
      }
    },


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


    _getColumnData : function(column)
    {
      var data = this._colData[column] || {};
      return {
        vAlign : data.vAlign || "top",
        hAlign : data.hAlign || "left",
        flex : data.flex || 1,
        minWidth : data.minWidth || 0,
        maxWidth : data.maxWidth || 32000
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
     */
    setColumnAlign : function(column, hAlign, vAlign)
    {
      this._validateArgument(hAlign, ["left", "center", "right"]);
      this._validateArgument(vAlign, ["top", "middle", "bottom"]);

      this._setColumnData(column, "hAlign", hAlign);
      this._setColumnData(column, "vAlign", vAlign);
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
     */
    setCellAlign : function(row, column, hAlign, vAlign)
    {
      this._validateArgument(hAlign, ["left", "center", "right"]);
      this._validateArgument(vAlign, ["top", "middle", "bottom"]);

      this._setCellData(column, "hAlign", hAlign);
      this._setCellData(column, "vAlign", vAlign);
    },


    setColumnFlex : function(column, flex) {
      this._setColumnData(column, "flex", flex);
    },

    setRowFlex : function(row, flex) {
      this._setRowData(row, "flex", flex);
    },

    setColumnMaxWidth : function(maxWidth) {
      this._setColumnData(column, "maxWidth", maxWidth);
    },

    setColumnMinWidth : function(minWidth) {
      this._setColumnData(column, "minWidth", minWidth);
    },

    setRowMaxHeight : function(maxHeight) {
      this._setRowData(column, "maxHeight", maxHeight);
    },

    setRowMinHeight : function(minHeight) {
      this._setRowData(column, "minHeight", minHeight);
    },






    /**
     * Get a map with all information about a cell
     *
     * @param row {Integer} The cell's row index
     * @param column {Integer} The cell's column index
     * @return {Map} Information about the cell
     */
    getCellData : function(row, column)
    {
      var rowData = this._rowData[row] || {};
      var colData = this._colData[column] || {};
      var gridData = this._grid[row] ? this._grid[row][column] || {} : {};
      return {
        vAlign : gridData.vAlign || colData.vAlign || "top",
        hAlign : gridData.hAlign || colData.hAlign || "left",
        widget : gridData.widget
      }
    },


    // overridden
    remove : function(widget) {
      throw new Error("Not yet implemented.");
    },


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
          var cell = this.getCellData(row, col).widget;
          if (!cell) {
            continue;
          }
          var cellSize = cell.getSizeHint();
          minHeight = Math.max(minHeight, cellSize.minHeight);
          height = Math.max(height, cellSize.height);
          maxHeight = Math.max(maxHeight, cellSize.maxHeight);
        }

        var rowData = this._getRowData(row);

        rowHeights[row] = {
          minHeight : Math.max(minHeight, rowData.minHeight),
          height : height,
          maxHeight : Math.min(maxHeight, rowData.maxHeight)
        };

      }
      this._rowHeights = rowHeights;
      return rowHeights;
    },


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
          var cell = this.getCellData(row, col).widget;
          if (!cell) {
            continue;
          }
          var cellSize = cell.getSizeHint();

          minWidth = Math.max(minWidth, cellSize.minWidth);
          width = Math.max(width, cellSize.width);
          maxWidth = Math.max(maxWidth, cellSize.maxWidth);
        }

        var colData = this._getColumnData(col);

        colWidths[col] = {
          minWidth: Math.max(minWidth, colData.minWidth),
          width : width,
          maxWidth : Math.max(maxWidth, colData.maxWidth)
        };
      }

      this._colWidths = colWidths;
      return colWidths;
    },


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
        col = colWidths[i];

        if (col.width == col.maxWidth && col.Width == col.minWidth) {
          continue;
        }

        var colFlex = this._getColumnData(i).flex;

        if (colFlex > 0)
        {
          flexibles.push({
            id : i,
            potential : diff > 0 ? col.maxWidth - col.width : col.width - col.minWidth,
            flex : colFlex
          });
        }
      }

      return qx.ui2.layout.Util.computeFlexOffsets(flexibles, diff);
    },


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
        row = rowHeights[i];

        if (row.height == row.maxHeight && row.Height == row.minHeight) {
          continue;
        }

        var rowFlex = this._getRowData(i).flex;

        if (rowFlex > 0)
        {
          flexibles.push({
            id : i,
            potential : diff > 0 ? row.maxHeight - row.height : row.height - row.minHeight,
            flex : rowFlex
          });
        }
      }

      return qx.ui2.layout.Util.computeFlexOffsets(flexibles, diff);
    },


    // overridden
    layout : function(width, height)
    {
      var Util = qx.ui2.layout.Util;
      var spacing = this.getSpacing();

      var colWidths = this._getColWidths();
      var colStretchOffsets = this._getColumnFlexOffsets(width);

      var rowHeights = this._getRowHeights();
      var rowStretchOffsets = this._getRowFlexOffsets(height);

      // do the layout
      var left = 0;
      for (var col=0; col<=this._maxColIndex; col++)
      {
        var top = 0;
        var width = colWidths[col].width + (colStretchOffsets[col] || 0);

        for (var row=0; row<=this._maxRowIndex; row++)
        {
          var cellData = this.getCellData(row, col);
          if (!cellData.widget) {
            continue;
          }

          var height = rowHeights[row].height + (rowStretchOffsets[row] || 0);

          var cellHint = cellData.widget.getSizeHint();

          var cellWidth = Math.min(width, cellHint.maxWidth);
          var cellHeight = Math.min(height, cellHint.maxHeight);
          var cellLeft = left + Util.computeHorizontalAlignOffset(cellData.hAlign, cellWidth, width);
          var cellTop = top + Util.computeVerticalAlignOffset(cellData.vAlign, cellHeight, height);

          cellData.widget.layout(
            cellLeft,
            cellTop,
            cellWidth,
            cellHeight
          );

          top += height + spacing;
        }

        left += width + spacing;
      }

    },

    // overridden
    invalidate : function()
    {
      if (this._sizeHint || this._rowHeights || this._colHeights)
      {
        this.debug("Clear layout cache");

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
        this.debug("Cached size hint: ", this._sizeHint);
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

      var spacingX = this.getSpacing() * (colWidths.length - 1);
      var spacingY = this.getSpacing() * (rowHeights.length - 1);

      var hint = {
        minWidth : minWidth + spacingX,
        width : width + spacingX,
        maxWidth : maxWidth + spacingX,
        minHeight : minHeight + spacingY,
        height : height + spacingY,
        maxHeight : maxHeight + spacingY
      };

      this.debug("Computed size hint: ", hint);
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


  }
});