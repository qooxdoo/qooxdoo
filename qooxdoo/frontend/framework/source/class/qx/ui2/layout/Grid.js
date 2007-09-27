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

qx.Class.define("qx.ui2.layout.Grid",
{
  extend : qx.ui2.layout.AbstractLayout,






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

    this._children = [];
    this._sizeHint = null;

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
      widget.addLayoutProperty("row", row);
      widget.addLayoutProperty("column", column);

      var grid = this._grid;

      if (grid[row] === undefined) {
         grid[row] = [];
      }
      if (grid[row][column] !== undefined) {
        throw new Error("There is already a widget in this cell (" + row + ", " + column + ")");
      }
      grid[row][column] = widget;
      this._children.push(widget);

      this._maxRowIndex = Math.max(this._maxRowIndex, row);
      this._maxColIndex = Math.max(this._maxColIndex, column);

      this._addToParent(widget);
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


    _setRowData : function(row, props)
    {
      var rowData = this._rowData[row];
      if (!rowData)
      {
        this._rowData[row] = props;
        return;
      }
      for (var key in props) {
        rowData[key] = props[key];
      }
    },


    _getRowData : function(row)
    {
      var data = this._rowData[row] || {};
      return {
        hAlign : data.hAlign || "left"
      }
    },


    _setColumnData : function(column, props)
    {
      var colData = this._colData[column];
      if (!colData)
      {
        this._colData[column] = props;
        return;
      }
      for (var key in props) {
        colData[key] = props[key];
      }
    },


    _getColumnData : function(column)
    {
      var data = this._colData[column] || {};
      return {
        vAlign : data.vAlign || "top"
      }
    },


    setRowAlign : function(row, hAlign)
    {
      this._validateArgument(hAlign, ["left", "center", "right"]);
      this._setRowData(row, {hAlign: hAlign});
    },


    setColumnAlign : function(column, vAlign)
    {
      this._validateArgument(vAlign, ["top", "middle", "bottom"]);
      this._setColumnData(column, {vAlign: vAlign});
    },


    getCellData : function(row, column)
    {
      var rowData = this._getRowData(row);
      var colData = this._getColumnData(column);
      return {
        vAlign : colData.vAlign,
        hAlign : rowData.hAlign
      }
    },


    // overridden
    remove : function(widget) {
      throw new Error("Not yet implemented.");
    },

    // overridden
    getChildren : function() {
      return this._children;
    },


    _getRowHeights : function()
    {
      if (this._rowHeights != null) {
        return this._rowHeights;
      }

      var grid = this._grid;
      var rowHeights = [];

      for (var row=0; row<=this._maxRowIndex; row++)
      {
        var minHeight = 0;
        var height = 0;
        var maxHeight = 0;

        for (var col=0; col<=this._maxColIndex; col++)
        {
          if (!grid[row] || !grid[row][col]) {
            continue;
          }
          var cell = grid[row][col];
          var cellSize = cell.getSizeHint();
          minHeight = Math.max(minHeight, cellSize.minHeight);
          height = Math.max(height, cellSize.height);
          maxHeight = Math.max(maxHeight, cellSize.maxHeight);
        }

        rowHeights[row] = {
          minHeight : minHeight,
          height : height,
          maxHeight : maxHeight
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

      var grid = this._grid;
      var colWidths = [];

      for (var col=0; col<=this._maxColIndex; col++)
      {
        var width = 0;
        var minWidth = 0;
        var maxWidth = 32000;

        for (var row=0; row<=this._maxRowIndex; row++)
        {
          if (!grid[row] || !grid[row][col]) {
            continue;
          }
          var cell = grid[row][col];
          var cellSize = cell.getSizeHint();

          minWidth = Math.max(minWidth, cellSize.minWidth);
          width = Math.max(width, cellSize.width);
          maxWidth = Math.max(maxWidth, cellSize.maxWidth);
        }

        colWidths[col] = {
          minWidth: minWidth,
          width : width,
          maxWidth : maxWidth
        };
      }

      this._colWidths = colWidths;
      return colWidths;
    },


    // overridden
    layout : function(width, height)
    {
      var grid = this._grid;
      var spacing = this.getSpacing();

      // calculate col widths
      var colWidths = this._getColWidths();

      // calculate row heights
      var rowHeights = this._getRowHeights();

      // do the layout
      var left = 0;
      for (var col=0; col<=this._maxColIndex; col++)
      {
        var top = 0;
        var width = colWidths[col].width;

        for (var row=0; row<=this._maxRowIndex; row++)
        {
          if (!grid[row] || !grid[row][col]) {
            continue;
          }
          var height = rowHeights[row].height;

          var cell = grid[row][col];
          var cellHint = cell.getSizeHint();
          var cellData = this.getCellData(row, col);

          var cellWidth = Math.min(width, cellHint.maxWidth);
          var cellHeight = Math.min(height, cellHint.maxHeight);
          var cellLeft = left;
          var cellTop = top;

          console.log(cellData);

          if (cellWidth !== width)
          {
            switch (cellData.hAlign)
            {
              case "left":
                break;

              case "center":
                cellLeft += Math.floor((width - cellWidth) / 2);
                break;

              case "right":
                cellLeft += (width - cellWidth)
                break;

              default:
                throw new Error("Invalid state!")
            }
          }

          if (cellHeight !== height)
          {
            switch (cellData.vAlign)
            {
              case "top":
                break;

              case "middle":
                cellTop += Math.floor((height - cellHeight) / 2);
                break;

              case "bottom":
                cellTop += (height - cellHeight)
                break;

              default:
                throw new Error("Invalid state!")
            }
          }

          cell.layout(
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
      this.debug("Clear layout cache.");

      this._preferredWidth = null;
      this._preferredHeight = null;
      this._rowHeights = null;
      this._colHeights = null;
    },


    // overridden
    invalidate : function()
    {
      this.debug("Clear layout cache.");
      this._sizeHint = null;
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