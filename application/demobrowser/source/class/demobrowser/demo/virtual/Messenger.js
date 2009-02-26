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

      // Create widget window
      var win = new qx.ui.window.Window("Contacts").set({
        contentPadding: 0,
        showClose: false,
        showMinimize: false
      });

      win.setLayout(new qx.ui.layout.Grow());
      win.moveTo(250, 20);
      win.open();
      
      
      this.messenger = new demobrowser.demo.virtual.messenger.Roster();
      this.messenger.setModel(this.__createUsers(200));
      win.add(this.messenger);
      

      var btnAdd = new qx.ui.form.Button("Add a contact...");
      var btnRemove = new qx.ui.form.Button("Remove last contact");

      btnAdd.addListener("execute", this.showAddContactWindow, this);
      btnRemove.addListener("execute", this.removeContact, this);

      doc.add(btnAdd, {left : 20, top : 10});
      doc.add(btnRemove, {left : 20, top : 40});
    },

    /**
     * This method contains the initial application code and gets called 
     * during startup of the application
     */
    __createUsers : function(amount)
    {
      var users = [
        {
          name : "Alexander Back",
          img : this.getRandomBuddy(),
          statusIcon : this.getRandomStatus()
        },
        {
          name : "Fabian Jakobs",
          img : "demobrowser/demo/icons/imicons/fabian_jakobs.png",
          statusIcon : this.getRandomStatus()
        },
        {
          name : "Andreas Ecker",
          img : this.getRandomBuddy(),
          statusIcon : this.getRandomStatus()
        },
        {
          name : "Martin Wittemann",
          img : "demobrowser/demo/icons/imicons/martin_wittemann.png",
          statusIcon : this.getRandomStatus()
        },
        {
          name : "Thomas Herchenröder",
          img : this.getRandomBuddy(),
          statusIcon : this.getRandomStatus()
        },
        {
          name : "Daniel Wagner",
          img : this.getRandomBuddy(),
          statusIcon : this.getRandomStatus()
        },
        {
          name : "Jonathan Weiß",
          img : "demobrowser/demo/icons/imicons/jonathan_weiss.png",
          statusIcon : this.getRandomStatus()
        },
        {
          name : "Yücel Beser",
          img : this.getRandomBuddy(),
          statusIcon : this.getRandomStatus()
        },
        {
          name : "Christian Schmidt",
          img : "demobrowser/demo/icons/imicons/christian_schmidt.png",
          statusIcon : this.getRandomStatus()
        }
      ];

      for (var i=0; i<users.length; i++) {
        users[i].group = "qooxdoo";
      };
      
      // Fill with dummy users:
      for (var i=users.length; i<amount; i++) {
        users[i] = {
          name : "User #" + i,
          img : this.getRandomBuddy(),
          statusIcon : this.getRandomStatus(),
          group : "Friends"
        };
      }
      
      var model = [];
      for (var i=0; i<users.length; i++)
      {
        var buddyModel = new demobrowser.demo.virtual.messenger.BuddyModel().set({
          name : users[i].name,
          avatar : users[i].img,
          status : users[i].statusIcon,
          group : users[i].group
        });

        model.push(buddyModel);
      }
      
      return new qx.data.Array(model);      
    },    
    
      
    getRandomBuddy : function()
    {
      var icons = [
        "angel", "embarrassed", "kiss", "laugh", "plain", "raspberry",
        "sad", "smile-big", "smile", "surprise"
      ];
      return "icon/22/emotes/face-" + icons[Math.floor(Math.random() * icons.length)] + ".png";
    },
  
    
    getRandomStatus : function()
    {
      var icons = [
        "away", "busy", "online", "offline"
      ];
      return icons[Math.floor(Math.random() * icons.length)];
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
