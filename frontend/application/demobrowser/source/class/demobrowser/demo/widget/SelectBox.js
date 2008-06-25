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

      this.addBox1();
      this.addBox2();
      this.addBox3();      
    },
    
    
    addBox1 : function()
    {
      this.getRoot().add(new qx.ui.basic.Label("Simple"), {left: 25, top: 20});
      
      var selectBox = new qx.ui.form.SelectBox();
      for (var i=0; i<30; i++) 
      {
        var tempItem = new qx.ui.form.ListItem("Item " + (i+1));
        selectBox.add(tempItem);

        // select sixth item
        if (i == 5) {
          selectBox.setSelectedItem(tempItem);
        }
      }
      this.getRoot().add(selectBox, {left: 20, top: 40});
    },
    
    
    addBox2 : function()
    {
      this.getRoot().add(new qx.ui.basic.Label("Long text"), {left: 175, top: 20});
      
      var selectBox = new qx.ui.form.SelectBox();
      for (var i=0; i<30; i++) 
      {
        var tempItem = new qx.ui.form.ListItem("Random Value " + Math.round(Math.random()*100000000));
        selectBox.add(tempItem);
        // select sixth item
        if (i == 5) {
          selectBox.setSelectedItem(tempItem);
        }
      }
      this.getRoot().add(selectBox, {left: 170, top: 40});      
    },


    addBox3 : function()
    {
      this.getRoot().add(new qx.ui.basic.Label("With icons"), {left: 335, top: 20});
      
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

      this.getRoot().add(selectBox, {left: 330, top: 40});      
    }
  }
});
