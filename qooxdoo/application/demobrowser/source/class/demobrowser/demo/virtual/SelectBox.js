/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

/* ************************************************************************

#asset(qx/icon/${qx.icontheme}/16/devices/*)

************************************************************************ */

qx.Class.define("demobrowser.demo.virtual.SelectBox",
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

      // Creates the model data
      var model = new qx.data.Array();
      for (var i = 0; i < 300; i++) {
        model.push("Item " + (i+1));
      }

      // Creates the select box
      var selectBox = new qx.ui.form.VirtualSelectBox(model);
      container.add(selectBox);

      // Pre-Select "Item No 6"
      selectBox.getSelection().push(model.getItem(5));

      // log all changes on the selection
      selectBox.getSelection().addListener("change", function(e) {
        this.debug("Change selection: ", selectBox.getSelection().getItem(0));
      });


      return container;
    },


    createBox2 : function()
    {
      var container = new qx.ui.container.Composite(new qx.ui.layout.VBox(2));
      container.add(new qx.ui.basic.Label("Long text"));

      // Creates the model data
      var model = new qx.data.Array();
      for (var i = 0; i < 300; i++) {
        model.push("Random Value " + Math.round(Math.random()*100000000));
      }

      // Creates the select box
      var selectBox = new qx.ui.form.VirtualSelectBox(model);
      container.add(selectBox);

      return container;
    },


    createBox3 : function()
    {
      var container = new qx.ui.container.Composite(new qx.ui.layout.VBox(2));
      container.add(new qx.ui.basic.Label("With icons"));

      var iconNames = [ "audio-card", "audio-input-microphone", "battery",
                        "camera-photo","camera-web","computer","display",
                        "drive-harddisk","drive-optical","input-keyboard",
                        "input-mouse","media-flash","media-optical","multimedia-player",
                        "network-wired","network-wireless","pda","phone","printer" ];

      var iconPrefix = "icon/16/devices/";
      var iconPostfix = ".png";

      // Creates row model data
      var rawData = [];
      for (var i = 0; i < iconNames.length; i++) {
        rawData.push({
          label: iconNames[i],
          icon: iconPrefix + iconNames[i] + iconPostfix 
        });
      }

      // Creates the model data
      var model = qx.data.marshal.Json.createModel(rawData);

      // Creates the select box
      var selectBox = new qx.ui.form.VirtualSelectBox(model).set({
        labelPath: "label",
        iconPath: "icon"
      });
      container.add(selectBox);

      return container;
    },


    createBox4 : function()
    {
      var container = new qx.ui.container.Composite(new qx.ui.layout.VBox(2));
      container.add(new qx.ui.basic.Label("Empty Item"));

      // Creates the model data
      var model = new qx.data.Array();
      model.push("");

      for (var i = 0; i < 300; i++) {
        model.push("Option " + (i+1));
      }

      // Creates the select box
      var selectBox = new qx.ui.form.VirtualSelectBox(model);
      container.add(selectBox);

      return container;
    }
  }
});
