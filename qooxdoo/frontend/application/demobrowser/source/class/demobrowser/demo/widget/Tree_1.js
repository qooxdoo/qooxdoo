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

      var t = new qx.ui.tree.Tree("Root").set({
        backgroundColor : "white",
        decorator : "inset",
        width : 200
      });
      this.getRoot().add(t, 20, 48);


      var te1 = new qx.ui.tree.TreeFolder("Desktop");
      te1.setOpen(true)
      t.add(te1);
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

      t.add(te2);



      /*
      var commandFrame = new qx.ui.groupbox.GroupBox("Control");
      with(commandFrame)
      {
        setTop(48);
        setLeft(250);

        setWidth("auto");
        setHeight("auto");
      };

      qx.ui.core.ClientDocument.getInstance().add(commandFrame);
      */
      var grid = new qx.ui.layout.Grid();
      var commandFrame = new qx.ui.core.Widget().set({
        layout: grid,
        decorator : "ridge"
      });
      this.getRoot().add(commandFrame, 250, 48);


      grid.add(new qx.ui.basic.Label("Current Folder: "), 0, 0);
      /*
      var tCurrentInput = new qx.ui.form.TextField;

      with(tCurrentInput)
      {
        setLeft(0);
        setRight(0);
        setTop(20);

        setReadOnly(true);
      };

      commandFrame.add(tCurrentInput);

      t.getManager().addEventListener("changeSelection", function(e) {
        tCurrentInput.setValue(e.getData()[0]._labelObject.getText());
      });



      var tDoubleClick = new qx.ui.form.CheckBox("Use double click?");

      with(tDoubleClick) {
        setTop(60);
        setLeft(0);
      };

      commandFrame.add(tDoubleClick);

      tDoubleClick.addEventListener("changeChecked", function(e) { t.setUseDoubleClick(e.getData()); });



      var tTreeLines = new qx.ui.form.CheckBox("Use tree lines?");

      with(tTreeLines) {
        setTop(80);
        setLeft(0);
        setChecked(true);
      };

      commandFrame.add(tTreeLines);

      tTreeLines.addEventListener("changeChecked", function(e) { t.setUseTreeLines(e.getData()); });




      var vShowItems = new qx.ui.form.Button("Show Items");

      with(vShowItems) {
        setTop(100);
        setLeft(0);
      };

      commandFrame.add(vShowItems);

      vShowItems.addEventListener("execute", function(e) {
        alert(t.getItems());
      });
//*/
    }
  }
});
