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
      if (visibleCells.lastColumn > 5) debugger;
      //this.fullUpdate(visibleCells, lastVisibleCells, rowSizes, columnSizes);
      //return;

      var x = visibleCells.firstColumn - lastVisibleCells.firstColumn;
      var y = visibleCells.firstRow - lastVisibleCells.firstRow;
      var refreshAll = false;
      var cellOffset = 0;
      var direction;

      if (x > 0)
      {
        refreshAll = (x > columnSizes.length);
        cellOffset = x;
        direction = "right";
      }
      else if (x < 0)
      {
        cellOffset = Math.abs(x);
        refreshAll = (cellOffset > columnSizes.length);
        direction = "left";
      }
      else if (y > 0)
      {
        cellOffset = y;
        refreshAll = (y > rowSizes.length);
        direction = "down";
      }
      else if (y < 0)
      {
        cellOffset = Math.abs(y);
        refreshAll = (cellOffset > rowSizes.length);
        direction = "up";
      }
      else
      {
        console.info(x, y)
        return;
      }

      if (refreshAll)
      {
        console.info("FULL!")
        this.fullUpdate(visibleCells, lastVisibleCells, rowSizes, columnSizes);
      }
      else
      {
        
        
        if (direction == "down")
        {

          
        
          var children = this._getChildren();

          console.log(children.length)
          //debugger;

          console.log("remove");
          var linesRemoved = visibleCells.firstRow - lastVisibleCells.firstRow;
          // Remove and pool children
          for (var row=lastVisibleCells.firstRow; row<lastVisibleCells.firstRow + linesRemoved; row++)
          {            
            console.log("row", row)
            for (var col=visibleCells.firstColumn; col<=visibleCells.lastColumn; col++)
            {
              var item = children[0];
              this._poolWidget(item);
              this._remove(item);
            }
          }
                    console.log("after", children.length)

          var x = 0;
          var y = 0;
          
          var left = 0;
          var top = 0;

          // move visible cells up
          console.log("move visible cells up")
          var i=0;
          console.log(lastVisibleCells.lastRow);
          
          for (var row=lastVisibleCells.firstRow + linesRemoved; row<=lastVisibleCells.lastRow; row++)
          {            
            console.log("row", row)
            for (var col=visibleCells.firstColumn; col<=visibleCells.lastColumn; col++)
            {
              
              var item = children[i++];
              if (!item) debugger;

              //console.log(left, top, columnSizes[x], rowSizes[y], x, y)  
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
          console.log("add new cells");
          for (var row=lastVisibleCells.lastRow+1; row<=visibleCells.lastRow; row++)
          {      
            console.log("row", row)      
            for (var col=visibleCells.firstColumn; col<=visibleCells.lastColumn; col++)
            {
              var item = this._getWidget(row, col);
              this._configureWidget(item, row, col);
                            
              //console.log(left, top, columnSizes[x], rowSizes[y], x, y)  
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


console.log("after", children.length)

          
/*
          // Remove children at the top
          for (var i=0; i<cellOffset*columnSizes.length; i++)
          {
            var item = children[start];
            this._poolWidget(item);
            this._remove(item);
          }
          
          console.info("removed " + cellOffset*columnSizes.length)


          var left = 0;
          var top = 0;
          var i = 0;

          // move visible cells up
          var lastRowCount = lastVisibleCells.lastRow - lastVisibleCells.firstRow;
          for (var y=0; y<lastRowCount-cellOffset; y++)
          {            
            for (var x=0; x<columnSizes.length; x++)
            {
              var item = children[i++];
              
              item.setUserBounds(left, top, columnSizes[x], rowSizes[y]);  
              left += columnSizes[x]; 
            }
            left = 0;
            top += rowSizes[y];
          }

          var added = 0;

          // add new cells
          for (var y=lastRowCount-cellOffset; y<rowSizes.length; y++)
          {            
            for (var x=0; x<columnSizes.length; x++)
            {
              var row = visibleCells.firstRow + y;
              var col = visibleCells.firstColumn + x;

              var item = this._getWidget(row, col);
              this._configureWidget(item, row, col);
                            
                            //console.info(item, x, y);
                            
              item.setUserBounds(left, top, columnSizes[x], rowSizes[y]); 
              this._add(item);
               
              left += columnSizes[x]; 
              
              added ++;
            }
            left = 0;
            top += rowSizes[y];
          }

          console.info("added ", added, lastRowCount-cellOffset, rowSizes.length)


          console.info(children.length)

*/


          // // Add the same amount of children at the bottom
          // for (var i=0; i<cellOffset*columnSizes.length; i++)
          // {
          //   var row = visibleCells.lastRow;
          //   var col = visibleCells.firstColumn + i;
          // 
          //   var child = this._getWidget(row, col);
          //   this._configureWidget(child, row, col);
          // 
          //   child.setUserBounds(left, top, columnSizes[i], top);
          //   this._add(child);
          // 
          //   left += columnSizes[i];
          // }
        }else{
          this.fullUpdate(visibleCells, lastVisibleCells, rowSizes, columnSizes);
        }
        
      }
      return;


      for (var i=0; i<children.length; i++) {
        this._poolWidget(children[i]);
      }

      this._removeAll();

      var top = 0;
      var left = 0;
      for (var x=0; x<columnSizes.length; x++)
      {
        for (var y=0; y<rowSizes.length; y++)
        {
          var rowIndex = visibleCells.firstRow + y;
          var colIndex = visibleCells.firstColumn + x;
                
          var item = this._getWidget(rowIndex, colIndex);
          this._configureWidget(item, rowIndex, colIndex);
                
          item.setUserBounds(left, top, columnSizes[x], rowSizes[y]);
          this._add(item);

          top += rowSizes[y];
        }
        left += columnSizes[x];
        top = 0;
      }







    }
  }
});
