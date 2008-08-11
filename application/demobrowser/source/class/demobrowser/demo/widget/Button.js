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

#asset(qx/icon/${qx.icontheme}/22/apps/media-video-player.png)
#asset(qx/icon/${qx.icontheme}/22/apps/internet-mail.png)
#asset(qx/icon/${qx.icontheme}/22/apps/internet-web-browser.png)

************************************************************************ */

qx.Class.define("demobrowser.demo.widget.Button",
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

      this.getRoot().add(container, {left:0,top:0});

      var btn1 = new qx.ui.form.Button("Button A", "icon/22/apps/media-video-player.png");
      container.add(btn1);
      var btn2 = new qx.ui.form.Button("Button B", "icon/22/apps/internet-mail.png");
      btn2.setEnabled(false);
      container.add(btn2);
      var btn3 = new qx.ui.form.ToggleButton("Toggle Button", "icon/22/apps/internet-web-browser.png");
      container.add(btn3);

      btn3.addListener("changeChecked", function(e) {
        this.debug("Checked: " + e.getData());
      }, this);
    }
  }
});
