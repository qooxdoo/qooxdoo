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
        },
        
        name2 : {
          check : "String",
          init : "root2",
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
      //        this.__model
      //        /    |      \
      // this.__a  this.__b  this.__c
      this.__model = new test.TreeNode();
      this.__a = new test.TreeNode();
      this.__a.setName("a");
      this.__a.setName2("a2");      
      this.__b = new test.TreeNode();
      this.__b.setName("b");
      this.__b.setName2("b2");      
      this.__c = new test.TreeNode();
      this.__c.setName("c");
      this.__c.setName2("c2");      
      this.__model.getChildren().push(this.__a, this.__b, this.__c);

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
    },
    
    
    testFolderLabelInitial: function() {
      // check the initial Labels
      this.assertEquals("root", this.__tree.getRoot().getLabel(), "Root node has a wrong name");
      this.assertEquals("a", this.__tree.getRoot().getChildren()[0].getLabel(), "First node has a wrong name");
      this.assertEquals("b", this.__tree.getRoot().getChildren()[1].getLabel(), "Second node has a wrong name");
      this.assertEquals("c", this.__tree.getRoot().getChildren()[2].getLabel(), "Third node has a wrong name");      
    },
    
    
    testFolderLabelChangeName: function() {
      // change the names
      this.__model.setName("ROOT");
      this.__a.setName("A");
      this.__b.setName("B");
      this.__c.setName("C");
      // check the initial Labels
      this.assertEquals("ROOT", this.__tree.getRoot().getLabel(), "Root node has a wrong name");
      this.assertEquals("A", this.__tree.getRoot().getChildren()[0].getLabel(), "First node has a wrong name");
      this.assertEquals("B", this.__tree.getRoot().getChildren()[1].getLabel(), "Second node has a wrong name");
      this.assertEquals("C", this.__tree.getRoot().getChildren()[2].getLabel(), "Third node has a wrong name");      
    },
    
    
    testFolderLabelPropertyChange: function() {
      // change the label path
      this.__controller.setLabelPath("name2");
      // check the initial Labels
      this.assertEquals("root2", this.__tree.getRoot().getLabel(), "Root node has a wrong name");
      this.assertEquals("a2", this.__tree.getRoot().getChildren()[0].getLabel(), "First node has a wrong name");
      this.assertEquals("b2", this.__tree.getRoot().getChildren()[1].getLabel(), "Second node has a wrong name");
      this.assertEquals("c2", this.__tree.getRoot().getChildren()[2].getLabel(), "Third node has a wrong name");      
    },
    
    
    testChildPush: function() {
      var d = new test.TreeNode();
      d.setName("d");
      var children = this.__model.getChildren();
      children.push(d);
      
      // Test if the tree nodes exist
      this.assertEquals("root", this.__tree.getRoot().getLabel(), "Root node has a wrong name");
      this.assertEquals("a", this.__tree.getRoot().getChildren()[0].getLabel(), "First node has a wrong name");
      this.assertEquals("b", this.__tree.getRoot().getChildren()[1].getLabel(), "Second node has a wrong name");
      this.assertEquals("c", this.__tree.getRoot().getChildren()[2].getLabel(), "Third node has a wrong name");
      this.assertEquals("d", this.__tree.getRoot().getChildren()[3].getLabel(), "New node has a wrong name");
    },
    
    
    testChildPop: function() {
      var children = this.__model.getChildren();
      children.pop();
      
      this.assertEquals("root", this.__tree.getRoot().getLabel(), "Root node has a wrong name");
      this.assertEquals("a", this.__tree.getRoot().getChildren()[0].getLabel(), "First node has a wrong name");
      this.assertEquals("b", this.__tree.getRoot().getChildren()[1].getLabel(), "Second node has a wrong name");
      this.assertUndefined(this.__tree.getRoot().getChildren()[2], "There is still a third node!");
    },
    
    testChildShift: function() {
      var children = this.__model.getChildren();
      children.shift();
      
      this.assertEquals("root", this.__tree.getRoot().getLabel(), "Root node has a wrong name");
      this.assertEquals("b", this.__tree.getRoot().getChildren()[0].getLabel(), "First node has a wrong name");
      this.assertEquals("c", this.__tree.getRoot().getChildren()[1].getLabel(), "Second node has a wrong name");
      this.assertUndefined(this.__tree.getRoot().getChildren()[2], "There is still a third node!");
    },
    
     
    testChildUnshift: function() {
      var d = new test.TreeNode();
      d.setName("d");
      var children = this.__model.getChildren();
      children.unshift(d);
      
      // Test if the tree nodes exist
      this.assertEquals("root", this.__tree.getRoot().getLabel(), "Root node has a wrong name");
      this.assertEquals("d", this.__tree.getRoot().getChildren()[0].getLabel(), "First node has a wrong name");
      this.assertEquals("a", this.__tree.getRoot().getChildren()[1].getLabel(), "Second node has a wrong name");
      this.assertEquals("b", this.__tree.getRoot().getChildren()[2].getLabel(), "Third node has a wrong name");
      this.assertEquals("c", this.__tree.getRoot().getChildren()[3].getLabel(), "Fourth node has a wrong name");
    },
    
    
    testTreeDeep: function() {
      // remove all children
      this.__model.getChildren().pop();
      this.__model.getChildren().pop();
      this.__model.getChildren().pop();
      
      tree = this.__tree;
      
      // create a staight tree
      // this.__model
      //      \
      //    this.__a
      //        \
      //      this.__b  
      //          \
      //        this.__c
      this.__model.getChildren().push(this.__a);
      this.__a.getChildren().push(this.__b);
      this.__b.getChildren().push(this.__c);

      // test for the model
      this.assertEquals("root", this.__tree.getRoot().getLabel(), "Root node has a wrong name");
      this.assertEquals("a", this.__tree.getRoot().getChildren()[0].getLabel(), "First node has a wrong name");
      this.assertEquals("b", this.__tree.getRoot().getChildren()[0].getChildren()[0].getLabel(), "Second node has a wrong name");
      this.assertEquals("c", this.__tree.getRoot().getChildren()[0].getChildren()[0].getChildren()[0].getLabel(), "Third node has a wrong name");      
    },
    
    
    testBig: function() {
      // build up the model instances
      var aa = new test.TreeNode();
      aa.setName("aa");   
      var bb = new test.TreeNode();
      bb.setName("bb");
      var cc = new test.TreeNode();
      cc.setName("cc");
      var bbb = new test.TreeNode();
      bbb.setName("bbb");
      var AA = new test.TreeNode();
      AA.setName("AA");
      
      // tie the model together
      //          this.__model
      //          /     |      \
      //   this.__a  this.__b  this.__c
      //     /  \        |         |
      //    aa  AA      bb        cc
      //                 |
      //                bbb
      bb.getChildren().push(bbb);
      this.__b.getChildren().push(bb);
      this.__a.getChildren().push(aa, AA);
      this.__c.getChildren().push(cc);
      
      // check the initial Labels
      // root layer
      this.assertEquals("root", this.__tree.getRoot().getLabel(), "Root node has a wrong name");
      // first layer
      this.assertEquals("a", this.__tree.getRoot().getChildren()[0].getLabel(), "a node has a wrong name");
      this.assertEquals("b", this.__tree.getRoot().getChildren()[1].getLabel(), "b node has a wrong name");
      this.assertEquals("c", this.__tree.getRoot().getChildren()[2].getLabel(), "c node has a wrong name");
      // second layer
      this.assertEquals("aa", this.__tree.getRoot().getChildren()[0].getChildren()[0].getLabel(), "aa node has a wrong name");
      this.assertEquals("AA", this.__tree.getRoot().getChildren()[0].getChildren()[1].getLabel(), "AA node has a wrong name");
      this.assertEquals("bb", this.__tree.getRoot().getChildren()[1].getChildren()[0].getLabel(), "bb node has a wrong name");
      this.assertEquals("cc", this.__tree.getRoot().getChildren()[2].getChildren()[0].getLabel(), "cc node has a wrong name");
      // third layer
      this.assertEquals("bbb", this.__tree.getRoot().getChildren()[1].getChildren()[0].getChildren()[0].getLabel(), "bbb node has a wrong name");      
    }
  }
});