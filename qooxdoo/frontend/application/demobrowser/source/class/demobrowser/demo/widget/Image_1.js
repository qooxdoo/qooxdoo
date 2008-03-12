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
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("demobrowser.demo.widget.Image_1",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      layout = new qx.ui.layout.HBox();
      var container = new qx.ui.core.Widget();
      container.setLayout(layout);
      this.getRoot().add(container, 0, 0, 0, 0);

      var mgr = qx.util.ImageRegistry.getInstance();
      var base = qx.core.Setting.get("demobrowser.resourceUri") + "/demobrowser/demo/icons/"

      mgr.register(base + "feed-reader.png", base + "feed-reader.png", 0, 0, 48, 48);
      mgr.register(base + "graphics-viewer-document.png", base + "graphics-viewer-document.png", 0, 0, 48, 48);
      mgr.register(base + "format-justify-fill.png", base + "format.png", -48, 0, 16, 16);
      mgr.register(base + "format-justify-left.png", base + "format.png", -64, 0, 16, 16);
      mgr.register(base + "multimedia-player.png", base + "multimedia-player.png", 0, 0, 128, 128);
      mgr.register(base + "multimedia-player-disabled.png", base + "multimedia-player-disabled.png", 0, 0, 128, 128);


      layout.setSpacing(10);
      layout.add(new qx.ui.basic.Image(base + "feed-reader.png"));
      layout.add(new qx.ui.basic.Image(base + "graphics-viewer-document.png"));
      layout.add(new qx.ui.basic.Image(base + "format-justify-fill.png"));
      layout.add(new qx.ui.basic.Image(base + "format-justify-left.png"));
      layout.add(new qx.ui.basic.Image(base + "format-justify-right.png"));
      layout.add(new qx.ui.basic.Image(base + "multimedia-player.png"));

      // toggle button
      var enable = false;
      var btn = new qx.ui.form.Button("Toggle enabled");
      btn.addListener("execute", function()
      {
        container.setEnabled(enable);
        enable = !enable;
      });

      this.getRoot().add(btn, 10, 140);



      var base2 = qx.core.Setting.get("demobrowser.resourceUri") + "/demobrowser/demo/grid_decoration/"
      mgr.register(base2 + "button-tl.png", base2 + "button-combined.png", 0, 0, 2, 2);
      mgr.register(base2 + "button-tr.png", base2 + "button-combined.png", 0, -2, 2, 2);
      mgr.register(base2 + "button-br.png", base2 + "button-combined.png", 0, -4, 2, 2);
      mgr.register(base2 + "button-bl.png", base2 + "button-combined.png", 0, -6, 2, 2);
      mgr.register(base2 + "button-t.png", base2 + "button-combined.png", 0, -8, 2, 2);
      mgr.register(base2 + "button-b.png", base2 + "button-combined.png", 0, -10, 2, 2);

      mgr.register(base2 + "button-l.png", base2 + "button-center-combined.png", 0, 0, 2, 16);
      mgr.register(base2 + "button-c.png", base2 + "button-center-combined.png", -2, 0, 2, 16);
      mgr.register(base2 + "button-r.png", base2 + "button-center-combined.png", -4, 0, 2, 16);

      var layout = new qx.ui.layout.Grid();
      layout.add(new qx.ui.basic.Image(base2 + "button-tl.png"), 0, 0);
      layout.add(new qx.ui.basic.Image(base2 + "button-t.png"), 0, 1);
      layout.add(new qx.ui.basic.Image(base2 + "button-tr.png"), 0, 2);
      layout.add(new qx.ui.basic.Image(base2 + "button-l.png"), 1, 0);
      layout.add(new qx.ui.basic.Image(base2 + "button-c.png"), 1, 1);
      layout.add(new qx.ui.basic.Image(base2 + "button-r.png"), 1, 2);
      layout.add(new qx.ui.basic.Image(base2 + "button-bl.png"), 2, 0);
      layout.add(new qx.ui.basic.Image(base2 + "button-b.png"), 2, 1);
      layout.add(new qx.ui.basic.Image(base2 + "button-br.png"), 2, 2);

      this.getRoot().add(new qx.ui.core.Widget().set({
        layout: layout
      }), 100, 200);

    }
  }
});
