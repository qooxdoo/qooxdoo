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

#asset(qx/icon/${qx.icontheme}/16/devices/drive-harddisk.png)
#asset(qx/icon/${qx.icontheme}/16/places/user-trash.png)
#asset(qx/icon/${qx.icontheme}/16/places/user-desktop.png)
#asset(qx/icon/${qx.icontheme}/16/status/dialog-information.png)

************************************************************************ */

qx.Class.define("demobrowser.demo.widget.Tree_Columns",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var tree = new qx.ui.tree.Tree().set({
        width: 600,
        height: 500
      });

      this.getRoot().add(tree, {left: 20, top: 48});
      var root = this.configureTreeItem(new qx.ui.tree.TreeFolder(), "Root");
      root.setOpen(true);
      tree.setRoot(root);

      // One icon for selected and one for unselected states
      var te1 = this.configureTreeItem(new qx.ui.tree.TreeFolder(), "Desktop");
      root.add(te1);

      var te1_1 = this.configureTreeItem(new qx.ui.tree.TreeFolder(), "Files");
      var te1_2 = this.configureTreeItem(new qx.ui.tree.TreeFolder(), "Workspace");
      var te1_3 = this.configureTreeItem(new qx.ui.tree.TreeFolder(), "Network");
      var te1_4 = this.configureTreeItem(new qx.ui.tree.TreeFolder(), "Trash");
      te1.add(te1_1, te1_2, te1_3, te1_4);

      // One icon specified, and used for both selected unselected states
      var te1_2_1 = this.configureTreeItem(new qx.ui.tree.TreeFile(), "Windows (C:)", "icon/16/devices/drive-harddisk.png");
      var te1_2_2 = this.configureTreeItem(new qx.ui.tree.TreeFile(), "Documents (D:)", "icon/16/devices/drive-harddisk.png");
      te1_2.add(te1_2_1, te1_2_2);

      var te2 = new this.configureTreeItem(new qx.ui.tree.TreeFolder(), "Inbox");
      var te2_1 = new this.configureTreeItem(new qx.ui.tree.TreeFolder(), "Presets");
      var te2_2 = new this.configureTreeItem(new qx.ui.tree.TreeFolder(), "Sent");
      var te2_3 = new this.configureTreeItem(new qx.ui.tree.TreeFolder(), "Trash", "icon/16/places/user-trash.png");
      var te2_4 = new this.configureTreeItem(new qx.ui.tree.TreeFolder(), "Data");
      var te2_5 = new this.configureTreeItem(new qx.ui.tree.TreeFolder(), "Edit");
      var te2_5_1 = new this.configureTreeItem(new qx.ui.tree.TreeFolder(), "Chat");
      var te2_5_2 = new this.configureTreeItem(new qx.ui.tree.TreeFolder(), "Pustefix");
      var te2_5_3 = new this.configureTreeItem(new qx.ui.tree.TreeFolder(), "TINC");
      var te2_5_3_1 = new this.configureTreeItem(new qx.ui.tree.TreeFolder(), "Announce");
      var te2_5_3_2 = new this.configureTreeItem(new qx.ui.tree.TreeFolder(), "Devel");
      te2_5_3.add(te2_5_3_1, te2_5_3_2);
      te2_5.add(te2_5_1, te2_5_2, te2_5_3);

      var te2_6 = new this.configureTreeItem(new qx.ui.tree.TreeFolder(), "Lists");
      var te2_6_1 = new this.configureTreeItem(new qx.ui.tree.TreeFolder(), "Relations");
      var te2_6_2 = new this.configureTreeItem(new qx.ui.tree.TreeFolder(), "Company");
      var te2_6_3 = new this.configureTreeItem(new qx.ui.tree.TreeFolder(), "Questions");
      var te2_6_4 = new this.configureTreeItem(new qx.ui.tree.TreeFolder(), "Internal");
      var te2_6_5 = new this.configureTreeItem(new qx.ui.tree.TreeFolder(), "Products");
      var te2_6_6 = new this.configureTreeItem(new qx.ui.tree.TreeFolder(), "Press");
      var te2_6_7 = new this.configureTreeItem(new qx.ui.tree.TreeFolder(), "Development");
      var te2_6_8 = new this.configureTreeItem(new qx.ui.tree.TreeFolder(), "Competition");
      te2_6.add(te2_6_1, te2_6_2, te2_6_3, te2_6_4, te2_6_5, te2_6_6, te2_6_7, te2_6_8);

      var te2_7 = new this.configureTreeItem(new qx.ui.tree.TreeFolder(), "Personal");
      var te2_7_1 = new this.configureTreeItem(new qx.ui.tree.TreeFolder(), "Bugs");
      var te2_7_2 = new this.configureTreeItem(new qx.ui.tree.TreeFolder(), "Family");
      var te2_7_3 = new this.configureTreeItem(new qx.ui.tree.TreeFolder(), "Projects");
      var te2_7_4 = new this.configureTreeItem(new qx.ui.tree.TreeFolder(), "Holiday");
      te2_7.add(te2_7_1, te2_7_2, te2_7_3, te2_7_4);

      var te2_8 = new this.configureTreeItem(new qx.ui.tree.TreeFolder(), "Big");
      for (var i=0;i<50; i++) {
        te2_8.add(new this.configureTreeItem(new qx.ui.tree.TreeFolder(), "Item " + i));
      };

      var te2_9 = new this.configureTreeItem(new qx.ui.tree.TreeFolder(), "Spam");

      te2.add(te2_1, te2_2, te2_3, te2_4, te2_5, te2_6, te2_7, te2_8, te2_9);
      root.add(te2);

    },

    configureTreeItem : function(treeItem, vLabel, vIcon)
    {
      // A left-justified icon
      if (Math.floor(Math.random() * 4) == 0) {
        var img = new qx.ui.basic.Image("icon/16/status/dialog-information.png");
        treeItem.addWidget(img);
      } else {
        treeItem.addWidget(new qx.ui.core.Spacer(16, 16));
      }

      // Here's our indentation and tree-lines
      treeItem.addSpacer();

      if (treeItem instanceof qx.ui.tree.TreeFolder) {
        treeItem.addOpenButton();
      }

      // The standard tree icon follows
      treeItem.addIcon();
      treeItem.setIcon(arguments.length >= 3 ? vIcon : "icon/16/places/user-desktop.png");


      // A checkbox comes right after the tree icon
      var checkbox = new qx.ui.form.CheckBox();
      checkbox.setFocusable(false);
      treeItem.addWidget(checkbox);

      // The label
      treeItem.addLabel(vLabel);

      // All else should be right justified
      treeItem.addWidget(new qx.ui.core.Spacer(), {flex: 1});

      // Add a file size, date and mode
      var text = new qx.ui.basic.Label(Math.round(Math.random() * 100) + "kb");
      text.setWidth(50);
      treeItem.addWidget(text);

      text = new qx.ui.basic.Label("May " + Math.round(Math.random() * 30 + 1) + " 2005");
      text.setWidth(150);
      treeItem.addWidget(text);

      text = new qx.ui.basic.Label("-rw-r--r--");
      text.setWidth(80);
      treeItem.addWidget(text);

      return treeItem;
    }

  }
});
