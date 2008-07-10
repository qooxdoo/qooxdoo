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

qx.Class.define("demobrowser.demo.widget.Canvas",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var win1 = new qx.ui.window.Window("Canvas - static coordinates").set({
        width: 200,
        height: 200
      });
      win1.setLayout(new qx.ui.layout.Canvas());

      var canvas1 = new qx.ui.embed.Canvas().set({
        canvasWidth: 200,
        canvasHeight: 200,
        syncDimension: false
      });
      canvas1.addListener("redraw", this.draw, this);

      win1.add(canvas1, {edge: 0});
      this.getRoot().add(win1, {left: 30, top: 40});
      win1.open();


      var win2 = new qx.ui.window.Window("Canvas - synced coordinates").set({
        width: 200,
        height: 200
      });
      win2.setLayout(new qx.ui.layout.Canvas());

      var canvas2 = new qx.ui.embed.Canvas().set({
        canvasWidth: 200,
        canvasHeight: 200,
        syncDimension: true
      });
      canvas2.addListener("redraw", this.draw, this);

      win2.add(canvas2, {edge: 0});
      this.getRoot().add(win2, {left: 130, top: 140});
      win2.open();
    },


    draw : function(e)
    {
      var data = e.getData();
      var width = data.width;
      var height = data.height;
      var ctx = data.context;

      ctx.fillStyle = "rgb(200,0,0)";
      ctx.fillRect (20, 20, 105, 100);

      ctx.fillStyle = "rgba(0, 0, 200, 0.5)";
      ctx.fillRect (70, 70, 105, 100);
    }
  }
});
