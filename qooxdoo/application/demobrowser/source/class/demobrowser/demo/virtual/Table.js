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

/* ************************************************************************

#asset(custom/*)

************************************************************************ */

qx.Class.define("demobrowser.demo.virtual.Table",
{
  extend : qx.application.Standalone,



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * This method contains the initial application code and gets called 
     * during startup of the application
     */
    main : function()
    {
      // Call super class
      this.base(arguments);

      var scroller = new qx.ui.virtual.core.Scroller(10000, 10000, 20, 100);
      // change all cell sizes!!
      for (var i=0; i<10000; i++)
      {
        scroller.pane.rowConfig.setItemSize(i, 20 + Math.round(Math.random() * 40));
        scroller.pane.columnConfig.setItemSize(i, 50 + Math.round(Math.random() * 80));
      }
      this.getRoot().add(scroller, {edge: 20});
      scroller.pane.addLayer(new qx.ui.virtual.layer.Row());
      scroller.pane.addLayer(new qx.ui.virtual.layer.GridLines("horizontal"));
      scroller.pane.addLayer(new qx.ui.virtual.layer.GridLines("vertical"));      
      scroller.pane.addLayer(new qx.ui.virtual.layer.Test());
      return;

      /*
      var layout = new qx.ui.layout.Grid(5, 5);
      layout.setRowFlex(0, 1);
      layout.setRowFlex(1, 1);
      layout.setColumnFlex(0, 1);
      layout.setColumnFlex(1, 1);
      
      var container = new qx.ui.container.Composite(layout);
      this.getRoot().add(container, {edge: 5});
      
      var scroller = new qx.ui.virtual.core.Scroller(1000, 100, 15, 40);
      scroller.pane.addLayer(new custom.layer.Test());      
      container.add(scroller, {row: 0, column: 0});      

      var scroller = new qx.ui.virtual.core.Scroller(1000, 100, 15, 40);
      scroller.pane.addLayer(new custom.layer.DomPoolTest());      
      container.add(scroller, {row: 0, column: 1});      

      var scroller = new qx.ui.virtual.core.Scroller(1000, 100, 15, 40);
      scroller.pane.addLayer(new custom.layer.Test());      
      container.add(scroller, {row: 1, column: 0});
      */      
      
      /*
      var scroller = new qx.ui.virtual.core.Scroller(1000, 10, 20, 80);
      scroller.pane.addLayer(new custom.layer.Row());
      scroller.pane.addLayer(new custom.layer.GridLines("horizontal"));
      scroller.pane.addLayer(new custom.layer.GridLines("vertical"));
      scroller.pane.addLayer(new custom.layer.Test());      
      //this.getRoot().add(scroller, {left: 20, top: 20});
      this.getRoot().add(scroller, {edge: 20});
      */
      
      /*
      var scroller = new qx.ui.virtual.core.Scroller(100, 10000, 60, 100);
      scroller.pane.addLayer(new custom.layer.Row());
      this.getRoot().add(scroller, {left: 470, top: 20});    
      
      var scroller = new qx.ui.virtual.core.Scroller(100, 10000, 60, 100);
      scroller.pane.addLayer(new custom.layer.GridLines("horizontal"));
      scroller.pane.addLayer(new custom.layer.GridLines("vertical"));
      this.getRoot().add(scroller, {left: 910, top: 20});   
      */    
    }
  }
});
