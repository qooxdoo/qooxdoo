/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */
/**
 * @asset(qx/icon/${qx.icontheme}/48/places/folder.png)
 */
qx.Class.define("demobrowser.demo.virtual.Tree",
{
  extend : qx.application.Standalone,

  members :
  {
    i: 0,
    __store: null,

    main: function()
    {
      this.base(arguments);

      // initializes layout
      var container = new qx.ui.container.Composite(new qx.ui.layout.HBox(20));
      this.getRoot().add(container, {top: 20, left: 20});

      // creates the tree
      var tree = new qx.ui.tree.VirtualTree(null, "name", "children").set({
        width : 200,
        height : 400
      });
      container.add(tree);

      // tree drag & drop
      tree.setDroppable(true);
      tree.setDraggable(true);
      tree.addListener("dragstart", function(e) {
        e.addType("item");
        e.addAction("move");
      });
      tree.addListener("drop", function(e) {
        var item = e.getOriginalTarget();
        var model = item && item.getModel ? item.getModel() : store.getModel();
        var newItem;
        if (e.getCurrentAction() == "move"){
          newItem = e.getDragTarget().getModel();
          this.removeItem(store.getModel(), newItem);
        } else {
          newItem = qx.data.marshal.Json.createModel({
            "name": "New Item " + this.i++,
            "children": []
          });
        }
        if (model.getChildren) {
          model.getChildren().push(newItem);
        }
      }, this);

      // loads the tree model
      var url = "json/tree.json";
      var store = new qx.data.store.Json(url);
      this.__store = store;

      // connect the store and the tree
      store.bind("model", tree, "model");

      // opens the 'Desktop' node
      store.addListener("loaded", function() {
        tree.openNode(tree.getModel().getChildren().getItem(0));
      }, this);

      var commandFrame = this.getCommandFrame(tree);
      container.add(commandFrame);
    },


    removeItem : function(root, item) {
      if (!root.getChildren || root == item) {
        return;
      }
      var children = root.getChildren();
      for (var i=0; i < children.length; i++) {
        if (children.getItem(i) == item) {
          children.remove(item);
          return;
        }
        this.removeItem(children.getItem(i), item);
      }
    },


    getCommandFrame : function(tree)
    {
      var commandFrame = new qx.ui.groupbox.GroupBox("Control");
      var spacerSize = 4;

      commandFrame.setLayout(new qx.ui.layout.Grid(5, 3));

      var row = 0;
      commandFrame.add(new qx.ui.basic.Label("Selection: ").set({
        paddingTop: 4
      }), {row: row, column: 0});

      var tCurrentInput = new qx.ui.form.TextField().set({
        readOnly : true
      });

      commandFrame.add(tCurrentInput, {row: row++, column: 1});

      tree.getSelection().addListener("change", function(e)
      {
        var selection = tree.getSelection();
        if(selection.getLength() > 0)
        {
          if (tree.getSelectionMode() === "multi") {
            tCurrentInput.setValue(selection.getLength() + " items");
          } else {
            tCurrentInput.setValue(selection.getItem(0).getName());
          }
        } else {
          tCurrentInput.setValue("");
        }
      });

      commandFrame.add(new qx.ui.core.Spacer(spacerSize, spacerSize), {row: row++, column: 0});
      commandFrame.add(new qx.ui.basic.Label("Open mode:"), {row: row, column: 0});
      var modes = {
        "tap": "tap",
        "dbltap": "double tap",
        "none": "none"
      };

      var modeMgr = new qx.ui.form.RadioGroup();
      for (var mode in modes)
      {
        var radioButton = new qx.ui.form.RadioButton(modes[mode]).set({
          value: mode == tree.getOpenMode()
        });
        radioButton.setUserData("mode", mode);

        modeMgr.add(radioButton);
        commandFrame.add(radioButton, {row: row++, column: 1});
      }

      modeMgr.addListener("changeSelection", function(e) {
        tree.setOpenMode(e.getData()[0].getUserData("mode"));
      });

      commandFrame.add(new qx.ui.core.Spacer(spacerSize, spacerSize), {row: row++, column: 0});
      commandFrame.add(new qx.ui.basic.Label("Selection:"), {row: row, column: 0});

      var btnMultiSelect = new qx.ui.form.CheckBox("Enable multi selection");
      commandFrame.add(btnMultiSelect, {row: row++, column: 1});

      btnMultiSelect.addListener("changeValue", function(e)
      {
        var enable = e.getData();
        tree.setSelectionMode(enable ? "multi": "single");
      });

      var btnDragSelect = new qx.ui.form.CheckBox("Enable drag selection");
      commandFrame.add(btnDragSelect, {row: row++, column: 1});

      btnDragSelect.addListener("changeValue", function(e)
      {
        var enable = e.getData();
        tree.setDragSelection(enable);

        if (!btnMultiSelect.getValue()) {
          btnMultiSelect.setValue(true);
        }
      });

      commandFrame.add(new qx.ui.core.Spacer(spacerSize, spacerSize), {row: row++, column: 0});
      commandFrame.add(new qx.ui.basic.Label("Root node:"), {row: row, column: 0});

      var btnHideRoot = new qx.ui.form.CheckBox("Hide Root Node");
      commandFrame.add(btnHideRoot, {row: row++, column: 1});

      btnHideRoot.addListener("changeValue", function(e) {
        tree.setHideRoot(e.getData());
      });

      var btnShowTopLevelOpenCloseIcons = new qx.ui.form.CheckBox("Show top level open/close icons");
      commandFrame.add(btnShowTopLevelOpenCloseIcons, {row: row++, column: 1});

      btnShowTopLevelOpenCloseIcons.addListener("changeValue", function(e) {
        tree.setShowTopLevelOpenCloseIcons(e.getData());
      });


      commandFrame.add(new qx.ui.core.Spacer(spacerSize, spacerSize), {row: row++, column: 0});
      commandFrame.add(new qx.ui.basic.Label("Tree:"), {row: row, column: 0});

      var btnShowLeafs = new qx.ui.form.CheckBox("Show Leafs");
      btnShowLeafs.setValue(tree.isShowLeafs());
      commandFrame.add(btnShowLeafs, {row: row++, column: 1});

      btnShowLeafs.addListener("changeValue", function(e) {
        tree.setShowLeafs(e.getData());
      });

      commandFrame.add(new qx.ui.core.Spacer(spacerSize, spacerSize), {row: row++, column: 0});

      var updateModel = new qx.ui.form.Button("Update Model");
      updateModel.addListener("execute", function(e) {
        var desktop = tree.getModel().getChildren().getItem(0);
        var trash = desktop.getChildren().getItem(2);

        var rawData = [];
        for (var i = 0; i < 10; i++) {
          rawData.push({"name": "File #" + (trash.getChildren().getLength() + i)});
        }
        var newItems = qx.data.marshal.Json.createModel(rawData, true);
        trash.getChildren().append(newItems);
      }, this);
      commandFrame.add(updateModel, {row: row++, column: 1});

      var vToggleHeight = new qx.ui.form.Button("Toggle Height");
      commandFrame.add(vToggleHeight, {row: row++, column: 1});

      var ddImg = new qx.ui.basic.Image("icon/48/places/folder.png");
      ddImg.setDraggable(true);
      ddImg.addListener("dragstart", function(e) {
        e.addType("item");
        e.addAction("copy");
      });
      commandFrame.add(new qx.ui.basic.Label("Drag me:"), {row: row, column: 0});
      commandFrame.add(ddImg, {row: row++, column: 1});


      var grow = true;
      vToggleHeight.addListener("execute", function(e) {
        tree.setHeight(grow ? 600: 400);
        grow = !grow;
      });

      return commandFrame;
    }
  }
});
