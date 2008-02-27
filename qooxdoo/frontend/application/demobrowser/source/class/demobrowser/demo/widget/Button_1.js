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

qx.Class.define("demobrowser.demo.widget.Button_1",
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

      var docLayout = new qx.ui.layout.HBox();
      docLayout.setSpacing(10);

      var container = new qx.ui.core.Widget();
      container.setPadding(20);
      container.setLayout(docLayout);

      doc.add(container, 0, 0);

      var img1 = "icon/48/apps/feed-reader.png";
      var img2 = "icon/48/apps/internet-mail.png";
      var img3 = "icon/48/apps/internet-web-browser.png";
      var img4 = "icon/48/apps/photo-album.png";

      var btn1 = new qx.ui.form.Button("Oxygen Icons", img1, 48, 48);
      docLayout.add(btn1);
      var btn2 = new qx.ui.form.Button("Tango Icons", img2, 48, 48);
      docLayout.add(btn2);
      var btn3 = new qx.ui.form.Button("Juhu", img3, 48, 48);
      docLayout.add(btn3);
      var btn4 = new qx.ui.form.RepeatButton("Repeat Button", img4, 48, 48);
      docLayout.add(btn4);

      btn1.addListener("execute", function() {
        qx.theme.manager.Icon.getInstance().setTheme(qx.theme.icon.Oxygen);
      }, this);

      btn2.addListener("execute", function() {
        qx.theme.manager.Icon.getInstance().setTheme(qx.theme.icon.Tango);
      }, this);

      btn4.addListener("execute", function() {
        console.log("repeat button execute!");
      });
    }
  }
});
