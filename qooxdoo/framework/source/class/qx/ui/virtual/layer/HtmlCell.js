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

/**
 * The HtmlCell layer renders each cell with custom HTML markup. The concrete
 * markup for each cell is provided by a cell provider.
 */
qx.Class.define("qx.ui.virtual.layer.HtmlCell",
{
  extend : qx.ui.virtual.layer.Abstract,
  
  implement : [qx.ui.virtual.core.ILayer],
  
  
  /**
   * @param htmlCellProvider {qx.ui.virtual.core.IHtmlCellProvider} This class
   *    provides the HTML markup for each cell.
   */
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
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // overridden
    _fullUpdate : function(
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
    }
  }
});