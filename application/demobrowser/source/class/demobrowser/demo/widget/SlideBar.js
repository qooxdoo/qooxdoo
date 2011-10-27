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

#asset(qx/icon/${qx.icontheme}/48/devices/*)

************************************************************************ */

qx.Class.define("demobrowser.demo.widget.SlideBar",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var slideBar = new qx.ui.container.SlideBar();
      slideBar.set({
        width: 300
      });

      slideBar.setLayout(new qx.ui.layout.HBox(3));

      var icons = [
        "audio-card.png","audio-input-microphone.png","battery.png",
        "camera-photo.png","camera-web.png","computer.png","display.png",
        "drive-harddisk.png","drive-optical.png","input-keyboard.png",
        "network-wired.png","network-wireless.png"
      ];

      for (var i=0; i<icons.length; i++)
      {
        slideBar.add((new qx.ui.basic.Image("icon/48/devices/" + icons[i])).set({
          decorator: "main",
          padding: 4
        }));
      }

      var toggle = new qx.ui.form.ToggleButton("Toggle size");

      toggle.addListener("changeValue", function(e) {
        slideBar.setWidth(e.getData() ? 800 : 300);
      });

      this.getRoot().add(toggle, {left:20, top:100});
      this.getRoot().add(slideBar, {left:20, top:20});
    }
  }
});
