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
   * Fabian Jakobs (fjakobs)
   * Jonathan Weiß (jonathan_rass)

************************************************************************ */

/* ************************************************************************

#asset(qx/icon/${qx.icontheme}/16/actions/list-add.png)

************************************************************************ */

/**
 * @tag showcase
 * @tag noPlayground
 */
qx.Class.define("demobrowser.demo.virtual.Messenger",
{
  extend : qx.application.Standalone,



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __addUserDialog : null,
    messenger : null,
    __tfUsername : null,

    main : function()
    {
      this.base(arguments);

      var doc = this.getRoot();

      // Create widget window
      var win = new qx.ui.window.Window("Contacts").set({
        contentPadding: 0,
        showClose: false,
        showMinimize: false
      });

      var layout = new qx.ui.layout.VBox();
      layout.setSeparator("separator-vertical")
      win.setLayout(layout);

      win.moveTo(250, 20);
      win.open();

      this.messenger = new demobrowser.demo.virtual.messenger.Roster();
      var model = demobrowser.demo.virtual.messenger.BuddyModel.createBuddies(200);
      this.messenger.setModel(model);

      win.add(this.createToolbar());
      win.add(this.messenger, {flex: 1});

      doc.add(this.createDetailsView(), {left: 20, top: 20});
    },


    createToolbar : function()
    {
      var toolbar = new qx.ui.toolbar.ToolBar();

      var part = new qx.ui.toolbar.Part();
      toolbar.add(part);

      var addButton = new qx.ui.toolbar.Button(
        "", "demobrowser/demo/icons/imicons/user_add.png"
      ).set({
        show: "icon"
      });
      addButton.addListener("execute", this.showAddContactWindow, this);
      part.add(addButton);


      var delButton = new qx.ui.toolbar.Button(
        "", "demobrowser/demo/icons/imicons/user_delete.png"
      ).set({
        show: "icon"
      });

      this.messenger.bind("selection[0]", delButton, "enabled", {
        converter : function(value) {
          return !!value;
        }
      });

      delButton.addListener("execute", function() {
        this.messenger.getModel().remove(this.messenger.getSelection().getItem(0));
      }, this);
      part.add(delButton);

      return part;
    },


    createDetailsView : function()
    {
      var controller = new qx.data.controller.Object();
      this.messenger.bind("selection[0]", controller, "model");

      var box = new qx.ui.groupbox.GroupBox("Contact Details");
      var grid = new qx.ui.layout.Grid(5, 5);
      grid.setColumnAlign(0, "right", "middle");
      box.setLayout(grid);

      box.add(new qx.ui.basic.Label("Name: "), {row: 0, column: 0});
      var inpName = new qx.ui.form.TextField();
      controller.addTarget(inpName, "value", "name", true);
      box.add(inpName, {row: 0, column:1});

      box.add(new qx.ui.basic.Label("Group: "), {row: 1, column: 0});
      var inpGroup = new qx.ui.form.TextField();
      controller.addTarget(inpGroup, "value", "group", true);
      box.add(inpGroup, {row: 1, column:1});

      box.add(new qx.ui.basic.Label("Status: "), {row: 2, column: 0});
      var inpStatus = new qx.ui.form.SelectBox();
      inpStatus.add(new qx.ui.form.ListItem("online").set({model: "online"}));
      inpStatus.add(new qx.ui.form.ListItem("away").set({model: "away"}));
      inpStatus.add(new qx.ui.form.ListItem("busy").set({model: "busy"}));
      inpStatus.add(new qx.ui.form.ListItem("offline").set({model: "offline"}));
//      controller.addTarget(inpStatus, "value", "status", true);

      this.messenger.bind(
        "selection[0].status", inpStatus, 
        "modelSelection",
        {
          converter: function(data) {
            return [data]
          } 
        }
      );      

      inpStatus.bind("selection", this.messenger, "selection[0].status", {
        converter : function(data) {
          return data[0].getModel();
        }
      });

      box.add(inpStatus, {row: 2, column:1});

      box.add(new qx.ui.basic.Label("Avatar: ").set({
        alignY: "top"
      }), {row: 3, column: 0});
      var inpAvatar = new qx.ui.basic.Image().set({
        alignX: "center"
      });
      controller.addTarget(inpAvatar, "source", "avatar");
      box.add(inpAvatar, {row: 3, column: 1});

      return box;
    },


    showAddContactWindow: function()
    {
      if (this.__addUserDialog == null)
      {
        var layout = new qx.ui.layout.Grid(5, 10);

        var win = new qx.ui.window.Window("Add user", "icon/16/actions/list-add.png");

        win.set({
          width : 165,
          height  : 100,
          showMinimize : false,
          showClose : false,
          showMaximize : false
        });

        win.setLayout(layout);

        var lblUsername = new qx.ui.basic.Label("Name:");
        var tfUsername = new qx.ui.form.TextField();
        var tfGroup = new qx.ui.form.ComboBox("New Group");
        tfGroup.add(new qx.ui.form.ListItem("qooxdoo"));
        tfGroup.add(new qx.ui.form.ListItem("Friends"));

        var lblGroup = new qx.ui.basic.Label("Group:");
        var btnAdd = new qx.ui.form.Button("Add");
        var btnCancel = new qx.ui.form.Button("Cancel");

        this.__tfUsername = tfUsername;

        btnAdd.setAllowGrowX(false);
        btnCancel.setAllowGrowX(false);

        win.addListener("appear", tfUsername.focus, tfUsername);

        btnCancel.addListener("execute", win.close, win);

        var addContact = function()
        {
          var buddy = new demobrowser.demo.virtual.messenger.BuddyModel();
          buddy.setName(tfUsername.getValue());
          buddy.setGroup(tfGroup.getValue());
          this.messenger.getModel().push(buddy);
          this.messenger.getSelection().setItem(0, buddy);
          win.close();
        }

        btnAdd.addListener("execute", addContact, this);
        win.addListener("keypress", function(e) {
          var key = e.getKeyIdentifier();
          if (key == "Enter") {
            addContact.call(this);
          } else if (key == "Escape") {
            win.close();
          }
        }, this);

        win.add(lblUsername, {row : 0, column : 0});
        win.add(tfUsername, {row : 0, column : 1, colSpan: 2});
        win.add(lblGroup, {row : 1, column : 0});
        win.add(tfGroup, {row : 1, column : 1, colSpan: 2});

        win.add(btnAdd, {row : 2, column : 1});
        win.add(btnCancel, {row : 2, column : 2});

        layout.setColumnAlign(0, "left", "middle");
        layout.setColumnAlign(1, "right", "middle");

        this.getRoot().add(win, {left:20, top:20});

        this.__addUserDialog = win;
      }

      this.__tfUsername.setValue("");
      this.__addUserDialog.center();
      this.__addUserDialog.open();
    },

    removeContact: function()
    {
      this.messenger.getModel().pop();
    }

  }
});
