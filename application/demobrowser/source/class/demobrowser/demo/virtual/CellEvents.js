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
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */

qx.Class.define("demobrowser.demo.virtual.CellEvents",
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


      var scroller = new qx.ui.virtual.core.Scroller(
        20, 20,
        40, 40
      );
      this.layer = new qx.test.ui.virtual.layer.LayerSimple(this);
      scroller.getPane().addLayer(this.layer);

      this.getRoot().add(scroller, {left : 20, top : 10});
    }
  }
});
