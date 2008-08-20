/**
 * Test large trees.  This one adds a Spam branch with 3000 leaf nodes.
 */
qx.Class.define("demobrowser.demo.treevirtual.TreeVirtual",
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
      
      // tree
      var tree = new qx.ui.treevirtual.TreeVirtual("Tree");
      tree.set({
              width  : 400
            });
      tree.setColumnWidth(0, 400);
      tree.setAlwaysShowOpenCloseSymbol(true);
  
      this.getRoot().add(tree,
                         {
                           left : 10,
                           top : 30,
                           bottom : 30
                         });
  
      // tree data model
      var dataModel = tree.getDataModel();
  
      var te1 = dataModel.addBranch(null, "Desktop", true);
      tree.nodeSetLabelStyle(te1, "background-color: red; color: white;");
                           
      var te;
  
      dataModel.addBranch(te1, "Files", true);
  
      te = dataModel.addBranch(te1, "Workspace", true);
      dataModel.addLeaf(te, "Windows (C:)");
      dataModel.addLeaf(te, "Documents (D:)");
  
      dataModel.addBranch(te1, "Network", true);
  
      te = dataModel.addBranch(te1, "Trash", true);
      tree.nodeSetCellStyle(te, "background-color: cyan;");
  
      var te2 = dataModel.addBranch(null, "Inbox", true);
  
      te = dataModel.addBranch(te2, "Spam", false);
  
      for (var i = 1; i < 3000; i++)
      {
        dataModel.addLeaf(te, "Spam Message #" + i);
      }
  
      dataModel.addBranch(te2, "Sent", true);
      dataModel.addBranch(te2, "Trash", true);
      dataModel.addBranch(te2, "Data", true);
      dataModel.addBranch(te2, "Edit", true);
  
      dataModel.setData();
    }
  }
});
