/**
 * Show use of events upon tree opening and closing, including adding nodes
 * dynamically upon tree open and removing the open/close button upon tree
 * open if the branch contains no children.
 *
 * Allows controlling selection mode.  Labels of selected items are displayed.
 */
qx.Class.define("demobrowser.demo.treevirtual.TreeVirtual_Events",
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
      tree.set(
        {
          width  : 400,
          decorator : "pane",
          backgroundColor : "white"
        });
      tree.setColumnWidth(0, 400);
      tree.setAlwaysShowOpenCloseSymbol(true);
  
      // Add the tree to the document
      this.getRoot().add(
        tree,
        {
          left   : 10,
          top    : 30,
          bottom : 30
        });
  
      // tree data model
      var dataModel = tree.getDataModel();
  
      var te1 = dataModel.addBranch(null, "Desktop", true);
  
      var te;
      dataModel.addBranch(te1, "Files", true);
  
      te = dataModel.addBranch(te1, "Workspace", true);
      dataModel.addLeaf(te, "Windows (C:)");
      dataModel.addLeaf(te, "Documents (D:)");
  
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
  
      /*
       * Each time we get a treeOpenWithContent event, add yet another leaf node
       * to the node being opened.
       */
      tree.addListener("treeOpenWithContent",
                       function(e)
                       {
                         alert('treeOpenWithContent ');
                         var node = e.getData();
                         dataModel.addLeaf(node.nodeId, newItem.toString());
                         newItem++;
                       });
  
      tree.addListener("treeClose",
                       function(e)
                       {
                         alert('treeClose ');
                       });
  
      /*
       * We handle opening an empty folder specially.  We demonstrate how to
       * disable the open/close symbol once we've determined there's nothing
       * in it.  This feature might be used to dynamically retrieve the
       * contents of the folder, and if nothing is available, indicate it by
       * removing the open/close symbol.
       */
      tree.addListener("treeOpenWhileEmpty",
                       function(e)
                       {
                         alert('treeOpenWhileEmpty');
                         var node = e.getData();
                         tree.nodeSetHideOpenClose(node, true);
                       });
  
  
      tree.addListener("changeSelection",
                       function(e)
                       {
                         var text = "Selected labels:";
                         var selectedNodes = e.getData();
                         for (i = 0; i < selectedNodes.length; i++)
                           {
                             text += "\n  " + selectedNodes[i].label;
                           }
                         alert('changeSelection: ' + text);
                       });
  
  
  
      var commandFrame = new qx.ui.groupbox.GroupBox("Control");
      this.getRoot().add(commandFrame,
                         {
                           top: 48,
                           left: 520,
                           right: 290
                         });
  
      // Create a combo box for the selection type
      var o = new qx.ui.basic.Atom("Selection Mode: ");
      o.set({ top: 6, left: 0 });
      commandFrame.add(o);
  
      o = new qx.ui.form.ComboBox();
//      o.setEditable(false);
  
      // Add the various selection types
      var item = new qx.ui.form.ListItem("No Selection");
      o.add(item);
      var item = new qx.ui.form.ListItem("Single Selection");
      o.add(item);
      item.getManager().setSelected(this);
      var item = new qx.ui.form.ListItem("Single Interval Selection");
      o.add(item);
      var item = new qx.ui.form.ListItem("Multiple Interval Selection");
      o.add(item);
    
      // We want to be notified if the selection changes
      o.addListener(
        "changeSelected",
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
  
      commandFrame.add(o,
                       {
                         top : 20,
                         left : 4,
                         right : 4
                       });
    }
  }
});
