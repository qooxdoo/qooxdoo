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

qx.Class.define("demobrowser.demo.widget.Tree_1",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var container = new qx.ui.container.Composite(new qx.ui.layout.HBox().set({
        spacing: 20
      })).set({
        padding: 30
      });
      this.getRoot().add(container);

      var tree = this.getTree();
      container.add(tree);

      var commandFrame = this.getCommandFrame(tree);
      container.add(commandFrame);
    },


    getTree : function()
    {
      var tree = new qx.ui.tree.Tree().set({
        width : 200,
        height : 400
      });

      var root = new qx.ui.tree.TreeFolder("root");
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

      for (var i=0; i<100; i++) {
        te2_3.add(new qx.ui.tree.TreeFile("Junk #" + i));
      }

      var te2_4 = new qx.ui.tree.TreeFolder("Data");
      var te2_5 = new qx.ui.tree.TreeFolder("Edit");

      te2.add(te2_1, te2_2, te2_3, te2_4, te2_5);

      root.add(te2);

      return tree;
    },


    getCommandFrame : function(tree)
    {
      var commandFrame = new qx.ui.groupbox.GroupBox("Control");
      var spacerSize = 4;

      var grid = new qx.ui.layout.Grid();
      grid.setHorizontalSpacing(3);
      grid.setVerticalSpacing(5);

      var pane = commandFrame.getPane();
      pane.setLayout(grid);

      var row = 0;
      pane.add(new qx.ui.basic.Label("Selection: ").set({
        paddingTop: 4
      }), {row: row, column: 0});

      var tCurrentInput = new qx.ui.form.TextField().set({
        readOnly : true
      });

      pane.add(tCurrentInput, {row: row++, column: 1});

      tree.addListener("change", function(e)
      {
        if (this.getSelectionMode() === "multi") {
          tCurrentInput.setValue(e.getData().length + " items");
        } else {
          tCurrentInput.setValue(e.getData().getLabelObject().getContent());
        }
      });


      pane.add(new qx.ui.core.Spacer(spacerSize, spacerSize), {row: row++, column: 0});
      pane.add(new qx.ui.basic.Label("Open mode:"), {row: row, column: 0});
      var modes = {
        "clickOpen": "click (open)",
        "clickOpenClose": "click (open/close)",
        "dblclickOpen": "double click (open)",
        "dblclickOpenClose": "double click (open/close)",
        "none": "none"
      };

      var modeMgr = new qx.ui.core.RadioManager();
      for (var mode in modes)
      {
        var radioButton = new qx.ui.form.RadioButton(modes[mode]).set({
          value: mode,
          checked: mode == tree.getOpenMode()
        });

        modeMgr.add(radioButton);
        pane.add(radioButton, {row: row++, column: 1})
      }

      modeMgr.addListener("change", function(e) {
        tree.setOpenMode(e.getValue().getValue());
      });


      pane.add(new qx.ui.core.Spacer(spacerSize, spacerSize), {row: row++, column: 0});
      pane.add(new qx.ui.basic.Label("Selection:"), {row: row, column: 0});

      var btnMultiSelect = new qx.ui.form.CheckBox("Enable multi selection");
      btnMultiSelect.setChecked(tree.getSelectionMode() == "multi");
      pane.add(btnMultiSelect, {row: row++, column: 1});

      btnMultiSelect.addListener("changeChecked", function(e)
      {
        var enable = e.getValue();
        tree.setSelectionMode(enable ? "multi": "single");

        if (!enable) {
          btnDragSelect.setChecked(false);
        }
      });



      var btnDragSelect = new qx.ui.form.CheckBox("Enable drag selection");
      btnDragSelect.setChecked(tree.getDragSelection());
      pane.add(btnDragSelect, {row: row++, column: 1});

      btnDragSelect.addListener("changeChecked", function(e)
      {
        var enable = e.getValue();
        tree.setDragSelection(enable);

        if (enable) {
          btnMultiSelect.setChecked(true);
        }
      });



      pane.add(new qx.ui.core.Spacer(spacerSize, spacerSize), {row: row++, column: 0});
      pane.add(new qx.ui.basic.Label("Root node:"), {row: row, column: 0});

      var btnHideRoot = new qx.ui.form.CheckBox("Hide Root Node");
      btnHideRoot.setChecked(tree.getHideRoot());
      pane.add(btnHideRoot, {row: row++, column: 1});

      btnHideRoot.addListener("changeChecked", function(e) {
        tree.setHideRoot(e.getValue());
      });




      var btnShowRootOpen = new qx.ui.form.CheckBox("Show root open button");
      btnShowRootOpen.setChecked(tree.getRootOpenClose());
      pane.add(btnShowRootOpen, {row: row++, column: 1});

      btnShowRootOpen.addListener("changeChecked", function(e) {
        tree.setRootOpenClose(e.getValue());
      });




      pane.add(new qx.ui.core.Spacer(spacerSize, spacerSize), {row: row++, column: 0});
      var vShowItems = new qx.ui.form.Button("Show Items");
      pane.add(vShowItems, {row: row++, column: 1});

      vShowItems.addListener("execute", function(e) {
        alert(("" + tree.getItems()).replace(",", "\n", "g"));
      });



      var vShowOpenItems = new qx.ui.form.Button("Show Open Items");
      pane.add(vShowOpenItems, {row: row++, column: 1});

      vShowOpenItems.addListener("execute", function(e) {
        alert(("" + tree.getSelectableItems()).replace(",", "\n", "g"));
      });



      var vShowSelectedItems = new qx.ui.form.Button("Show Selected Items");
      pane.add(vShowSelectedItems, {row: row++, column: 1});

      vShowSelectedItems.addListener("execute", function(e) {
        alert(("" + tree.getSelectedItems()).replace(",", "\n", "g"));
      });




      var vShowSelectedItems = new qx.ui.form.Button("Toggle Height");
      pane.add(vShowSelectedItems, {row: row++, column: 1});

      var grow = true;
      vShowSelectedItems.addListener("execute", function(e) {
        tree.setHeight(grow ? 600: 400);
        grow = !grow;
      });

      return commandFrame;
    }
  }
});
