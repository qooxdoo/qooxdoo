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

/**
 * @tag test
 */
qx.Class.define("demobrowser.demo.virtual.Pane_Column",
{
  extend : qx.application.Standalone,



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    main : function()
    {
      // Call super class
      this.base(arguments);

      var layout = new qx.ui.layout.Grid(5, 0);
      layout.setRowFlex(1, 1);
      layout.setColumnFlex(0, 1);
      layout.setColumnFlex(1, 1);
      layout.setColumnFlex(2, 1);

      var container = new qx.ui.container.Composite(layout);
      this.getRoot().add(container, {edge: 0});

      container.add(new qx.ui.basic.Label("Even/Odd Colors").set({
        font: "bold",
        decorator: "table-scroller-header",
        padding: 3,
        allowGrowX: true
      }), {row: 0, column: 0});
      var scroller = new qx.ui.virtual.core.Scroller(100, 10000, 60, 60);
      scroller.getPane().addLayer(new qx.ui.virtual.layer.Column("white", "#EEE"));
      container.add(scroller, {row: 1, column: 0});

      container.add(new qx.ui.basic.Label("Custom Colors").set({
        font: "bold",
        decorator: "table-scroller-header",
        padding: 3,
        allowGrowX: true
      }), {row: 0, column: 1});
      var scroller = new qx.ui.virtual.core.Scroller(100, 10000, 60, 60);
      var columnLayer = new qx.ui.virtual.layer.Column();
      for (var i=0; i<10000; i++) {
        columnLayer.setColor(i, qx.util.ColorUtil.randomColor());
      }
      scroller.getPane().addLayer(columnLayer);
      container.add(scroller, {row: 1, column: 1});

      container.add(new qx.ui.basic.Label("Even/Odd & Custom Colors").set({
        font: "bold",
        decorator: "table-scroller-header",
        padding: 3,
        allowGrowX: true
      }), {row: 0, column: 2});
      var scroller = new qx.ui.virtual.core.Scroller(100, 10000, 60, 60);
      var columnLayer = new qx.ui.virtual.layer.Column("white", "#EEE");
      for (var i=0; i<10000; i++) {
        if (Math.random() > 0.7) {
          columnLayer.setColor(i, qx.util.ColorUtil.randomColor());
        }
      }
      scroller.getPane().addLayer(columnLayer);
      container.add(scroller, {row: 1, column: 2});
    }
  }
});
