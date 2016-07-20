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
   * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("qx.test.ui.virtual.layer.GridLinesHorizontal",
{
  extend : qx.test.ui.virtual.layer.LayerTestCase,

  members :
  {
    _createLayer : function() {
      return new qx.ui.virtual.layer.GridLines("horizontal");
    },

    _assertCells : function(firstRow, firstColumn, rowCount, columnCount, msg)
    {
      var children = this.layer.getContentElement().getDomElement().childNodes;

      this.assertEquals(rowCount-1, children.length);
    }
  }
});
