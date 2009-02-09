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
        this,
        pane.getRowConfig(),
        pane.getColumnConfig()
      );      
      spanLayer.setCellSpan(1, 1, 2, 2);
      spanLayer.setCellSpan(1, 5, 3, 3);
      spanLayer.setCellSpan(7, 4, 2, 4);
      spanLayer.setCellSpan(6, 0, 10, 2);
      spanLayer.setCellSpan(10, 9, 10, 5);
      spanLayer.setCellSpan(11, 3, 6, 3);
      
      scroller.getPane().addLayer(spanLayer);
    },
    
    
    getCellHtml : function(row, column, left, top, width, height) 
    {
      var color = (row + column) % 2 == 0 ? "yellow" : "green";
      
      return [
        "<div style='position:absolute;",
        "left:", left, "px;",
        "top:", top, "px;",
        "width:", width, "px;",
        "height:", height, "px;",
        "background-color:", color,
        "'>",
        row, "x", column,
        "</div>"
      ].join(""); 
    }
  }
});
