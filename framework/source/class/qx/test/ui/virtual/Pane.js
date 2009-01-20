/* ************************************************************************

   Copyright:

   License:

   Authors:

************************************************************************ */

qx.Class.define("qx.test.ui.virtual.Pane",
{
  extend : qx.test.ui.LayoutTestCase,

  members :
  {
    setUp : function()
    {
      this.base(arguments);
      
      this.defaultWidth = 30;
      this.defaultHeight = 10;
      this.rowCount = 1000;
      this.colCount = 200;
      
      var pane = new qx.ui.virtual.core.Pane(
        this.rowCount, this.colCount, 
        this.defaultHeight, this.defaultWidth
      );
      
      this.getRoot().add(pane);
      this.pane = pane;
    },
    
    tearDown : function()
    {
      this.pane.destroy();      
      this.base(arguments);
      qx.ui.core.queue.Manager.flush();
    },
    
    testConstructor : function() {
      this.assertNotUndefined(this.pane);
    },
    
    testScrollProperties : function()
    {
      qx.ui.core.queue.Manager.flush();
      this.pane.setScrollY(30, false);
      this.assertEquals(30, this.pane.getScrollY());
      
      this.pane.setScrollX(40, false);
      this.assertEquals(40, this.pane.getScrollX());      
    },
    
    testGetScrollSize : function()
    {
      var size = this.pane.getScrollSize();
      this.assertEquals(this.defaultWidth * this.colCount, size.width);
      this.assertEquals(this.defaultHeight * this.rowCount, size.height);
      
      var rowConfig = this.pane.rowConfig;
      rowConfig.setDefaultItemSize(50);
      rowConfig.setItemCount(123);
      rowConfig.setItemSize(10, 30);
      this.assertEquals(50 * 123 - 20, this.pane.getScrollSize().height);
    },
    
    testLayerAdd : function()
    {
      var layer = new qx.test.ui.virtual.LayerMock();
      this.pane.addLayer(layer);
      this.assertEquals(layer, this.pane.layers[0]);
    },
    
    testUpdateOnResize : function()
    {
      var layer = new qx.test.ui.virtual.LayerMock();
      this.pane.addLayer(layer);

      this.assertEquals(0, layer.calls.length);
      qx.ui.core.queue.Manager.flush();
      this.assertEquals(1, layer.calls.length);
      this.assertEquals("fullUpdate", layer.calls[0][0]);
    },
        
    assertUpdateArgs : function(rowIndex, colIndex, rowSizes, colSizes, args, msg)
    {
      this.assertEquals(rowIndex, args[0].firstRow, msg);
      this.assertEquals(colIndex, args[0].firstColumn, msg);
      this.assertArrayEquals(rowSizes, args[2], msg);
      this.assertArrayEquals(colSizes, args[3], msg);      
    },
    
    assertScroll : function(scrollTop, scrollLeft, pane, msg)
    {
      var layerContainer = this.pane._getChildren()[0];
      this.assertEquals(-scrollTop, layerContainer.getBounds().top, msg);
      this.assertEquals(-scrollLeft, layerContainer.getBounds().left, msg);
    },
    
    testFullUpdate : function()
    {
      var layer = new qx.test.ui.virtual.LayerMock();
      this.pane.addLayer(layer);
      this.pane.set({
        width: 100,
        height: 50
      });
      qx.ui.core.queue.Manager.flush();
      layer.calls = [];           
      this.pane.fullUpdate();
      
      this.assertEquals(1, layer.calls.length);
      this.assertEquals("fullUpdate", layer.calls[0][0]);
      var args = layer.calls[0][1];
      this.assertUpdateArgs(0, 0, [10, 10, 10, 10, 10], [30, 30, 30, 30], args);
      this.assertScroll(0, 0, this.pane);
      
      layer.calls = [];
      this.pane.setScrollY(4);                       
      this.pane.fullUpdate();
      qx.ui.core.queue.Manager.flush();
      var args = layer.calls[0][1];
      this.assertUpdateArgs(0, 0, [10, 10, 10, 10, 10, 10], [30, 30, 30, 30], args);
      this.assertScroll(4, 0, this.pane);
      
      layer.calls = [];
      this.pane.setScrollY(10);                       
      this.pane.fullUpdate();
      qx.ui.core.queue.Manager.flush();
      var args = layer.calls[0][1];
      this.assertUpdateArgs(1, 0, [10, 10, 10, 10, 10], [30, 30, 30, 30], args);
      this.assertScroll(0, 0, this.pane);

      layer.calls = [];
      this.pane.setScrollY(16);                       
      this.pane.fullUpdate();
      qx.ui.core.queue.Manager.flush();
      var args = layer.calls[0][1];
      this.assertUpdateArgs(1, 0, [10, 10, 10, 10, 10, 10], [30, 30, 30, 30], args);
      this.assertScroll(6, 0, this.pane);
      
      
      this.pane.setScrollY(0);
      qx.ui.core.queue.Manager.flush();
      
      layer.calls = [];
      this.pane.setScrollX(4);                       
      this.pane.fullUpdate();
      qx.ui.core.queue.Manager.flush();
      var args = layer.calls[0][1];
      this.assertUpdateArgs(0, 0, [10, 10, 10, 10, 10], [30, 30, 30, 30], args);
      this.assertScroll(0, 4, this.pane);
      
      layer.calls = [];
      this.pane.setScrollX(30);                       
      this.pane.fullUpdate();
      qx.ui.core.queue.Manager.flush();
      var args = layer.calls[0][1];
      this.assertUpdateArgs(0, 1, [10, 10, 10, 10, 10], [30, 30, 30, 30], args);
      this.assertScroll(0, 0, this.pane);

      layer.calls = [];
      this.pane.setScrollX(36);                       
      this.pane.fullUpdate();
      qx.ui.core.queue.Manager.flush();
      var args = layer.calls[0][1];
      this.assertUpdateArgs(0, 1, [10, 10, 10, 10, 10], [30, 30, 30, 30], args);
      this.assertScroll(0, 6, this.pane);            
    },
    
    testUpdateScrollPosition : function()
    {
      var layer = new qx.test.ui.virtual.LayerMock();
      this.pane.addLayer(layer);
      this.pane.set({
        width: 100,
        height: 50
      });                
      this.pane.updateScrollPosition();
      qx.ui.core.queue.Manager.flush();
      
      layer.calls = [];      
      this.pane.setScrollY(4, true);  
      qx.ui.core.queue.Manager.flush();
      this.assertEquals("updateScrollPosition", layer.calls[0][0]);
      var args = layer.calls[0][1];      
      this.assertUpdateArgs(0, 0, [10, 10, 10, 10, 10, 10], [30, 30, 30, 30], args);
      this.assertScroll(4, 0, this.pane);
      
      layer.calls = [];      
      this.pane.setScrollY(5, true);  
      qx.ui.core.queue.Manager.flush();
      this.assertEquals(0, layer.calls.length);
      this.assertScroll(5, 0, this.pane);
      
      layer.calls = [];
      this.pane.setScrollY(10, true);                       
      qx.ui.core.queue.Manager.flush();
      this.assertEquals("updateScrollPosition", layer.calls[0][0]);
      var args = layer.calls[0][1];      
      this.assertUpdateArgs(1, 0, [10, 10, 10, 10, 10], [30, 30, 30, 30], args);
      this.assertScroll(0, 0, this.pane);

      layer.calls = [];
      this.pane.setScrollY(16, true);                       
      qx.ui.core.queue.Manager.flush();
      this.assertEquals("updateScrollPosition", layer.calls[0][0]);
      var args = layer.calls[0][1];      
      this.assertUpdateArgs(1, 0, [10, 10, 10, 10, 10, 10], [30, 30, 30, 30], args);
      this.assertScroll(6, 0, this.pane);
      
      
      this.pane.setScrollY(0, true);
      qx.ui.core.queue.Manager.flush();
      
      layer.calls = [];
      this.pane.setScrollX(4, true);                       
      qx.ui.core.queue.Manager.flush();
      this.assertEquals(0, layer.calls.length);
      this.assertScroll(0, 4, this.pane);
      
      layer.calls = [];
      this.pane.setScrollX(30, true);                       
      qx.ui.core.queue.Manager.flush();
      this.assertEquals("updateScrollPosition", layer.calls[0][0]);
      var args = layer.calls[0][1];
      this.assertUpdateArgs(0, 1, [10, 10, 10, 10, 10], [30, 30, 30, 30], args);
      this.assertScroll(0, 0, this.pane);

      layer.calls = [];
      this.pane.setScrollX(36, true);                       
      qx.ui.core.queue.Manager.flush();
      this.assertEquals(0, layer.calls.length);
      this.assertScroll(0, 6, this.pane);           
    }    
  }
});
