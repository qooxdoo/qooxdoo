/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
   * Fabian Jakobs (fjakobs)
   * Jonathan Weiß (jonathan_rass)

************************************************************************ */

/**
 * @tag test
 */
qx.Class.define("demobrowser.demo.virtual.Complex",
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

      var scroller = new qx.ui.virtual.core.Scroller(100, 15, 32, 120);
      scroller.getPane().setWidth(450);

      // change 8 sizes
      for (var i=2; i<10; i++)
      {
        scroller.getPane().getRowConfig().setItemSize(i, 50 + Math.round(Math.random() * 40));
        scroller.getPane().getColumnConfig().setItemSize(i, 50 + Math.round(Math.random() * 80));
      }

      this.getRoot().add(scroller, {left : 20, top : 10});
      scroller.getPane().addLayer(new qx.ui.virtual.layer.Row("white", "rgb(238, 243, 255)"));
      scroller.getPane().addLayer(new qx.ui.virtual.layer.GridLines("horizontal"));
      scroller.getPane().addLayer(new demobrowser.demo.virtual.DemoLayer);

      // Creates the prefetch behavior
      new qx.ui.virtual.behavior.Prefetch(
        scroller,
        {
          minLeft : 500,
          maxLeft : 600,
          minRight : 1000,
          maxRight : 1200,
          minAbove : 0,
          maxAbove : 0,
          minBelow : 0,
          maxBelow : 0
        }
      );
    }
  }
});
