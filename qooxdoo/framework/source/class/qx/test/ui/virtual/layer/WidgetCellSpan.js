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

qx.Class.define("qx.test.ui.virtual.layer.WidgetCellSpan",
{
  extend : qx.test.ui.virtual.layer.LayerTestCase,

  members :
  {
    setUp : function()
    {
      this._pool = [];
      this.base(arguments);
    },

    tearDown : function() {
      this.base(arguments);
      this._disposeArray("_pool");
      this.__cellRenderer.dispose();
      this.__rowConfig.dispose();
      this.__columnConfig.dispose();
    },


    _createLayer : function()
    {
      this.__cellRenderer = new qx.ui.virtual.cell.Cell();

      this.__rowConfig = new qx.ui.virtual.core.Axis(10, 100);
      this.__columnConfig = new qx.ui.virtual.core.Axis(20, 100);

      return new qx.ui.virtual.layer.WidgetCellSpan(
        this,
        this.__rowConfig,
        this.__columnConfig
      );
    },


    getCellWidget : function(row, column)
    {
      var widget = this._pool.pop() || new qx.ui.core.Widget();
      widget.setBackgroundColor((row + column) % 2 == 0 ? "red" : "green");
      return widget;
    },


    poolCellWidget : function(widget)
    {
      this._pool.push(widget);
    },


    _assertCells : function(firstRow, firstColumn, rowCount, columnCount, msg)
    {
      var children = this.layer._cellLayer._getChildren();

      this.assertEquals(rowCount * columnCount, children.length);

      for (var y=0; y<rowCount; y++)
      {
        for (var x=0; x<columnCount; x++)
        {
          var row = firstRow + y;
          var column = firstColumn + x;

          var widget = children[y*columnCount + x];
          this.assertEquals(row, widget.getUserData("cell.row"));
          this.assertEquals(column, widget.getUserData("cell.column"));
        }
      }
    },


    testGetRenderedCellWidget : function()
    {
      var rowConfig = new qx.ui.virtual.core.Axis(10, 100);
      var columnConfig = new qx.ui.virtual.core.Axis(20, 100);

      var pool = new qx.data.Array();
      pool.setAutoDisposeItems(true);
      var layer = new qx.ui.virtual.layer.WidgetCellSpan(
        {
          getCellWidget: function(row, column)
          {
            var widget = new qx.ui.core.Widget();
            widget.setUserData("test", row+"/"+column);
            pool.push(widget);
            return row == 1 && column == 2 ? null : widget;
          },

          poolCellWidget : function(widget) {
          }
        },
        rowConfig, columnConfig
      );

      layer.setCellSpan(2, 0, 1, 2);
      layer.setCellSpan(2, 3, 1, 2);
      layer.setCellSpan(2, 2, 2, 1);

      this.getRoot().add(layer);
      this.flush();

      layer.fullUpdate(1, 1, [10, 10, 10], [50, 50, 50]);
      this.flush();

      this.assertEquals(null, layer.getRenderedCellWidget(0, 0));
      this.assertEquals(null, layer.getRenderedCellWidget(0, 1));
      this.assertEquals(null, layer.getRenderedCellWidget(1, 0));
      this.assertEquals(null, layer.getRenderedCellWidget(1, 2));
      this.assertEquals(null, layer.getRenderedCellWidget(4, 1));
      this.assertEquals(null, layer.getRenderedCellWidget(1, 4));
      this.assertEquals(null, layer.getRenderedCellWidget(4, 4));

      // non spanning cells
      this.assertEquals("1/1", layer.getRenderedCellWidget(1, 1).getUserData("test"));
      this.assertEquals("1/3", layer.getRenderedCellWidget(1, 3).getUserData("test"));
      this.assertEquals("3/1", layer.getRenderedCellWidget(3, 1).getUserData("test"));
      this.assertEquals("3/3", layer.getRenderedCellWidget(3, 3).getUserData("test"));

      // spanning cells
      this.assertEquals("2/0", layer.getRenderedCellWidget(2, 0).getUserData("test"));
      this.assertEquals("2/0", layer.getRenderedCellWidget(2, 1).getUserData("test"));
      this.assertEquals("2/3", layer.getRenderedCellWidget(2, 3).getUserData("test"));
      this.assertEquals("2/3", layer.getRenderedCellWidget(2, 4).getUserData("test"));
      this.assertEquals("2/2", layer.getRenderedCellWidget(2, 2).getUserData("test"));
      this.assertEquals("2/2", layer.getRenderedCellWidget(3, 2).getUserData("test"));

      layer.destroy();
      rowConfig.dispose();
      columnConfig.dispose();
      pool.dispose();
    }
  },

  destruct : function() {
    this.__cellRenderer = null;
  }
});
