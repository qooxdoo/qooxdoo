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
      this.pane.setScrollY(30);
      this.assertEquals(30, this.pane.getScrollY());
      
      this.pane.setScrollX(40);
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
      var layer = new qx.test.ui.virtual.layer.LayerMock();
      this.pane.addLayer(layer);
      this.assertEquals(layer, this.pane.getLayers()[0]);
    },
    
    testUpdateOnResize : function()
    {
      var layer = new qx.test.ui.virtual.layer.LayerMock();
      this.pane.addLayer(layer);

      this.assertEquals(0, layer.calls.length);
      qx.ui.core.queue.Manager.flush();
      this.assertEquals(1, layer.calls.length);
      this.assertEquals("fullUpdate", layer.calls[0][0]);
    },
    
    testUpdateEvent : function()
    {
      var called = 0;
      
      var pane = new qx.ui.virtual.core.Pane(100, 20, 10, 50);
      pane.addListener("update", function() { called ++}, this);
      pane.set({
        width: 300,
        height: 200
      });
            
      // no update after creation
      this.getRoot().add(pane);
      this.assertEquals(0, called, "Expect no update after creation");
      
      // one update after appear
      qx.ui.core.queue.Manager.flush();
      this.assertEquals(1, called, "Expect one update after appear");      
      
      // one update after pane resize
      called = 0;
      pane.setWidth(400);
      qx.ui.core.queue.Manager.flush();
      this.assertEquals(1, called, "Expect one update after pane resize");
      
      // one update after data resize
      called = 0;
      pane.rowConfig.setItemCount(200);
      this.assertEquals(0, called, "Expect no update");
      pane.fullUpdate();
      this.assertEquals(1, called, "Expect one update after data resize");
      
      // one update after data and pane resize
      called = 0;
      pane.rowConfig.setItemCount(300);
      pane.setWidth(500);
      qx.ui.core.queue.Manager.flush();
      this.assertEquals(1, called, "Expect one update after data and pane resize");
      
      pane.destroy();
    },
        
    assertUpdateArgs : function(rowIndex, colIndex, rowSizes, colSizes, args, msg)
    {
      this.assertEquals(rowIndex, args[0], msg);
      this.assertEquals(colIndex, args[2], msg);
      this.assertArrayEquals(rowSizes, args[4], msg);
      this.assertArrayEquals(colSizes, args[5], msg);      
    },

    assertScrollArgs : function(rowIndex, colIndex, rowSizes, colSizes, args, msg)
    {
      this.assertEquals(rowIndex, args[0], msg);
      this.assertEquals(colIndex, args[2], msg);
      this.assertArrayEquals(rowSizes, args[4], msg);
      this.assertArrayEquals(colSizes, args[5], msg);      
    },    
    
    assertScroll : function(scrollTop, scrollLeft, pane, msg)
    {
      var layerContainer = this.pane._getChildren()[0];
      this.assertEquals(-scrollTop, layerContainer.getBounds().top, msg);
      this.assertEquals(-scrollLeft, layerContainer.getBounds().left, msg);
    },
    
    testFullUpdate : function()
    {
      var layer = new qx.test.ui.virtual.layer.LayerMock();
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
      
      this.pane.setScrollY(4);                       
      layer.calls = [];
      this.pane.fullUpdate();
      qx.ui.core.queue.Manager.flush();
      var args = layer.calls[0][1];
      this.assertUpdateArgs(0, 0, [10, 10, 10, 10, 10, 10], [30, 30, 30, 30], args);
      this.assertScroll(4, 0, this.pane);
      
      this.pane.setScrollY(10);                       
      layer.calls = [];
      this.pane.fullUpdate();
      qx.ui.core.queue.Manager.flush();
      var args = layer.calls[0][1];
      this.assertUpdateArgs(1, 0, [10, 10, 10, 10, 10], [30, 30, 30, 30], args);
      this.assertScroll(0, 0, this.pane);

      this.pane.setScrollY(16);                       
      layer.calls = [];
      this.pane.fullUpdate();
      qx.ui.core.queue.Manager.flush();
      var args = layer.calls[0][1];
      this.assertUpdateArgs(1, 0, [10, 10, 10, 10, 10, 10], [30, 30, 30, 30], args);
      this.assertScroll(6, 0, this.pane);
      
      
      this.pane.setScrollY(0);
      qx.ui.core.queue.Manager.flush();
      
      this.pane.setScrollX(4);                       
      layer.calls = [];
      this.pane.fullUpdate();
      qx.ui.core.queue.Manager.flush();
      var args = layer.calls[0][1];
      this.assertUpdateArgs(0, 0, [10, 10, 10, 10, 10], [30, 30, 30, 30], args);
      this.assertScroll(0, 4, this.pane);
      
      this.pane.setScrollX(30);                       
      layer.calls = [];
      this.pane.fullUpdate();
      qx.ui.core.queue.Manager.flush();
      var args = layer.calls[0][1];
      this.assertUpdateArgs(0, 1, [10, 10, 10, 10, 10], [30, 30, 30, 30], args);
      this.assertScroll(0, 0, this.pane);

      this.pane.setScrollX(36);                       
      layer.calls = [];
      this.pane.fullUpdate();
      qx.ui.core.queue.Manager.flush();
      var args = layer.calls[0][1];
      this.assertUpdateArgs(0, 1, [10, 10, 10, 10, 10], [30, 30, 30, 30], args);
      this.assertScroll(0, 6, this.pane);            
    },
    
    
    testPrefetchY : function()
    {
    
    },
    
    
    testUpdateLayerWindow : function()
    {
      var layer = new qx.test.ui.virtual.layer.LayerMock();
      this.pane.addLayer(layer);
      this.pane.set({
        width: 100,
        height: 50
      });                
      this.pane.updateScrollPosition();
      qx.ui.core.queue.Manager.flush();
      
      layer.calls = [];      
      this.pane.setScrollY(4);  
      qx.ui.core.queue.Manager.flush();
      this.assertEquals("updateLayerWindow", layer.calls[0][0]);
      var args = layer.calls[0][1];      
      this.assertScrollArgs(0, 0, [10, 10, 10, 10, 10, 10], [30, 30, 30, 30], args);
      this.assertScroll(4, 0, this.pane);
      
      layer.calls = [];    
      this.pane.setScrollY(5);  
      qx.ui.core.queue.Manager.flush();
      this.assertEquals(0, layer.calls.length);
      this.assertScroll(5, 0, this.pane);
      
      layer.calls = [];
      this.pane.setScrollY(10);                       
      qx.ui.core.queue.Manager.flush();
      this.assertEquals(0, layer.calls.length);
      this.assertScroll(10, 0, this.pane);

      layer.calls = [];
      this.pane.setScrollY(16);                       
      qx.ui.core.queue.Manager.flush();
      this.assertEquals("updateLayerWindow", layer.calls[0][0]);
      var args = layer.calls[0][1];      
      this.assertScrollArgs(1, 0, [10, 10, 10, 10, 10, 10], [30, 30, 30, 30], args);
      this.assertScroll(6, 0, this.pane);
      
      
      this.pane.setScrollY(0);
      qx.ui.core.queue.Manager.flush();
      
      layer.calls = [];
      this.pane.setScrollX(4);                       
      qx.ui.core.queue.Manager.flush();
      this.assertEquals(0, layer.calls.length);
      this.assertScroll(0, 4, this.pane);
      
      layer.calls = [];
      this.pane.setScrollX(30);                       
      qx.ui.core.queue.Manager.flush();
      this.assertEquals("updateLayerWindow", layer.calls[0][0]);
      var args = layer.calls[0][1];
      this.assertScrollArgs(0, 1, [10, 10, 10, 10, 10], [30, 30, 30, 30], args);
      this.assertScroll(0, 0, this.pane);

      layer.calls = [];
      this.pane.setScrollX(36);                       
      qx.ui.core.queue.Manager.flush();
      this.assertEquals(0, layer.calls.length);
      this.assertScroll(0, 6, this.pane);           
    },

    testSrollRowIntoView : function()
    {
      this.pane.set({
        width : 400,
        height : 305
      });
      this.pane.columnConfig.setItemCount(1);

      var layer = new qx.test.ui.virtual.layer.LayerSimple();
      this.pane.addLayer(layer);
      qx.ui.core.queue.Manager.flush();

      this.pane.scrollRowIntoView(100)
      qx.ui.core.queue.Manager.flush();

      var children = layer.getContentElement().getDomElement().childNodes;

      this.assertScroll(5, 0, this.pane);
      this.assertEquals("0 / 70", children[0].innerHTML)
      this.assertEquals("0 / 100", children[children.length-1].innerHTML)

    },


    testSrollColumnIntoView : function()
    {
      this.pane.set({
        width : 405,
        height : 305
      });
      this.pane.rowConfig.setItemCount(1);

      var layer = new qx.test.ui.virtual.layer.LayerSimple();
      this.pane.addLayer(layer);
      qx.ui.core.queue.Manager.flush();

      this.pane.scrollColumnIntoView(100)
      qx.ui.core.queue.Manager.flush();

      var children = layer.getContentElement().getDomElement().childNodes;

      this.assertScroll(0, 15, this.pane);
      this.assertEquals("87 / 0", children[0].innerHTML)
      this.assertEquals("100 / 0", children[children.length-1].innerHTML)
    },

    testSrollRowIntoViewEdgeCase : function()
    {
      this.pane.set({
        width : 400,
        height : 305
      });
      this.pane.columnConfig.setItemCount(1);

      var layer = new qx.test.ui.virtual.layer.LayerSimple();
      this.pane.addLayer(layer);
      qx.ui.core.queue.Manager.flush();

      this.pane.scrollRowIntoView(2000)
      qx.ui.core.queue.Manager.flush();

      var children = layer.getContentElement().getDomElement().childNodes;

      // TODO fjakobs
      // this.assertScroll(5, 0, this.pane);
      // this.assertEquals("0 / 70", children[0].innerHTML)
      // this.assertEquals("0 / 100", children[children.length-1].innerHTML)

    },


    testSrollColumnIntoViewEdgeCase : function()
    {
      this.pane.set({
        width : 405,
        height : 305
      });
      this.pane.rowConfig.setItemCount(1);

      var layer = new qx.test.ui.virtual.layer.LayerSimple();
      this.pane.addLayer(layer);
      qx.ui.core.queue.Manager.flush();

      this.pane.scrollColumnIntoView(400)
      qx.ui.core.queue.Manager.flush();

      var children = layer.getContentElement().getDomElement().childNodes;

      // TODO fjakobs
      // this.assertScroll(0, 5, this.pane);
      // this.assertEquals("70 / 0", children[0].innerHTML)
      // this.assertEquals("100 / 0", children[children.length-1].innerHTML)
    }

  }
});
