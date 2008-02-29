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
  extend : demobrowser.Demo,

  members :
  {
    main: function()
    {
      this.base(arguments);
      qx.theme.manager.Meta.getInstance().setTheme(qx.theme.Classic);

      doc = new qx.ui.root.Application(document);

      doc.setTextColor("black");
      doc.setBackgroundColor("white");

      var img1 = qx.io.Alias.getInstance().resolve("icon/48/apps/video-player.png");
      var img2 = qx.io.Alias.getInstance().resolve("icon/48/apps/internet-mail.png");
      var img3 = qx.io.Alias.getInstance().resolve("icon/48/apps/internet-web-browser.png");
      var img4 = qx.io.Alias.getInstance().resolve("icon/48/apps/photo-album.png");

      w1 = new qx.ui.basic.Image(img1, 48, 48);
      w2 = new qx.ui.basic.Image(img2, 48, 48);
      w3 = new qx.ui.basic.Image(img3, 48, 48);
      w4 = new qx.ui.basic.Image(img4, 48, 48);

      layout = new qx.ui.layout.Basic();

      layout.add(w1, 10, 10);
      layout.add(w2, 200, 20);
      layout.add(w3, 350, 50);
      layout.add(w4, 50, 200);

      var container = new qx.ui.core.Widget();
      container.setLayout(layout);

      doc.add(container, 0, 0, 0, 0);
    }
  }
});
