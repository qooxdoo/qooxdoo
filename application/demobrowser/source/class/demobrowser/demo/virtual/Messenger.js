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

      this.messenger = new demobrowser.demo.virtual.messenger.Messenger();

      var btnAdd = new qx.ui.form.Button("Add a contact...");
      var btnRemove = new qx.ui.form.Button("Remove last contact");

      btnAdd.addListener("execute", this.showAddContactWindow, this);
      btnRemove.addListener("execute", this.removeContact, this);

      doc.add(btnAdd, {left : 20, top : 10});
      doc.add(btnRemove, {left : 20, top : 40});
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
        var tfUsername = new qx.ui.form.TextField;
        var btnAdd = new qx.ui.form.Button("Add");
        var btnCancel = new qx.ui.form.Button("Cancel");

        this.__tfUsername = tfUsername;

        btnAdd.setAllowGrowX(false);
        btnCancel.setAllowGrowX(false);

        win.addListener("appear", tfUsername.focus, tfUsername);

        btnCancel.addListener("execute", win.close, win);
        btnAdd.addListener("execute", function()
        {
          var buddy = new demobrowser.demo.virtual.messenger.BuddyModel();
          buddy.setName(tfUsername.getValue());
          this.messenger.getModel().push(buddy);
          win.close();
        }, this);

        win.add(lblUsername, {row : 0, column : 0});
        win.add(tfUsername, {row : 0, column : 1, colSpan: 2});

        win.add(btnAdd, {row : 1, column : 1});
        win.add(btnCancel, {row : 1, column : 2});

        layout.setColumnAlign(0, "left", "middle");
        layout.setColumnAlign(1, "right", "middle");

        this.getRoot().add(win, {left:20, top:20});

        this.__addUserDialog = win;
      }

      this.__tfUsername.setValue("");
      this.__addUserDialog.open();
    },

    removeContact: function()
    {
      this.messenger.getModel().pop();
    }

  }
});
