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

qx.Class.define("demobrowser.demo.virtual.Scroller",
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

      var win = new qx.ui.window.Window();
      win.setLayout(new qx.ui.layout.Grow());
      win.open();
      
      var scroller = new qx.ui.virtual.core.Scroller(1, 1, 400, 500).set({
        width: 500,
        height: 400
      });
      scroller.getPane().addLayer(new qx.ui.virtual.layer.Row());
      scroller.getPane().addLayer(new qx.ui.virtual.layer.Test());
      win.add(scroller);
    }
  }
});
