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

qx.Class.define("qx.test.ui.virtual.layer.LayerSimple",
{
  extend : qx.ui.core.Widget,
  implement : [qx.ui.virtual.core.ILayer],

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {

    getCellHtml : function(row, column, left, top, width, height)
    {
      var content = column + " / " + row;
      return [
        "<div style='position:absolute;",
        "left:", left, "px;",
        "top:", top, "px;",
        "width:", width, "px;",
        "height:", height, "px;",
        "'>",
        content,
        "</div>"
      ].join("");   
    },

    fullUpdate : function(
      firstRow, lastRow, 
      firstColumn, lastColumn, 
      rowSizes, columnSizes
    )
    {
      var html = [];
      var left = 0;
      var top = 0;
      var row = firstRow;
      var col = firstColumn;
      for (var x=0; x<rowSizes.length; x++)
      {
        var left = 0;
        var col = firstColumn;
        var height = rowSizes[x] 
        for(var y=0; y<columnSizes.length; y++)
        {
          var width = columnSizes[y];
          
          html[html.length] = this.getCellHtml(
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
      
      this._firstRow = firstRow;
      this._lastRow = lastRow;
      this._firstColumn = firstColumn;
      this._lastColumn = lastColumn;
      this._rowSizes = rowSizes;
      this._columnSizes = columnSizes;
    },


    
    updateLayerWindow : function(
      firstRow, lastRow, 
      firstColumn, lastColumn, 
      rowSizes, columnSizes
    ) {
      this.fullUpdate(
        firstRow, lastRow, 
        firstColumn, lastColumn, 
        rowSizes, columnSizes
      );
    }

  }
});