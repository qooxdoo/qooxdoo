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
      this.flush();
    },


    assertUpdateArgs : function(rowIndex, colIndex, rowSizes, colSizes, args, msg)
    {
      this.assertEquals(rowIndex, args[0], msg);
      this.assertEquals(colIndex, args[1], msg);
      this.assertArrayEquals(rowSizes, args[2], msg);
      this.assertArrayEquals(colSizes, args[3], msg);
    },


    assertScrollArgs : function(rowIndex, colIndex, rowSizes, colSizes, args, msg)
    {
      this.assertEquals(rowIndex, args[0], msg);
      this.assertEquals(colIndex, args[1], msg);
      this.assertArrayEquals(rowSizes, args[2], msg);
      this.assertArrayEquals(colSizes, args[3], msg);
    },


    assertScroll : function(scrollTop, scrollLeft, pane, msg)
    {
      var layerContainer = this.pane._getChildren()[0];
      this.assertEquals(-scrollTop, layerContainer.getBounds().top, msg);
      this.assertEquals(-scrollLeft, layerContainer.getBounds().left, msg);
    },


    testConstructor : function() {
      this.assertNotUndefined(this.pane);
    },


    testScrollProperties : function()
    {
      this.flush();
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

      var rowConfig = this.pane.getRowConfig();
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
      this.flush();
      this.assertEquals(1, called, "Expect one update after appear");

      // one update after pane resize
      called = 0;
      pane.setWidth(400);
      this.flush();
      this.assertEquals(1, called, "Expect one update after pane resize");

      // one update after data resize
      called = 0;
      pane.getRowConfig().setItemCount(200);
      this.flush();
      this.assertEquals(1, called, "Expect one update after data resize");

      // one update after data and pane resize
      called = 0;
      pane.getRowConfig().setItemCount(300);
      pane.setWidth(500);
      this.flush();
      this.assertEquals(2, called, "Expect two updates after data and pane resize");

      pane.destroy();
    },


    testFullUpdate : function()
    {
      var layer = new qx.test.ui.virtual.layer.LayerMock();
      this.pane.addLayer(layer);
      this.pane.set({
        width: 100,
        height: 50
      });
      this.flush();

      layer.calls = [];
      this.pane.fullUpdate();
      this.flush();

      this.assertEquals(2, layer.calls.length);
      this.assertEquals("fullUpdate", layer.calls[0][0]);
      var args = layer.calls[0][1];
      this.assertUpdateArgs(0, 0, [10, 10, 10, 10, 10], [30, 30, 30, 30], args);
      this.assertScroll(0, 0, this.pane);

      this.pane.setScrollY(4);
      layer.calls = [];
      this.pane.fullUpdate();
      this.flush();
      var args = layer.calls[0][1];
      this.assertUpdateArgs(0, 0, [10, 10, 10, 10, 10, 10], [30, 30, 30, 30], args);
      this.assertScroll(4, 0, this.pane);

      this.pane.setScrollY(10);
      layer.calls = [];
      this.pane.fullUpdate();
      this.flush();
      var args = layer.calls[0][1];
      this.assertUpdateArgs(1, 0, [10, 10, 10, 10, 10], [30, 30, 30, 30], args);
      this.assertScroll(0, 0, this.pane);

      this.pane.setScrollY(16);
      layer.calls = [];
      this.pane.fullUpdate();
      this.flush();
      var args = layer.calls[0][1];
      this.assertUpdateArgs(1, 0, [10, 10, 10, 10, 10, 10], [30, 30, 30, 30], args);
      this.assertScroll(6, 0, this.pane);


      this.pane.setScrollY(0);
      this.flush();

      this.pane.setScrollX(4);
      layer.calls = [];
      this.pane.fullUpdate();
      this.flush();
      var args = layer.calls[0][1];
      this.assertUpdateArgs(0, 0, [10, 10, 10, 10, 10], [30, 30, 30, 30], args);
      this.assertScroll(0, 4, this.pane);

      this.pane.setScrollX(30);
      layer.calls = [];
      this.pane.fullUpdate();
      this.flush();
      var args = layer.calls[0][1];
      this.assertUpdateArgs(0, 1, [10, 10, 10, 10, 10], [30, 30, 30, 30], args);
      this.assertScroll(0, 0, this.pane);

      this.pane.setScrollX(36);
      layer.calls = [];
      this.pane.fullUpdate();
      this.flush();
      var args = layer.calls[0][1];
      this.assertUpdateArgs(0, 1, [10, 10, 10, 10, 10], [30, 30, 30, 30], args);
      this.assertScroll(0, 6, this.pane);
    },


    testNoRows : function()
    {
      var layer = new qx.test.ui.virtual.layer.LayerMock();
      this.pane.addLayer(layer);

      layer.calls = [];
      this.pane.setWidth(100);
      this.pane.getColumnConfig().setDefaultItemSize(100);
      this.pane.getColumnConfig().setItemCount(1);
      this.pane.getRowConfig().setItemCount(0);
      this.flush();

      var args = layer.calls[0][1];
      this.assertUpdateArgs(0, 0, [], [100], args);
      this.assertScroll(0, 0, this.pane);

      // resize
      layer.calls = [];
      this.pane.setWidth(30);
      this.pane.getColumnConfig().setDefaultItemSize(30);
      this.flush();

      var args = layer.calls[0][1];
      this.assertUpdateArgs(0, 0, [], [30], args);
      this.assertScroll(0, 0, this.pane);
    },


    testNoColumns : function()
    {
      var layer = new qx.test.ui.virtual.layer.LayerMock();
      this.pane.addLayer(layer);

      layer.calls = [];
      this.pane.setHeight(100);
      this.pane.getRowConfig().setDefaultItemSize(100);
      this.pane.getRowConfig().setItemCount(1);
      this.pane.getColumnConfig().setItemCount(0);
      this.flush();

      var args = layer.calls[0][1];
      this.assertUpdateArgs(0, 0, [100], [], args);
      this.assertScroll(0, 0, this.pane);

      // resize
      layer.calls = [];
      this.pane.setHeight(30);
      this.pane.getRowConfig().setDefaultItemSize(30);
      this.flush();

      var args = layer.calls[0][1];
      this.assertUpdateArgs(0, 0, [30], [], args);
      this.assertScroll(0, 0, this.pane);
    },


    testPrefetchYAtTop : function()
    {
      var layerHeight = 400;
      var layer = new qx.test.ui.virtual.layer.LayerMock();
      this.pane.addLayer(layer);
      this.pane.set({width: 300, height: layerHeight});
      this.flush();

      // scroll top is 0 and prefetch above
      this.pane.prefetchY(100, 200, 0, 0);
      this.flush();
      this.assertEquals(layerHeight, layer.getBounds().height);
      this.assertScroll(0, 0, this.pane);
    },


    testPrefetchYLimitedAtTop : function()
    {
      var layerHeight = 400;
      var layer = new qx.test.ui.virtual.layer.LayerMock();
      this.pane.addLayer(layer);
      this.pane.set({width: 300, height: layerHeight});
      this.flush();

      // scroll top is 100 and prefetch above 200
      this.pane.setScrollY(100);
      this.pane.prefetchY(100, 200, 0, 0);
      this.flush();
      this.assertEquals(layerHeight+100, layer.getBounds().height);
      this.assertScroll(100, 0, this.pane);
    },


    testPrefetchYAtBottom : function()
    {
      var layerHeight = 400;
      var layer = new qx.test.ui.virtual.layer.LayerMock();
      this.pane.addLayer(layer);
      this.pane.set({width: 300, height: layerHeight});
      this.flush();

      // scroll top to bottom and prefetch below 200
      this.pane.setScrollY(this.pane.getScrollMaxY());
      this.pane.prefetchY(0, 0, 100, 200);
      this.flush();
      this.assertEquals(layerHeight, layer.getBounds().height);
      this.assertScroll(0, 0, this.pane);
    },


    testPrefetchYLimitedAtBottom : function()
    {
      var layerHeight = 400;
      var layer = new qx.test.ui.virtual.layer.LayerMock();
      this.pane.addLayer(layer);
      this.pane.set({width: 300, height: layerHeight});
      this.flush();

      // scroll top to bottom and prefetch below 200
      this.pane.setScrollY(this.pane.getScrollMaxY()-100);
      this.pane.prefetchY(0, 0, 100, 200);
      this.flush();
      this.assertEquals(layerHeight+100, layer.getBounds().height);
      this.assertScroll(0, 0, this.pane);
    },


    testPrefetchYInMiddle : function()
    {
      var layerHeight = 400;
      var layer = new qx.test.ui.virtual.layer.LayerMock();
      this.pane.addLayer(layer);
      this.pane.set({width: 300, height: layerHeight});
      this.flush();

      // scroll top is 500 and prefetch above 200
      this.pane.setScrollY(500);
      this.pane.prefetchY(100, 200, 100, 200);
      this.flush();
      this.assertEquals(layerHeight+400, layer.getBounds().height);
      this.assertScroll(200, 0, this.pane);

      // already prefetched 200 pixel above. Scrolling up 20px and prefetching
      // again should not change the layers
      this.pane.setScrollY(480);
      this.pane.prefetchY(100, 200, 100, 200);
      this.flush();
      this.assertEquals(layerHeight+400, layer.getBounds().height);
      this.assertScroll(180, 0, this.pane);

      // scroll more than minAbove up. Prefetching should update the layers
      this.pane.setScrollY(390);
      this.pane.prefetchY(100, 200, 100, 200);
      this.flush();
      this.assertEquals(layerHeight+400, layer.getBounds().height);
      this.assertScroll(200, 0, this.pane);

      // already prefetched 200 pixel below. Scrolling down 20px and prefetching
      // again should not change the layers
      this.pane.setScrollY(410);
      this.pane.prefetchY(100, 200, 100, 200);
      this.flush();
      this.assertEquals(layerHeight+400, layer.getBounds().height);
      this.assertScroll(220, 0, this.pane);

      // scroll more than minBelow down. Prefetching should update the layers
      this.pane.setScrollY(520);
      this.pane.prefetchY(100, 200, 100, 200);
      this.flush();
      this.assertEquals(layerHeight+400, layer.getBounds().height);
      this.assertScroll(200, 0, this.pane);
    },


    testPrefetchXAtLeft : function()
    {
      var layerWidth = 300;
      var layer = new qx.test.ui.virtual.layer.LayerMock();
      this.pane.addLayer(layer);
      this.pane.set({width: layerWidth, height: 400});
      this.flush();

      // scroll left is 0 and prefetch left
      this.pane.prefetchX(100, 200, 0, 0);
      this.flush();
      this.assertEquals(layerWidth, layer.getBounds().width);
      this.assertScroll(0, 0, this.pane);
    },


    testPrefetchXLimitedAtLeft : function()
    {
      var layerWidth = 300;
      var layer = new qx.test.ui.virtual.layer.LayerMock();
      this.pane.addLayer(layer);
      this.pane.getColumnConfig().setDefaultItemSize(10);
      this.pane.set({width: layerWidth, height: 400});
      this.flush();

      // scroll top is 100 and prefetch above 200
      this.pane.setScrollX(100);
      this.pane.prefetchX(100, 200, 0, 0);
      this.flush();
      this.assertEquals(layerWidth+100, layer.getBounds().width);
      this.assertScroll(0, 100, this.pane);
    },


    testPrefetchXAtBottom : function()
    {
      var layerWidth = 300;
      var layer = new qx.test.ui.virtual.layer.LayerMock();
      this.pane.addLayer(layer);
      this.pane.getColumnConfig().setDefaultItemSize(10);
      this.pane.set({width: layerWidth, height: 400});
      this.flush();

      // scroll left to right and prefetch right 200
      this.pane.setScrollX(this.pane.getScrollMaxX());
      this.pane.prefetchX(0, 0, 100, 200);
      this.flush();
      this.assertEquals(layerWidth, layer.getBounds().width);
      this.assertScroll(0, 0, this.pane);
    },


    testPrefetchXLimitedAtBottom : function()
    {
      var layerWidth = 300;
      var layer = new qx.test.ui.virtual.layer.LayerMock();
      this.pane.addLayer(layer);
      this.pane.getColumnConfig().setDefaultItemSize(10);
      this.pane.set({width: layerWidth, height: 400});
      this.flush();

      // scroll left to right-100 and prefetch right 200
      this.pane.setScrollX(this.pane.getScrollMaxX()-100);
      this.pane.prefetchX(0, 0, 100, 200);
      this.flush();
      this.assertEquals(layerWidth+100, layer.getBounds().width);
      this.assertScroll(0, 0, this.pane);
    },


    testPrefetchXInMiddle : function()
    {
      var layerWidth = 300;
      var layer = new qx.test.ui.virtual.layer.LayerMock();
      this.pane.addLayer(layer);
      this.pane.set({width: layerWidth, height: 400});
      this.pane.getColumnConfig().setDefaultItemSize(10);
      this.flush();

      // scroll left is 500 and prefetch left 200
      this.pane.setScrollX(500);
      this.pane.prefetchX(100, 200, 100, 200);
      this.flush();
      this.assertEquals(layerWidth+400, layer.getBounds().width);
      this.assertScroll(0, 200, this.pane);

      // already prefetched 200 pixel at the left. Scrolling left 20px and prefetching
      // again should not change the layers
      this.pane.setScrollX(480);
      this.pane.prefetchX(100, 200, 100, 200);
      this.flush();
      this.assertEquals(layerWidth+400, layer.getBounds().width);
      this.assertScroll(0, 180, this.pane);

      // scroll more than minLeft left. Prefetching should update the layers
      this.pane.setScrollX(390);
      this.pane.prefetchX(100, 200, 100, 200);
      this.flush();
      this.assertEquals(layerWidth+400, layer.getBounds().width);
      this.assertScroll(0, 200, this.pane);

      // already prefetched 200 pixel right. Scrolling right 20px and prefetching
      // again should not change the layers
      this.pane.setScrollX(410);
      this.pane.prefetchX(100, 200, 100, 200);
      this.flush();
      this.assertEquals(layerWidth+400, layer.getBounds().width);
      this.assertScroll(0, 220, this.pane);

      // scroll more than minRight right. Prefetching should update the layers
      this.pane.setScrollX(520);
      this.pane.prefetchX(100, 200, 100, 200);
      this.flush();
      this.assertEquals(layerWidth+400, layer.getBounds().width);
      this.assertScroll(0, 200, this.pane);
    },


    testUpdateLayerWindow : function()
    {
      var layer = new qx.test.ui.virtual.layer.LayerMock();
      this.pane.addLayer(layer);
      this.pane.set({
        width: 100,
        height: 50
      });
      this.flush();

      layer.calls = [];
      this.pane.setScrollY(4);
      this.flush();
      this.assertEquals("updateLayerWindow", layer.calls[0][0]);
      var args = layer.calls[0][1];
      this.assertScrollArgs(0, 0, [10, 10, 10, 10, 10, 10], [30, 30, 30, 30], args);
      this.assertScroll(4, 0, this.pane);

      layer.calls = [];
      this.pane.setScrollY(5);
      this.flush();
      this.assertEquals(0, layer.calls.length);
      this.assertScroll(5, 0, this.pane);

      layer.calls = [];
      this.pane.setScrollY(10);
      this.flush();
      this.assertEquals(0, layer.calls.length);
      this.assertScroll(10, 0, this.pane);

      layer.calls = [];
      this.pane.setScrollY(16);
      this.flush();
      this.assertEquals("updateLayerWindow", layer.calls[0][0]);
      var args = layer.calls[0][1];
      this.assertScrollArgs(1, 0, [10, 10, 10, 10, 10, 10], [30, 30, 30, 30], args);
      this.assertScroll(6, 0, this.pane);


      this.pane.setScrollY(0);
      this.flush();

      layer.calls = [];
      this.pane.setScrollX(4);
      this.flush();
      this.assertEquals(0, layer.calls.length);
      this.assertScroll(0, 4, this.pane);

      layer.calls = [];
      this.pane.setScrollX(30);
      this.flush();
      this.assertEquals("updateLayerWindow", layer.calls[0][0]);
      var args = layer.calls[0][1];
      this.assertScrollArgs(0, 1, [10, 10, 10, 10, 10], [30, 30, 30, 30], args);
      this.assertScroll(0, 0, this.pane);

      layer.calls = [];
      this.pane.setScrollX(36);
      this.flush();
      this.assertEquals(0, layer.calls.length);
      this.assertScroll(0, 6, this.pane);
    },


    testSrollRowIntoView : function()
    {
      this.pane.set({
        width : 400,
        height : 305
      });
      this.pane.getColumnConfig().setItemCount(1);

      var layer = new qx.test.ui.virtual.layer.LayerSimple();
      this.pane.addLayer(layer);
      this.flush();

      this.pane.scrollRowIntoView(100)
      this.flush();

      var children = layer.getContentElement().getDomElement().childNodes;

      this.assertScroll(5, 0, this.pane);
      this.assertEquals("70 / 0", children[0].innerHTML)
      this.assertEquals("100 / 0", children[children.length-1].innerHTML);
    },


    testSrollColumnIntoView : function()
    {
      this.pane.set({
        width : 405,
        height : 305
      });
      this.pane.getRowConfig().setItemCount(1);

      var layer = new qx.test.ui.virtual.layer.LayerSimple();
      this.pane.addLayer(layer);
      this.flush();

      this.pane.scrollColumnIntoView(100)
      this.flush();

      var children = layer.getContentElement().getDomElement().childNodes;

      this.assertScroll(0, 15, this.pane);
      this.assertEquals("0 / 87", children[0].innerHTML)
      this.assertEquals("0 / 100", children[children.length-1].innerHTML)
    },


    _testSrollRowIntoViewEdgeCase : function()
    {
      this.pane.set({
        width : 400,
        height : 305
      });
      this.pane.getColumnConfig().setItemCount(1);

      var layer = new qx.test.ui.virtual.layer.LayerSimple();
      this.pane.addLayer(layer);
      this.flush();

      this.pane.scrollRowIntoView(2000)
      this.flush();

      var children = layer.getContentElement().getDomElement().childNodes;

      this.assertScroll(5, 0, this.pane);
      this.assertEquals("0 / 969", children[0].innerHTML)
      this.assertEquals("0 / 999", children[children.length-1].innerHTML)
    },


    _testSrollColumnIntoViewEdgeCase : function()
    {
      this.pane.set({
        width : 405,
        height : 305
      });
      this.pane.getRowConfig().setItemCount(1);

      var layer = new qx.test.ui.virtual.layer.LayerSimple();
      this.pane.addLayer(layer);
      this.flush();

      this.pane.scrollColumnIntoView(400)
      this.flush();

      var children = layer.getContentElement().getDomElement().childNodes;

      this.assertScroll(0, 15, this.pane);
      this.assertEquals("186 / 0", children[0].innerHTML)
      this.assertEquals("199 / 0", children[children.length-1].innerHTML)
    },


    testGetCellAtPosition : function()
    {
      this.pane.getRowConfig().setItemCount(3);
      this.pane.getColumnConfig().setItemCount(3);

      var layer = new qx.test.ui.virtual.layer.LayerSimple();
      this.pane.addLayer(layer);
      this.flush();

      this.assertJsonEquals({row : 0, column : 0}, this.pane.getCellAtPosition(0, 0));
      this.assertEquals(null, this.pane.getCellAtPosition(400, 0));
      this.assertEquals(null, this.pane.getCellAtPosition(0, 300));
      this.assertEquals(null, this.pane.getCellAtPosition(400, 300));
      this.assertJsonEquals({row : 2, column : 2}, this.pane.getCellAtPosition(89, 29));
    },


    testGetItemAtPositionEmptySpace : function()
    {
      var pane = this.pane;

      pane.setHeight(100);
      pane.setWidth(50);
      this.pane.getRowConfig().setItemCount(1);
      this.pane.getRowConfig().setDefaultItemSize(50);
      this.flush();

      this.assertJsonEquals({row : 0, column : 0}, this.pane.getCellAtPosition(1, 49));
      this.assertEquals(null, this.pane.getCellAtPosition(1, 50));
      this.assertEquals(null, this.pane.getCellAtPosition(1, 70));
    },


    testMouseCellEvents : function()
    {
      var rowCount = 2;
      var colCount = 2;
      var defaultHeight = 10;
      var defaultWidth = 50;

      var pane = new qx.ui.virtual.core.Pane(
        rowCount, colCount,
        defaultHeight, defaultWidth
      ).set({
        width: 150,
        height: 30
      });

      this.getRoot().add(pane, {left: 100, top: 100});
      this.flush();

      var calls = [];
      var listener = function(e) {
        calls.push(e);
      }
      pane.addListener("cellClick", listener);
      pane.addListener("cellDblclick", listener);
      pane.addListener("cellContextmenu", listener);

      var MouseEventMock = qx.test.ui.virtual.MouseEventMock;
      var eventMouseToCellEvents = {
        "click" : "cellClick",
        "dblclick" : "cellDblclick",
        "contextmenu" : "cellContextmenu"
      };


      for (var mouseEvent in eventMouseToCellEvents)
      {
        var cellEvent = eventMouseToCellEvents[mouseEvent];

        calls = [];
        pane.dispatchEvent(new MouseEventMock(mouseEvent, {documentLeft: 99, documentTop: 99}));
        this.assertEquals(0, calls.length);

        calls = [];
        pane.dispatchEvent(new MouseEventMock(mouseEvent, {documentLeft: 100, documentTop: 100}));
        this.assertEquals(1, calls.length, cellEvent);
        this.assertEquals(0, calls[0].getRow(), cellEvent);
        this.assertEquals(0, calls[0].getColumn(), cellEvent);
        this.assertEquals(cellEvent, calls[0].getType(), cellEvent);

        calls = [];
        pane.dispatchEvent(new MouseEventMock(mouseEvent, {documentLeft: 160, documentTop: 103}));
        this.assertEquals(1, calls.length, cellEvent);
        this.assertEquals(0, calls[0].getRow(), cellEvent);
        this.assertEquals(1, calls[0].getColumn(), cellEvent);
        this.assertEquals(cellEvent, calls[0].getType(), cellEvent);

        calls = [];
        pane.dispatchEvent(new MouseEventMock(mouseEvent, {documentLeft: 105, documentTop: 110}));
        this.assertEquals(1, calls.length, cellEvent);
        this.assertEquals(1, calls[0].getRow(), cellEvent);
        this.assertEquals(0, calls[0].getColumn(), cellEvent);
        this.assertEquals(cellEvent, calls[0].getType(), cellEvent);

        calls = [];
        pane.dispatchEvent(new MouseEventMock(mouseEvent, {documentLeft: 105, documentTop: 125}));
        this.assertEquals(0, calls.length);

        calls = [];
        pane.dispatchEvent(new MouseEventMock(mouseEvent, {documentLeft: 275, documentTop: 105}));
        this.assertEquals(0, calls.length);

        calls = [];
        pane.dispatchEvent(new MouseEventMock(mouseEvent, {documentLeft: 275, documentTop: 105}));
        this.assertEquals(0, calls.length);
      }

      pane.destroy();
      this.flush();
    },


    testDestroy : function()
    {
      this.pane.destroy();
      this.flush();

      this.assertDestroy(function()
      {
        var pane = new qx.ui.virtual.core.Pane(
          this.rowCount, this.colCount,
          this.defaultHeight, this.defaultWidth
        );

        this.getRoot().add(pane);
        pane.destroy();
      }, this);
    }
  },

  destruct : function() {
    this.pane = null;
  }
});
