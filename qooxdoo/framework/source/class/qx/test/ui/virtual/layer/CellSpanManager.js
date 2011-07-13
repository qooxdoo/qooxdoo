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

qx.Class.define("qx.test.ui.virtual.layer.CellSpanManager",
{
  extend : qx.test.ui.LayoutTestCase,

  members :
  {
    setUp : function()
    {
      this.rowConfig = new qx.ui.virtual.core.Axis(10, 100);
      this.columnConfig = new qx.ui.virtual.core.Axis(20, 100);

      this.cellSpan = new qx.ui.virtual.layer.CellSpanManager(
        this.rowConfig,
        this.columnConfig
      );
    },


    tearDown : function()
    {
      this.base(arguments);
      this.cellSpan.dispose();
      this.rowConfig.dispose();
      this.columnConfig.dispose();
    },


    assertSorted : function(cells, key)
    {
      var last = -1;
      for (var i=0, l=cells.length; i<l; i++)
      {
        var cell = cells[i];
        var start = cell[key];
        this.assert(last <= start);
        last = start;
      }
    },


    testGetSortedCells : function()
    {
      var cellSpan = this.cellSpan;

      cellSpan.addCell("c1", 6, 4, 5, 3);
      cellSpan.addCell("c2", 2, 6, 3, 4);
      cellSpan.addCell("c3", 7, 7, 6, 3);
      cellSpan.addCell("c4", 2, 8, 6, 13);
      cellSpan.addCell("c5", 0, 9, 1, 13);
      cellSpan.addCell("c6", 10, 10, 1, 3);

      var cells = cellSpan._getSortedCells("firstRow");
      this.assertEquals(6, cells.length);
      this.assertSorted(cells, "firstRow");

      var cells = cellSpan._getSortedCells("lastRow");
      this.assertEquals(6, cells.length);
      this.assertSorted(cells, "lastRow");

      var cells = cellSpan._getSortedCells("firstColumn");
      this.assertEquals(6, cells.length);
      this.assertSorted(cells, "firstColumn");

      var cells = cellSpan._getSortedCells("lastColumn");
      this.assertEquals(6, cells.length);
      this.assertSorted(cells, "lastColumn");


      cellSpan.addCell("c7", 6, 5, 2, 5);
      cellSpan.addCell("c8", 1, 12, 7, 4);

      var cells = cellSpan._getSortedCells("firstRow");
      this.assertEquals(8, cells.length);
      this.assertSorted(cells, "firstRow");

      var cells = cellSpan._getSortedCells("lastRow");
      this.assertEquals(8, cells.length);
      this.assertSorted(cells, "lastRow");

      var cells = cellSpan._getSortedCells("firstColumn");
      this.assertEquals(8, cells.length);
      this.assertSorted(cells, "firstColumn");

      var cells = cellSpan._getSortedCells("lastColumn");
      this.assertEquals(8, cells.length);
      this.assertSorted(cells, "lastColumn");
    },


    testFindCellsInRange : function()
    {
      var cellSpan = this.cellSpan;

      cellSpan.addCell("c1", 6, 4, 5, 3);
      cellSpan.addCell("c2", 2, 6, 3, 4);
      cellSpan.addCell("c3", 7, 7, 6, 3);
      cellSpan.addCell("c4", 2, 8, 6, 13);
      cellSpan.addCell("c5", 1, 9, 1, 13);
      cellSpan.addCell("c6", 10, 10, 1, 3);

      var result = cellSpan._findCellsInRange("firstRow", 2, 6);
      this.assertArrayEquals(
        ["c1", "c2", "c4"],
        qx.lang.Object.getKeys(result).sort()
      );

      var result = cellSpan._findCellsInRange("firstRow", 11, 20);
      this.assertArrayEquals([], qx.lang.Object.getKeys(result));

      var result = cellSpan._findCellsInRange("firstRow", 0, 0);
      this.assertArrayEquals([], qx.lang.Object.getKeys(result));

      var result = cellSpan._findCellsInRange("firstRow", 0, 5);
      this.assertArrayEquals(
        ["c2", "c4", "c5"],
        qx.lang.Object.getKeys(result).sort()
      );


      var result = cellSpan._findCellsInRange("lastRow", 3, 8);
      this.assertArrayEquals(["c2", "c4"], qx.lang.Object.getKeys(result).sort());

      var result = cellSpan._findCellsInRange("firstColumn", 3, 7);
      this.assertArrayEquals(
        ["c1", "c2", "c3"],
        qx.lang.Object.getKeys(result).sort()
      );

      var result = cellSpan._findCellsInRange("lastColumn", 0, 22);
      this.assertArrayEquals(
        ["c1", "c2", "c3", "c4", "c5", "c6"],
        qx.lang.Object.getKeys(result).sort()
      );
    },


    testFindCellsInWindow : function()
    {
      var cellSpan = this.cellSpan;

      cellSpan.addCell("c1", 6, 4, 5, 3);
      cellSpan.addCell("c2", 2, 6, 3, 4);
      cellSpan.addCell("c3", 7, 7, 6, 3);
      cellSpan.addCell("c4", 2, 8, 6, 13);
      cellSpan.addCell("c5", 1, 9, 1, 13);
      cellSpan.addCell("c6", 10, 10, 1, 3);

      var cells = cellSpan.findCellsInWindow(1, 7, 5, 14);
      var ids = [];
      cells.forEach(function(cell) {
        ids.push(cell.id);
      });
      this.assertArrayEquals(["c2", "c4", "c5"], ids.sort());
    },


    testGetCellOffsets : function()
    {
      var cellSpan = this.cellSpan;

      var bounds = cellSpan.getCellBounds([{
        firstRow: 1,
        lastRow: 3,
        firstColumn: 2,
        lastColumn: 5
      }], 3, 3);
      this.assertJsonEquals({
        left: -20,
        top: -20,
        width: 80,
        height: 30
      }, bounds[0]);

      var bounds = cellSpan.getCellBounds([{
        firstRow: 1,
        lastRow: 3,
        firstColumn: 2,
        lastColumn: 5
      }], 1, 2);
      this.assertJsonEquals({
        left: 0,
        top: 0,
        width: 80,
        height: 30
      }, bounds[0]);

      var bounds = cellSpan.getCellBounds([{
        firstRow: 1,
        lastRow: 3,
        firstColumn: 2,
        lastColumn: 5
      }], 0, 1);
      this.assertJsonEquals({
        left: 20,
        top: 10,
        width: 80,
        height: 30
      }, bounds[0]);
    },


    testAxisChange : function()
    {
      var bounds = this.cellSpan.getCellBounds([{
        firstRow: 1,
        lastRow: 3,
        firstColumn: 2,
        lastColumn: 5
      }], 3, 3);
      this.assertJsonEquals({
        left: -20,
        top: -20,
        width: 80,
        height: 30
      }, bounds[0]);

      this.rowConfig.setDefaultItemSize(15);

      var bounds = this.cellSpan.getCellBounds([{
        firstRow: 1,
        lastRow: 3,
        firstColumn: 2,
        lastColumn: 5
      }], 3, 3);
      this.assertJsonEquals({
        left: -20,
        top: -30,
        width: 80,
        height: 45
      }, bounds[0]);
    },


    testComputeCellSpanMap : function()
    {
      var cellSpan = this.cellSpan;

      cellSpan.addCell("c1", 0, 0, 2, 2);
      cellSpan.addCell("c2", 0, 4, 2, 2);
      cellSpan.addCell("c3", 2, 2, 2, 2);
      cellSpan.addCell("c4", 4, 0, 2, 2);
      cellSpan.addCell("c5", 4, 4, 2, 2);

      var cells = cellSpan.findCellsInWindow(1, 1, 4, 4);
      var ids = [];
      cells.forEach(function(cell) {
        ids.push(cell.id);
      });
      this.assertJsonEquals(["c1", "c2", "c3", "c4", "c5"], ids.sort());

      var map = cellSpan.computeCellSpanMap(cells, 1, 1, 4, 4);
      this.assertJsonEquals([
       undefined,
       [undefined, 1, undefined, undefined, 1],
       [undefined, undefined, 1, 1],
       [undefined, undefined, 1, 1],
       [undefined, 1, undefined, undefined, 1]
      ], map);
    },


    testDispose : function()
    {
      var rowConfig = new qx.ui.virtual.core.Axis(10, 100);
      var columnConfig = new qx.ui.virtual.core.Axis(20, 100);

      this.assertDestroy(function()
      {
        var cellSpan = new qx.ui.virtual.layer.CellSpanManager(
          rowConfig,
          columnConfig
        );
        cellSpan.dispose();
      }, this);

      rowConfig.dispose();
      columnConfig.dispose();
    }

  },

  destruct : function() {
    this.cellSpan = this.rowConfig = this.columnConfig = null;
  }
});