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

qx.Class.define("qx.test.ui.virtual.layer.WidgetCell",
{
  extend : qx.test.ui.virtual.layer.LayerTestCase,

  members :
  {
    setUp : function()
    {
      this._pool = [];

      this.base(arguments);
    },


    tearDown : function()
    {
      for (var i=0; i<this._pool.length; i++) {
        this._pool[i].destroy();
      }
      this.flush();

      this._pool = null;
      this.base(arguments);
    },


    _createLayer : function() {
      return new qx.ui.virtual.layer.WidgetCell(this);
    },


    getCellWidget : function(row, column)
    {
      var widget = this._pool.pop() || new qx.ui.core.Widget();
      widget.setBackgroundColor((row + column) % 2 == 0 ? "red" : "green");
      return widget;
    },


    poolCellWidget : function(widget)
    {
      widget.setUserData("row", -1);
      widget.setUserData("column", -1);
      this._pool.push(widget);
    },


    _assertCells : function(firstRow, firstColumn, rowCount, columnCount, msg)
    {
      var children = this.layer._getChildren();

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
      var pool = new qx.data.Array();
      pool.setAutoDisposeItems(true);
      var layer = new qx.ui.virtual.layer.WidgetCell({
        getCellWidget: function(row, column)
        {
          var widget = new qx.ui.core.Widget();
          widget.setUserData("test", row+"/"+column);
          pool.push(widget);
          return row == 2 && column == 2 ? null : widget;
        },

        poolCellWidget : function(widget) {
        }
      });

      this.getRoot().add(layer);
      this.flush();

      layer.fullUpdate(1, 1, [10, 10, 10], [50, 50, 50]);
      this.flush();

      this.assertEquals(null, layer.getRenderedCellWidget(0, 0));
      this.assertEquals(null, layer.getRenderedCellWidget(0, 1));
      this.assertEquals(null, layer.getRenderedCellWidget(1, 0));
      this.assertEquals(null, layer.getRenderedCellWidget(2, 2));
      this.assertEquals(null, layer.getRenderedCellWidget(4, 1));
      this.assertEquals(null, layer.getRenderedCellWidget(1, 4));
      this.assertEquals(null, layer.getRenderedCellWidget(4, 4));

      this.assertEquals("1/1", layer.getRenderedCellWidget(1, 1).getUserData("test"));
      this.assertEquals("1/3", layer.getRenderedCellWidget(1, 3).getUserData("test"));
      this.assertEquals("3/1", layer.getRenderedCellWidget(3, 1).getUserData("test"));
      this.assertEquals("3/3", layer.getRenderedCellWidget(3, 3).getUserData("test"));

      layer.destroy();
      pool.dispose();
    },


    testEmptyCells : function()
    {
      var layer = new qx.ui.virtual.layer.WidgetCell({
        getCellWidget: function(row, column) {
          return column === 0 ? new qx.ui.core.Widget() : null;
        },

        poolCellWidget : function(widget) {
          widget.destroy();
        }
      });

      this.getRoot().add(layer);
      this.flush();

      layer.fullUpdate(0, 0, [10, 10, 10, 10, 10, 10], [30, 30, 30]);
      this.flush();

      var children = layer.getChildren();

      for (var y=0; y<=5; y++)
      {
        for (var x=0; x<=2; x++)
        {
          var child = children[y*3 + x];
          if (x === 0) {
            this.assertInstance(child, qx.ui.core.Widget);
          } else {
            this.assertInstance(child, qx.ui.core.Spacer);
          }
        }
      }

      layer.destroy();
    }
  }
});
