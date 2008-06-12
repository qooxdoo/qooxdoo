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
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/* ************************************************************************

#asset(qx/icon/Oxygen/16/devices/*)

************************************************************************ */

qx.Class.define("demobrowser.demo.widget.SelectBox",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      ///////////////////////////////////////////////////////////////
      // Labels for the demos
      this.getRoot().add(new qx.ui.basic.Label("Long text"), {left: 30, top: 25});
      this.getRoot().add(new qx.ui.basic.Label("With icons"), {left: 160, top: 25});
      this.getRoot().add(new qx.ui.basic.Label("Long list"), {left: 290, top: 25});
      this.getRoot().add(new qx.ui.basic.Label("Long button, short text"), {left: 420, top: 25});
      this.getRoot().add(new qx.ui.basic.Label("Fonts"), {left: 30, bottom: 35});
      ///////////////////////////////////////////////////////////////


      ///////////////////////////////////////////////////////////////
      // example 1: Only text with different length
      var selectBox1 = new qx.ui.form.SelectBox();
      for (var i = 0; i < 30; i++) {
        var tempItem = new qx.ui.form.ListItem("Item " + Math.pow(10, i));
        selectBox1.add(tempItem);
        // select sixth item
        if (i == 5) {
          selectBox1.setSelectedItem(tempItem);
        }
      }
      this.getRoot().add(selectBox1, {left: 20, top: 40});
      ///////////////////////////////////////////////////////////////

      ///////////////////////////////////////////////////////////////
      // example 2: Text and Icons
      var iconNames = [ "audio-card.png","audio-input-microphone.png","battery.png",
      "camera-photo.png","camera-web.png","computer.png","display.png",
      "drive-harddisk.png","drive-optical.png","input-keyboard.png",
      "input-mouse.png","media-flash.png","media-optical.png","multimedia-player.png",
      "network-wired.png","network-wireless.png","pda.png","phone.png","printer.png" ];

      var iconNamesPrefix = "icon/16/devices/"

      var selectBox2 = new qx.ui.form.SelectBox();
      for (var i = 0; i < iconNames.length; i++) {
        var tempItem = new qx.ui.form.ListItem(iconNames[i].substr(0, iconNames[i].indexOf(".")), iconNamesPrefix + iconNames[i]);
        selectBox2.add(tempItem);
      }

      this.getRoot().add(selectBox2, {left: 150, top: 40});
      ///////////////////////////////////////////////////////////////

      ///////////////////////////////////////////////////////////////
      // example 3: a lot of choices
      var selectBox3 = new qx.ui.form.SelectBox();
      selectBox3.setMaxListHeight(null);
      for (var i = 0; i < 300; i++) {
        var tempItem = new qx.ui.form.ListItem("" + i);
        selectBox3.add(tempItem);
      }
      this.getRoot().add(selectBox3, {left: 280, top: 40});
      ///////////////////////////////////////////////////////////////



      ///////////////////////////////////////////////////////////////
      // example 4: fonts
      var selectBox4 = new qx.ui.form.SelectBox();
      var font1 = new qx.bom.Font(12, ["Tahoma"]);
      var font2 = new qx.bom.Font(15, ["Arial"]);
      var font3 = new qx.bom.Font(18, ["Courier New"]);
      var font4 = new qx.bom.Font(21, ["Times New Roman"]);
      var fonts = [font1, font2, font3, font4];
      for (var i = 0; i < fonts.length; i++) {
        var tempItem = new qx.ui.form.ListItem("Font " + (i + 1));
        tempItem.setFont(fonts[i]);
        selectBox4.add(tempItem);
      }
      this.getRoot().add(selectBox4, {left: 20, bottom: 10});
      ///////////////////////////////////////////////////////////////


      ///////////////////////////////////////////////////////////////
      // example 5: long button, short text with disabled fields
      var selectBox5 = new qx.ui.form.SelectBox();
      selectBox5.setWidth(300);
      selectBox5.setMaxListHeight(100);
      for (var i = 0; i < 20; i++) {
        var tempItem = new qx.ui.form.ListItem("Item " + i);
        // enable every fifth element
        if (i % 5 == 1) {
          tempItem.setEnabled(false);
        }
        selectBox5.add(tempItem);
      }
      this.getRoot().add(selectBox5, {left: 410, top: 40});
      ///////////////////////////////////////////////////////////////
    }
  }
});
