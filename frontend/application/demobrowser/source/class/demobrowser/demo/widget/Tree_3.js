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



************************************************************************ */

qx.Class.define("demobrowser.demo.widget.Tree_3",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      this._container = new qx.ui.core.Widget().set({
        layout: new qx.ui.layout.HBox().set({
          spacing: 20
        }),
        padding: 30
      });
      this.getRoot().add(this._container);


      var tree = this.getTree();
      this._container.getLayout().add(tree);
      this._tree = tree;

      this._container.getLayout().add(this.getCommandFrame());
    },


    getTree : function()
    {
      var tree = new qx.ui.tree.Tree().set({
        width : 200,
        height : 400
      });

      var root = new qx.ui.tree.TreeFolder("Root");
      root.setOpen(true);
      tree.setRoot(root);

      var te1 = new qx.ui.tree.TreeFolder("Desktop");
      te1.setOpen(true)
      root.add(te1);
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

      root.add(te2);

      return tree;
    },


    getCommandFrame : function()
    {
      var commandFrame = new qx.ui.groupbox.GroupBox("Control");

      var grid = new qx.ui.layout.Grid();
      grid.setHorizontalSpacing(3);
      grid.setVerticalSpacing(5);
      commandFrame.getPane().setLayout(grid);


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

      this.btnAddAfter = new qx.ui.form.Button("Add after");
      this.btnAddAfter.addListener("execute", this._addAfter, this);
      grid.add(this.btnAddAfter, row++, 0, {colSpan: 2});

      this.btnAddBefore = new qx.ui.form.Button("Add before");
      this.btnAddBefore.addListener("execute", this._addBefore, this);
      grid.add(this.btnAddBefore, row++, 0, {colSpan: 2});

      this.btnAddBegin = new qx.ui.form.Button("Add at begin");
      this.btnAddBegin.addListener("execute", this._addBegin, this);
      grid.add(this.btnAddBegin, row++, 0, {colSpan: 2});


      grid.add(new qx.ui.core.Spacer(5, 5), row++, 0);

      this.btnRemove = new qx.ui.form.Button("Remove tree item");
      this.btnRemove.addListener("execute", this._removeTreeItem, this);
      grid.add(this.btnRemove, row++, 0, {colSpan: 2});

      this.btnRemoveAll = new qx.ui.form.Button("Remove all children");
      this.btnRemoveAll.addListener("execute", this._removeAll, this);
      grid.add(this.btnRemoveAll, row++, 0, {colSpan: 2});


      grid.add(new qx.ui.core.Spacer(5, 5), row++, 0);

      this.btnMoveToParent = new qx.ui.form.Button("Move to parent");
      this.btnMoveToParent.addListener("execute", this._moveToParent, this);
      grid.add(this.btnMoveToParent, row++, 0, {colSpan: 2});


      grid.add(new qx.ui.core.Spacer(5, 5), row++, 0);
      grid.add(new qx.ui.basic.Label("Show open button:"), row, 0);
      var modes = ["always", "never", "auto"];
      this.showOpenButtons = {};

      this.mgrShowRootOpen = new qx.ui.core.RadioManager();
      for (var i=0; i<modes.length; i++)
      {
        var mode = modes[i];
        var radioButton = new qx.ui.form.RadioButton(mode).set({
          value: mode,
          checked: mode == this._tree.getRootOpenClose()
        });
        this.showOpenButtons[mode] = radioButton;
        this.mgrShowRootOpen.add(radioButton);
        grid.add(radioButton, row++, 1)
      }

      this.mgrShowRootOpen.addListener("changeSelected", this._onChangeShowOpen, this);


      grid.add(new qx.ui.core.Spacer(5, 5), row++, 0);

      this.btnReset = new qx.ui.form.Button("Reset tree");
      this.btnReset.addListener("execute", this._resetTree, this);
      grid.add(this.btnReset, row++, 0, {colSpan: 2});


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


    _addBefore : function()
    {
      var current = this._tree.getSelectedItem();
      var file = new qx.ui.tree.TreeFile(this.inputItemName.getValue());

      current.getParent().addBefore(file, current);
    },


    _addAfter : function()
    {
      var current = this._tree.getSelectedItem();
      var file = new qx.ui.tree.TreeFile(this.inputItemName.getValue());

      current.getParent().addAfter(file, current);
    },


    _addBegin : function()
    {
      var current = this._tree.getSelectedItem();
      var file = new qx.ui.tree.TreeFile(this.inputItemName.getValue());

      current.getParent().addAtBegin(file);
    },


    _removeTreeItem : function()
    {
      var current = this._tree.getSelectedItem();
      var parent = current.getParent();

      parent.remove(current);
    },


    _removeAll : function()
    {
      var current = this._tree.getSelectedItem();
      current.removeAll();
    },


    _moveToParent : function()
    {
      var current = this._tree.getSelectedItem();
      var parent = current.getParent();
      parent.remove(current);
      parent.getParent().add(current);

      this._updateControls();
    },


    _onChangeShowOpen : function()
    {
      var current = this._tree.getSelectedItem();
      var mode = this.mgrShowRootOpen.getSelected().getValue();
      current.setOpenSymbolMode(mode);
    },


    _resetTree : function()
    {
      this._container.getLayout().remove(this._tree);
      this._tree = this.getTree();
      this._container.getLayout().addAt(this._tree, 0);

      this._tree.getManager().addListener("changeSelection", this._updateControls, this);
      this._updateControls();
    },


    _updateControls : function()
    {
      var current = this._tree.getSelectedItem();

      if (!current)
      {
        this.btnAddFolder.setEnabled(false);
        this.btnAddFile.setEnabled(false);
        this.btnAddBefore.setEnabled(false);
        this.btnAddAfter.setEnabled(false);
        this.btnAddBegin.setEnabled(false);
        this.btnRemove.setEnabled(false);
        this.btnRemoveAll.setEnabled(false);
        this.mgrShowRootOpen.setEnabled(false);
        this.btnMoveToParent.setEnabled(false);
        return;
      }

      var isTopLevel = current.getLevel() == 0;
      var isFolder = current instanceof qx.ui.tree.TreeFolder;
      var isLastItem = this._tree.getNextSiblingOf(current) == null;
      var isFirstItem = this._tree.getPreviousSiblingOf(current) == null;

      this.btnAddFolder.setEnabled(isFolder);
      this.btnAddFile.setEnabled(isFolder);
      this.btnAddBefore.setEnabled(true);
      this.btnAddAfter.setEnabled(true);
      this.btnAddBegin.setEnabled(true);
      this.btnRemove.setEnabled(true);
      this.btnRemoveAll.setEnabled(true);
      this.mgrShowRootOpen.setEnabled(isFolder);
      this.showOpenButtons[current.getOpenSymbolMode()].setChecked(true);
      this.btnMoveToParent.setEnabled(!isTopLevel);
    }
  }
});
