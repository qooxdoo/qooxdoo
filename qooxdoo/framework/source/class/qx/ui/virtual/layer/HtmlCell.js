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

qx.Class.define("qx.ui.virtual.layer.HtmlCell",
{
  extend : qx.ui.core.Widget,
  
  implement : [qx.ui.virtual.core.ILayer],
  
  construct : function(htmlCellProvider)
  {
    this.base(arguments);    
    this._cellProvider = htmlCellProvider;
  },
  
  
  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    fullUpdate : function(visibleCells, rowSizes, columnSizes)
    {
      var html = [];
      var left = 0;
      var top = 0;
      var row = visibleCells.firstRow;
      var col = visibleCells.firstColumn;
      for (var x=0; x<rowSizes.length; x++)
      {
        var left = 0;
        var col = visibleCells.firstColumn;
        var height = rowSizes[x] 
        for(var y=0; y<columnSizes.length; y++)
        {
          var width = columnSizes[y];
          
          html[html.length] = this._cellProvider.getCellHtml(
            row, col,
            left, top,
            width, height
          );

          col++;
          left += width;          
        }
        top += height;
        row++;
      }
      
      this.getContentElement().setAttribute("html", html.join(""));
    },
    
    
    updateLayerWindow : function(visibleCells, lastVisibleCells, rowSizes, columnSizes) {
      this.fullUpdate(visibleCells, rowSizes, columnSizes);
    }
  }
});