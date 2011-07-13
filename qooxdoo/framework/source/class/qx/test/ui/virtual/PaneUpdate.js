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

/**
 * This class tests all combinations of events, which could trigger pane and
 * layer updates
 *
 * <pre>
 *   Initial   Axis    Window   Data
 * |X        |       |        |        |fullUpdate|
 * |X        |       |        |X       |fullUpdate|
 * |X        |       |X       |        |fullUpdate|
 * |X        |       |X       |X       |fullUpdate|
 * |X        |X      |        |        |fullUpdate|
 * |X        |X      |        |X       |fullUpdate|
 * |X        |X      |X       |        |fullUpdate|
 * |X        |X      |X       |X       |fullUpdate|
 * |         |X      |        |        |fullUpdate|
 * |         |X      |        |X       |fullUpdate|
 * |         |X      |X       |        |fullUpdate|
 * |         |X      |X       |X       |fullUpdate|
 * |         |       |X       |        |updateLayerWindow|
 * |         |       |X       |X       |fullUpdate|
 * |         |       |        |X       |updateData|
 * </pre>
 */
qx.Class.define("qx.test.ui.virtual.PaneUpdate",
{
  extend : qx.test.ui.LayoutTestCase,

  members :
  {
    setUp : function()
    {
      this.pane = new qx.ui.virtual.core.Pane(100, 30, 20, 60);

      this.layer1 = new qx.test.ui.virtual.layer.LayerMock();
      this.pane.addLayer(this.layer1);

      this.layer2 = new qx.test.ui.virtual.layer.LayerMock();
      this.pane.addLayer(this.layer2);

      this.getRoot().add(this.pane);
    },


    tearDown : function()
    {
      this.base(arguments);
      this.pane.destroy();
    },


    assertCalls : function(methodNames, calls, msg)
    {
      this.assertEquals(methodNames.length, calls.length);
      for (var i=0; i<methodNames.length; i++) {
        this.assertEquals(methodNames[i], calls[i][0]);
      }
    },


    resetCalls : function()
    {
      this.layer1.calls = [];
      this.layer2.calls = [];
    },


    testNoUpdateBeforeAppear : function()
    {
      this.assertCalls([], this.layer1.calls);
      this.assertCalls([], this.layer2.calls);

      // full update
      this.pane.fullUpdate();
      this.assertCalls([], this.layer1.calls);
      this.assertCalls([], this.layer2.calls);

      // be nasty and only flush the widget queue
      this.resetCalls();
      qx.ui.core.queue.Widget.flush();
      this.assertCalls([], this.layer1.calls);
      this.assertCalls([], this.layer2.calls);

      // scroll
      this.pane.setScrollX(20);
      this.pane.setScrollY(100);
      this.assertCalls([], this.layer1.calls);
      this.assertCalls([], this.layer2.calls);

      // be nasty and only flush the widget queue
      this.resetCalls();
      qx.ui.core.queue.Widget.flush();
      this.assertCalls([], this.layer1.calls);
      this.assertCalls([], this.layer2.calls);

      // full flush
      this.resetCalls();
      this.flush();
      this.assertCalls(["fullUpdate", "_fullUpdate"], this.layer1.calls);
      this.assertCalls(["fullUpdate", "_fullUpdate"], this.layer2.calls);
    },


    testInitial : function()
    {
      this.assertCalls([], this.layer1.calls);
      this.assertCalls([], this.layer2.calls);
      this.flush();
      this.assertCalls(["fullUpdate", "_fullUpdate"], this.layer1.calls);
      this.assertCalls(["fullUpdate", "_fullUpdate"], this.layer2.calls);
    },


    testInitialData : function()
    {
      this.assertCalls([], this.layer1.calls);
      this.assertCalls([], this.layer2.calls);
      this.pane.getRowConfig().setItemCount(123);
      this.layer1.updateLayerData();
      this.layer2.updateLayerData();
      this.flush();
      this.assertCalls(["updateLayerData", "fullUpdate", "_fullUpdate"], this.layer1.calls);
      this.assertCalls(["updateLayerData", "fullUpdate", "_fullUpdate"], this.layer2.calls);
    },


    testInitialWindow : function()
    {
      this.assertCalls([], this.layer1.calls);
      this.assertCalls([], this.layer2.calls);
      this.pane.getRowConfig().setItemCount(123);
      this.pane.setScrollX(20);
      this.pane.setScrollY(30);
      this.flush();
      this.assertCalls(["fullUpdate", "_fullUpdate"], this.layer1.calls);
      this.assertCalls(["fullUpdate", "_fullUpdate"], this.layer2.calls);
    },


    testInitialWindowData : function()
    {
      this.assertCalls([], this.layer1.calls);
      this.assertCalls([], this.layer2.calls);
      this.pane.getRowConfig().setItemCount(123);
      this.layer1.updateLayerData();
      this.layer2.updateLayerData();
      this.pane.setScrollX(20);
      this.pane.setScrollY(30);
      this.flush();
      this.assertCalls(["updateLayerData", "fullUpdate", "_fullUpdate"], this.layer1.calls);
      this.assertCalls(["updateLayerData", "fullUpdate", "_fullUpdate"], this.layer2.calls);
    },


    testInitialAxis : function()
    {
      this.assertCalls([], this.layer1.calls);
      this.assertCalls([], this.layer2.calls);
      this.pane.getRowConfig().setItemCount(123);
      this.flush();
      this.assertCalls(["fullUpdate", "_fullUpdate"], this.layer1.calls);
      this.assertCalls(["fullUpdate", "_fullUpdate"], this.layer2.calls);
    },


    testInitialAxisData : function()
    {
      this.assertCalls([], this.layer1.calls);
      this.assertCalls([], this.layer2.calls);
      this.pane.getRowConfig().setItemCount(123);
      this.layer1.updateLayerData();
      this.layer2.updateLayerData();
      this.flush();
      this.assertCalls(["updateLayerData", "fullUpdate", "_fullUpdate"], this.layer1.calls);
      this.assertCalls(["updateLayerData", "fullUpdate", "_fullUpdate"], this.layer2.calls);
    },


    testInitialAxisWindow : function()
    {
      this.assertCalls([], this.layer1.calls);
      this.assertCalls([], this.layer2.calls);
      this.pane.getRowConfig().setItemCount(123);
      this.pane.setScrollX(20);
      this.pane.setScrollY(30);
      this.flush();
      this.assertCalls(["fullUpdate", "_fullUpdate"], this.layer1.calls);
      this.assertCalls(["fullUpdate", "_fullUpdate"], this.layer2.calls);
    },


    testInitialAxisWindowData : function()
    {
      this.assertCalls([], this.layer1.calls);
      this.assertCalls([], this.layer2.calls);
      this.pane.getRowConfig().setItemCount(123);
      this.pane.setScrollX(20);
      this.pane.setScrollY(30);
      this.layer1.updateLayerData();
      this.layer2.updateLayerData();
      this.flush();
      this.assertCalls(["updateLayerData", "fullUpdate", "_fullUpdate"], this.layer1.calls);
      this.assertCalls(["updateLayerData", "fullUpdate", "_fullUpdate"], this.layer2.calls);
    },


    testAxis : function()
    {
      this.flush();
      this.resetCalls();

      this.pane.getRowConfig().setItemCount(123);
      this.assertCalls([], this.layer1.calls);
      this.assertCalls([], this.layer2.calls);
      this.resetCalls();
      this.flush();
      this.assertCalls(["fullUpdate", "_fullUpdate"], this.layer1.calls);
      this.assertCalls(["fullUpdate", "_fullUpdate"], this.layer2.calls);
    },


    testAxisData : function()
    {
      this.flush();
      this.resetCalls();

      this.pane.getRowConfig().setItemCount(123);
      this.layer1.updateLayerData();
      this.layer2.updateLayerData();

      this.assertCalls(["updateLayerData"], this.layer1.calls);
      this.assertCalls(["updateLayerData"], this.layer2.calls);
      this.resetCalls();
      this.flush();
      this.assertCalls(["fullUpdate", "_fullUpdate"], this.layer1.calls);
      this.assertCalls(["fullUpdate", "_fullUpdate"], this.layer2.calls);
    },


    testAxisWindow : function()
    {
      this.flush();
      this.resetCalls();

      this.pane.getRowConfig().setItemCount(123);
      this.pane.setScrollX(20);
      this.pane.setScrollY(30);

      this.assertCalls([], this.layer1.calls);
      this.assertCalls([], this.layer2.calls);
      this.resetCalls();
      this.flush();
      this.assertCalls(["fullUpdate", "_fullUpdate"], this.layer1.calls);
      this.assertCalls(["fullUpdate", "_fullUpdate"], this.layer2.calls);
    },


    testAxisWindowData : function()
    {
      this.flush();
      this.resetCalls();

      this.pane.getRowConfig().setItemCount(123);
      this.pane.setScrollX(20);
      this.pane.setScrollY(30);
      this.layer1.updateLayerData();
      this.layer2.updateLayerData();

      this.assertCalls(["updateLayerData"], this.layer1.calls);
      this.assertCalls(["updateLayerData"], this.layer2.calls);
      this.resetCalls();
      this.flush();
      this.assertCalls(["fullUpdate", "_fullUpdate"], this.layer1.calls);
      this.assertCalls(["fullUpdate", "_fullUpdate"], this.layer2.calls);
    },


    testWindow : function()
    {
      this.flush();
      this.resetCalls();

      this.pane.setScrollX(20);
      this.pane.setScrollY(30);

      this.assertCalls([], this.layer1.calls);
      this.assertCalls([], this.layer2.calls);
      this.resetCalls();
      this.flush();
      this.assertCalls(["updateLayerWindow", "_updateLayerWindow"], this.layer1.calls);
      this.assertCalls(["updateLayerWindow", "_updateLayerWindow"], this.layer2.calls);
    },


    testWindowData : function()
    {
      this.flush();
      this.resetCalls();

      this.pane.setScrollX(20);
      this.pane.setScrollY(30);
      this.layer1.updateLayerData();
      this.layer2.updateLayerData();

      this.assertCalls(["updateLayerData"], this.layer1.calls);
      this.assertCalls(["updateLayerData"], this.layer2.calls);
      this.resetCalls();
      this.flush();
      this.assertCalls(["updateLayerWindow", "_fullUpdate"], this.layer1.calls);
      this.assertCalls(["updateLayerWindow", "_fullUpdate"], this.layer2.calls);
    },


    testData : function()
    {
      this.flush();
      this.resetCalls();

      this.layer1.updateLayerData();

      this.assertCalls(["updateLayerData"], this.layer1.calls);
      this.assertCalls([], this.layer2.calls);
      this.resetCalls();
      this.flush();
      this.assertCalls(["_updateLayerData"], this.layer1.calls);
      this.assertCalls([], this.layer2.calls);
    }
  }
});
