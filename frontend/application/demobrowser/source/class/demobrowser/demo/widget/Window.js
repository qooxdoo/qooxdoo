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
#asset(qx/icon/${qx.icontheme}/22/apps/graphics-viewer.png)
#asset(qx/icon/${qx.icontheme}/22/apps/preferences-wallpaper.png)
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
      // Create the Window
      var win = new qx.ui.window.Window("First Window", "icon/16/apps/office-calendar.png");
      win.setLayout(new qx.ui.layout.VBox(10));
      win.setPadding(10);
      win.open();
      this.getRoot().add(win, {left:20, top:20});

      // Add an Atom
      var atom = new qx.ui.basic.Atom("Welcome to your first own Window.<br/>Have fun!", "icon/32/apps/office-address-book.png");
      atom.setRich(true);
      win.add(atom);

      // Add a TabView
      var tabView = new qx.ui.tabview.TabView;
      win.add(tabView, {flex:1});

      var page1 = new qx.ui.tabview.Page("Page 1");
      tabView.add(page1);

      var page2 = new qx.ui.tabview.Page("Page 2");
      tabView.add(page2);

      var page3 = new qx.ui.tabview.Page("Page 3");
      tabView.add(page3);
    },


    createWindow2 : function()
    {
      var win = new qx.ui.window.Window("Second Window", "icon/16/apps/internet-feed-reader.png");
      win.setLayout(new qx.ui.layout.VBox(10));
      win.setPadding(10);
      win.setStatus("Application is ready");
      win.open();
      this.getRoot().add(win, {left:350, top:120});

      var atom = new qx.ui.basic.Atom("The second window", "icon/22/apps/accessories-calculator.png");
      win.add(atom);


      var box = new qx.ui.container.Composite;
      box.setLayout(new qx.ui.layout.HBox(10));
      win.add(box, {flex:1});



      var basicSettings = new qx.ui.groupbox.GroupBox("Basics");
      basicSettings.setLayout(new qx.ui.layout.VBox(4));
      box.add(basicSettings, {flex:1});

      var resizeable = new qx.ui.form.CheckBox("Resizeable");
      resizeable.setChecked(true);
      resizeable.addListener("changeChecked", function(e) {
        win.setResizable(e.getData());
      });
      basicSettings.add(resizeable);

      var moveable = new qx.ui.form.CheckBox("Moveable");
      moveable.setChecked(true);
      moveable.addListener("changeChecked", function(e) {
        win.setMoveable(e.getData());
      });
      basicSettings.add(moveable);



      var showClose = new qx.ui.form.CheckBox("Show Close");
      showClose.setChecked(true);
      showClose.addListener("changeChecked", function(e) {
        win.setShowClose(e.getData());
      });
      basicSettings.add(showClose);

      var showMaximize = new qx.ui.form.CheckBox("Show Maximize");
      showMaximize.setChecked(true);
      showMaximize.addListener("changeChecked", function(e) {
        win.setShowMaximize(e.getData());
      });
      basicSettings.add(showMaximize);

      var showMinimize = new qx.ui.form.CheckBox("Show Minimize");
      showMinimize.setChecked(true);
      showMinimize.addListener("changeChecked", function(e) {
        win.setShowMinimize(e.getData());
      });
      basicSettings.add(showMinimize);



      var allowClose = new qx.ui.form.CheckBox("Allow Close");
      allowClose.setChecked(true);
      allowClose.addListener("changeChecked", function(e) {
        win.setAllowClose(e.getData());
      });
      basicSettings.add(allowClose);

      var allowMaximize = new qx.ui.form.CheckBox("Allow Maximize");
      allowMaximize.setChecked(true);
      allowMaximize.addListener("changeChecked", function(e) {
        win.setAllowMaximize(e.getData());
      });
      basicSettings.add(allowMaximize);

      var allowMinimize = new qx.ui.form.CheckBox("Allow Minimize");
      allowMinimize.setChecked(true);
      allowMinimize.addListener("changeChecked", function(e) {
        win.setAllowMinimize(e.getData());
      });
      basicSettings.add(allowMinimize);





      var showStatusbar = new qx.ui.form.CheckBox("Show Statusbar");
      showStatusbar.setChecked(false);
      showStatusbar.addListener("changeChecked", function(e) {
        win.setShowStatusbar(e.getData());
      });
      basicSettings.add(showStatusbar);




      var styleSettings = new qx.ui.groupbox.GroupBox("Style");
      styleSettings.setLayout(new qx.ui.layout.VBox(4));
      box.add(styleSettings, {flex:1});


      var moveLabel = new qx.ui.basic.Atom("Move Method", "icon/22/apps/graphics-viewer.png");
      styleSettings.add(moveLabel);

      var moveFrame = new qx.ui.form.RadioButton("Frame");
      moveFrame.setValue("frame");
      styleSettings.add(moveFrame);

      var moveOpaque = new qx.ui.form.RadioButton("Opaque");
      moveOpaque.setValue("opaque");
      styleSettings.add(moveOpaque);

      var moveTranslucent = new qx.ui.form.RadioButton("Translucent");
      moveTranslucent.setValue("translucent");
      styleSettings.add(moveTranslucent);

      var rbm1 = new qx.ui.form.RadioGroup(moveFrame, moveOpaque, moveTranslucent);
      rbm1.addListener("changeValue", function(e) {
        win.setMoveMethod(e.getData());
      });



      var resizeLabel = new qx.ui.basic.Atom("Resize Method", "icon/22/apps/preferences-wallpaper.png");
      resizeLabel.setMarginTop(20);
      styleSettings.add(resizeLabel);

      var resizeFrame = new qx.ui.form.RadioButton("Frame");
      resizeFrame.setValue("frame");
      resizeFrame.setChecked(true);
      styleSettings.add(resizeFrame);

      var resizeOpaque = new qx.ui.form.RadioButton("Opaque");
      resizeFrame.setValue("opaque");
      styleSettings.add(resizeOpaque);

      var rbm2 = new qx.ui.form.RadioGroup(resizeFrame, resizeOpaque);
      rbm2.addListener("changeValue", function(e) {
        win.setResizeMethod(e.getData());
      });
    },


    createWindow3 : function()
    {
      var win = new qx.ui.window.Window("Third Window", "icon/16/apps/internet-telephony.png");
      win.setLayout(new qx.ui.layout.VBox);
      win.setMaxWidth(450);
      win.setMaxHeight(400);
      win.open();
      win.setPadding(10);
      this.getRoot().add(win, {left:100, top:250});




      var wm1 = new qx.ui.window.Window("First Modal Dialog");
      wm1.setLayout(new qx.ui.layout.VBox);
      // wm1.setModal(true);
      this.getRoot().add(wm1, {left:150, top:150});

      var btn1 = new qx.ui.form.Button("Open Modal Dialog 1", "icon/16/apps/office-database.png");
      btn1.addListener("execute", wm1.open, wm1);
      win.add(btn1);




      var wm2 = new qx.ui.window.Window("Second Modal Dialog");
      wm2.setLayout(new qx.ui.layout.VBox);
      // wm2.setModal(true);
      wm2.setShowClose(false);
      this.getRoot().add(wm2, {left:100, top:100});

      var btn2 = new qx.ui.form.Button("Open Modal Dialog 2", "icon/16/apps/office-database.png");
      btn2.addListener("execute", wm2.open, wm2);
      wm1.add(btn2);



      var chkm1 = new qx.ui.form.CheckBox("Modal");
      wm1.add(chkm1);

      chkm1.addListener("changeChecked", function(e) {
        wm1.setModal(e.getData());
      });

      var icon1 = new qx.ui.basic.Image("icon/32/status/dialog-error.png");
      wm2.add(icon1);

      var warn1 = new qx.ui.basic.Label("Do you want to fly to Rio?");
      wm2.add(warn1);

      var btn3 = new qx.ui.form.Button("Yes", "icon/16/actions/dialog-ok.png");
      btn3.addListener("execute", function(e)
      {
        alert("Thank you!");
        wm2.close();
      });
      wm2.add(btn3);

      var btn4 = new qx.ui.form.Button("No", "icon/16/actions/dialog-cancel.png");
      btn4.addListener("execute", function(e) {
        alert("Sorry, please click 'Yes'!");
      });
      wm2.add(btn4);
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
