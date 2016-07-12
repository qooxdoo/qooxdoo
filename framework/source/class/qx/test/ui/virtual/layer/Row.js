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

qx.Class.define("qx.test.ui.virtual.layer.Row",
{
  extend : qx.test.ui.virtual.layer.LayerTestCase,

  members :
  {
    _createLayer : function() {
      return new qx.ui.virtual.layer.Row("red", "green");
    },

    _assertCells : function(firstRow, firstColumn, rowCount, columnCount, msg)
    {
      var children = this.layer.getContentElement().getDomElement().childNodes;

      this.assertEquals(rowCount, children.length);

      for (var i=0; i<rowCount; i++)
      {
        var row = firstRow + i;
        if (row % 2 == 0) {
          this.assertCssColor("red", children[i].style.backgroundColor);
        } else {
          this.assertCssColor("green", children[i].style.backgroundColor);
        }
      }
    }
  }
});
