/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
   * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("qx.test.ui.virtual.Axis",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    setUp : function()
    {
      this.defaultSize = 10;
      this.count = 1000;
      this.axis = new qx.ui.virtual.core.Axis(this.defaultSize, this.count);
    },


    tearDown : function() {
      this.axis.dispose();
    },


    assertItem : function(expectedItemIndex, expectedOffset, cellData, msg)
    {
      this.assertEquals(expectedItemIndex, cellData.index, msg + ": invalid item index");
      this.assertEquals(expectedOffset, cellData.offset, msg + ": invalid item offset");
    },


    testDefaultItemSize : function()
    {
      this.assertEquals(this.defaultSize, this.axis.getDefaultItemSize());

      this.axis.setDefaultItemSize(20);
      this.assertEquals(20, this.axis.getDefaultItemSize());
    },


    testItemCount : function()
    {
      this.assertEquals(this.count, this.axis.getItemCount());

      this.axis.setItemCount(this.count * 2);
      this.assertEquals(this.count * 2, this.axis.getItemCount());
    },


    testItemSize : function()
    {
      var sizes = {};
      sizes[100] = 2;
      sizes[200] = 30;
      sizes[600] = this.defaultSize;
      for (var key in sizes) {
        this.axis.setItemSize(parseInt(key, 10), sizes[key]);
      }

      for (var i=0; i<this.count; i++) {
        this.assertEquals(sizes[i] || this.defaultSize, this.axis.getItemSize(i));
      }

      this.axis.setDefaultItemSize(this.defaultSize * 2);
      for (var i=0; i<this.count; i++) {
        this.assertEquals(sizes[i] || (this.defaultSize*2), this.axis.getItemSize(i));
      }
    },


    testItemAtPosition : function()
    {
      this.axis.setItemCount(1000);
      this.axis.setDefaultItemSize(10);

      // in the middle
      this.assertItem(500, 5, this.axis.getItemAtPosition(10*500+5));

      // position at the edge
      this.assertItem(0, 0, this.axis.getItemAtPosition(0));
      this.assertItem(999, 9, this.axis.getItemAtPosition(10*1000-1));

      // position outside of the range
      this.assertNull(this.axis.getItemAtPosition(-10));
      this.assertNull(this.axis.getItemAtPosition(10 * 1000));
      this.assertNull(this.axis.getItemAtPosition(10 * 1000 + 100));

      // special case: no items in the axis
      this.axis.setItemCount(0);
      this.assertNull(this.axis.getItemAtPosition(0));
    },


    testEmptyAxis : function()
    {
      this.axis.setItemSize(1, 10);
      this.axis.setItemCount(0);
      this.assertEquals(0, this.axis.getTotalSize());
    },


    testGetItemAtPositionCustomSizes : function()
    {
      var d = this.defaultSize;
      var sizes = {};
      sizes[100] = d-8;
      sizes[200] = d+20;
      sizes[600] = d;
      for (var key in sizes) {
        this.axis.setItemSize(parseInt(key, 10), sizes[key]);
      }

      // exact start position
      this.assertItem(0, 0, this.axis.getItemAtPosition(0*d));
      this.assertItem(10, 0, this.axis.getItemAtPosition(10*d));
      this.assertItem(101, 0, this.axis.getItemAtPosition(101*d-8));
      this.assertItem(201, 0, this.axis.getItemAtPosition(201*d-8+20));
      this.assertItem(601, 0, this.axis.getItemAtPosition(601*d-8+20));

      // in the middle
      this.assertItem(0, 4, this.axis.getItemAtPosition(0*d + 4));
      this.assertItem(10, 4, this.axis.getItemAtPosition(10*d + 4));
      this.assertItem(101, 4, this.axis.getItemAtPosition(101*d-8 + 4));
      this.assertItem(201, 4, this.axis.getItemAtPosition(201*d-8+20 + 4));
      this.assertItem(601, 4, this.axis.getItemAtPosition(601*d-8+20 + 4));

      //before end
      this.assertItem(0, d-1, this.axis.getItemAtPosition(0*d + d-1));
      this.assertItem(10, d-1, this.axis.getItemAtPosition(10*d + d-1));
      this.assertItem(101, d-1, this.axis.getItemAtPosition(101*d-8 + d-1));
      this.assertItem(201, d-1, this.axis.getItemAtPosition(201*d-8+20 + d-1));
      this.assertItem(601, d-1, this.axis.getItemAtPosition(601*d-8+20 + d-1));
    },


    ITEM_POS_ITER : 5,
    ITEM_POS_COUNT : 10000,

    testGetItemAtPositionStress : function()
    {
      for (var j=0; j<this.ITEM_POS_ITER; j++)
      {
        var total = 0;
        this.axis.setItemCount(this.ITEM_POS_COUNT);

        for (var i=0; i<this.ITEM_POS_COUNT; i++)
        {
          if (i==this.ITEM_POS_COUNT-10) {
            var pos = total + 20;
          }

          var itemSize = 50 + Math.round(Math.random() * 80);
          total += itemSize;
          this.axis.setItemSize(i, itemSize);
        }

        this.assertItem(this.ITEM_POS_COUNT-10, 20, this.axis.getItemAtPosition(pos));
      }
    },


    testGetTotalSize : function()
    {
      var d = this.defaultSize;
      var count = this.count;

      this.assertEquals(d*count, this.axis.getTotalSize());

      var correction = 0;
      for (var i=1; i<=10; i++) {
        this.axis.setItemSize(i*10, d + i*2);
        correction += i*2;
      }

      this.assertEquals(d*count + correction, this.axis.getTotalSize());
    },


    TOTAL_SIZE_ITER : 5, // was 50
    TOTAL_SIZE_ITEMS : 100, // was 1000

    testGetTotalSizeStress : function()
    {
      for (var j=0; j<this.TOTAL_SIZE_ITER; j++)
      {
        var total = 0;
        this.axis.setItemCount(this.TOTAL_SIZE_ITEMS);

        for (var i=0; i<this.TOTAL_SIZE_ITEMS; i++)
        {
          var itemSize = 50 + Math.round(Math.random() * 80);
          total += itemSize;
          this.axis.setItemSize(i, itemSize);
        }

        this.assertEquals(total, this.axis.getTotalSize());
      }
    },


    testGetItemSizes : function()
    {
      this.axis.setDefaultItemSize(10);

      this.assertArrayEquals(
        [10, 10, 10, 10],
        this.axis.getItemSizes(0, 40)
      );

      this.assertArrayEquals(
          [10, 10, 10, 10],
          this.axis.getItemSizes(20, 40)
        );

      this.assertArrayEquals(
        [10, 10, 10, 10],
        this.axis.getItemSizes(0, 31)
      );

      this.axis.setItemSize(1, 5);
      this.axis.setItemSize(3, 25);

      this.assertArrayEquals(
        [10, 5, 10, 25],
        this.axis.getItemSizes(0, 50)
      );

      this.assertArrayEquals(
        [10, 5, 10, 25],
        this.axis.getItemSizes(0, 26)
      );

      this.assertArrayEquals(
        [5, 10, 25, 10],
        this.axis.getItemSizes(1, 41)
      );

      // test at the end of the scale
      this.axis.setDefaultItemSize(10);
      this.axis.setItemCount(10);
      this.assertArrayEquals(
        [10, 10],
        this.axis.getItemSizes(8, 25)
      );

      this.assertArrayEquals(
        [10],
        this.axis.getItemSizes(9, 30)
      );
    },


    testGetItemPosition : function()
    {
      var d = this.defaultSize;

      // item in the middle
      this.assertEquals(d*20, this.axis.getItemPosition(20));

      // item at the edges
      this.assertEquals(0, this.axis.getItemPosition(0));
      this.assertEquals(d*(this.count-1), this.axis.getItemPosition(this.count-1));

      // item outside the range
      this.assertEquals(null, this.axis.getItemPosition(-1));
      this.assertEquals(null, this.axis.getItemPosition(this.count));
      this.assertEquals(null, this.axis.getItemPosition(this.count + 100));
    },


    testGetItemPositionCustomSizes : function()
    {
      var d = this.defaultSize;
      var sizes = {};
      sizes[100] = d-8;
      sizes[200] = d+20;
      sizes[600] = d;
      for (var key in sizes) {
        this.axis.setItemSize(parseInt(key, 10), sizes[key]);
      }

      this.assertEquals(0*d, this.axis.getItemPosition(0));
      this.assertEquals(10*d, this.axis.getItemPosition(10));
      this.assertEquals(101*d-8, this.axis.getItemPosition(101));
      this.assertEquals(201*d-8+20, this.axis.getItemPosition(201));
      this.assertEquals(601*d-8+20, this.axis.getItemPosition(601));
    },


    testChangeEvents : function()
    {
      var self = this;
      var listener = function() {};

      this.assertEventFired(this.axis, "change", function() {
        self.axis.setDefaultItemSize(23);
      }, listener);

      this.assertEventNotFired(this.axis, "change", function() {
        self.axis.setDefaultItemSize(23);
      }, listener);


      this.assertEventFired(this.axis, "change", function() {
        self.axis.setItemCount(123);
      }, listener);

      this.assertEventNotFired(this.axis, "change", function() {
        self.axis.setItemCount(123);
      }, listener);


      this.assertEventFired(this.axis, "change", function() {
        self.axis.setItemSize(10, 66);
      }, listener);

      this.assertEventNotFired(this.axis, "change", function() {
        self.axis.setItemSize(10, 66);
      }, listener);

      this.assertEventFired(this.axis, "change", function() {
        self.axis.setItemSize(10, null);
      }, listener);

      this.assertEventNotFired(this.axis, "change", function() {
        self.axis.setItemSize(11, null);
      }, listener);


      this.assertEventFired(this.axis, "change", function() {
        self.axis.resetItemSizes();
      }, listener);
    },


    SETUP_ITER : 10, // was 100

    testPerformanceSetupBestCase : function()
    {
      //window.top.console.profile("setup (best case)");
      var start = new Date();
      for (var i=0; i<this.SETUP_ITER; i++)
      {
        this.axis.__ranges = null;
        this.axis.getItemAtPosition(0);
      }
      var end = new Date();
      //window.top.console.profileEnd();

      // this.warn("setup time (best case): " + ((end - start) / this.SETUP_ITER) + "ms");
    },

    testPerformanceSetupWorstCase : function()
    {
      // each cell has a custom size
      for (var i=0; i<this.count; i++) {
        this.axis.setItemSize(i, this.defaultSize + (i % 20) + 1);
      }

      //window.top.console.profile("setup (worst case)");
      var start = new Date();
      for (var i=0; i<this.SETUP_ITER; i++)
      {
        this.axis.__ranges = null;
        this.axis.getItemAtPosition(0);
      }
      var end = new Date();
      //window.top.console.profileEnd();

      // this.warn("setup time (worst case): " + ((end - start) / this.SETUP_ITER) + "ms");
    },


    FIND_ITER : 100, // was 10000

    testPerformanceFindBestCase : function()
    {
      var max = this.axis.getTotalSize();

      //window.top.console.profile("find (best case)");
      var start = new Date();
      for (var i=0; i<this.FIND_ITER; i++) {
        this.axis.getItemAtPosition((i*17) % max);
      }
      var end = new Date();
      //window.top.console.profileEnd();

      // this.warn("find time (best case): " + ((end - start) / this.FIND_ITER) + "ms");
    },


    testPerformanceFindWorstCase : function()
    {
      // each cell has a custom size
      for (var i=0; i<this.count; i++) {
        this.axis.setItemSize(i, this.defaultSize + (i % 20) + 1);
      }

      var max = this.axis.getTotalSize();

      //window.top.console.profile("find (worst case)");
      var start = new Date();
      for (var i=0; i<this.FIND_ITER; i++) {
        this.axis.getItemAtPosition((i*17) % max);
      }
      var end = new Date();
      //window.top.console.profileEnd();

      // this.warn("find time (worst case): " + ((end - start) / this.FIND_ITER) + "ms");
    }

  },

  destruct : function() {
    this.axis = null;
  }
});
