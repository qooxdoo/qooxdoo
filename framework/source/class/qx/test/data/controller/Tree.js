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
qx.Class.define("qx.test.data.controller.Tree", 
{
  extend : qx.dev.unit.TestCase,


  construct : function() {
    this.base(arguments);

    // define a test class
    qx.Class.define("test.TreeNode",
    {
      extend : qx.core.Object,
      
      construct : function() {
        this.base(arguments);
        
        this.setChildren(new qx.data.Array());
      },

      properties :
      {
        children : {
          check : "qx.data.Array",
          event : "changeChild",
          nullable : true
        },

        name : {
          check : "String",
          init : "root",
          event : "changeName"
        }
      }
    });
  },


  members :
  {

    setUp : function()
    {
      this.__tree = new qx.ui.tree.Tree();
      
      // create a model
      this.__model = new test.TreeNode();
      this.__model.getChildren().push(new test.TreeNode(), new test.TreeNode(), new test.TreeNode());
      
      for (var i = 0; i < this.__model.getChildren().length; i++) {
        this.__model.getChildren().getItem(i).setName("Node " + i);
      }
      
      // create the controller
      this.__controller = new qx.data.controller.Tree(this.__model, this.__tree, "children", "name");      
    },


    tearDown : function()
    {
      this.__controller = null;
      this.__model = null;
      this.__tree.dispose();
    },
    
    
    testFolderCreation: function() {
      // Test if the tree nodes exist
      this.assertNotNull(this.__tree.getRoot(), "Root node does not exist");
      this.assertNotNull(this.__tree.getRoot().getChildren()[0], "First node does not exist");
      this.assertNotNull(this.__tree.getRoot().getChildren()[1], "Second node does not exist");
      this.assertNotNull(this.__tree.getRoot().getChildren()[2], "Third node does not exist");
    }
  
  }
});
