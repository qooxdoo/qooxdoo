/*
 * Demonstrate use of multiple columns in a tree, and the use of the
 * getHierarchy() method to retrieve the entire tree path of a node.
 * Allows various options to be manipulated.
 */
qx.Class.define("demobrowser.demo.treevirtual.TreeVirtual_Multiple_Columns",
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
      tree.nodeSetLabelStyle(te1,
                             "background-color: red; " +
                             "color: white;" +
                             "font-weight: bold;");

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
      tree.nodeSetCellStyle(te, "background-color: cyan;");

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

      var commandFrame = new qx.ui.groupbox.GroupBox("Control");
      commandFrame.setLayout(new qx.ui.layout.VBox(8));

      hBox.add(commandFrame);

      var o = new qx.ui.basic.Atom("Current Selection: ");
      commandFrame.add(o);

      o = new qx.ui.form.TextField();
      o.set({ readOnly: true });
      commandFrame.add(o);

      tree.addListener(
        "changeSelection",
        function(e)
        {
          // Get the list of selected nodes.  We're in single-selection mode,
          // so there will be only one of them.
          var nodes = e.getData();
          this.setValue(tree.getHierarchy(nodes[0].nodeId).join('/'));
          buttonRemove.setEnabled(true);
        },
        o);

      var buttonRemove = new qx.ui.form.Button("Remove");
      buttonRemove.set({ enabled: false });
      commandFrame.add(buttonRemove);
      buttonRemove.addListener(
        "execute",
        function(e)
        {
          var selectedNodes = tree.getSelectedNodes();
          for (var i = 0; i < selectedNodes.length; i++)
          {
            dataModel.prune(selectedNodes[i].nodeId, true);
            dataModel.setData();
          }
        });

      o = new qx.ui.form.CheckBox("Use tree lines if theme supports them?");
      o.set({ value: true });
      commandFrame.add(o);
      o.addListener("changeValue",
                    function(e)
                    {
                      tree.setUseTreeLines(e.getData());
                    });

      o = new qx.ui.form.CheckBox("Exclude first-level tree lines?");
      o.set({ value: false });
      commandFrame.add(o);
      o.addListener("changeValue",
                    function(e)
                    {
                      tree.setExcludeFirstLevelTreeLines(e.getData());
                    });

      o = new qx.ui.form.CheckBox("Always show open/close symbol?");
      o.set({ value: true });
      commandFrame.add(o);
      o.addListener("changeValue",
                    function(e)
                    {
                      tree.setAlwaysShowOpenCloseSymbol(e.getData());
                    });

      o = new qx.ui.form.CheckBox("Remove open/close if found empty?");
      o.set({ value: true });
      commandFrame.add(o);
      tree.addListener("treeOpenWhileEmpty",
                       function(e)
                       {
                         if (this.getValue())
                         {
                           var node = e.getData();
                           tree.nodeSetHideOpenClose(node, true);
                         }
                       },
                       o);

      o = new qx.ui.form.CheckBox("Open/close click selects row?");
      o.set({ value: false });
      commandFrame.add(o);
      o.addListener("changeValue",
                    function(e)
                    {
                      tree.setOpenCloseClickSelectsRow(e.getData());
                    });

      o = new qx.ui.form.CheckBox("Disable the tree?");
      o.set({ value: false });
      commandFrame.add(o);
      o.addListener("changeValue",
                    function(e)
                    {
                      tree.setEnabled(! e.getData());
                    });

      o = new qx.ui.form.CheckBox("Show column visibilty menu");
      o.set({ value: true });
      commandFrame.add(o);
      o.addListener("changeValue",
                    function(e)
                    {
                      tree.setColumnVisibilityButtonVisible(e.getData());
                    });
    }
  }
});
