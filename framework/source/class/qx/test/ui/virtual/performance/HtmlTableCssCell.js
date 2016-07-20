/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */

qx.Class.define("qx.test.ui.virtual.performance.HtmlTableCssCell",
{
  extend : qx.test.ui.virtual.performance.AbstractLayerTest,
  type : "abstract", // disabled

  members :
  {
    getLayer : function() {
      return new qx.test.ui.virtual.performance.layer.HtmlTableCssCell(this);
    },


    getCellHtml : function(row, column, left, top, width, height)
    {
      var html = [
        "<td>",
        row,
        " / ",
        column,
        "</td>"
      ];
      return html.join("");
    }

  }

});
