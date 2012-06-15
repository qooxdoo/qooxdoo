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
#asset(qx/icon/${qx.icontheme}/16/apps/internet-telephony.png)
#asset(qx/icon/${qx.icontheme}/22/apps/utilities-calculator.png)
#asset(qx/icon/${qx.icontheme}/32/status/dialog-error.png)
#asset(qx/icon/${qx.icontheme}/16/actions/dialog-ok.png)
#asset(qx/icon/${qx.icontheme}/16/actions/dialog-cancel.png)

************************************************************************ */
/**
 * @tag showcase
 */
qx.Class.define("demobrowser.demo.widget.Window",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      this.createWindow1();
      this.createWindow2();
      this.createWindow3();
    },


    createWindow1 : function()
    {
      // Create the Window
      var win = new qx.ui.window.Window("First Window", "icon/16/apps/office-calendar.png");
      win.setLayout(new qx.ui.layout.VBox(10));
      win.setShowStatusbar(true);
      win.setStatus("Demo loaded");
      win.open();
      this.getRoot().add(win, {left:20, top:20});

      // Test for move listener
      win.addListener("move", function(e) {
        this.debug("Moved to: " + e.getData().left + "x" + e.getData().top);
      }, this);

      // Test for resize listener
      win.addListener("resize", function(e) {
        this.debug("Resized to: " + e.getData().width + "x" + e.getData().height);
      }, this);

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
      win.setStatus("Application is ready");
      win.open();
      this.getRoot().add(win, {left:350, top:120});

      var atom = new qx.ui.basic.Atom("The second window", "icon/22/apps/utilities-calculator.png");
      win.add(atom);


      var box = new qx.ui.container.Composite;
      box.setLayout(new qx.ui.layout.HBox(10));
      win.add(box, {flex:1});



      var basicSettings = new qx.ui.groupbox.GroupBox("Basics");
      basicSettings.setLayout(new qx.ui.layout.VBox(4));
      box.add(basicSettings, {flex:1});



      var showClose = new qx.ui.form.CheckBox("Show Close");
      showClose.setValue(true);
      showClose.addListener("changeValue", function(e) {
        win.setShowClose(e.getData());
      });
      basicSettings.add(showClose);

      var showMaximize = new qx.ui.form.CheckBox("Show Maximize");
      showMaximize.setValue(true);
      showMaximize.addListener("changeValue", function(e) {
        win.setShowMaximize(e.getData());
      });
      basicSettings.add(showMaximize);

      var showMinimize = new qx.ui.form.CheckBox("Show Minimize");
      showMinimize.setValue(true);
      showMinimize.addListener("changeValue", function(e) {
        win.setShowMinimize(e.getData());
      });
      basicSettings.add(showMinimize);



      var allowClose = new qx.ui.form.CheckBox("Allow Close");
      allowClose.setValue(true);
      allowClose.addListener("changeValue", function(e) {
        win.setAllowClose(e.getData());
      });
      basicSettings.add(allowClose);

      var allowMaximize = new qx.ui.form.CheckBox("Allow Maximize");
      allowMaximize.setValue(true);
      allowMaximize.addListener("changeValue", function(e) {
        win.setAllowMaximize(e.getData());
      });
      basicSettings.add(allowMaximize);

      var allowMinimize = new qx.ui.form.CheckBox("Allow Minimize");
      allowMinimize.setValue(true);
      allowMinimize.addListener("changeValue", function(e) {
        win.setAllowMinimize(e.getData());
      });
      basicSettings.add(allowMinimize);



      var showStatusbar = new qx.ui.form.CheckBox("Show Statusbar");
      showStatusbar.setValue(false);
      showStatusbar.addListener("changeValue", function(e) {
        win.setShowStatusbar(e.getData());
      });
      basicSettings.add(showStatusbar);



      var resize = new qx.ui.groupbox.GroupBox("Resizable");
      resize.setLayout(new qx.ui.layout.VBox(4));
      box.add(resize, {flex:1});

      var resizeFrame = new qx.ui.form.CheckBox("Use resize frame");
      resizeFrame.setValue(true);
      resizeFrame.addListener("changeValue", function(e) {
        win.setUseResizeFrame(e.getData());
      });
      resize.add(resizeFrame);

      var edges = ["top", "right", "bottom", "left"];
      for (var i=0; i<edges.length; i++)
      {
        var edge = edges[i];
        var resizable = new qx.ui.form.CheckBox("Resizable " + edge).set({
          value: true
        });
        resizable.bind("value", win, "resizable" + qx.lang.String.firstUp(edge));
        resize.add(resizable);
      }

      var move = new qx.ui.groupbox.GroupBox("Moveable");
      move.setLayout(new qx.ui.layout.VBox(4));
      box.add(move, {flex:1});

      var movable = new qx.ui.form.CheckBox("Movable");
      movable.setValue(true);
      movable.addListener("changeValue", function(e) {
        win.setMovable(e.getData());
      });
      move.add(movable);

      var moveFrame = new qx.ui.form.CheckBox("Use move frame");
      moveFrame.addListener("changeValue", function(e) {
        win.setUseMoveFrame(e.getData());
      });
      move.add(moveFrame);
    },


    createWindow3 : function()
    {
      var win = new qx.ui.window.Window("Third Window", "icon/16/apps/internet-telephony.png");
      win.setLayout(new qx.ui.layout.VBox);
      win.setMinWidth(200);
      win.setMaxWidth(450);
      win.setMaxHeight(400);
      win.setAllowMaximize(false);
      win.open();
      this.getRoot().add(win, {left:100, top:250});

      var wm1 = this.getModalWindow1();
      var btn1 = new qx.ui.form.Button("Open Modal Dialog 1", "icon/16/apps/office-calendar.png");
      btn1.addListener("execute", wm1.open, wm1);
      win.add(btn1);
    },


    getModalWindow1 : function()
    {
      var wm1 = new qx.ui.window.Window("First Modal Dialog");
      wm1.setLayout(new qx.ui.layout.VBox(10));
      wm1.setModal(true);
      wm1.moveTo(150, 150);
      this.getRoot().add(wm1);

      var wm2 = this.getModalWindow2();

      var btn2 = new qx.ui.form.Button("Open Modal Dialog 2", "icon/16/apps/office-calendar.png");
      btn2.addListener("execute", wm2.open, wm2);
      wm1.add(btn2);

      var chkm1 = new qx.ui.form.CheckBox("Modal");
      chkm1.setValue(true);
      wm1.add(chkm1);

      chkm1.addListener("changeValue", function(e) {
        wm1.setModal(e.getData());
      });

      return wm1;
    },


    /**
     *
     * @return {qx.ui.window.Window} modal window
     * @lint ignoreDeprecated(alert)
     */
    getModalWindow2 : function()
    {
      var wm2 = new qx.ui.window.Window("Second Modal Dialog");
      wm2.setLayout(new qx.ui.layout.VBox(10));
      wm2.setModal(true);
      wm2.setShowClose(false);
      wm2.moveTo(300, 300);
      this.getRoot().add(wm2);

      var warn1 = new qx.ui.basic.Atom("Do you want to fly to Berlin?", "icon/32/status/dialog-error.png");
      wm2.add(warn1);

      var box = new qx.ui.container.Composite;
      box.setLayout(new qx.ui.layout.HBox(10, "right"));
      wm2.add(box);

      var btn3 = new qx.ui.form.Button("Yes", "icon/16/actions/dialog-ok.png");
      btn3.addListener("execute", function(e) {
        wm2.close();
      });
      box.add(btn3);

      var btn4 = new qx.ui.form.Button("No", "icon/16/actions/dialog-cancel.png");
      btn4.addListener("execute", function(e) {
        alert("Sorry, please click 'Yes'!");
      });
      box.add(btn4);

      return wm2;
    }
  }
});
