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
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */

qx.Class.define("demobrowser.demo.animation.Tree_Highlight",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      this._container = new qx.ui.container.Composite(new qx.ui.layout.HBox().set({
        spacing: 20
      })).set({
        padding: 30
      });
      this.getRoot().add(this._container);


      var treeGroup = new qx.ui.groupbox.GroupBox("Tree").set({
        contentPadding: [4,4,4,4]
      })
      treeGroup.setLayout(new qx.ui.layout.Canvas());
      this._container.add(treeGroup);

      this._treeGroup = treeGroup;

      var tree = this.getTree();
      treeGroup.add(tree, {edge: 0});

      this._tree = tree;

      this._container.add(this.getCommandFrame());
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

      var te1_1 = new qx.ui.tree.TreeFolder("Files");
      var te1_2 = new qx.ui.tree.TreeFolder("Workspace");
      var te1_3 = new qx.ui.tree.TreeFolder("Network");
      var te1_4 = new qx.ui.tree.TreeFolder("Trash");
      te1.add(te1_1, te1_2, te1_3, te1_4);


      var te1_2_1 = new qx.ui.tree.TreeFile("Windows (C:)");
      var te1_2_2 = new qx.ui.tree.TreeFile("Documents (D:)");
      te1_2.add(te1_2_1, te1_2_2);



      var te2 = new qx.ui.tree.TreeFolder("Inbox");

      var te2_1 = new qx.ui.tree.TreeFolder("Presets");
      var te2_2 = new qx.ui.tree.TreeFolder("Sent");
      var te2_3 = new qx.ui.tree.TreeFolder("Trash");

      for (var i=0; i<100; i++) {
        te2_3.add(new qx.ui.tree.TreeFile("Junk #" + i));
      }

      var te2_4 = new qx.ui.tree.TreeFolder("Data 123213234325345234523453453245");
      var te2_5 = new qx.ui.tree.TreeFolder("Edit");

      te2.add(te2_1, te2_2, te2_3, te2_4, te2_5);

      root.add(te2);

      return tree;
    },


    getCommandFrame : function()
    {
      var commandFrame = new qx.ui.groupbox.GroupBox("Control");

      commandFrame.setLayout(new qx.ui.layout.Grid(3, 5));

      var row = 0;
      commandFrame.add(new qx.ui.basic.Label("New tree item name: ").set({
        paddingTop: 4
      }), {row: row, column: 0});
      this.inputItemName = new qx.ui.form.TextField("Hello");

      commandFrame.add(this.inputItemName, {row: row++, column: 1});


      this.btnAddFolder = new qx.ui.form.Button("Add folder");
      this.btnAddFolder.addListener("execute", this._addFolder, this);
      commandFrame.add(this.btnAddFolder, {row: row++, column: 0, colSpan: 2});

      this.btnAddFile = new qx.ui.form.Button("Add file");
      this.btnAddFile.addListener("execute", this._addFile, this);
      commandFrame.add(this.btnAddFile, {row: row++, column: 0, colSpan: 2});

      this.btnAddAfter = new qx.ui.form.Button("Add after");
      this.btnAddAfter.addListener("execute", this._addAfter, this);
      commandFrame.add(this.btnAddAfter, {row: row++, column: 0, colSpan: 2});

      this.btnAddBefore = new qx.ui.form.Button("Add before");
      this.btnAddBefore.addListener("execute", this._addBefore, this);
      commandFrame.add(this.btnAddBefore, {row: row++, column: 0, colSpan: 2});

      this.btnAddBegin = new qx.ui.form.Button("Add at begin");
      this.btnAddBegin.addListener("execute", this._addBegin, this);
      commandFrame.add(this.btnAddBegin, {row: row++, column: 0, colSpan: 2});


      commandFrame.add(new qx.ui.core.Spacer(5, 5), {row: row++, column: 0});

      this.btnRemove = new qx.ui.form.Button("Remove tree item");
      this.btnRemove.addListener("execute", this._removeTreeItem, this);
      commandFrame.add(this.btnRemove, {row: row++, column: 0, colSpan: 2});

      this.btnRemoveAll = new qx.ui.form.Button("Remove all children");
      this.btnRemoveAll.addListener("execute", this._removeAll, this);
      commandFrame.add(this.btnRemoveAll, {row: row++, column: 0, colSpan: 2});


      commandFrame.add(new qx.ui.core.Spacer(5, 5), {row: row++, column: 0});

      this.btnMoveToParent = new qx.ui.form.Button("Move to parent");
      this.btnMoveToParent.addListener("execute", this._moveToParent, this);
      commandFrame.add(this.btnMoveToParent, {row: row++, column: 0, colSpan: 2});


      commandFrame.add(new qx.ui.core.Spacer(5, 5), {row: row++, column: 0});
      commandFrame.add(new qx.ui.basic.Label("Show open button:"), {row: row, column: 0});
      var modes = ["always", "never", "auto"];
      this.showOpenButtons = {};

      this.mgrShowRootOpen = new qx.ui.form.RadioGroup();
      for (var i=0; i<modes.length; i++)
      {
        var mode = modes[i];
        var radioButton = new qx.ui.form.RadioButton(mode).set({
          value: mode == this._tree.getRootOpenClose()
        });
        radioButton.setUserData("mode", mode);
        this.showOpenButtons[mode] = radioButton;
        this.mgrShowRootOpen.add(radioButton);
        commandFrame.add(radioButton, {row: row++, column: 1})
      }

      this.mgrShowRootOpen.addListener("changeSelection", this._onChangeShowOpen, this);


      commandFrame.add(new qx.ui.core.Spacer(5, 5), {row: row++, column: 0});

      this.btnReset = new qx.ui.form.Button("Reset tree");
      this.btnReset.addListener("execute", this._resetTree, this);
      commandFrame.add(this.btnReset, {row: row++, column: 0, colSpan: 2});


      this._tree.addListener("changeSelection", this._updateControls, this);
      this._updateControls();

      return commandFrame;
    },


    _addFolder : function()
    {
      var current = this._tree.getSelection()[0];
      var folder = new qx.ui.tree.TreeFolder(this.inputItemName.getValue());

      folder.addListenerOnce("appear", function(){
        var effect = new qx.fx.effect.core.Highlight(folder.getContainerElement().getDomElement());
        effect.start();
      }, this);

      current.setOpen(true);
      current.add(folder);
    },


    _addFile : function()
    {
      var current = this._tree.getSelection()[0];
      var file = new qx.ui.tree.TreeFile(this.inputItemName.getValue());

      file.addListenerOnce("appear", function(){
        var effect = new qx.fx.effect.core.Highlight(file.getContainerElement().getDomElement());
        effect.start();
      }, this);

      current.setOpen(true);
      current.add(file);
    },


    _addBefore : function()
    {
      var current = this._tree.getSelection()[0];
      var file = new qx.ui.tree.TreeFile(this.inputItemName.getValue());

      file.addListenerOnce("appear", function(){
        var effect = new qx.fx.effect.core.Highlight(file.getContainerElement().getDomElement());
        effect.start();
      }, this);

      current.getParent().addBefore(file, current);
    },


    _addAfter : function()
    {
      var current = this._tree.getSelection()[0];
      var file = new qx.ui.tree.TreeFile(this.inputItemName.getValue());

      file.addListenerOnce("appear", function(){
        var effect = new qx.fx.effect.core.Highlight(file.getContainerElement().getDomElement());
        effect.start();
      }, this);

      current.getParent().addAfter(file, current);
    },


    _addBegin : function()
    {
      var current = this._tree.getSelection()[0];
      var file = new qx.ui.tree.TreeFile(this.inputItemName.getValue());

      file.addListenerOnce("appear", function(){
        var effect = new qx.fx.effect.core.Highlight(file.getContainerElement().getDomElement());
        effect.start();
      }, this);

      current.getParent().addAtBegin(file);
    },


    _removeTreeItem : function()
    {
      var current = this._tree.getSelection()[0];
      var parent = current.getParent();

      parent.remove(current);
    },


    _removeAll : function()
    {
      var current = this._tree.getSelection()[0];
      current.removeAll();
    },


    _moveToParent : function()
    {
      var current = this._tree.getSelection()[0];
      var parent = current.getParent();
      parent.remove(current);
      parent.getParent().add(current);

      this._updateControls();
    },


    _onChangeShowOpen : function()
    {
      var current = this._tree.getSelection()[0];
      if (current != null) {
        var mode = this.mgrShowRootOpen.getSelection()[0].getUserData("mode");
        current.setOpenSymbolMode(mode);
      }
    },


    _resetTree : function()
    {
      this._treeGroup.remove(this._tree);
      this._tree = this.getTree();
      this._treeGroup.add(this._tree, {edge: 0});

      this._tree.addListenerOnce("appear", function(){
        this._tree.addListener("changeSelection", this._updateControls, this);
      }, this);

    },


    _updateControls : function()
    {
      var current = this._tree.getSelection()[0];

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

      var level = current.getLevel();
      var isTopLevel = level == -1;
      var isFolder = current instanceof qx.ui.tree.TreeFolder;

      this.btnAddFolder.setEnabled(isFolder);
      this.btnAddFile.setEnabled(isFolder);
      this.btnAddBefore.setEnabled(!isTopLevel);
      this.btnAddAfter.setEnabled(!isTopLevel);
      this.btnAddBegin.setEnabled(!isTopLevel);
      this.btnRemove.setEnabled(!isTopLevel);
      this.btnRemoveAll.setEnabled(true);
      this.mgrShowRootOpen.setEnabled(isFolder);
      this.showOpenButtons[current.getOpenSymbolMode()].setValue(true);
      this.btnMoveToParent.setEnabled(level > 0);
    }
  },

  /*
   *****************************************************************************
      DESTRUCTOR
   *****************************************************************************
   */

  destruct : function()
  {
    this._container = this._treeGroup = this._tree = this.inputItemName =
      this.btnAddFolder = this.btnAddFile = this.btnAddAfter =
      this.btnAddBefore = this.btnAddBegin = this.btnRemove =
      this.btnRemoveAll = this.btnMoveToParent = this.showOpenButtons =
      this.mgrShowRootOpen = this.btnReset = null;
  }
});
