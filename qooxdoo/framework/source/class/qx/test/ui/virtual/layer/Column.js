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
   * Jonathan Weiß (jonathan_rass)
   * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("qx.test.ui.virtual.layer.Column",
{
  extend : qx.test.ui.virtual.layer.LayerTestCase,

  members :
  {
    _createLayer : function() {
      return new qx.ui.virtual.layer.Column("red", "green");
    },

    _assertCells : function(firstRow, firstColumn, rowCount, columnCount, msg)
    {
      var children = this.layer.getContentElement().getDomElement().childNodes;

      this.assertEquals(columnCount, children.length);

      for (var i=0; i<columnCount; i++)
      {
        var column = firstColumn + i;
        if (column % 2 == 0) {
          this.assertCssColor("red", children[i].style.backgroundColor);
        } else {
          this.assertCssColor("green", children[i].style.backgroundColor);
        }
      }
    }
  }
});
