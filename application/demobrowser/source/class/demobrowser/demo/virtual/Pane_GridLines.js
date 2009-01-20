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

qx.Class.define("demobrowser.demo.virtual.Pane_GridLines",
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
      layout.setRowFlex(0, 1);
      layout.setColumnFlex(0, 1);
      layout.setColumnFlex(1, 1);
      layout.setColumnFlex(2, 1);
      
      var container = new qx.ui.container.Composite(layout);
      this.getRoot().add(container, {edge: 5});      
      
      var scroller = new qx.ui.virtual.core.Scroller(100, 10000, 60, 100);
      scroller.pane.addLayer(new qx.ui.virtual.layer.GridLines("horizontal"));
      scroller.pane.addLayer(new qx.ui.virtual.layer.GridLines("vertical"));
      container.add(scroller, {row: 0, column: 0});   

      var scroller = new qx.ui.virtual.core.Scroller(100, 10000, 60, 100);
      scroller.pane.addLayer(new qx.ui.virtual.layer.GridLines("vertical"));
      container.add(scroller, {row: 0, column: 1});   

      var scroller = new qx.ui.virtual.core.Scroller(100, 10000, 60, 100);
      scroller.pane.addLayer(new qx.ui.virtual.layer.GridLines("horizontal"));
      container.add(scroller, {row: 0, column: 2});   
    }
  }
});
