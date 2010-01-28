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

qx.Class.define("demobrowser.demo.root.Inline_Dynamic_Resize",
{
  extend : qx.application.Inline,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var isle1 = new qx.ui.root.Inline(document.getElementById("isle1"), false, true);
      isle1.setLayout(new qx.ui.layout.Canvas());
      isle1.add(new qx.ui.form.Button(null, "icon/48/devices/computer.png"), {edge: 0});


      var isle2 = new qx.ui.root.Inline(document.getElementById("isle2"), true, false).set({
        padding: [10, 0],
        decorator: null,
        appearance: "widget"
      });
      isle2.setLayout(new qx.ui.layout.Canvas());

      var slideBar = new qx.ui.container.SlideBar();
      slideBar.setLayout(new qx.ui.layout.HBox(3));
      isle2.add(slideBar, {edge: 0});

      var icons = [
        "audio-card.png","audio-input-microphone.png","battery.png",
        "camera-photo.png","camera-web.png","computer.png","display.png",
        "drive-harddisk.png","drive-optical.png","input-keyboard.png",
        "network-wired.png","network-wireless.png"
      ];

      for (var i=0; i<icons.length; i++)
      {
        slideBar.add((new qx.ui.basic.Image("icon/48/devices/" + icons[i])).set({
          decorator: "group",
          padding: 4
        }));
      }
    }
  }
});
