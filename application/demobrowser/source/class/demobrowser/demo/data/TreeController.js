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
            
      // create the wirdget
      var tree = new qx.ui.tree.Tree();
      this.getRoot().add(tree, {left: 10, top: 80});
      tree.setWidth(250);
      tree.setHeight(300);
      
      // bind the widget to the data with the controller
      var controller = new qx.data.controller.Tree(nodes[0], tree, "children", "name");
      
      // open the root node
      tree.getRoot().setOpen(true);
      
      root = nodes[0];
      
      
      /* ***********************************************
       * Controlls: Do only work on the data array
       * ********************************************* */  

      var addItemButton = new qx.ui.form.Button("Add an item to root");
      addItemButton.setWidth(180);
      this.getRoot().add(addItemButton, {left: 270, top: 80});
      addItemButton.addListener("execute", function() {
        var node = new demobrowser.demo.data.model.Node();
        node.setName("Item " + tree.getItems(true).length);
        node.setName2("Thing " + tree.getItems(true).length);        
        nodes[0].getChildren().push(node);
      }, this);
      
      var removeItemButton = new qx.ui.form.Button("Remove an item from root");
      removeItemButton.setWidth(180);
      this.getRoot().add(removeItemButton, {left: 270, top: 115});
      removeItemButton.addListener("execute", function() {
        nodes[0].getChildren().pop();
      }, this);
      
      var changeNameButton = new qx.ui.form.Button("Change the label binding");
      changeNameButton.setWidth(180);
      this.getRoot().add(changeNameButton, {left: 270, top: 150});
      changeNameButton.addListener("execute", function() {
        if (controller.getLabelPath() == "name") {
          controller.setLabelPath("name2");
        } else {
          controller.setLabelPath("name");
        }
      }, this);

      var logDataButton = new qx.ui.form.Button("Write data to log");
      logDataButton.setWidth(180);
      this.getRoot().add(logDataButton, {left: 270, top: 185});
      logDataButton.addListener("execute", function() {
        // push the data in the consoleListController.html
        this.info(nodes[0].toString());
      }, this);








       /* ***********************************************
        * DESCRIPTIONS
        * ********************************************* */  
       // List Selection sync description
       var syncListDescription = new qx.ui.basic.Label();
       syncListDescription.setRich(true);
       syncListDescription.setWidth(430);
       syncListDescription.setContent(
         "<b>Tree binding</b><br/>"
         + "This tree is bound to a set of randomly generated nodes. Every node"
         + " does have a name and a name2 property, containing 'Item i' and "
         + "'Thing i'. The children are stored in a qx.data.Array for each node."
       );
       this.getRoot().add(syncListDescription, {left: 20, top: 10});      
    }
  }
});
