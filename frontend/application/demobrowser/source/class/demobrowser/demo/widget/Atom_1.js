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

qx.Class.define("demobrowser.demo.widget.Atom_1",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      qx.theme.manager.Meta.getInstance().setTheme(qx.theme.Classic);

      doc = new qx.ui.root.Application(document);

      var docLayout = new qx.ui.layout.HBox();
      docLayout.setSpacing(10);

      var container = new qx.ui.core.Widget();
      container.setPadding(20);
      container.setLayout(docLayout);

      doc.add(container, 0, 0);

      var img1 = "icon/48/apps/video-player.png";
      var img2 = "icon/48/apps/internet-mail.png";
      var img3 = "icon/48/apps/internet-web-browser.png";
      var img4 = "icon/48/apps/photo-album.png";

      var border = new qx.ui.decoration.Basic(1, "solid", "black");

      docLayout.add(new qx.ui.basic.Atom("Juhu", img1, 48, 48).set({
        backgroundColor : "#dedede",
        decorator : border,
        padding : 5,
        allowGrowY: false
      }));

      docLayout.add(new qx.ui.basic.Atom("Juhu", img2, 48, 48).set({
        backgroundColor : "#dedede",
        decorator : border,
        align : "top",
        padding : 5,
        allowGrowY: false
      }));

      docLayout.add(new qx.ui.basic.Atom("Juhu", img3, 48, 48).set({
        backgroundColor : "#dedede",
        decorator : border,
        align : "right",
        padding : 5,
        allowGrowY: false
      }));

      docLayout.add(new qx.ui.basic.Atom("Juhu", img4, 48, 48).set({
        backgroundColor : "#dedede",
        decorator : border,
        align : "bottom",
        padding : 5,
        allowGrowY: false
      }));

      docLayout.add(new qx.ui.basic.Atom("Juhu", img1, 48, 48).set({
        backgroundColor : "#dedede",
        decorator : border,
        show : "icon",
        padding : 5,
        allowGrowY: false
      }));
    }
  }
});
