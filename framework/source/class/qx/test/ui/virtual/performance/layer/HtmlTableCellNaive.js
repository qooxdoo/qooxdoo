/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */

qx.Class.define("qx.test.ui.virtual.performance.layer.HtmlTableCellNaive", {
  extend : qx.ui.virtual.layer.Abstract,

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
    _fullUpdate : function(
      firstRow, firstColumn,
      rowSizes, columnSizes
    )
    {
      var html = [];
      var left = 0;
      var top = 0;
      var row = firstRow;
      var column = firstColumn;

      html.push('<table style="border-collapse: collapse; margin: 0px; padding: 0px;">');

      for (var x=0; x<rowSizes.length; x++)
      {
        var left = 0;
        var column = firstColumn;
        var height = rowSizes[x];

        html.push('<tr style="border-collapse: collapse; margin: 0px; padding: 0px;">');
        for(var y=0; y<columnSizes.length; y++)
        {
          var width = columnSizes[y];

          html.push(
            this._cellProvider.getCellHtml(
              row, column,
              left, top,
              width, height
            )
          );

          column++;
          left += width;
        }
        html.push("</tr>");
        top += height;
        row++;
      }
      html.push("</table>");

      this.getContentElement().setAttribute("html", html.join(""));
    }
  }
});