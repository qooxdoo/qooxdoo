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

qx.Class.define("demobrowser.demo.widget.Icon_1",
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
      var base = qx.core.Setting.get("demobrowser.resourceUri") + "/demo/icons/"


      mgr.register(base + "feed-reader.png", base + "feed-reader.png", 0, 0, 48, 48);
      mgr.register(base + "graphics-viewer-document.png", base + "graphics-viewer-document.png", 0, 0, 48, 48);
      mgr.register(base + "format-justify-fill.png", base + "format.png", -48, 0, 16, 16);
      mgr.register(base + "format-justify-left.png", base + "format.png", -64, 0, 16, 16);

      layout.setSpacing(20);

      layout.add(new qx.ui.basic.Icon(base + "feed-reader.png"));
      layout.add(new qx.ui.basic.Icon(base + "graphics-viewer-document.png"));
      layout.add(new qx.ui.basic.Icon(base + "format-justify-fill.png"));
      layout.add(new qx.ui.basic.Icon(base + "format-justify-left.png"));
      layout.add(new qx.ui.basic.Icon(base + "format-justify-right.png"));
      layout.add(new qx.ui.basic.Icon(base + "multimedia-player.png", base + "multimedia-player-disabled.png"));


      /*
      var img = qx.bom.ClippedImage.create();
      qx.bom.ClippedImage.setSource(img, base + "format.png", 16, 16, -32, 0, 96, 0);

      qx.bom.element.Style.set(img, "position", "absolute");
      qx.bom.element.Style.set(img, "top", 200);
      qx.bom.element.Style.set(img, "left", 200);
      qx.bom.element.Style.set(img, "zIndex", 200);

      document.body.appendChild(img);
      */



      // toggle button
      var enable = false;
      var btn = new qx.ui.form.Button("Toggle enabled");
      btn.addListener("execute", function()
      {
        container.setEnabled(enable);
        enable = !enable;
      });

      doc.add(btn, 10, 140);
    }
  }
});
