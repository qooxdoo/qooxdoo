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

qx.Class.define("demobrowser.demo.virtual.CellSpan",
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

      var scroller = new qx.ui.virtual.core.Scroller(1000, 100, 20, 100);

      this.getRoot().add(scroller, {edge: 20});
      scroller.getPane().addLayer(new qx.ui.virtual.layer.Row("white", "#EEE"));
      scroller.getPane().addLayer(new qx.ui.virtual.layer.GridLines("horizontal"));
      scroller.getPane().addLayer(new qx.ui.virtual.layer.GridLines("vertical"));   
      
      var pane = scroller.getPane();
      
      var spanLayer = new qx.ui.virtual.layer.CellSpan(
        pane.getRowConfig(),
        pane.getColumnConfig()
      );      
      spanLayer.addCell("c1", 1, 1, 2, 1);
      spanLayer.addCell("c2", 1, 5, 3, 3);
      spanLayer.addCell("c3", 7, 3, 1, 4);
      spanLayer.addCell("c4", 6, 0, 10, 1);
      spanLayer.addCell("c5", 10, 9, 10, 5);
      spanLayer.addCell("c6", 11, 3, 6, 3);
      
      scroller.getPane().addLayer(spanLayer);
    }   
  }
});
