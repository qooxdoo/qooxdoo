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

qx.Class.define("qx.test.ui.virtual.layer.CellSpan",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    setUp : function() 
    {
      var rowConfig = new qx.ui.virtual.core.Axis(10, 100);
      var columnConfig = new qx.ui.virtual.core.Axis(20, 100);
  
      this.layer = new qx.ui.virtual.layer.CellSpan(rowConfig, columnConfig);
    },
  
    tearDown : function()
    {
      this.layer.destroy();
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
      var layer = this.layer;
      
      layer.addCell("c1", 6, 4, 5, 3);
      layer.addCell("c2", 2, 6, 3, 4);
      layer.addCell("c3", 7, 7, 6, 3);
      layer.addCell("c4", 2, 8, 6, 13);
      layer.addCell("c5", 0, 9, 1, 13);
      layer.addCell("c6", 10, 10, 1, 3);

      var cells = layer._getSortedCells("firstRow");
      this.assertEquals(6, cells.length);      
      this.assertSorted(cells, "firstRow");
      
      var cells = layer._getSortedCells("lastRow");
      this.assertEquals(6, cells.length);      
      this.assertSorted(cells, "lastRow");

      var cells = layer._getSortedCells("firstColumn");
      this.assertEquals(6, cells.length);      
      this.assertSorted(cells, "firstColumn");

      var cells = layer._getSortedCells("lastColumn");
      this.assertEquals(6, cells.length);      
      this.assertSorted(cells, "lastColumn");
      
      
      layer.addCell("c7", 6, 5, 2, 5);
      layer.addCell("c8", 1, 12, 7, 4);

      var cells = layer._getSortedCells("firstRow");
      this.assertEquals(8, cells.length);      
      this.assertSorted(cells, "firstRow");
      
      var cells = layer._getSortedCells("lastRow");
      this.assertEquals(8, cells.length);      
      this.assertSorted(cells, "lastRow");

      var cells = layer._getSortedCells("firstColumn");
      this.assertEquals(8, cells.length);      
      this.assertSorted(cells, "firstColumn");

      var cells = layer._getSortedCells("lastColumn");
      this.assertEquals(8, cells.length);      
      this.assertSorted(cells, "lastColumn");
    },
    
    
    testFindCellsInRange : function()
    {
      var layer = this.layer;
      
      layer.addCell("c1", 6, 4, 5, 3);
      layer.addCell("c2", 2, 6, 3, 4);
      layer.addCell("c3", 7, 7, 6, 3);
      layer.addCell("c4", 2, 8, 6, 13);
      layer.addCell("c5", 1, 9, 1, 13);
      layer.addCell("c6", 10, 10, 1, 3);
      
      var result = {};
      layer._findCellsInRange(result, "firstRow", 2, 6);
      this.assertArrayEquals(["c1", "c2", "c4"], qx.lang.Object.getKeys(result).sort()); 

      var result = {};
      layer._findCellsInRange(result, "firstRow", 11, 20);
      this.assertArrayEquals([], qx.lang.Object.getKeys(result));
      
      var result = {};
      layer._findCellsInRange(result, "firstRow", 0, 0);
      this.assertArrayEquals([], qx.lang.Object.getKeys(result));
      
      var result = {};
      layer._findCellsInRange(result, "firstRow", 0, 5);
      this.assertArrayEquals(["c2", "c4", "c5"], qx.lang.Object.getKeys(result).sort());
      

      var result = {};
      layer._findCellsInRange(result, "lastRow", 3, 8);
      this.assertArrayEquals(["c2", "c4"], qx.lang.Object.getKeys(result).sort());                         

      var result = {};
      layer._findCellsInRange(result, "firstColumn", 3, 7);
      this.assertArrayEquals(["c1", "c2", "c3"], qx.lang.Object.getKeys(result).sort());                         

      var result = {};
      layer._findCellsInRange(result, "lastColumn", 0, 22);
      this.assertArrayEquals(["c1", "c2", "c3", "c4", "c5", "c6"], qx.lang.Object.getKeys(result).sort());                               
    },
    
    
    testFindCellsInWindow : function()
    {
      var layer = this.layer;
      
      layer.addCell("c1", 6, 4, 5, 3);
      layer.addCell("c2", 2, 6, 3, 4);
      layer.addCell("c3", 7, 7, 6, 3);
      layer.addCell("c4", 2, 8, 6, 13);
      layer.addCell("c5", 1, 9, 1, 13);
      layer.addCell("c6", 10, 10, 1, 3);    
      
      var cells = layer._findCellsInWindow(1, 5, 7, 20);
      this.assertArrayEquals(["c2", "c4", "c5"], qx.lang.Object.getKeys(cells).sort());      
    },
    
    
    testGetCellOffsets : function()
    {
      var layer = this.layer;
      
      var offsets = layer._getCellBounds({
        firstRow: 1,
        lastRow: 3,
        firstColumn: 2,
        lastColumn: 5         
      }, 3, 3);
      this.assertJsonEquals({
        left: -20,
        top: -20,
        width: 80,
        height: 30
      }, offsets);
      
      var offsets = layer._getCellBounds({
        firstRow: 1,
        lastRow: 3,
        firstColumn: 2,
        lastColumn: 5         
      }, 1, 2);
      this.assertJsonEquals({
        left: 0,
        top: 0,
        width: 80,
        height: 30
      }, offsets);
      
      var offsets = layer._getCellBounds({
        firstRow: 1,
        lastRow: 3,
        firstColumn: 2,
        lastColumn: 5         
      }, 0, 1);
      this.assertJsonEquals({
        left: 20,
        top: 10,
        width: 80,
        height: 30
      }, offsets);      
    }
  }
});
