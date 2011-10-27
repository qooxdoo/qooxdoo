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

      var label = new qx.ui.basic.Label("Resize the windows to see the effect.");
      this.getRoot().add(label, {left: 10, top: 10});

      var win1 = new qx.ui.window.Window("Window containing a Canvas - static coordinates").set({
        width: 200,
        height: 200
      });
      win1.setLayout(new qx.ui.layout.Canvas());

      if (!qx.core.Environment.get("html.canvas"))
      {
        var canvas1 = new qx.ui.container.Composite(new qx.ui.layout.HBox());
        canvas1.add(new qx.ui.basic.Label("Canvas is not supported by this browser!").set({
          rich : true,
          alignX: "center",
          alignY: "middle"
        }));
      }
      else
      {
        var canvas1 = new qx.ui.embed.Canvas().set({
          canvasWidth: 200,
          canvasHeight: 200,
          syncDimension: false
        });
        canvas1.addListener("redraw", this.draw, this);
      }

      win1.add(canvas1, {edge: 0});
      this.getRoot().add(win1, {left: 30, top: 40});
      win1.open();


      var win2 = new qx.ui.window.Window("Window containing a Canvas - synced coordinates").set({
        width: 200,
        height: 200
      });
      win2.setLayout(new qx.ui.layout.Canvas());

      if (!qx.core.Environment.get("html.canvas"))
      {
        var canvas2 = new qx.ui.container.Composite(new qx.ui.layout.HBox());
        canvas2.add(new qx.ui.basic.Label("Canvas is not support by this browser!").set({
          rich : true,
          alignX: "center",
          alignY: "middle"
        }));
      }
      else
      {
        var canvas2 = new qx.ui.embed.Canvas().set({
          canvasWidth: 200,
          canvasHeight: 200,
          syncDimension: true
        });
        canvas2.addListener("redraw", this.draw, this);
      }

      win2.add(canvas2, {edge: 0});
      this.getRoot().add(win2, {left: 30, top: 250});
      win2.open();
    },


    draw : function(e)
    {
      var data = e.getData();
      var ctx = data.context;

      ctx.fillStyle = "rgb(200,0,0)";
      ctx.fillRect (20, 20, 105, 100);

      ctx.fillStyle = "rgba(0, 0, 200, 0.5)";
      ctx.fillRect (70, 70, 105, 100);
    }
  }
});
