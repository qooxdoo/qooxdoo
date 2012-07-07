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

#asset(qx/icon/${qx.icontheme}/22/places/user-desktop.png)

************************************************************************ */

qx.Class.define("demobrowser.demo.widget.Tree",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var hBox = new qx.ui.layout.HBox();
      hBox.set(
        {
          spacing: 20
        });
      var container = new qx.ui.container.Composite(hBox);
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
      te1.setOpen(true);
      te1.setIcon("icon/22/places/user-desktop.png");
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

      for (var i=0; i<30; i++) {
        te2_3.add(new qx.ui.tree.TreeFile("Junk #" + i));
      }

      var te2_4 = new qx.ui.tree.TreeFolder("Data");
      var te2_5 = new qx.ui.tree.TreeFolder("Edit");

      te2.add(te2_1, te2_2, te2_3, te2_4, te2_5);

      root.add(te2);

      return tree;
    },


    /**
     *
     * @param tree {qx.ui.tree.Tree} Tree
     * @return {qx.ui.groupbox.GroupBox} group box
     * @lint ignoreDeprecated(alert)
     */
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

      tree.addListener("changeSelection", function(e)
      {
        var data = e.getData();
        if(data.length > 0)
        {
          if (this.getSelectionMode() === "multi") {
            tCurrentInput.setValue(data.length + " items");
          } else {
            tCurrentInput.setValue(data[0].getLabel());
          }
        }
        else
        {
          tCurrentInput.setValue("");
        }
      });


      commandFrame.add(new qx.ui.core.Spacer(spacerSize, spacerSize), {row: row++, column: 0});
      commandFrame.add(new qx.ui.basic.Label("Open mode:"), {row: row, column: 0});
      var modes = {
        "click": "click",
        "dblclick": "double click",
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
        commandFrame.add(radioButton, {row: row++, column: 1})
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




      var btnShowRootOpen = new qx.ui.form.CheckBox("Show root open button");
      commandFrame.add(btnShowRootOpen, {row: row++, column: 1});

      btnShowRootOpen.addListener("changeValue", function(e) {
        tree.setRootOpenClose(e.getData());
      });




      commandFrame.add(new qx.ui.core.Spacer(spacerSize, spacerSize), {row: row++, column: 0});
      var vShowItems = new qx.ui.form.Button("Show Items");
      commandFrame.add(vShowItems, {row: row++, column: 1});

      vShowItems.addListener("execute", function(e) {
        alert(("" + tree.getItems()).replace(",", "\n", "g"));
      });



      var vShowOpenItems = new qx.ui.form.Button("Show Open Items");
      commandFrame.add(vShowOpenItems, {row: row++, column: 1});

      vShowOpenItems.addListener("execute", function(e) {
        alert(("" + tree.getItems(true, false)).replace(",", "\n", "g"));
      });



      var vShowSelectedItems = new qx.ui.form.Button("Show Selected Items");
      commandFrame.add(vShowSelectedItems, {row: row++, column: 1});

      vShowSelectedItems.addListener("execute", function(e)
      {
        if (this.getSelectionMode() === "single") {
          alert(this.getSelection());
        } else {
          alert(this.getSelection().toString().replace(",", "\n", "g"));
        }
      }, tree);




      var vToggleHeight = new qx.ui.form.Button("Toggle Height");
      commandFrame.add(vToggleHeight, {row: row++, column: 1});

      var grow = true;
      vToggleHeight.addListener("execute", function(e) {
        tree.setHeight(grow ? 600: 400);
        grow = !grow;
      });

      return commandFrame;
    }
  }
});
