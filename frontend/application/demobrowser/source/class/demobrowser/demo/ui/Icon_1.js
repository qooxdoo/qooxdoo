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

qx.Class.define("demobrowser.demo.ui.Icon_1",
{
  extend : demobrowser.Demo,

  members :
  {
    main: function()
    {
      this.base(arguments);

      doc = new qx.ui.root.Application(document);

      doc.setTextColor("black");
      doc.setBackgroundColor("white");

      layout = new qx.ui.layout.HBox();
      var container = new qx.ui.core.Widget();
      container.setLayout(layout);
      doc.add(container, 0, 0, 0, 0);

      qx.theme.manager.Meta.getInstance().setTheme(qx.theme.Classic);

      var mgr = qx.io.image.IconManager.getInstance();

      mgr.register("icons/feed-reader.png", "icons/feed-reader.png", 0, 0, 48, 48);
      mgr.register("icons/graphics-viewer-document.png", "icons/graphics-viewer-document.png", 0, 0, 48, 48);
      mgr.register("icons/format-justify-fill.png", "icons/format.png", -48, 0, 16, 16);
      mgr.register("icons/format-justify-left.png", "icons/format.png", -64, 0, 16, 16);

      layout.setSpacing(20);

      layout.add(new qx.ui.basic.Icon("icons/feed-reader.png"));
      layout.add(new qx.ui.basic.Icon("icons/graphics-viewer-document.png"));
      layout.add(new qx.ui.basic.Icon("icons/format-justify-fill.png"));
      layout.add(new qx.ui.basic.Icon("icons/format-justify-left.png"));
      layout.add(new qx.ui.basic.Icon("icons/format-justify-right.png"));
      layout.add(new qx.ui.basic.Icon("icons/multimedia-player.png", "icons/multimedia-player-disabled.png"));


      // toggle button
      var enable = false;
      var btn = new qx.ui.form.Button("Toggle enabled");
      btn.addListener("click", function()
      {
        container.setEnabled(enable);
        enable = !enable;
      });

      doc.add(btn, 10, 140);
    }
  }
});
