/**
 * Demonstrate providing initially-selected tree nodes.
 */
qx.Class.define("demobrowser.demo.treevirtual.TreeVirtual_Selections",
{
  extend : qx.application.Standalone,

  members :
  {
    main : function()
    {
      this.base(arguments);
      // We want to use some of the high-level node operation convenience
      // methods rather than manually digging into the TreeVirtual helper
      // classes.  Include the mixin that provides them.
      qx.Class.include(qx.ui.treevirtual.TreeVirtual,
                       qx.ui.treevirtual.MNode);
      
      // Use an HBox to hold the tree and the groupbox
      var hBox = new qx.ui.container.Composite(new qx.ui.layout.HBox(20));
      this.getRoot().add(hBox, { edge : 30 });

      // tree
      var tree = new qx.ui.treevirtual.TreeVirtual("Tree");
      tree.set(
        {
          width  : 400
        });

      tree.setColumnWidth(0, 400);
      tree.setAlwaysShowOpenCloseSymbol(true);
  
      tree.setSelectionMode(
                qx.ui.treevirtual.TreeVirtual.SelectionMode.MULTIPLE_INTERVAL);
  
      // Add the tree to the document
      hBox.add(tree);
  
      // tree data model
      var dataModel = tree.getDataModel();
  
      var te1 = dataModel.addBranch(null, "Desktop", true);
  
      var x;
      var te;
      dataModel.addBranch(te1, "Files", true);
  
      te = dataModel.addBranch(te1, "Workspace", true);
      x = dataModel.addLeaf(te, "Windows (C:)");
      tree.nodeSetSelected(x, true);
      x = dataModel.addLeaf(te, "Documents (D:)");
      tree.nodeSetSelected(x, true);
  
      dataModel.addBranch(te1, "Network", true);
      dataModel.addBranch(te1, "Trash", true);
  
      var te2 = dataModel.addBranch(null, "Inbox", true);
  
      te = dataModel.addBranch(te2, "Spam", false);
      for (var i = 1; i < 3000; i++)
      {
        dataModel.addLeaf(te, "Spam Message #" + i);
      }
  
      dataModel.addBranch(te2, "Sent", false);
      dataModel.addBranch(te2, "Trash", false);
      dataModel.addBranch(te2, "Data", false);
      dataModel.addBranch(te2, "Edit", false);
  
      dataModel.setData();
  
      var newItem = 1;
  
      var commandFrame = new qx.ui.groupbox.GroupBox("Control");
      commandFrame.setLayout(new qx.ui.layout.VBox(2));

      hBox.add(commandFrame);
  
      // Create a combo box for the selection type
      var o = new qx.ui.basic.Atom("Selection Mode: ");
      commandFrame.add(o);
  
      o = new qx.ui.form.SelectBox();
  
      // Add the various selection types
      var item = new qx.ui.form.ListItem("No Selection");
      o.add(item);
      var item = new qx.ui.form.ListItem("Single Selection");
      o.add(item);
      var item = new qx.ui.form.ListItem("Single Interval Selection");
      o.add(item);
      var item = new qx.ui.form.ListItem("Multiple Interval Selection");
      o.add(item);
      o.setSelected(item);
    
      // We want to be notified if the selection changes
      o.addListener(
        "changeValue",
        function()
        {
          switch(this.getValue())
          {
          case "No Selection":
            tree.setSelectionMode(
              qx.ui.treevirtual.TreeVirtual.SelectionMode.NONE);
            break;
  
          case "Single Selection":
            tree.setSelectionMode(
              qx.ui.treevirtual.TreeVirtual.SelectionMode.SINGLE);
            break;
  
          case "Single Interval Selection":
            tree.setSelectionMode(
              qx.ui.treevirtual.TreeVirtual.SelectionMode.SINGLE_INTERVAL);
            break;
  
          case "Multiple Interval Selection":
            tree.setSelectionMode(
              qx.ui.treevirtual.TreeVirtual.SelectionMode.MULTIPLE_INTERVAL);
            break;
          }
        });
  
      commandFrame.add(o);
    }
  }
});
