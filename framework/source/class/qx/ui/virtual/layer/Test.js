/* ************************************************************************

   Copyright:

   License:

   Authors:

************************************************************************ */

qx.Class.define("qx.ui.virtual.layer.Test",
{
  extend : qx.ui.core.Widget,
  
  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    fullUpdate : function(visibleCells, lastVisibleCells, rowSizes, columnSizes)
    {
      //qx.ui.core.queue.Manager.flush();
      //var start = new Date();
  
      var html = [];
      var left = 0;
      var top = 0;
      var row = visibleCells.firstRow;
      var col = visibleCells.firstColumn;
      for (var x=0; x<rowSizes.length; x++)
      {
        var left = 0;
        var col = visibleCells.firstColumn;
        for(var y=0; y<columnSizes.length; y++)
        {
          var color = (row+col) % 2 == 0 ? "blue" : "yellow";
          var content = col + "x" + row;
          html.push(
            "<div style='position:absolute;",
            "left:", left, "px;",
            "top:", top, "px;",
            "width:", columnSizes[y], "px;",
            "height:", rowSizes[x], "px;",
            //"background-color:", color,
            "'>",
            content,
            "</div>"
          ); 
          col++;
          left += columnSizes[y];          
        }
        top += rowSizes[x];
        row++;
      }
      
      this.getContentElement().setAttribute("html", html.join(""));
      /*
      this.debug("dom - update: " + (new Date() - start) + "ms");
      var start = new Date();
      qx.ui.core.queue.Manager.flush();
      this.debug("dom - flush: " + (new Date() - start) + "ms");
      */     
    },
    
    
    updateScrollPosition : function(visibleCells, lastVisibleCells, rowSizes, columnSizes) {
      this.fullUpdate(visibleCells, lastVisibleCells, rowSizes, columnSizes);
    }
  }
});
