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

#asset(qx/icon/${qx.icontheme}/16/devices/*)

************************************************************************ */

qx.Class.define("demobrowser.demo.widget.SelectBox",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var scroller = new qx.ui.container.Scroll();

      var box = new qx.ui.container.Composite(new qx.ui.layout.HBox(50));
      box.setPadding(20);

      box.add(this.createBox1());
      box.add(this.createBox2());
      box.add(this.createBox3());
      box.add(this.createBox4());

      scroller.add(box, {left : 20, top : 20});
      this.getRoot().add(scroller, {edge : 0});
    },


    createBox1 : function()
    {
      var container = new qx.ui.container.Composite(new qx.ui.layout.VBox(2));
      container.add(new qx.ui.basic.Label("Simple"));

      var selectBox = new qx.ui.form.SelectBox();
      for (var i=0; i<30; i++)
      {
        var tempItem = new qx.ui.form.ListItem("Item " + (i+1));
        selectBox.add(tempItem);

        // select sixth item
        if (i == 5) {
          selectBox.setSelection([tempItem]);
        }
      }

      selectBox.addListener("changeSelection", function(e) {
        this.debug("changeSelection: " + e.getData()[0]);
      });

      container.add(selectBox);

      return container;
    },


    createBox2 : function()
    {
      var container = new qx.ui.container.Composite(new qx.ui.layout.VBox(2));

      container.add(new qx.ui.basic.Label("Long text"));

      var selectBox = new qx.ui.form.SelectBox();
      for (var i=0; i<30; i++)
      {
        var tempItem = new qx.ui.form.ListItem("Random Value " + Math.round(Math.random()*100000000));
        selectBox.add(tempItem);
      }

      container.add(selectBox);

      return container;
    },


    createBox3 : function()
    {
      var container = new qx.ui.container.Composite(new qx.ui.layout.VBox(2));

      container.add(new qx.ui.basic.Label("With icons"));

      var iconNames = [ "audio-card.png","audio-input-microphone.png","battery.png",
      "camera-photo.png","camera-web.png","computer.png","display.png",
      "drive-harddisk.png","drive-optical.png","input-keyboard.png",
      "input-mouse.png","media-flash.png","media-optical.png","multimedia-player.png",
      "network-wired.png","network-wireless.png","pda.png","phone.png","printer.png" ];

      var iconNamesPrefix = "icon/16/devices/"

      var selectBox = new qx.ui.form.SelectBox();
      for (var i=0; i<iconNames.length; i++) {
        var tempItem = new qx.ui.form.ListItem(iconNames[i].substr(0, iconNames[i].indexOf(".")), iconNamesPrefix + iconNames[i]);
        selectBox.add(tempItem);
      }

      container.add(selectBox);

      return container;
    },


    createBox4 : function()
    {
      var container = new qx.ui.container.Composite(new qx.ui.layout.VBox(2));
      container.add(new qx.ui.basic.Label("Empty Item"));

      var selectBox = new qx.ui.form.SelectBox();
      selectBox.add(new qx.ui.form.ListItem(""));

      for (var i=0; i<10; i++) {
        selectBox.add(new qx.ui.form.ListItem("Option " + (i+1)));
      }

      container.add(selectBox);
      return container;
    }
  }
});
