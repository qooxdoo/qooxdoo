/* ************************************************************************

   Copyright:

   License:

   Authors:

************************************************************************ */

qx.Class.define("qx.ui.virtual.layer.GridLines",
{
  extend : qx.ui.core.Widget,
  
  
  construct : function(orientation) 
  {
    this.base(arguments);
    this._isHorizontal = (orientation || "vertical") == "horizontal";
  },
  
  
  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */
 
  members :
  {  
    _color : "gray",
  
    __renderHorizontalLines : function(htmlArr, rowSizes)
    {
      var top = 0;
      for (var y=0; y<rowSizes.length-1; y++)
      {
        top += rowSizes[y] - 1;       
        htmlArr.push(
          "<div style='",
          "position: relative;",
          "height: 1px;",
          "width: 100%;",
          "top:", top, "px;",
          "background-color:", this._color, 
          "'>",
          "</div>"
        );
      }  
    },
    
    __renderVerticalLines : function(htmlArr, columnSizes)
    {
      var left = 0;
      for (var x=0; x<columnSizes.length-1; x++)
      {
        left += columnSizes[x] - 1;       
        htmlArr.push(
          "<div style='",
          "position: absolute;",
          "width: 1px;",          
          "height: 100%;",
          "top: 0px;",
          "left:", left, "px;",
          "background-color:", this._color, 
          "'>",
          "</div>"
        );
      }      
    },
  
    fullUpdate : function(visibleCells, lastVisibleCells, rowSizes, columnSizes)
    {
      var html = [];
      if (this._isHorizontal) {
        this.__renderHorizontalLines(html, rowSizes);
      } else {
        this.__renderVerticalLines(html, columnSizes);
      }
      this.getContentElement().setAttribute("html", html.join(""));
    },
    
    updateScrollPosition : function(visibleCells, lastVisibleCells, rowSizes, columnSizes) 
    {
      var rowChanged = visibleCells.firstRow !== lastVisibleCells.firstRow;
      var columnChanged = visibleCells.firstColumn !== lastVisibleCells.firstColumn;
      
      if (
        (this._isHorizontal && rowChanged) ||
        (!this._isHorizontal && columnChanged)
      ) {
        this.fullUpdate(visibleCells, lastVisibleCells, rowSizes, columnSizes);
      }
    }
  }
});
