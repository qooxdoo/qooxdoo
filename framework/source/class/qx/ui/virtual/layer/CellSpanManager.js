/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("qx.ui.virtual.layer.CellSpanManager",
{
  extend : qx.core.Object,
  
  construct : function(rowConfig, columnConfig)
  {
    this.base(arguments);  
    
    if (qx.core.Variant.isSet("qx.debug", "on")) 
    {
      this.assertInstance(rowConfig, qx.ui.virtual.core.Axis);
      this.assertInstance(columnConfig, qx.ui.virtual.core.Axis);
    }    
    
    this._cells = {};
    this._invalidateSortCache();
    this._invalidatePositionCache();
    
    rowConfig.addListener("change", this._onRowConfigChange, this);
    columnConfig.addListener("change", this._onColumnConfigChange, this);
    
    this._rowConfig = rowConfig;
    this._columnConfig = columnConfig;    
  },
  
  
  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    addCell : function(id, row, column, rowSpan, columnSpan)
    {
      this._cells[id] = {
        firstRow: row,
        lastRow : row + rowSpan - 1,
        firstColumn: column,
        lastColumn: column + columnSpan - 1,
        id: id
      }
      this._invalidateSortCache();
    },
     
     
    removeCell : function(id)
    {
      delete(this._cells[id]);
      this._invalidateSortCache();
    },
         
     
    _invalidateSortCache : function() {
      this._sorted = {};
    },
     
     
    _getSortedCells : function(key)
    {
      if (this._sorted[key]) {
        return this._sorted[key];
      }
      var sorted = this._sorted[key] = qx.lang.Object.getValues(this._cells);
      sorted.sort(function(a, b) {
        return a[key] < b[key] ? -1 : 1;
      });
      return sorted;
    },     
     
     
    _findCellsInRange : function(result, key, min, max)
    {
      var cells = this._getSortedCells(key);
      if (cells.length == 0) {
        return;
      }
       
      var start = 0;
      var end = cells.length-1;            
      
      // find first cell, which is >= "min"
      while (true) 
      {
        var pivot = start + ((end - start) >> 1);
        
        var cell = cells[pivot];
        if (
          cell[key] >= min &&
          (pivot == 0 || cells[pivot-1][key] < min)
        ) {
          // the start cell was found
          break;
        }
        
        if (cell[key] >= min) {
          end = pivot - 1;
        } else {
          start = pivot + 1; 
        }
        if (start > end) {
          // nothing found
          return;
        }
      }       
       
      var cell = cells[pivot];
      while (cell && cell[key] >= min && cell[key] <= max)
      {
        result[cell.id] = cell;
        cell = cells[pivot++];
      }       
    },
     
       
    findCellsInWindow : function(firstRow, lastRow, firstColumn, lastColumn) 
    {
      var horizontalInWindow = {};
      this._findCellsInRange(horizontalInWindow, "firstColumn", firstColumn, lastColumn);
      this._findCellsInRange(horizontalInWindow, "lastColumn", firstColumn, lastColumn);
       
      var verticalInWindow = {};
      this._findCellsInRange(verticalInWindow, "firstRow", firstRow, lastRow);
      this._findCellsInRange(verticalInWindow, "lastRow", firstRow, lastRow);
       
      var cells = [];
      // intersect
      for (var id in verticalInWindow)
      {
        if (horizontalInWindow[id]) {
          cells.push(horizontalInWindow[id]);
        }
      }
      return cells;
    },     
    

    _onRowConfigChange : function(e) {
      this._rowPos = [];
    },    
    
    
    _onColumnConfigChange : function(e) {
      this._columnPos = [];
    },

    
    _invalidatePositionCache : function()
    {
      this._rowPos = [];
      this._columnPos = [];
    },
    
    
    _getRowPosition : function(row)
    {
      var pos = this._rowPos[row]; 
      if (pos !== undefined) {
        return pos;
      }

      pos = this._rowPos[row] = this._rowConfig.getItemPosition(row);
      return pos;
    },
    
    
    _getColumnPosition : function(column)
    {
      var pos = this._columnPos[column]; 
      if (pos !== undefined) {
        return pos;
      }
      
      pos = this._columnPos[column] = this._columnConfig.getItemPosition(column);
      return pos;
    },    
    
    
    _getSingleCellBounds : function(cell, firstVisibleRow, firstVisibleColumn)
    {
      var bounds = {
        left: 0,
        top: 0,
        width: 0,
        height: 0
      }
     
      bounds.height = 
        this._getRowPosition(cell.lastRow) + 
        this._rowConfig.getItemSize(cell.lastRow) -
        this._getRowPosition(cell.firstRow);
      
      bounds.top = 
        this._getRowPosition(cell.firstRow) -
        this._getRowPosition(firstVisibleRow);
      
      bounds.width = 
        this._getColumnPosition(cell.lastColumn) + 
        this._columnConfig.getItemSize(cell.lastColumn) -
        this._getColumnPosition(cell.firstColumn);
      
      bounds.left = 
        this._getColumnPosition(cell.firstColumn) -
        this._getColumnPosition(firstVisibleColumn);
      
      return bounds;
    },
    
    
    getCellBounds : function(cells, firstVisibleRow, firstVisibleColumn)
    {
      var bounds = [];      
      for (var i=0, l=cells.length; i<l; i++)
      {
        bounds.push(this._getSingleCellBounds(
          cells[i], firstVisibleRow, firstVisibleColumn)
        )
      }
      return bounds;
    },
    
    
    computeCellSpanMap : function(cells, firstRow, lastRow, firstColumn, lastColumn)
    {
      var map = [];
      for (var i=firstRow; i<= lastRow; i++) {
        map[i] = [];
      }
      
      for (var i=0, l=cells.length; i<l; i++)
      {
        var cell = cells[i];
        
        var rowStartIndex = Math.max(firstRow, cell.firstRow);
        var rowEndIndex = Math.min(lastRow, cell.lastRow);
        
        for (var rowIndex=rowStartIndex; rowIndex <= rowEndIndex; rowIndex++)
        {
          row = map[rowIndex];

          var columnStartIndex = Math.max(firstColumn, cell.firstColumn);
          var columnEndIndex = Math.min(lastColumn, cell.lastColumn);
          for (var columnIndex=columnStartIndex; columnIndex <= columnEndIndex; columnIndex++)
          {
            row[columnIndex] = 1;
          }
        }
      }
      
      return map;
    }
  }
});