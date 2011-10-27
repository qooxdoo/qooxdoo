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
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/* ************************************************************************

#asset(qx/icon/${qx.icontheme}/16/places/folder.png)
#asset(qx/icon/${qx.icontheme}/48/places/folder.png)
#asset(qx/icon/${qx.icontheme}/48/devices/*)

************************************************************************ */

qx.Class.define("demobrowser.demo.widget.List",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      // scroll container
      var scroller = new qx.ui.container.Scroll();
      var container = new qx.ui.container.Composite(new qx.ui.layout.Basic());
      container.setAllowStretchX(false);
      scroller.add(container);
      this.getRoot().add(scroller, {edge : 0});

      ////////////////////////////////////////////////////////////////
      // Configurable list
      var configureLabel = new qx.ui.basic.Label("Configurable");
      configureLabel.setFont("bold");
      container.add(configureLabel, {left: 20, top: 20});

      var configList = new qx.ui.form.List;
      configList.setScrollbarX("on");

      configList.set({ height: 280, width: 150, selectionMode : "multi" });

      var item;
      for( var i=1; i<=25; i++ )
      {
        item = new qx.ui.form.ListItem("Item No " + i, "icon/" + ((i % 4) ? "16" : "48") + "/places/folder.png");
        configList.add(item);

        !(i % 9) && (item.setEnabled(false));

        // Pre-Select "Item No 20"
        if (i==20) {
          configList.setSelection([item]);
        }
      };

      configList.addListener("changeSelection", function(e) {
        var selection = e.getData();
        if (selection[0]) {
          this.debug("Value: " + selection[0].getLabel());
        }
      });

      container.add(configList, {left: 20, top: 40});

      // Configure Elements
      var mode1 = new qx.ui.form.RadioButton("Single Selection");
      var mode2 = new qx.ui.form.RadioButton("Multi Selection");
      var mode3 = new qx.ui.form.RadioButton("Additive Selection");
      var mode4 = new qx.ui.form.RadioButton("One Selection");

      mode1.setUserData("value", "single");
      mode2.setUserData("value", "multi");
      mode3.setUserData("value", "additive");
      mode4.setUserData("value", "one");

      mode2.setValue(true);

      container.add(mode1, {left: 180, top: 40});
      container.add(mode2, {left: 180, top: 60});
      container.add(mode3, {left: 180, top: 80});
      container.add(mode4, {left: 180, top: 100});

      var rbm1 = new qx.ui.form.RadioGroup(mode1, mode2, mode3, mode4);

      var show1 = new qx.ui.form.RadioButton("Show Label");
      var show2 = new qx.ui.form.RadioButton("Show Icon");
      var show3 = new qx.ui.form.RadioButton("Show Both");

      show1.setUserData("value", "label");
      show2.setUserData("value", "icon");
      show3.setUserData("value", "both");

      show3.setValue(true);

      container.add(show1, {left: 180, top: 140});
      container.add(show2, {left: 180, top: 160});
      container.add(show3, {left: 180, top: 180});

      var rbm2 = new qx.ui.form.RadioGroup(show1, show2, show3);

      rbm2.addListener("changeSelection", function(e)
      {
        for (var i = 0; i < configList.getChildren().length; i++) {
          configList.getChildren()[i].setShow(e.getData()[0].getUserData("value"));
        }
      });

      var dragCheck = new qx.ui.form.CheckBox("Enable drag selection");
      var quickCheck = new qx.ui.form.CheckBox("Enable quick selection").set({enabled : false});

      container.add(dragCheck, {left: 180, top: 220});
      container.add(quickCheck, {left: 180, top: 240});

      dragCheck.addListener("changeValue", function(e)
      {
        if (e.getData())
        {
          var mode = configList.getSelectionMode();
          if (mode == "single" || mode == "one") {
            this.debug("Drag selection is only available for the modes multi or additive");
          }
        }

        configList.setDragSelection(e.getData());
      });

      quickCheck.addListener("changeValue", function(e)
      {
        if (e.getData())
        {
          var mode = configList.getSelectionMode();
          if (mode == "multi" || mode == "additive") {
            this.debug("Quick selection is only available for the modes multi or additive");
          }
        }

        configList.setQuickSelection(e.getData());
      });

      rbm1.addListener("changeSelection", function(e)
      {
        var value = e.getData()[0].getUserData("value");
        configList.setSelectionMode(value);

        if (value == "single" || value == "one")
        {
          dragCheck.setEnabled(false);
          quickCheck.setEnabled(true);
        }
        else if (value == "multi" || value == "addaptive")
        {
          dragCheck.setEnabled(true);
          quickCheck.setEnabled(false);
        }

      });

      ////////////////////////////////////////////////////////////////



      ////////////////////////////////////////////////////////////////
      // Selection mode "one" demo list
      var oneLabel = new qx.ui.basic.Label("One as selection mode");
      oneLabel.setFont("bold");
      container.add(oneLabel, {left: 330, top: 20});

      var oneList = new qx.ui.form.List();
      oneList.set({ height: 280, width: 150, selectionMode : "one" });
      var item;
      for( var i=1; i<=25; i++ )
      {
        item = new qx.ui.form.ListItem("Item No " + i, "icon/16/places/folder.png");
        oneList.add(item);

        // Pre-Select "Item No 16"
        if (i==16) {
          oneList.setSelection([item]);
        }
      };

      container.add(oneList, {left: 330, top: 40});
      ////////////////////////////////////////////////////////////////



      ////////////////////////////////////////////////////////////////

      // additive selecion list
      var configureLabel = new qx.ui.basic.Label("Additive selection");
      configureLabel.setFont("bold");
      container.add(configureLabel, {left: 520, top: 20});

      var additiveList = new qx.ui.form.List;
      var item3;

      additiveList.set({ width: 150, selectionMode : "additive" });

      var l3l = [ "Leon","Lukas","Luca","Finn","Tim","Felix","Jonas","Luis",
      "Maximilian","Julian","Max","Paul","Niclas","Jan","Ben","Elias","Jannick",
      "Philipp","Noah","Tom","Moritz","Nico","David","Nils","Simon","Fabian",
      "Erik","Justin","Alexander","Jakob","Florian","Nick","Linus","Mika","Jason",
      "Daniel","Lennard","Marvin","Jannis","Tobias","Dominic","Marlon","Marc",
      "Johannes","Jonathan","Julius","Colin","Joel","Kevin","Vincent","Robin"];

      for (var i=0; i<l3l.length; i++)
      {
        item3 = new qx.ui.form.ListItem(l3l[i]);
        additiveList.add(item3);

        if (i==10||i==12||i==16) {
          additiveList.addToSelection(item3);
        }
      };

      container.add(additiveList, {left: 520, top: 40});
      ////////////////////////////////////////////////////////////////




      ////////////////////////////////////////////////////////////////
      // Horizontal list
      var configureLabel = new qx.ui.basic.Label("Horizontal, Icons only");
      configureLabel.setFont("bold");
      container.add(configureLabel, {left: 20, top: 350});

      var l4 = new qx.ui.form.List(true);
      var item4;

      l4.set({ width: 550, selectionMode : "multi", height : null });

      var l4l = [ "audio-card.png","audio-input-microphone.png","battery.png",
      "camera-photo.png","camera-web.png","computer.png","display.png",
      "drive-harddisk.png","drive-optical.png","input-keyboard.png",
      "input-mouse.png","media-flash.png","media-optical.png","multimedia-player.png",
      "network-wired.png","network-wireless.png","pda.png","phone.png","printer.png" ];

      var l4pre = "icon/48/devices/"

      for (var i=0; i<l4l.length; i++)
      {
        item4 = new qx.ui.form.ListItem(null, l4pre + l4l[i]);
        l4.add(item4);

        if (i == 12) {
          l4.setSelection([item4]);
        }
      };

      container.add(l4, {left: 20, top: 370});
      ////////////////////////////////////////////////////////////////


    }
  }
});
