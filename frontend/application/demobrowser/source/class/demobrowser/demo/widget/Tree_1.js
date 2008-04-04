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



      var commandFrame = new qx.ui.groupbox.GroupBox("Control");

      var grid = new qx.ui.layout.Grid();
      grid.setHorizontalSpacing(3);
      grid.setVerticalSpacing(5);
      commandFrame.getPane().setLayout(grid);

      this.getRoot().add(commandFrame, 250, 48);

      var row = 0;
      grid.add(new qx.ui.basic.Label("Current Folder: "), row, 0);

      var tCurrentInput = new qx.ui.form.TextField().set({
        readOnly : true
      });

      grid.add(tCurrentInput, row++, 1);

      tree.getManager().addListener("changeSelection", function(e) {
        tCurrentInput.setValue(e.getData()[0].getLabelObject().getContent());
      });


      grid.add(new qx.ui.basic.Label("Open mode:"), row, 0, {rowSpan:3});
      var modes = {
        "click" : "click",
        "dblclick": "double click",
        "none": "none"
      };

      var modeMgr = new qx.ui.core.RadioManager();
      for (var mode in modes)
      {
        var radioButton = new qx.ui.form.RadioButton(modes[mode]).set({
          value: mode,
          checked: mode == "none"
        });
        modeMgr.add(radioButton);
        grid.add(radioButton, row++, 1)
      }

      modeMgr.addListener("changeSelected", function(e) {
        tree.setOpenMode(e.getValue().getValue());
      });


      grid.add(new qx.ui.basic.Label("Selection:"), row, 0, {rowSpan: 3});

      var c1 = new qx.ui.form.CheckBox("Enable Multi-Selection");
      c1.setChecked(tree.getManager().getMultiSelection());
      grid.add(c1, row++, 1);

      console.log("multi", tree.getManager().getMultiSelection())

      var c2 = new qx.ui.form.CheckBox("Enable Drag-Selection");
      c2.setChecked(tree.getManager().getDragSelection());
      grid.add(c2, row++, 1);

      var c3 = new qx.ui.form.CheckBox("Allow Deselection");
      c3.setChecked(tree.getManager().getCanDeselect());
      grid.add(c3, row++, 1);

      c1.addListener("changeChecked", function(e) {
        tree.getManager().setMultiSelection(e.getValue());
      });

      c2.addListener("changeChecked", function(e) {
        console.log(e.getValue(), e)
        tree.getManager().setDragSelection(e.getValue());
      });

      c3.addListener("changeChecked", function(e) {
        tree.getManager().setCanDeselect(e.getValue());
      });



/*

      var tTreeLines = new qx.ui.form.CheckBox("Use tree lines?");

      with(tTreeLines) {
        setTop(80);
        setLeft(0);
        setChecked(true);
      };

      commandFrame.add(tTreeLines);

      tTreeLines.addEventListener("changeChecked", function(e) { tree.setUseTreeLines(e.getData()); });
*/


      var vShowItems = new qx.ui.form.Button("Show Items");
      grid.add(vShowItems, row++, 1);

      vShowItems.addListener("execute", function(e) {
        console.log(tree.getItems());
      });
    }
  }
});
