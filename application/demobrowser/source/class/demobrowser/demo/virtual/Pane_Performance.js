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
   * Jonathan Weiß (jonathan_rass)

************************************************************************ */

/* ************************************************************************

#asset(custom/*)

************************************************************************ */

qx.Class.define("demobrowser.demo.virtual.Pane_Performance",
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

      var layout = new qx.ui.layout.Grid(5, 5);
      layout.setRowFlex(1, 1);
      layout.setColumnFlex(0, 1);
      layout.setColumnFlex(1, 1);
      
      var container = new qx.ui.container.Composite(layout);
      this.getRoot().add(container, {edge: 5});
      
      container.add(new qx.ui.basic.Label("absolute"), {row: 0, column: 0});
      var scroller = new qx.ui.virtual.core.Scroller(1000, 100, 15, 40);
      scroller.getPane().addLayer(new qx.ui.virtual.layer.Test());      
      container.add(scroller, {row: 1, column: 0});      

      container.add(new qx.ui.basic.Label("relative"), {row: 0, column: 1});
      var scroller = new qx.ui.virtual.core.Scroller(1000, 100, 15, 40);
      scroller.getPane().addLayer(new qx.ui.virtual.layer.TestRelative());      
      container.add(scroller, {row: 1, column: 1});

    }
  }
});
