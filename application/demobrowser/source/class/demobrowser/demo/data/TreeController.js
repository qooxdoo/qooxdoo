/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * @tag noPlayground
 * tag databinding
 */
qx.Class.define("demobrowser.demo.data.TreeController",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      // create the data
      var nodes = [];
      for (var i = 0; i < 50; i++) {
        nodes[i] = new demobrowser.demo.data.model.Node();
        nodes[i].setName("Item " + i);
        nodes[i].setName2("Thing " + i);
        // if its not the root node
        if (i != 0) {
          // add the children in some random order
          nodes[parseInt(Math.random() * i)].getChildren().push(nodes[i]);
        }
      }

      // create the tree
      var tree = new qx.ui.tree.Tree();
      tree.setSelectionMode("multi");
      this.getRoot().add(tree, {left: 10, top: 130});
      tree.setWidth(250);
      tree.setHeight(300);

      // bind the widget to the data with the controller
      var treeController = new qx.data.controller.Tree(nodes[0], tree, "children", "name");

      // open the root node
      tree.getRoot().setOpen(true);


      // create a list for the selection
      var list = new qx.ui.form.List();
      list.setHeight(300);
      this.getRoot().add(list, {left: 270, top: 130});

      // bind the list to the selection of the tree
      new qx.data.controller.List(treeController.getSelection(), list, "name2");




      /* ***********************************************
       * Controlls: Do only work on the data array
       * ********************************************* */

      var addItemButton = new qx.ui.form.Button("Add an item to root");
      addItemButton.setWidth(180);
      this.getRoot().add(addItemButton, {left: 390, top: 130});
      addItemButton.addListener("execute", function() {
        var node = new demobrowser.demo.data.model.Node();
        node.setName("Item " + tree.getItems(true).length);
        node.setName2("Thing " + tree.getItems(true).length);
        nodes[0].getChildren().push(node);
      }, this);

      var removeItemButton = new qx.ui.form.Button("Remove an item from root");
      removeItemButton.setWidth(180);
      this.getRoot().add(removeItemButton, {left: 390, top: 165});
      removeItemButton.addListener("execute", function() {
        nodes[0].getChildren().pop();
      }, this);

      var changeNameButton = new qx.ui.form.Button("Change the label binding");
      changeNameButton.setWidth(180);
      this.getRoot().add(changeNameButton, {left: 390, top: 200});
      changeNameButton.addListener("execute", function() {
        if (treeController.getLabelPath() == "name") {
          treeController.setLabelPath("name2");
        } else {
          treeController.setLabelPath("name");
        }
      }, this);

      var logDataButton = new qx.ui.form.Button("Write data to log");
      logDataButton.setWidth(180);
      this.getRoot().add(logDataButton, {left: 390, top: 235});
      logDataButton.addListener("execute", function() {
        // push the data in the consoleListController.html
        this.info(nodes[0].toString());
      }, this);








       /* ***********************************************
        * DESCRIPTIONS
        * ********************************************* */
       // treeDescription
       var treeDescription = new qx.ui.basic.Label();
       treeDescription.setRich(true);
       treeDescription.setWidth(240);
       treeDescription.setValue(
         "<b>Tree binding</b><br/>"
         + "This tree is bound to a set of randomly generated nodes. Every node"
         + " does have a name and a name2 property, containing 'Item i' and "
         + "'Thing i'."
       );
       this.getRoot().add(treeDescription, {left: 20, top: 10});


       // List Selection description
       var selectionListDescription = new qx.ui.basic.Label();
       selectionListDescription.setRich(true);
       selectionListDescription.setWidth(100);
       selectionListDescription.setValue(
         "<b>Selected Items</b><br/>"
         + "A list containing the selected items of the tree."
       );
       this.getRoot().add(selectionListDescription, {left: 270, top: 10});
    }
  }
});
