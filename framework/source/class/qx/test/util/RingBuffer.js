/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Carsten Lergenmueller (carstenl)

************************************************************************ */

qx.Class.define("qx.test.util.RingBuffer",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    testAdd : function()
    {
      var max = 3;
      var buf = new qx.util.RingBuffer(max);

      buf.addEntry(1);
      this.assertEquals(1, buf.getAllEntries().length);

      buf.addEntry(2);
      this.assertEquals(2, buf.getAllEntries().length);

      buf.addEntry(3);
      this.assertEquals(3, buf.getAllEntries().length);

      buf.addEntry(4);

      var allEntries = buf.getAllEntries();
      this.assertEquals(3, allEntries.length);

      this.assertEquals(allEntries[0], 2);
      this.assertEquals(allEntries[1], 3);
      this.assertEquals(allEntries[2], 4);
    },


    testAddMany : function()
    {
      var max = 3;
      var buf = new qx.util.RingBuffer(max);

      for (var i=0; i<=1003; i++){
         buf.addEntry(i);
      }

      var allEntries = buf.getAllEntries();
      this.assertEquals(3, allEntries.length);

      this.assertEquals(allEntries[0], 1001);
      this.assertEquals(allEntries[1], 1002);
      this.assertEquals(allEntries[2], 1003);
    },


    testGet : function()
    {
      var max = 7;
      var buf = new qx.util.RingBuffer(max);

      buf.addEntry(1);
      buf.addEntry(2);
      buf.addEntry(3);
      buf.addEntry(5);
      buf.addEntry(6);
      buf.addEntry(7);
      buf.addEntry(8);
      buf.addEntry(9);
      buf.addEntry(10);

      var entries = buf.getEntries(4);
      this.assertEquals(4, entries.length);

      this.assertEquals(entries[0], 7);
      this.assertEquals(entries[1], 8);
      this.assertEquals(entries[2], 9);
      this.assertEquals(entries[3], 10);
    },


    testMark : function()
    {
      var max = 3;
      var buf = new qx.util.RingBuffer(max);

      buf.addEntry(1);
      buf.addEntry(2);
      buf.mark();
      buf.addEntry(3);
      buf.addEntry(4);

      var entriesSinceMark = buf.getEntries(9999, true);
      this.assertEquals(2, entriesSinceMark.length);

      this.assertEquals(entriesSinceMark[0], 3);
      this.assertEquals(entriesSinceMark[1], 4);
    },


    testClear : function()
    {
      var max = 3;
      var buf = new qx.util.RingBuffer(max);

      buf.addEntry(1);
      buf.addEntry(2);
      buf.addEntry(3);
      buf.addEntry(4);

      this.assertEquals(3, buf.getAllEntries().length);

      buf.clear();

      this.assertEquals(0, buf.getAllEntries().length);
    },


    testDataTypes : function()
    {
      var max = 6;
      var buf = new qx.util.RingBuffer(max);

      buf.addEntry(1);
      buf.addEntry(2);
      buf.addEntry(3);

      buf.addEntry(null);
      buf.addEntry(buf);
      buf.addEntry("Some string");
      buf.addEntry({"some":"map"});
      buf.addEntry(["Some array"]);
      buf.addEntry(function(){});

      var allEntries = buf.getAllEntries();
      this.assertEquals(6, allEntries.length);

      this.assertEquals(allEntries[0], null);
      this.assertEquals(allEntries[1], buf);
      this.assertEquals(allEntries[2], "Some string");
      this.assertEquals(allEntries[3].some, "map");
      this.assertEquals(allEntries[4][0], "Some array");
      this.assertEquals(typeof allEntries[5], "function");
    }
  }
});