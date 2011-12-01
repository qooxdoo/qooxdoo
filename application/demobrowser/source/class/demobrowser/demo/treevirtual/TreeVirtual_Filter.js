/*
 * Demonstrate how to apply a filter to the SimpleTreeDataModel.
 */
qx.Class.define("demobrowser.demo.treevirtual.TreeVirtual_Filter",
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
      var tree = new qx.ui.treevirtual.TreeVirtual(
          [
            "Tree",
            "Permissions",
            "Last Accessed"
          ]);
      tree.set(
        {
          width  : 400
        });
      tree.setAlwaysShowOpenCloseSymbol(true);

      // Obtain the resize behavior object to manipulate
      var resizeBehavior = tree.getTableColumnModel().getBehavior();

      // Ensure that the tree column remains sufficiently wide
      resizeBehavior.set(0, { width:"1*", minWidth:180  });

      hBox.add(tree);

      // tree data model
      var dataModel = tree.getDataModel();

      var te1 = dataModel.addBranch(null, "Desktop", true);
      var te1_1;

      dataModel.addBranch(te1, "Files", true);

      te1_1 = dataModel.addBranch(te1, "Workspace", true);
      var te = dataModel.addLeaf(te1_1, "Windows (C:)");
      dataModel.setColumnData(te, 1, "-rwxr-xr-x");
      dataModel.setColumnData(te, 2, "2007-01-30 22:54:03");
      te = dataModel.addLeaf(te1_1, "Documents (D:)");
      dataModel.setColumnData(te, 1, "-rwxr-xr-x");
      dataModel.setColumnData(te, 2, "2007-01-30 22:54:03");

      dataModel.addBranch(te1, "Network", true);

      te = dataModel.addBranch(te1, "Trash", true);

      var te2 = dataModel.addBranch(null, "Inbox", true);

      te = dataModel.addBranch(te2, "Spam", true);

      for (var i = 1; i < 3000; i++)
      {
        dataModel.addLeaf(te, "Spam Message #" + i);
      }

      dataModel.addBranch(te2, "Sent", false);
      dataModel.addBranch(te2, "Trash", false);
      dataModel.addBranch(te2, "Data", false);
      dataModel.addBranch(te2, "Edit", false);

      var commandFrame = new qx.ui.groupbox.GroupBox("Control");
      commandFrame.setLayout(new qx.ui.layout.VBox(2));

      hBox.add(commandFrame);

      // Create a combo box for the selection type
      var filterLabel = new qx.ui.basic.Label("Filter:");
      commandFrame.add(filterLabel);

      var textField = new qx.ui.form.TextField();
      textField.setValue("100");
      textField.addListener("input", function() {
        dataModel.setData();
      },this);
      commandFrame.add(textField);

      // Set the filter
      var filter = qx.lang.Function.bind(function(node)
      {
        if (node.type == qx.ui.treevirtual.MTreePrimitive.Type.LEAF) {
          var label = node.label;
          return label.indexOf(textField.getValue()) != -1;
        }
        return true;
      }, this);
      dataModel.setFilter(filter);
    }
  }
});
