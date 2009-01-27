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
   * Jonathan Weiß (jonathan_rass)

************************************************************************ */

qx.Class.define("qx.ui.virtual.layer.WidgetCell",
{
  extend : qx.ui.core.Widget,
  
  implement : [qx.ui.virtual.core.ILayer],
  
  construct : function(widgetCellProvider)
  {
    this.base(arguments);

    if (qx.core.Variant.isSet("qx.debug", "on")) {
      this.assertInterface(widgetCellProvider, qx.ui.virtual.core.IWidgetCellProvider);
    }
    
    this._cellProvider = widgetCellProvider;
    this.__spacerPool = [];
  },
  
  
  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */
 
  members :
  {    
    __spacerPool : null,
    
    _getSpacer : function()
    {
      var spacer = this.__spacerPool.pop();
      if (!spacer) 
      {
        spacer = new qx.ui.core.Spacer();
        spacer.setUserData("emptycell", 1);
      }
      return spacer;
    },
    
    fullUpdate : function(
      firstRow, lastRow, 
      firstColumn, lastColumn, 
      rowSizes, columnSizes    
    )
    {
      var cellProvider = this._cellProvider;
    
      var children = this._getChildren();
      for (var i=0; i<children.length; i++) 
      {
        var child = children[i];
        if (child.getUserData("emptycell")) {
          this.__spacerPool.push(child);
        } else {
          cellProvider.poolCellWidget(child);
        }
      }

      this._removeAll();

      var top = 0;
      var left = 0;

      for (var y=0; y<rowSizes.length; y++)
      {
        for (var x=0; x<columnSizes.length; x++)
        {
          var row = firstRow + y;
          var column = firstColumn + x;
                
          var item = cellProvider.getCellWidget(row, column) || this._getSpacer();
          item.setUserBounds(left, top, columnSizes[x], rowSizes[y]);
          this._add(item);

          left += columnSizes[x];
        }
        top += rowSizes[y];
        left = 0;
      }

      this._firstRow = firstRow;
      this._lastRow = lastRow;
      this._firstColumn = firstColumn;
      this._lastColumn = lastColumn;            
    },
    
    
    updateLayerWindow : function(
      firstRow, lastRow, 
      firstColumn, lastColumn, 
      rowSizes, columnSizes
    ) 
    {
      // compute overlap of old and new window
      //
      //      +---+
      //      |  ##--+
      //      |  ##  |
      //      +--##  |
      //         +---+
      //
      var overlap = {
        firstRow: Math.max(firstRow, this._firstRow),
        lastRow: Math.min(lastRow, this._lastRow),
        firstColumn: Math.max(firstColumn, this._firstColumn),
        lastColumn: Math.min(lastColumn, this._lastColumn)
      }
      
      if (
        overlap.firstRow > overlap.lastRow || 
        overlap.firstColumn > overlap.lastColumn
      ) {
        return this.fullUpdate(
          firstRow, lastRow, 
          firstColumn, lastColumn, 
          rowSizes, columnSizes            
        );
      }           
      
      // collect the widgets to move
      var children = this._getChildren();
      var lineLength = this._lastColumn - this._firstColumn + 1;
      var widgetsToMove = [];
      var widgetsToMoveIndexes = {};
      for (var row=firstRow; row<=lastRow; row++)
      {
        widgetsToMove[row] = [];
        for (var column=firstColumn; column<=lastColumn; column++)
        {
          if (
            row >= overlap.firstRow &&
            row <= overlap.lastRow &&
            column >= overlap.firstColumn &&
            column <= overlap.lastColumn
          ) 
          {
            var x = column - this._firstColumn;
            var y = row - this._firstRow;
            var index = y*lineLength + x;
            widgetsToMove[row][column] = children[index];
            widgetsToMoveIndexes[index] = true;
          }
        }
      }
      
      var cellProvider = this._cellProvider;
      
      // pool widgets
      var children = this._getChildren();
      for (var i=0; i<children.length; i++)
      {        
        if (!widgetsToMoveIndexes[i]) 
        {
          var child = children[i];
          if (child.getUserData("emptycell")) {
            this.__spacerPool.push(child);
          } else {
            cellProvider.poolCellWidget(child);
          }
        }
      }

      this._removeAll();

      var top = 0;
      var left = 0;

      for (var y=0; y<rowSizes.length; y++)
      {
        for (var x=0; x<columnSizes.length; x++)
        {
          var row = firstRow + y;
          var column = firstColumn + x;
                
          var item = 
            widgetsToMove[row][column] || 
            cellProvider.getCellWidget(row, column) ||
            this._getSpacer();
          
          item.setUserBounds(left, top, columnSizes[x], rowSizes[y]);
          this._add(item);

          left += columnSizes[x];
        }
        top += rowSizes[y];
        left = 0;
      }
      
      this._firstRow = firstRow;
      this._lastRow = lastRow;
      this._firstColumn = firstColumn;
      this._lastColumn = lastColumn;      
    }
  },
  
  destruct : function()
  {   
    var children = this._getChildren();
    for (var i=0; i<children.length; i++) {
      children[i].dispose();
    }
  }
});
