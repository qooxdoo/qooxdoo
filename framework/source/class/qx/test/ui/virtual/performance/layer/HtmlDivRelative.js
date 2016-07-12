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

************************************************************************ */

qx.Class.define("qx.test.ui.virtual.performance.layer.HtmlDivRelative",
{
  extend : qx.ui.virtual.layer.Abstract,


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
      var col = firstColumn;
      for (var x=0; x<rowSizes.length; x++)
      {
        var left = 0;
        var col = firstColumn;
        for(var y=0; y<columnSizes.length; y++)
        {
          var content = col + " / " + row;

          html.push(
            "<div style='",
            "float: left;",
            "width:", columnSizes[y], "px;",
            "height:", rowSizes[x], "px;",
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
    }
  }
});
