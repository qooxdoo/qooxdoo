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
      new qx.data.controller.Tree(nodes[0], tree, "children", "name");
      
      // open the root node
      tree.getRoot().setOpen(true);
      
      
      /* ***********************************************
       * Controlls: Do only work on the data array
       * ********************************************* */  
/*
      var addItemButton = new qx.ui.form.Button("Add an item");
      addItemButton.setWidth(120);
      this.getRoot().add(addItemButton, {left: 370, top: 110});
      addItemButton.addListener("execute", function() {
        data.push("Item " + data.length);
      }, this);
      
      var removeItemButton = new qx.ui.form.Button("Remove an item");
      removeItemButton.setWidth(120);
      this.getRoot().add(removeItemButton, {left: 370, top: 145});
      removeItemButton.addListener("execute", function() {
        data.pop();
      }, this);
      
      var logDataButton = new qx.ui.form.Button("Write data to log");
      logDataButton.setWidth(120);
      this.getRoot().add(logDataButton, {left: 370, top: 180});
      logDataButton.addListener("execute", function() {
        // open the console
        qx.log.appender.Console.show();
        // push the data in the consoleListController.html
        this.info(data.toString());
      }, this);
*/









       /* ***********************************************
        * DESCRIPTIONS
        * ********************************************* */  
       // List Selection sync description
       var syncListDescription = new qx.ui.basic.Label();
       syncListDescription.setRich(true);
       syncListDescription.setWidth(250);
       syncListDescription.setContent(
         "<b>Tree binding</b><br/>"
         + "This tree is bound to a set of randomly generated nodes."
       );
       this.getRoot().add(syncListDescription, {left: 20, top: 10});      
    }
  }
});
