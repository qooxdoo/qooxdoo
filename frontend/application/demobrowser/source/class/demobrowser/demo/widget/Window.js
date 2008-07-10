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

#asset(qx/icon/${qx.icontheme}/16/apps/office-calendar.png)
#asset(qx/icon/${qx.icontheme}/32/apps/office-address-book.png)
#asset(qx/icon/${qx.icontheme}/16/apps/internet-feed-reader.png)
#asset(qx/icon/${qx.icontheme}/22/apps/accessories-calculator.png)
#asset(qx/icon/${qx.icontheme}/16/actions/system-run.png)
#asset(qx/icon/${qx.icontheme}/16/apps/internet-telephony.png)
#asset(qx/icon/${qx.icontheme}/16/apps/office-database.png)
#asset(qx/icon/${qx.icontheme}/32/status/dialog-error.png)
#asset(qx/icon/${qx.icontheme}/16/actions/dialog-ok.png)
#asset(qx/icon/${qx.icontheme}/16/actions/dialog-cancel.png)

************************************************************************ */

qx.Class.define("demobrowser.demo.widget.Window",
{
  extend : qx.application.Standalone,

  members :
  {
    createWindow1 : function()
    {
      var w1 = new qx.ui.window.Window("First Window", "icon/16/apps/office-calendar.png");
      w1.setLayout(new qx.ui.layout.VBox);
      this.getRoot().add(w1, {left:20, top:20});

      var a1 = new qx.ui.basic.Atom("Welcome to your first own Window.<br/>Have fun!", "icon/32/apps/office-address-book.png");
      a1.setRich(true);
      w1.add(a1);

      var tf1 = new qx.ui.tabview.TabView;

      var p1_1 = new qx.ui.tabview.Page("Page 1");
      var p1_2 = new qx.ui.tabview.Page("Page 2");
      var p1_3 = new qx.ui.tabview.Page("Page 3");

      tf1.add(p1_1);
      tf1.add(p1_2);
      tf1.add(p1_3);

      w1.add(tf1);

      w1.open();
    },

    createWindow2 : function()
    {
      var w2 = new qx.ui.window.Window("Second Window", "icon/16/apps/internet-feed-reader.png");
      w2.setLayout(new qx.ui.layout.VBox);
      this.getRoot().add(w2, {left:250, top:120});
      w2.open();

      var at1 = new qx.ui.basic.Atom("Your second window", "icon/22/apps/accessories-calculator.png");
      w2.add(at1);







      var fs1 = new qx.ui.groupbox.GroupBox("Settings");


      var chk1 = new qx.ui.form.CheckBox("Show Icon");
      chk1.setChecked(true);
      chk1.addListener("changeChecked", function(e) {
        w2.setShowIcon(e.getData());
      });

      var chk2 = new qx.ui.form.CheckBox("Show Caption");
      chk2.setChecked(true);
      chk2.addListener("changeChecked", function(e) {
        w2.setShowCaption(e.getData());
      });



      var chk3 = new qx.ui.form.CheckBox("Resizeable");
      chk3.setChecked(true);
      chk3.addListener("changeChecked", function(e) {
        w2.setResizable(e.getData());
      });

      var chk4 = new qx.ui.form.CheckBox("Moveable");
      chk4.setChecked(true);
      chk4.addListener("changeChecked", function(e) {
        w2.setMoveable(e.getData());
      });



      var chk5 = new qx.ui.form.CheckBox("Show Close");
      chk5.setChecked(true);
      chk5.addListener("changeChecked", function(e) {
        w2.setShowClose(e.getData());
      });

      var chk6 = new qx.ui.form.CheckBox("Show Maximize/Restore");
      chk6.setChecked(true);
      chk6.addListener("changeChecked", function(e) {
        w2.setShowMaximize(e.getData());
      });

      var chk7 = new qx.ui.form.CheckBox("Show Minimize");
      chk7.setChecked(true);
      chk7.addListener("changeChecked", function(e) {
        w2.setShowMinimize(e.getData());
      });



      var chk8 = new qx.ui.form.CheckBox("Allow Close");
      chk8.setChecked(true);
      chk8.addListener("changeChecked", function(e) {
        w2.setAllowClose(e.getData());
      });

      var chk9 = new qx.ui.form.CheckBox("Allow Maximize");
      chk9.setChecked(true);
      chk9.addListener("changeChecked", function(e) {
        w2.setAllowMaximize(e.getData());
      });

      var chk10 = new qx.ui.form.CheckBox("Allow Minimize");
      chk10.setChecked(true);
      chk10.addListener("changeChecked", function(e) {
        w2.setAllowMinimize(e.getData());
      });





      var l1 = new qx.ui.basic.Atom("Move Method", "icon/16/actions/system-run.png");

      var rb1 = new qx.ui.form.RadioButton("Frame");
      var rb2 = new qx.ui.form.RadioButton("Opaque");
      var rb3 = new qx.ui.form.RadioButton("Translucent");

      var rbm1 = new qx.ui.form.RadioGroup(rb1, rb2, rb3);

      rbm1.addListener("changeSelected", function(e) {
        w2.setMoveMethod(e.getData().getValue());
      });



      var l2 = new qx.ui.basic.Atom("Resize Method", "icon/16/actions/system-run.png");

      var rb4 = new qx.ui.form.RadioButton("Frame");
      var rb5 = new qx.ui.form.RadioButton("Opaque");

      rb4.setChecked(true);

      var rbm2 = new qx.ui.form.RadioGroup(rb4, rb5);

      rbm2.addListener("changeSelected", function(e) {
        w2.setResizeMethod(e.getData().getValue());
      });




      var chk11 = new qx.ui.form.CheckBox("Show Statusbar");
      chk11.setChecked(false);
      chk11.addListener("changeChecked", function(e) {
        w2.setShowStatusbar(e.getData());
      });



      fs1.add(chk1, chk2, chk3, chk4, chk5, chk6, chk7, chk8, chk9, chk10, l1, rb1, rb2, rb3, l2, rb4, rb5, chk11);
      w2.add(fs1);



    },

    createWindow3 : function()
    {
      var w3 = new qx.ui.window.Window("Third Window", "icon/16/apps/internet-telephony.png");
      w3.setLayout(new qx.ui.layout.VBox);
      w3.setMaxWidth(450);
      w3.setMaxHeight(400);
      w3.open();
      this.getRoot().add(w3, {left:100, top:200});


      var wm1 = new qx.ui.window.Window("First Modal Dialog");
      wm1.setLayout(new qx.ui.layout.VBox);
      wm1.setModal(true);
      this.getRoot().add(wm1, {left:150, top:150});

      var btn1 = new qx.ui.form.Button("Open Modal Dialog 1", "icon/16/apps/office-database.png");
      w3.add(btn1);

      btn1.addListener("execute", function(e) {
        wm1.open();
      });

      var wm2 = new qx.ui.window.Window("Second Modal Dialog");
      wm2.setLayout(new qx.ui.layout.VBox);
      wm2.setModal(true);
      wm2.setShowClose(false);
      this.getRoot().add(wm2, {left:100, top:100});


      var btn2 = new qx.ui.form.Button("Open Modal Dialog 2", "icon/16/apps/office-database.png");
      wm1.add(btn2);

      btn2.addListener("execute", function(e) {
        wm2.open();
      });

      var chkm1 = new qx.ui.form.CheckBox("Modal");
      wm1.add(chkm1);

      chkm1.addListener("changeChecked", function(e) {
        wm1.setModal(e.getData());
      });

      var icon1 = new qx.ui.basic.Image("icon/32/status/dialog-error.png");
      var warn1 = new qx.ui.basic.Label("Do you want to fly to Rio?");

      var btn3 = new qx.ui.form.Button("Yes", "icon/16/actions/dialog-ok.png");
      var btn4 = new qx.ui.form.Button("No", "icon/16/actions/dialog-cancel.png");

      btn3.addListener("execute", function(e) {
        alert("Thank you!");
        wm2.close();
      });

      btn4.addListener("execute", function(e) {
        alert("Sorry, please click 'Yes'!");
      });

      wm2.add(btn3);
      wm2.add(btn4);
      wm2.add(icon1);
      wm2.add(warn1);
    },

    main: function()
    {
      this.base(arguments);

      this.createWindow1();
      this.createWindow2();
      this.createWindow3();
    }
  }
});
