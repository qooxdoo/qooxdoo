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

qx.Class.define("qx.test.ui.virtual.performance.HtmlDivCell", {
  extend : qx.test.ui.virtual.performance.AbstractLayerTest,
  type : "abstract", // disabled

  members :
  {
    getLayer : function()
    {
      this.__cellRenderer = new qx.ui.virtual.cell.Cell();
      return new qx.ui.virtual.layer.HtmlCell(this);
    },

    getCellProperties : function(row, column) {
      return this.__cellRenderer.getCellProperties(row + " / " + column, {});
    }
  }

});
