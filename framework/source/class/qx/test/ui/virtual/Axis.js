/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
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
      this.assertEquals(expectedItemIndex, cellData.index, msg);
      this.assertEquals(expectedOffset, cellData.offset, msg);
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
        this.axis.setItemSize(parseInt(key), sizes[key]);
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
      this.assertItem(0, 0, this.axis.getItemAtPosition(0));
    },
    
    testGetItemAtPositionCustomSizes : function()
    {
      var d = this.defaultSize;
      var sizes = {};
      sizes[100] = d-8;
      sizes[200] = d+20;      
      sizes[600] = d;
      for (var key in sizes) {
        this.axis.setItemSize(parseInt(key), sizes[key]);
      }
      
      var sum = 0;

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
    },
    

    SETUP_ITER : 100,
    
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
      
      this.warn("setup time (best case): " + ((end - start) / this.SETUP_ITER) + "ms");
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
      
      this.warn("setup time (worst case): " + ((end - start) / this.SETUP_ITER) + "ms");
    },
    
    
    FIND_ITER : 10000,
    
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
      
      this.warn("find time (best case): " + ((end - start) / this.FIND_ITER) + "ms");            
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
      
      this.warn("find time (worst case): " + ((end - start) / this.FIND_ITER) + "ms");        
    }
    
  }
});
