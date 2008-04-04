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

qx.Class.define("demobrowser.demo.widget.Tree_3",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var tree = new qx.ui.tree.Tree("Root").set({
        width : 200
      });
      this.getRoot().add(tree, 20, 48);

      var te1 = new qx.ui.tree.TreeFolder("Desktop");
      te1.setOpen(true)
      tree.add(te1);
      desktop = te1;

      var te1_1 = new qx.ui.tree.TreeFolder("Files");
      var te1_2 = new qx.ui.tree.TreeFolder("Workspace");
      var te1_3 = new qx.ui.tree.TreeFolder("Network");
      var te1_4 = new qx.ui.tree.TreeFolder("Trash");
      te1.add(te1_1, te1_2, te1_3, te1_4);


      var te1_2_1 = new qx.ui.tree.TreeFile("Windows (C:)");
      var te1_2_2 = new qx.ui.tree.TreeFile("Documents (D:)");
      te1_2.add(te1_2_1, te1_2_2);
      arbeitsplatz = te1_2;



      var te2 = new qx.ui.tree.TreeFolder("Inbox");
      posteingang = te2;

      var te2_1 = new qx.ui.tree.TreeFolder("Presets");
      var te2_2 = new qx.ui.tree.TreeFolder("Sent");
      var te2_3 = new qx.ui.tree.TreeFolder("Trash");
      var te2_4 = new qx.ui.tree.TreeFolder("Data");
      var te2_5 = new qx.ui.tree.TreeFolder("Edit");

      te2.add(te2_1, te2_2, te2_3, te2_4, te2_5);

      tree.add(te2);
      this._tree = tree;


      this.getRoot().add(this.getCommandFrame(), 250, 48);
    },


    getCommandFrame : function()
    {
      var commandFrame = new qx.ui.groupbox.GroupBox("Control");

      var grid = new qx.ui.layout.Grid();
      grid.setHorizontalSpacing(3);
      grid.setVerticalSpacing(5);
      commandFrame.getPane().setLayout(grid);


      // new tree item name
      // add folder
      // add file
      // move to parent
      // move up
      // move down
      // delete


      var row = 0;
      grid.add(new qx.ui.basic.Label("New tree item name: "), row, 0);
      this.inputItemName = new qx.ui.form.TextField("Hello");
      grid.add(this.inputItemName, row++, 1);


      this.btnAddFolder = new qx.ui.form.Button("Add folder");
      this.btnAddFolder.addListener("execute", this._addFolder, this);
      grid.add(this.btnAddFolder, row++, 0, {colSpan: 2});

      this.btnAddFile = new qx.ui.form.Button("Add file");
      this.btnAddFile.addListener("execute", this._addFile, this);
      grid.add(this.btnAddFile, row++, 0, {colSpan: 2});

      grid.add(new qx.ui.core.Spacer(5, 5), row++, 0);

      this.btnRemove = new qx.ui.form.Button("Remove tree item");
      this.btnRemove.addListener("execute", this._removeTreeItem, this);
      grid.add(this.btnRemove, row++, 0, {colSpan: 2});

      grid.add(new qx.ui.core.Spacer(5, 5), row++, 0);

      this.btnMoveToParent = new qx.ui.form.Button("Move to parent");
      this.btnMoveToParent.addListener("execute", this._moveToParent, this);
      grid.add(this.btnMoveToParent, row++, 0, {colSpan: 2});

      this.btnMoveUp = new qx.ui.form.Button("Move up");
      grid.add(this.btnMoveUp, row++, 0, {colSpan: 2});

      this.btnMoveDown = new qx.ui.form.Button("Move down");
      grid.add(this.btnMoveDown, row++, 0, {colSpan: 2});

      this._tree.getManager().addListener("changeSelection", this._updateControls, this);
      this._updateControls();

      return commandFrame;
    },


    _addFolder : function()
    {
      var current = this._tree.getSelectedItem();
      var folder = new qx.ui.tree.TreeFolder(this.inputItemName.getValue());
      current.setOpen(true);
      current.add(folder);
    },


    _addFile : function()
    {
      var current = this._tree.getSelectedItem();
      var file = new qx.ui.tree.TreeFile(this.inputItemName.getValue());
      current.setOpen(true);
      current.add(file);
    },


    _removeTreeItem : function()
    {
      var current = this._tree.getSelectedItem();
      var parent = current.getParent();

      var selected = parent;
      if (current.getLevel() == 0)
      {
        var selected =
          this._tree.getPreviousSiblingOf(current) ||
          this._tree.getNextSiblingOf(current) ||
          null;
      }

      if (selected) {
        parent.getTree().getManager().setItemSelected(selected, true);
      }

      parent.remove(current);
    },


    _moveToParent : function()
    {
      var current = this._tree.getSelectedItem();
      var parent = current.getParent();
      parent.remove(current);
      parent.getParent().add(current);

      this._updateControls();
    },


    _updateControls : function()
    {
      var current = this._tree.getSelectedItem();

      if (!current)
      {
        this.btnAddFolder.setEnabled(false);
        this.btnAddFile.setEnabled(false);
        this.btnRemove.setEnabled(false);
        this.btnMoveToParent.setEnabled(false);
        this.btnMoveUp.setEnabled(false);
        this.btnMoveDown.setEnabled(false);
        return;
      }

      var isTopLevel = current.getLevel() == 0;
      var isFolder = current instanceof qx.ui.tree.TreeFolder;
      var isLastItem = this._tree.getNextSiblingOf(current) == null;
      var isFirstItem = this._tree.getPreviousSiblingOf(current) == null;

      this.btnAddFolder.setEnabled(isFolder);
      this.btnAddFile.setEnabled(isFolder);
      this.btnRemove.setEnabled(true);
      this.btnMoveToParent.setEnabled(!isTopLevel);
      this.btnMoveUp.setEnabled(!isFirstItem);
      this.btnMoveDown.setEnabled(!isLastItem);
    }
  }
});
