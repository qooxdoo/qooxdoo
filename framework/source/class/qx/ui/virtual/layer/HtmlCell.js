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
    
    if (qx.core.Variant.isSet("qx.debug", "on")) {
      this.assertInterface(htmlCellProvider, qx.ui.virtual.core.IHtmlCellProvider);
    }
    this._cellProvider = htmlCellProvider;
  },
  
  
  /*
   *****************************************************************************
      PROPERTIES
   *****************************************************************************
   */

   properties :
   {
     // overridden
     anonymous :
     {
       refine: true,
       init: true
     }
   },
  
  
  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    syncWidget : function()
    {
      if (!this._rowSizes) {
        return;
      }
      this.fullUpdate(
        this._firstRow, this._lastRow,
        this._firstColumn, this._lastColumn,
        this._rowSizes, this._columnSizes
      );
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
      var column = firstColumn;
      for (var x=0; x<rowSizes.length; x++)
      {
        var left = 0;
        var column = firstColumn;
        var height = rowSizes[x] 
        for(var y=0; y<columnSizes.length; y++)
        {
          var width = columnSizes[y];
          
          html[html.length] = this._cellProvider.getCellHtml(
            row, column,
            left, top,
            width, height
          );

          column++;
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