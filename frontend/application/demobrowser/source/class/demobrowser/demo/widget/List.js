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

#asset(qx/icon/Oxygen/16/places/folder.png)
#asset(qx/icon/Oxygen/48/places/folder.png)
#asset(qx/icon/Oxygen/48/devices/*)

************************************************************************ */

qx.Class.define("demobrowser.demo.widget.List",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var l1 = new qx.ui.form.List;

      l1.set({ height: 300, width: 150, selectionMode : "multi" });

      var item;
      for( var i=1; i<=25; i++ )
      {
        item = new qx.ui.form.ListItem("Item No " + i, "icon/" + ((i % 4) ? "16" : "48") + "/places/folder.png");

        !(i % 9) && (item.setEnabled(false));
        l1.add(item);
      };

      this.getRoot().add(l1, {left: 20, top: 20});






      var l2 = new qx.ui.form.List;

      l2.set({ width: 150, selectionMode : "single", spacing : 1 });

      var l2l = [ "black", "silver", "gray", "maroon",
        "red", "purple", "fuchsia", "green", "lime", "olive",
        "yellow", "navy", "blue", "teal", "aqua", "magenta",
        "orange", "brown" ];

      var decorator = new qx.ui.decoration.Uniform();
      decorator.set({width:1, style:"solid", color:"#898989"});

      var item2;
      for (var i=0; i<l2l.length; i++)
      {
        item2 = new qx.ui.form.ListItem(l2l[i]);
        //item2.setTextColor(l2l[i]);
        //item2.setHeight(20+Math.round(Math.random()*50));
        //item2.setDecorator(decorator);

        l2.add(item2);
      };

      this.getRoot().add(l2, {left: 400, top: 120});





      var l3 = new qx.ui.form.List;

      l3.set({ width: 150, selectionMode : "additive" });

      var l3l = [ "Leon","Lukas","Luca","Finn","Tim","Felix","Jonas","Luis",
      "Maximilian","Julian","Max","Paul","Niclas","Jan","Ben","Elias","Jannick",
      "Philipp","Noah","Tom","Moritz","Nico","David","Nils","Simon","Fabian",
      "Erik","Justin","Alexander","Jakob","Florian","Nick","Linus","Mika","Jason",
      "Daniel","Lennard","Marvin","Jannis","Tobias","Dominic","Marlon","Marc",
      "Johannes","Jonathan","Julius","Colin","Joel","Kevin","Vincent","Robin"];

      for (var i=0; i<l3l.length; i++) {
        l3.add(new qx.ui.form.ListItem(l3l[i]));
      };

      this.getRoot().add(l3, {left: 600, top: 120});





      var l4 = new qx.ui.form.List(true);

      l4.set({ width: 550, selectionMode : "multi", height : null });

      var l4l = [ "audio-card.png","audio-input-microphone.png","battery.png",
      "camera-photo.png","camera-web.png","computer.png","display.png",
      "drive-harddisk.png","drive-optical.png","input-keyboard.png",
      "input-mouse.png","media-flash.png","media-optical.png","multimedia-player.png",
      "network-wired.png","network-wireless.png","pda.png","phone.png","printer.png" ];

      var l4pre = "icon/48/devices/"

      for (var i=0; i<l4l.length; i++) {
        l4.add(new qx.ui.form.ListItem(null, l4pre + l4l[i]));
      };

      this.getRoot().add(l4, {left: 20, top: 370});





      var mode1 = new qx.ui.form.RadioButton("Single Selection");
      var mode2 = new qx.ui.form.RadioButton("Multi Selection");
      var mode3 = new qx.ui.form.RadioButton("Additive Selection");

      mode1.setValue("single");
      mode2.setValue("multi");
      mode3.setValue("additive");

      mode2.setChecked(true);

      this.getRoot().add(mode1, {left: 180, top: 20});
      this.getRoot().add(mode2, {left: 180, top: 40});
      this.getRoot().add(mode3, {left: 180, top: 60});

      var rbm = new qx.ui.core.RadioManager(mode1, mode2, mode3);

      rbm.addListener("change", function(e) {
        l1.setSelectionMode(e.getValue().getValue());
      });





      var show1 = new qx.ui.form.RadioButton("Show Label");
      var show2 = new qx.ui.form.RadioButton("Show Icon");
      var show3 = new qx.ui.form.RadioButton("Show Both");

      show1.setValue("label");
      show2.setValue("icon");
      show3.setValue("both");

      show3.setChecked(true);

      this.getRoot().add(show1, {left: 180, top: 100});
      this.getRoot().add(show2, {left: 180, top: 120});
      this.getRoot().add(show3, {left: 180, top: 140});

      var rbm = new qx.ui.core.RadioManager(show1, show2, show3);

      rbm.addListener("change", function(e)
      {
        for( var i=0; i<l1.getChildren().length; i++ ) {
          l1.getChildren()[i].setShow(e.getValue().getValue());
        }
      });




      var drag1 = new qx.ui.form.CheckBox("Enable drag selection");
      drag1.setChecked(true);

      this.getRoot().add(drag1, {left: 180, top: 180});

      drag1.addListener("change", function(e) {
        l1.setDragSelection(e.getValue());
      });
    }
  }
});
