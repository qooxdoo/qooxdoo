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

      var btn1 = new qx.ui.form.Button("Button A", "icon/48/apps/video-player.png");
      container.add(btn1);
      var btn2 = new qx.ui.form.Button("Button B", "icon/48/apps/internet-mail.png");
      container.add(btn2);
      var btn3 = new qx.ui.form.ToggleButton("Toggle Button", "icon/48/apps/internet-web-browser.png");
      container.add(btn3);

      btn3.addListener("changeChecked", function(e) {
        this.debug("Checked: " + e.getValue());
      }, this);
    }
  }
});
