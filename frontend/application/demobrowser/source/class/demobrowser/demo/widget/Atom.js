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

/* ************************************************************************

#asset(qx/icon/Oxygen/48/apps/video-player.png)
#asset(qx/icon/Oxygen/48/apps/internet-mail.png)
#asset(qx/icon/Oxygen/48/apps/internet-web-browser.png)
#asset(qx/icon/Oxygen/48/apps/photo-album.png)
#asset(qx/icon/Oxygen/48/apps/office-writer.png)

************************************************************************ */

qx.Class.define("demobrowser.demo.widget.Atom",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var box = new qx.ui.layout.HBox();
      box.setSpacing(10);

      var container = new qx.ui.container.Composite(box);
      container.setPadding(20);

      this.getRoot().add(container);

      var img1 = "icon/48/apps/video-player.png";
      var img2 = "icon/48/apps/internet-mail.png";
      var img3 = "icon/48/apps/internet-web-browser.png";
      var img4 = "icon/48/apps/photo-album.png";
      var img5 = "icon/48/apps/office-writer.png";

      container.add(new qx.ui.basic.Atom("Juhu1", img1).set({
        backgroundColor : "#dedede",
        decorator : "black",
        padding : 5,
        allowGrowY: false
      }));

      container.add(new qx.ui.basic.Atom("Juhu2", img2).set({
        backgroundColor : "#dedede",
        decorator : "black",
        align : "top",
        padding : 5,
        allowGrowY: false,
        enabled : false
      }));

      container.add(new qx.ui.basic.Atom("Juhu3", img3).set({
        backgroundColor : "#dedede",
        decorator : "black",
        align : "right",
        padding : 5,
        allowGrowY: false
      }));

      container.add(new qx.ui.basic.Atom("Juhu4", img4).set({
        backgroundColor : "#dedede",
        decorator : "black",
        align : "bottom",
        padding : 5,
        allowGrowY: false
      }));

      container.add(new qx.ui.basic.Atom("Juhu5", img5).set({
        backgroundColor : "#dedede",
        decorator : "black",
        show : "icon",
        padding : 5,
        allowGrowY: false
      }));
    }
  }
});
