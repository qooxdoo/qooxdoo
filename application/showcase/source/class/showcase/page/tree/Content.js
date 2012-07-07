/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#asset(qx/icon/${qx.icontheme}/22/places/*)
#asset(qx/icon/${qx.icontheme}/22/mimetypes/media-image.png)
#asset(qx/icon/${qx.icontheme}/22/apps/office-chart.png)
#asset(qx/icon/${qx.icontheme}/22/apps/internet-mail.png)
#asset(qx/icon/${qx.icontheme}/22/actions/document-send.png)
#asset(qx/icon/${qx.icontheme}/22/actions/mail-mark-junk.png)
#asset(qx/icon/${qx.icontheme}/22/actions/mail-mark-important.png)
#asset(qx/icon/${qx.icontheme}/22/actions/mail-message-new.png)
#asset(qx/icon/${qx.icontheme}/22/devices/drive-harddisk.png)
#asset(qx/icon/${qx.icontheme}/22/devices/drive-optical.png)

************************************************************************ */

qx.Class.define("showcase.page.tree.Content",
{
  extend : showcase.page.AbstractDesktopContent,


  construct : function(page) {
    this.base(arguments, page);

    var win = this.__addSecondWindow();
    this.getView().add(win);
    win.moveTo(260, 20);
    win.open();
  },


  members : {
    _addWindowContent : function(win)
    {
      win.set({
        caption : "Simple View",
        minWidth: 200
      });

      win.setLayout(new qx.ui.layout.Grow());

      var tree = new qx.ui.tree.Tree().set({
        width : 200,
        height : 400,
        selectionMode : "multi",
        dragSelection: true,
        decorator: null,
        padding: 0,
        backgroundColor: "rgb(228,228,228)"
      });
      win.add(tree);

      var root = new qx.ui.tree.TreeFolder("Home").set({
        icon: "icon/22/places/user-home.png"
      });
      root.setOpen(true);
      tree.setRoot(root);

      var te1 = new qx.ui.tree.TreeFolder("Desktop").set({
        icon: "icon/22/places/user-desktop.png"
      });
      te1.setOpen(true)
      root.add(te1);

      var te1_1 = new qx.ui.tree.TreeFolder("Files");
      var te1_2 = new qx.ui.tree.TreeFolder("Workspace");
      var te1_3 = new qx.ui.tree.TreeFolder("Network").set({
        icon: "icon/22/places/network-server.png"
      });
      var te1_4 = new qx.ui.tree.TreeFolder("Trash").set({
        icon: "icon/22/places/user-trash.png"
      });
      te1.add(te1_1, te1_2, te1_3, te1_4);


      var te1_2_1 = new qx.ui.tree.TreeFile("Windows (C:)").set({
        icon: "icon/22/devices/drive-harddisk.png"
      });
      var te1_2_2 = new qx.ui.tree.TreeFile("Documents (D:)").set({
        icon: "icon/22/devices/drive-harddisk.png"
      });
      var te1_2_3 = new qx.ui.tree.TreeFile("DVD (E:)").set({
        icon: "icon/22/devices/drive-optical.png"
      });
      te1_2.add(te1_2_1, te1_2_2, te1_2_3);



      var te2 = new qx.ui.tree.TreeFolder("Inbox").set({
        icon: "icon/22/apps/internet-mail.png",
        open: true
      });

      var te2_1 = new qx.ui.tree.TreeFolder("Junk").set({
        icon: "icon/22/actions/mail-mark-junk.png"
      });
      var te2_2 = new qx.ui.tree.TreeFolder("Sent").set({
        icon: "icon/22/actions/document-send.png"
      });
      var te2_3 = new qx.ui.tree.TreeFolder("Trash").set({
        icon: "icon/22/places/user-trash-full.png"
      });

      for (var i=0; i<30; i++) {
        te2_3.add(new qx.ui.tree.TreeFile("Junk #" + i).set({
          icon: "icon/22/actions/mail-message-new.png"
        }));
      }

      var te2_4 = new qx.ui.tree.TreeFolder("Data").set({
        icon: "icon/22/apps/office-chart.png"
      });
      var te2_5 = new qx.ui.tree.TreeFolder("Important").set({
        icon: "icon/22/actions/mail-mark-important.png"
      });

      te2.add(te2_1, te2_2, te2_3, te2_4, te2_5);

      root.add(te2);
    },


    __addSecondWindow : function()
    {
      var win = new qx.ui.window.Window().set({
        showClose: false,
        showMinimize: false,
        width: 310,
        height: 425,
        minWidth: 200,
        caption: "Detailed View",
        layout: new qx.ui.layout.Grow(),
        contentPadding: 0
      });

      var tree = new qx.ui.tree.Tree().set({
        width: 600,
        height: 500,
        decorator: null,
        padding: 0,
        selectionMode : "multi",
        dragSelection: true,
        backgroundColor: "rgb(228,228,228)"
      });

      win.add(tree);

      var root = this.configureTreeItem(new qx.ui.tree.TreeFolder(), "Home", "icon/22/places/user-home.png");
      root.setOpen(true);
      tree.setRoot(root);

      // One icon for selected and one for unselected states
      var te1 = this.configureTreeItem(new qx.ui.tree.TreeFolder(), "Desktop", "icon/22/places/user-desktop.png");
      te1.setOpen(true);
      root.add(te1);

      var te1_1 = this.configureTreeItem(new qx.ui.tree.TreeFolder(), "Files");
      var te1_2 = this.configureTreeItem(new qx.ui.tree.TreeFolder(), "Workspace");
      var te1_3 = this.configureTreeItem(new qx.ui.tree.TreeFolder(), "Network", "icon/22/places/network-server.png");
      var te1_4 = this.configureTreeItem(new qx.ui.tree.TreeFolder(), "Trash", "icon/22/places/user-trash-full.png");
      te1.add(te1_1, te1_2, te1_3, te1_4);

      // One icon specified, and used for both selected unselected states
      var te1_2_1 = this.configureTreeItem(new qx.ui.tree.TreeFile(), "Windows (C:)", "icon/22/devices/drive-harddisk.png");
      var te1_2_2 = this.configureTreeItem(new qx.ui.tree.TreeFile(), "Documents (D:)", "icon/22/devices/drive-harddisk.png");
      te1_2.add(te1_2_1, te1_2_2);

      var te2 = this.configureTreeItem(new qx.ui.tree.TreeFolder(), "Inbox", "icon/22/apps/internet-mail.png");
      te2.setOpen(true);
      var te2_1 = this.configureTreeItem(new qx.ui.tree.TreeFolder(), "Junk", "icon/22/actions/mail-mark-junk.png");
      var te2_2 = this.configureTreeItem(new qx.ui.tree.TreeFolder(), "Sent", "icon/22/actions/document-send.png");
      var te2_3 = this.configureTreeItem(new qx.ui.tree.TreeFolder(), "Trash", "icon/22/places/user-trash.png");
      var te2_4 = this.configureTreeItem(new qx.ui.tree.TreeFolder(), "Data", "icon/22/apps/office-chart.png");
      var te2_5 = this.configureTreeItem(new qx.ui.tree.TreeFolder(), "Edit");
      var te2_5_1 = this.configureTreeItem(new qx.ui.tree.TreeFolder(), "Chat");
      var te2_5_2 = this.configureTreeItem(new qx.ui.tree.TreeFolder(), "Pustefix");
      var te2_5_3 = this.configureTreeItem(new qx.ui.tree.TreeFolder(), "TINC");
      var te2_5_3_1 = this.configureTreeItem(new qx.ui.tree.TreeFolder(), "Announce");
      var te2_5_3_2 = this.configureTreeItem(new qx.ui.tree.TreeFolder(), "Devel");
      te2_5_3.add(te2_5_3_1, te2_5_3_2);
      te2_5.add(te2_5_1, te2_5_2, te2_5_3);

      var te2_6 = this.configureTreeItem(new qx.ui.tree.TreeFolder(), "Lists");
      var te2_6_1 = this.configureTreeItem(new qx.ui.tree.TreeFolder(), "Relations");
      var te2_6_2 = this.configureTreeItem(new qx.ui.tree.TreeFolder(), "Company");
      var te2_6_3 = this.configureTreeItem(new qx.ui.tree.TreeFolder(), "Questions");
      var te2_6_4 = this.configureTreeItem(new qx.ui.tree.TreeFolder(), "Internal");
      var te2_6_5 = this.configureTreeItem(new qx.ui.tree.TreeFolder(), "Products");
      var te2_6_6 = this.configureTreeItem(new qx.ui.tree.TreeFolder(), "Press");
      var te2_6_7 = this.configureTreeItem(new qx.ui.tree.TreeFolder(), "Development");
      var te2_6_8 = this.configureTreeItem(new qx.ui.tree.TreeFolder(), "Competition");
      te2_6.add(te2_6_1, te2_6_2, te2_6_3, te2_6_4, te2_6_5, te2_6_6, te2_6_7, te2_6_8);

      var te2_7 = this.configureTreeItem(new qx.ui.tree.TreeFolder(), "Personal");
      var te2_7_1 = this.configureTreeItem(new qx.ui.tree.TreeFolder(), "Bugs");
      var te2_7_2 = this.configureTreeItem(new qx.ui.tree.TreeFolder(), "Family");
      var te2_7_3 = this.configureTreeItem(new qx.ui.tree.TreeFolder(), "Projects");
      var te2_7_4 = this.configureTreeItem(new qx.ui.tree.TreeFolder(), "Holiday");
      te2_7.add(te2_7_1, te2_7_2, te2_7_3, te2_7_4);

      var te2_8 = this.configureTreeItem(new qx.ui.tree.TreeFolder(), "Images");
      for (var i=0;i<50; i++) {
        te2_8.add(this.configureTreeItem(new qx.ui.tree.TreeFolder(), "Vacation" + (i+1), "icon/22/mimetypes/media-image.png"));
      };

      te2.add(te2_1, te2_2, te2_3, te2_4, te2_5, te2_6, te2_7, te2_8);
      root.add(te2);

      return win;
    },


    configureTreeItem : function(treeItem, vLabel, vIcon)
    {
      // Here's our indentation and tree-lines
      treeItem.addSpacer();

      if (treeItem instanceof qx.ui.tree.TreeFolder) {
        treeItem.addOpenButton();
      }

      // The standard tree icon follows
      treeItem.addIcon();
      if (arguments.length >= 3) {
        treeItem.setIcon(vIcon);
      }

      // The label
      treeItem.addLabel(vLabel);

      // All else should be right justified
      treeItem.addWidget(new qx.ui.core.Spacer(), {flex: 1});

      // Add a file size, date and mode
      var text = new qx.ui.basic.Label(Math.round(Math.random() * 99) + "kb");
      text.setWidth(30);
      text.setAlignY("middle");
      text.setMargin([0, 8]);
      treeItem.addWidget(text);

      text = new qx.ui.basic.Label("May " + Math.round(Math.random() * 30 + 1) + " 2005");
      text.setWidth(80);
      text.setAlignY("middle");
      treeItem.addWidget(text);

      return treeItem;
    }
  }
});