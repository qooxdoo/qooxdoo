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

qx.Class.define("qx.ui.virtual.layer.AbstractWidget",
{
  extend : qx.ui.core.Widget,
  
  construct : function()
  {
    this.base(arguments);
    this._pool = [];
  },
  
  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */
 
  members :
  {
    _getWidget : function(row, column) {
      throw new Error("_getWidget is abstract");
    },
    
    _poolWidget: function(widget) {
      throw new Error("_poolWidget is abstract");
    },

    _configureWidget : function(widget, row, column) 
    {
      throw new Error("_configureWidget is abstract");
    },    
    
    fullUpdate : function(visibleCells, lastVisibleCells, rowSizes, columnSizes)
    {
      var children = this._getChildren();
      for (var i=0; i<children.length; i++) {
        this._poolWidget(children[i]);
      }

      this._removeAll();

      var top = 0;
      var left = 0;

      for (var y=0; y<rowSizes.length; y++)
      {
        for (var x=0; x<columnSizes.length; x++)
        {
          var rowIndex = visibleCells.firstRow + y;
          var colIndex = visibleCells.firstColumn + x;
                
          var item = this._getWidget(rowIndex, colIndex);
          this._configureWidget(item, rowIndex, colIndex);
                
          item.setUserBounds(left, top, columnSizes[x], rowSizes[y]);
          this._add(item);

          left += columnSizes[x];
        }
        top += rowSizes[y];
        left = 0;
      }
    },
    
    updateScrollPosition : function(visibleCells, lastVisibleCells, rowSizes, columnSizes) 
    {
      var refreshAll = false;
      
      if (
        visibleCells.firstRow > lastVisibleCells.firstRow ||
        visibleCells.lastRow > lastVisibleCells.lastRow        
      ) {
        if (visibleCells.firstRow > lastVisibleCells.lastRow) {
          refreshAll = true;
        } else {
          direction = "down";
        }
      } else {
        refreshAll = true;
      }      
      
      if (refreshAll) 
      {
        this.fullUpdate(visibleCells, lastVisibleCells, rowSizes, columnSizes);
        return;
      }
      
      if (direction == "down")
      {
        var children = this._getChildren();

        // Remove and pool children
        var linesRemoved = visibleCells.firstRow - lastVisibleCells.firstRow;
        for (var row=lastVisibleCells.firstRow; row<lastVisibleCells.firstRow + linesRemoved; row++)
        {            
          for (var col=visibleCells.firstColumn; col<=visibleCells.lastColumn; col++)
          {
            var item = children[0];
            this._poolWidget(item);
            this._remove(item);
          }
        }

        var x = 0;
        var y = 0;
        
        var left = 0;
        var top = 0;

        // move visible cells up
        var i=0;
        for (var row=lastVisibleCells.firstRow + linesRemoved; row<=lastVisibleCells.lastRow; row++)
        {            
          for (var col=visibleCells.firstColumn; col<=visibleCells.lastColumn; col++)
          {
            var item = children[i++]; 
            item.setUserBounds(left, top, columnSizes[x], rowSizes[y]);              
            
            left += columnSizes[x];               
            x++;
          }
          left = 0;
          top += rowSizes[y];
          
          y++;
          x = 0;
        }

        // add new cells
        for (var row=lastVisibleCells.lastRow+1; row<=visibleCells.lastRow; row++)
        {      
          for (var col=visibleCells.firstColumn; col<=visibleCells.lastColumn; col++)
          {
            var item = this._getWidget(row, col);
            this._configureWidget(item, row, col);
                          
            item.setUserBounds(left, top, columnSizes[x], rowSizes[y]); 
            this._add(item);

            left += columnSizes[x];               
            x++;
          }
          left = 0;
          top += rowSizes[y];
          
          y++;
          x = 0;
        }
      }
      else
      {
        this.fullUpdate(visibleCells, lastVisibleCells, rowSizes, columnSizes);
      }
    }
  }
});
