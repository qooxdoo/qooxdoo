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

/* ************************************************************************
#ignore(qx.test.MyTreeNode)
#ignore(qx.test.TreeEndNode)
#ignore(qx.test.TreeNode)
************************************************************************ */

qx.Class.define("qx.test.data.controller.Tree",
{
  extend : qx.dev.unit.TestCase,
  include : qx.dev.unit.MMock,

  construct : function() {
    this.base(arguments);

    // define a test class
    qx.Class.define("qx.test.TreeNode",
    {
      extend : qx.core.Object,

      construct : function() {
        this.base(arguments);

        this.setChildren(new qx.data.Array());
        this.setAltChildren(new qx.data.Array());
      },

      properties :
      {
        children : {
          check : "qx.data.Array",
          event : "changeChild",
          nullable : true
        },

        altChildren : {
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
        },

        icon : {
          check : "String",
          event: "changeIcon",
          nullable: true
        },

        icon2 : {
          check : "String",
          event: "changeIcon2",
          nullable: true
        },

        color : {
          check : "String",
          event : "changeColor",
          init: "green",
          nullable: true
        }
      },

      destruct : function()
      {
        if (this.getChildren()) {
          this.getChildren().setAutoDisposeItems(true);
          this.getChildren().dispose();
        }
        if (this.getAltChildren()) {
          this.getAltChildren().setAutoDisposeItems(true);
          this.getAltChildren().dispose();
        }
      }
    });
  },


  members :
  {

    __tree: null,
    __model: null,
    __controller: null,

    __a: null,
    __b: null,
    __c: null,

    setUp : function()
    {
      // prevent the icon laod error with this stub
      this.stub(qx.io.ImageLoader, "load")

      this.__tree = new qx.ui.tree.Tree();

      // create a model
      //        this.__model
      //        /    |      \
      // this.__a  this.__b  this.__c
      this.__model = new qx.test.TreeNode();

      this.__a = new qx.test.TreeNode();
      this.__a.set({
        name: "a",
        name2: "a2",
        icon: "icon a",
        icon2: "icon a2",
        color: "red"
      });

      this.__b = new qx.test.TreeNode();
      this.__b.set({
       name: "b",
       name2: "b2",
       icon: "icon b",
       icon2: "icon b2",
       color: "blue"
      });

      this.__c = new qx.test.TreeNode();
      this.__c.set({
        name: "c",
        name2: "c2",
        icon: "icon c",
        icon2: "icon c2",
        color: "white"
      });

      this.__model.getChildren().push(this.__a, this.__b, this.__c);
      this.__model.getAltChildren().push(this.__c, this.__b, this.__a);

      // create the controller
      this.__controller = new qx.data.controller.Tree(this.__model, this.__tree, "children", "name");
      this.__controller.setIconPath("icon");
    },


    tearDown : function()
    {
      this.__controller.dispose();
      this.__model.dispose();
      this.__tree.dispose();

      // clear the stub
      this.getSandbox().restore();
    },


    testRemoveBindingsRecursive: function(){
      // reform the model tree
      this.__model.getChildren().remove(this.__c);
      this.__a.getChildren().push(this.__c);

      var cFolder = this.__tree.getRoot().getChildren()[0].getChildren()[0];
      this.assertNotNull(cFolder, "Third node does not exist");
      this.assertEquals("c", cFolder.getLabel());

      // remove the model node
      this.__a.getChildren().remove(this.__c);
      // check if its disposed and the bindings have been removed
      this.__c.setName("affe");
      this.assertEquals("c", cFolder.getLabel());

      // destroy is async --> wait for it!
      this.wait(100, function() {
        this.assertTrue(cFolder.isDisposed());
      }, this);
    },


    testModelChange: function(){
      // set model to null
      this.__controller.setModel(null);

      // set the same model again (forces the tree to redraw)
      this.__controller.setModel(this.__model);

      var d  = new qx.test.TreeNode();
      d.setName("d");

      var model = this.__model;
      // add the new model
      this.wait(100, function() {
        model.getChildren().push(d);
      });

      // d will be disposed by the model
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
      var d = new qx.test.TreeNode();
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
      var d = new qx.test.TreeNode();
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
      var aa = new qx.test.TreeNode();
      aa.setName("aa");
      var bb = new qx.test.TreeNode();
      bb.setName("bb");
      var cc = new qx.test.TreeNode();
      cc.setName("cc");
      var bbb = new qx.test.TreeNode();
      bbb.setName("bbb");
      var AA = new qx.test.TreeNode();
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
    },


    testChildReverse: function() {
      // reverse the children
      this.__model.getChildren().reverse();
      // check the labels
      this.assertEquals("a", this.__tree.getRoot().getChildren()[2].getLabel(), "First node has a wrong name");
      this.assertEquals("b", this.__tree.getRoot().getChildren()[1].getLabel(), "Second node has a wrong name");
      this.assertEquals("c", this.__tree.getRoot().getChildren()[0].getLabel(), "Third node has a wrong name");
    },


    testChangeChildPath: function() {
      // change the child path
      this.__controller.setChildPath("altChildren");
      // check the labels
      this.assertEquals("c", this.__tree.getRoot().getChildren()[0].getLabel(), "First node has a wrong name");
      this.assertEquals("b", this.__tree.getRoot().getChildren()[1].getLabel(), "Second node has a wrong name");
      this.assertEquals("a", this.__tree.getRoot().getChildren()[2].getLabel(), "Third node has a wrong name");
    },


    testChangeTarget: function() {
      // create a new tree
      var tree = new qx.ui.tree.Tree();

      // set the new tree as target
      this.__controller.setTarget(tree);

      // check the new folders
      this.assertEquals("a", tree.getRoot().getChildren()[0].getLabel(), "First node has a wrong name");
      this.assertEquals("b", tree.getRoot().getChildren()[1].getLabel(), "Second node has a wrong name");
      this.assertEquals("c", tree.getRoot().getChildren()[2].getLabel(), "Third node has a wrong name");

      // check if the old tree is empty
      this.assertNull(this.__tree.getRoot(), "Former tree is not empty.");
      tree.dispose();
    },


    testChangeModel: function() {
      // create a new model
      //     this.__model
      //        /    \
      // this.__a  this.__b
      var model = new qx.test.TreeNode();
      var a = new qx.test.TreeNode();
      a.setName("A");
      var b = new qx.test.TreeNode();
      b.setName("B");
      model.getChildren().push(a, b);

      // set the new model
      this.__controller.setModel(model);

      // check the folders
      this.assertEquals("A", this.__tree.getRoot().getChildren()[0].getLabel(), "First node has a wrong name");
      this.assertEquals("B", this.__tree.getRoot().getChildren()[1].getLabel(), "Second node has a wrong name");

      this.__controller.setModel(null);
      model.dispose();
    },


    testIconPath: function() {
      this.assertEquals(null, this.__tree.getRoot().getIcon(), "Root node has a wrong icon");
      this.assertEquals("icon a", this.__tree.getRoot().getChildren()[0].getIcon(), "First node has a wrong icon");
      this.assertEquals("icon b", this.__tree.getRoot().getChildren()[1].getIcon(), "Second node has a wrong icon");
      this.assertEquals("icon c", this.__tree.getRoot().getChildren()[2].getIcon(), "Third node has a wrong icon");
    },


    testIconPathChange: function() {
      // change the icon path
      this.__controller.setIconPath("icon2");

      // test the binding
      this.assertEquals(null, this.__tree.getRoot().getIcon(), "Root node has a wrong icon");
      this.assertEquals("icon a2", this.__tree.getRoot().getChildren()[0].getIcon(), "First node has a wrong icon");
      this.assertEquals("icon b2", this.__tree.getRoot().getChildren()[1].getIcon(), "Second node has a wrong icon");
      this.assertEquals("icon c2", this.__tree.getRoot().getChildren()[2].getIcon(), "Third node has a wrong icon");
    },

    testIconChange: function() {
      // change the icon values
      this.__model.setIcon("AFFE");
      this.__a.setIcon("ICON A");
      this.__b.setIcon("ICON B");
      this.__c.setIcon("ICON C");

      // test the new icon values
      this.assertEquals("AFFE", this.__tree.getRoot().getIcon(), "Root node has a wrong icon");
      this.assertEquals("ICON A", this.__tree.getRoot().getChildren()[0].getIcon(), "First node has a wrong icon");
      this.assertEquals("ICON B", this.__tree.getRoot().getChildren()[1].getIcon(), "Second node has a wrong icon");
      this.assertEquals("ICON C", this.__tree.getRoot().getChildren()[2].getIcon(), "Third node has a wrong icon");
    },


    testSelection: function() {
      // open the tree so that the selection can be done
      this.__tree.getRoot().setOpen(true);
      // select the first object
      this.__tree.addToSelection(this.__tree.getRoot().getChildren()[0]);
      // test the selection
      this.assertEquals(this.__a, this.__controller.getSelection().getItem(0), "Selection does not work.");

      // test for the length
      this.assertEquals(1, this.__controller.getSelection().length, "Selection length is wrong.");

      // select the second object
      this.__tree.addToSelection(this.__tree.getRoot().getChildren()[1]);
      // test the selection
      this.assertEquals(this.__b, this.__controller.getSelection().getItem(0), "Selection does not work.");
      // test for the length
      this.assertEquals(1, this.__controller.getSelection().length, "Selection length is wrong.");
    },


    testSelectionBackMultiple: function() {
      // open the tree so that the selection can be done
      this.__tree.getRoot().setOpen(true);
      // select the second and third object
      this.__tree.setSelectionMode("multi");

      // add the some elements to the selection
      this.__controller.getSelection().push(this.__a);
      this.__controller.getSelection().push(this.__b);

      // test the selection
      this.assertEquals(this.__a, this.__controller.getSelection().getItem(0), "Add to selection does not work.");
      this.assertEquals(this.__b, this.__controller.getSelection().getItem(1), "Add to selection does not work.");
    },


    testSelectionAfterDelete: function() {
      // open the tree so that the selection can be done
      this.__tree.getRoot().setOpen(true);

      // add c to the selection
      this.__controller.getSelection().push(this.__c);
      // remove the c node
      var temp = this.__model.getChildren().splice(2, 1);
      temp.setAutoDisposeItems(true);
      temp.dispose();
      // check if the selection is empty
      this.assertEquals(0, this.__controller.getSelection().length, "Remove from selection does not work!");

      // add b to the selection
      this.__controller.getSelection().push(this.__b);

      // remove the first element of the controller 'this.__a'
      temp = this.__model.getChildren().shift();
      temp.dispose();

      // check if the selected item in the list is "b"
      this.assertTrue(this.__controller.getSelection().contains(this.__b), "Selection array wrong!");
      this.assertEquals("b", this.__tree.getSelection()[0].getLabel(), "Remove from selection does not work!");
    },


    testSelectInvisible: function() {
      // add c to the selection
      this.__controller.getSelection().push(this.__c);

      // check if the selection worked
      this.assertEquals(1, this.__controller.getSelection().length, "Adding of an non visible element should not work.");
    },


    testLabelOptions: function() {
      // create the options
      var options = {
        converter: function(data, model) {
          return data + model.getName2();
        }
      };

      // create the controller
      this.__controller.dispose();
      this.__controller = new qx.data.controller.Tree(this.__model, this.__tree, "children", "name");
      this.__controller.setLabelOptions(options);

      // test the converter
      this.assertEquals("rootroot2", this.__tree.getRoot().getLabel(), "Root node has a wrong name");
      this.assertEquals("aa2", this.__tree.getRoot().getChildren()[0].getLabel(), "First node has a wrong name");
      this.assertEquals("bb2", this.__tree.getRoot().getChildren()[1].getLabel(), "Second node has a wrong name");
      this.assertEquals("cc2", this.__tree.getRoot().getChildren()[2].getLabel(), "Third node has a wrong name");
    },


    testIconOptions: function() {
      // create the options
      var options = {
        converter: function(data, model) {
          if (data != null) {
             return data + model.getName();
          }
          return null;
        }
      };

      // create the controller
      this.__controller.dispose();

      this.__controller = new qx.data.controller.Tree(this.__model, this.__tree, "children", "name");
      this.__controller.setIconPath("icon");
      this.__controller.setIconOptions(options);

      // test the converter
      this.assertNull(this.__tree.getRoot().getIcon(), "Root node has a wrong icon");
      this.assertEquals("icon aa", this.__tree.getRoot().getChildren()[0].getIcon(), "First node has a wrong icon");
      this.assertEquals("icon bb", this.__tree.getRoot().getChildren()[1].getIcon(), "Second node has a wrong icon");
      this.assertEquals("icon cc", this.__tree.getRoot().getChildren()[2].getIcon(), "Third node has a wrong icon");
    },


    testItemWithoutChildren: function() {
      // create new Object
      qx.Class.define("qx.test.TreeEndNode",
      {
        extend : qx.core.Object,

        properties :
        {
          name : {
            check : "String",
            init : "root",
            event : "changeName"
          },

          icon : {
            check : "String",
            event : "changeIcon",
            nullable : true
          }
        }
      });

      var endNode = new qx.test.TreeEndNode();
      endNode.setName("ENDE");
      this.__model.getChildren().push(endNode);

      this.assertEquals("root", this.__tree.getRoot().getLabel(), "Root node has a wrong name");
      this.assertEquals("a", this.__tree.getRoot().getChildren()[0].getLabel(), "First node has a wrong name");
      this.assertEquals("b", this.__tree.getRoot().getChildren()[1].getLabel(), "Second node has a wrong name");
      this.assertEquals("c", this.__tree.getRoot().getChildren()[2].getLabel(), "Third node has a wrong name");
      this.assertEquals("ENDE", this.__tree.getRoot().getChildren()[3].getLabel(), "Fourth node has a wrong name");
    },


    testSetLateModel: function() {
      this.__controller.dispose();
      // create the controller
      this.__controller = new qx.data.controller.Tree(null, this.__tree, "children", "name");

      this.__controller.setModel(this.__model);

      // check the initial Labels
      this.assertEquals("root", this.__tree.getRoot().getLabel(), "Root node has a wrong name");
      this.assertEquals("a", this.__tree.getRoot().getChildren()[0].getLabel(), "First node has a wrong name");
      this.assertEquals("b", this.__tree.getRoot().getChildren()[1].getLabel(), "Second node has a wrong name");
      this.assertEquals("c", this.__tree.getRoot().getChildren()[2].getLabel(), "Third node has a wrong name");
    },


    testSetLateTarget: function() {
      this.__controller.dispose();
      // create the controller
      this.__controller = new qx.data.controller.Tree(this.__model, null, "children", "name");

      this.__controller.setTarget(this.__tree);

      // check the initial Labels
      this.assertEquals("root", this.__tree.getRoot().getLabel(), "Root node has a wrong name");
      this.assertEquals("a", this.__tree.getRoot().getChildren()[0].getLabel(), "First node has a wrong name");
      this.assertEquals("b", this.__tree.getRoot().getChildren()[1].getLabel(), "Second node has a wrong name");
      this.assertEquals("c", this.__tree.getRoot().getChildren()[2].getLabel(), "Third node has a wrong name");
    },


    testSetLateTargetAndModel: function() {
      this.__controller.dispose();
      this.__controller = new qx.data.controller.Tree(null, null, "children", "name");

      this.__controller.setTarget(this.__tree);
      this.__controller.setModel(this.__model);

      // check the initial Labels
      this.assertEquals("root", this.__tree.getRoot().getLabel(), "Root node has a wrong name");
      this.assertEquals("a", this.__tree.getRoot().getChildren()[0].getLabel(), "First node has a wrong name");
      this.assertEquals("b", this.__tree.getRoot().getChildren()[1].getLabel(), "Second node has a wrong name");
      this.assertEquals("c", this.__tree.getRoot().getChildren()[2].getLabel(), "Third node has a wrong name");

      // redo the test and set the modeln and target in different order
      this.__controller.dispose();
      this.__controller = new qx.data.controller.Tree(null, null, "children", "name");

      this.__controller.setModel(this.__model);
      this.__controller.setTarget(this.__tree);

      // check the initial Labels
      this.assertEquals("root", this.__tree.getRoot().getLabel(), "Root node has a wrong name");
      this.assertEquals("a", this.__tree.getRoot().getChildren()[0].getLabel(), "First node has a wrong name");
      this.assertEquals("b", this.__tree.getRoot().getChildren()[1].getLabel(), "Second node has a wrong name");
      this.assertEquals("c", this.__tree.getRoot().getChildren()[2].getLabel(), "Third node has a wrong name");
    },


    testSetLateChildPath: function() {
      this.__controller.dispose();

      this.__controller = new qx.data.controller.Tree(this.__model, this.__tree, null, "name");

      this.__controller.setChildPath("children");

      // check the initial Labels
      this.assertEquals("root", this.__tree.getRoot().getLabel(), "Root node has a wrong name");
      this.assertEquals("a", this.__tree.getRoot().getChildren()[0].getLabel(), "First node has a wrong name");
      this.assertEquals("b", this.__tree.getRoot().getChildren()[1].getLabel(), "Second node has a wrong name");
      this.assertEquals("c", this.__tree.getRoot().getChildren()[2].getLabel(), "Third node has a wrong name");
    },


    testSetLateLabelPath: function() {
      this.__controller.dispose();

      this.__controller = new qx.data.controller.Tree(this.__model, this.__tree, "children");

      this.__controller.setLabelPath("name");

      // check the initial Labels
      this.assertEquals("root", this.__tree.getRoot().getLabel(), "Root node has a wrong name");
      this.assertEquals("a", this.__tree.getRoot().getChildren()[0].getLabel(), "First node has a wrong name");
      this.assertEquals("b", this.__tree.getRoot().getChildren()[1].getLabel(), "Second node has a wrong name");
      this.assertEquals("c", this.__tree.getRoot().getChildren()[2].getLabel(), "Third node has a wrong name");
    },


    testSetLateAll: function() {
      this.__controller.dispose();

      this.__controller = new qx.data.controller.Tree();

      // set the needed properties
      this.__controller.setLabelPath("name");
      this.__controller.setChildPath("children");
      this.__controller.setModel(this.__model);
      this.__controller.setTarget(this.__tree);

      // check the initial Labels
      this.assertEquals("root", this.__tree.getRoot().getLabel(), "Root node has a wrong name");
      this.assertEquals("a", this.__tree.getRoot().getChildren()[0].getLabel(), "First node has a wrong name");
      this.assertEquals("b", this.__tree.getRoot().getChildren()[1].getLabel(), "Second node has a wrong name");
      this.assertEquals("c", this.__tree.getRoot().getChildren()[2].getLabel(), "Third node has a wrong name");
    },


    testDelegateConfigure: function() {
      // create the delegate
      var delegate = new qx.core.Object();
      delegate.configureItem = function(item) {
        item.setUserData("a", true);
      };

      this.__controller.setDelegate(delegate);

      // check the initial Labels
      this.assertTrue(this.__tree.getRoot().getUserData("a"), "Delegation not working.");
      this.assertTrue(this.__tree.getRoot().getChildren()[0].getUserData("a"), "Delegation not working.");
      this.assertTrue(this.__tree.getRoot().getChildren()[1].getUserData("a"), "Delegation not working.");
      this.assertTrue(this.__tree.getRoot().getChildren()[2].getUserData("a"), "Delegation not working.");

      this.__controller.setDelegate(null);
      delegate.dispose();
    },


    testDelegateConfigureLate : function()
    {
      // clear up the setup
      this.__controller.dispose();

      var controller = new qx.data.controller.Tree(null, this.__tree, "children", "name");

      var delegate = {
        configureItem: function(item) {
          item.setUserData("a", true);
        }
      };

      controller.setDelegate(delegate);
      controller.setModel(this.__model);

      // check the initial Labels
      this.assertTrue(this.__tree.getRoot().getUserData("a"), "Delegation not working.");
      this.assertTrue(this.__tree.getRoot().getChildren()[0].getUserData("a"), "Delegation not working.");
      this.assertTrue(this.__tree.getRoot().getChildren()[1].getUserData("a"), "Delegation not working.");
      this.assertTrue(this.__tree.getRoot().getChildren()[2].getUserData("a"), "Delegation not working.");

      controller.dispose();
    },


    testDelegateCreateLate: function () {
      var delegate = {
        createItem : function() {
          var folder = new qx.ui.tree.TreeFolder();
          folder.setUserData("my", true);
          return folder;
        }
      };
      this.__controller.setDelegate(delegate);

      // check the initial Labels
      this.assertEquals("root", this.__tree.getRoot().getLabel(), "Root node has a wrong name");
      this.assertEquals("a", this.__tree.getRoot().getChildren()[0].getLabel(), "First node has a wrong name");
      this.assertEquals("b", this.__tree.getRoot().getChildren()[1].getLabel(), "Second node has a wrong name");
      this.assertEquals("c", this.__tree.getRoot().getChildren()[2].getLabel(), "Third node has a wrong name");

      // check if the folders are the self created folders
      this.assertTrue(this.__tree.getRoot().getUserData("my"), "Default folders found.");
      this.assertTrue(this.__tree.getRoot().getChildren()[0].getUserData("my"), "Default folders found.");
      this.assertTrue(this.__tree.getRoot().getChildren()[1].getUserData("my"), "Default folders found.");
      this.assertTrue(this.__tree.getRoot().getChildren()[2].getUserData("my"), "Default folders found.");
    },


    testDelegateCreateFirst: function () {
      this.__controller.dispose();

      this.__controller = new qx.data.controller.Tree();
      var delegate = {
        createItem : function() {
          var folder = new qx.ui.tree.TreeFolder();
          folder.setUserData("my", true);
          return folder;
        }
      };

      var tree = new qx.ui.tree.Tree();
      this.__controller.setDelegate(delegate);
      this.__controller.setChildPath("children");
      this.__controller.setLabelPath("name");
      this.__controller.setModel(this.__model);
      this.__controller.setTarget(tree);


      // check the initial Labels
      this.assertEquals("root", tree.getRoot().getLabel(), "Root node has a wrong name");
      this.assertEquals("a", tree.getRoot().getChildren()[0].getLabel(), "First node has a wrong name");
      this.assertEquals("b", tree.getRoot().getChildren()[1].getLabel(), "Second node has a wrong name");
      this.assertEquals("c", tree.getRoot().getChildren()[2].getLabel(), "Third node has a wrong name");

      // check if the folders are the self created folders
      this.assertTrue(tree.getRoot().getUserData("my"), "Default folders found.");
      this.assertTrue(tree.getRoot().getChildren()[0].getUserData("my"), "Default folders found.");
      this.assertTrue(tree.getRoot().getChildren()[1].getUserData("my"), "Default folders found.");
      this.assertTrue(tree.getRoot().getChildren()[2].getUserData("my"), "Default folders found.");

      tree.destroy();
    },


    testDelegateBindLate: function () {
      var delegate = {
        bindItem : function(controller, item, id) {
          controller.bindDefaultProperties(item, id);
          controller.bindProperty("color", "textColor", null, item, id);
        }
      };
      this.__controller.setDelegate(delegate);

      // check the initial Labels
      this.assertEquals("root", this.__tree.getRoot().getLabel(), "Root node has a wrong name");
      this.assertEquals("a", this.__tree.getRoot().getChildren()[0].getLabel(), "First node has a wrong name");
      this.assertEquals("b", this.__tree.getRoot().getChildren()[1].getLabel(), "Second node has a wrong name");
      this.assertEquals("c", this.__tree.getRoot().getChildren()[2].getLabel(), "Third node has a wrong name");

      // check the names
      this.assertEquals("green", this.__tree.getRoot().getTextColor(), "Root node has a wrong name");
      this.assertEquals("red", this.__tree.getRoot().getChildren()[0].getTextColor(), "First node has a wrong name");
      this.assertEquals("blue", this.__tree.getRoot().getChildren()[1].getTextColor(), "Second node has a wrong name");
      this.assertEquals("white", this.__tree.getRoot().getChildren()[2].getTextColor(), "Third node has a wrong name");

      this.__model.setColor("black");
      this.assertEquals("black", this.__tree.getRoot().getTextColor(), "Root node has a wrong name");
    },



    testDelegateBindFirst: function () {
      var delegate = {
        bindItem : function(controller, item, id) {
          controller.bindDefaultProperties(item, id);
          controller.bindProperty("color", "textColor", null, item, id);
        }
      };
      var tree = new qx.ui.tree.Tree();
      this.__controller.setDelegate(delegate);
      this.__controller.setChildPath("children");
      this.__controller.setLabelPath("name");
      this.__controller.setModel(this.__model);
      this.__controller.setTarget(tree);

      // check the initial Labels
      this.assertEquals("root", tree.getRoot().getLabel(), "Root node has a wrong name");
      this.assertEquals("a", tree.getRoot().getChildren()[0].getLabel(), "First node has a wrong name");
      this.assertEquals("b", tree.getRoot().getChildren()[1].getLabel(), "Second node has a wrong name");
      this.assertEquals("c", tree.getRoot().getChildren()[2].getLabel(), "Third node has a wrong name");

      // check the names
      this.assertEquals("green", tree.getRoot().getTextColor(), "Root node has a wrong name");
      this.assertEquals("red", tree.getRoot().getChildren()[0].getTextColor(), "First node has a wrong name");
      this.assertEquals("blue", tree.getRoot().getChildren()[1].getTextColor(), "Second node has a wrong name");
      this.assertEquals("white", tree.getRoot().getChildren()[2].getTextColor(), "Third node has a wrong name");

      this.__model.setColor("black");
      this.assertEquals("black", tree.getRoot().getTextColor(), "Root node has a wrong name");

      tree.dispose();
    },


    testDelegateBindPropertyReverse: function () {
      var delegate = {
        bindItem : function(controller, item, id) {
          controller.bindProperty("name", "appearance", null, item, id);
          controller.bindPropertyReverse("name", "appearance", null, item, id);
          controller.bindPropertyReverse("color", "backgroundColor", null, item, id);
        }
      };
      this.__controller.setDelegate(delegate);

      // check the initial Labels
      this.assertEquals("root", this.__tree.getRoot().getAppearance(), "Root node has a wrong name");
      this.assertEquals("a", this.__tree.getRoot().getChildren()[0].getAppearance(), "First node has a wrong name");
      this.assertEquals("b", this.__tree.getRoot().getChildren()[1].getAppearance(), "Second node has a wrong name");
      this.assertEquals("c", this.__tree.getRoot().getChildren()[2].getAppearance(), "Third node has a wrong name");

      // check the reverse binding
      this.__tree.getRoot().setAppearance("ROOT");
      this.assertEquals("ROOT", this.__model.getName(), "Reverse binding not ok!");
      this.__tree.getRoot().getChildren()[0].setBackgroundColor("#123456");
      this.assertEquals("#123456", this.__a.getColor(), "Reverse binding not ok!");

      // invoke a removing and setting of the bindings with the new bindItem
      delegate.bindItem = function(controller, item, id) {
        controller.bindProperty("name", "appearance", null, item, id);
      }
      this.__controller.setDelegate(null);
      this.__controller.setDelegate(delegate);

      this.__tree.getRoot().setAppearance("123");
      this.assertEquals("ROOT", this.__model.getName(), "Removing not ok");
      this.__tree.getRoot().getChildren()[0].setBackgroundColor("#654321");
      this.assertEquals("#123456", this.__a.getColor(), "Removing not ok");
    },


    testDelegateAddItem: function() {
      var a = new qx.test.TreeNode();
      a.setName("new");
      // set a delegate
      this.__controller.setDelegate({
        createItem : function() {
          return new qx.ui.tree.TreeFolder();
        }
      });

      // flush the dispose queue
      qx.ui.core.queue.Dispose.flush();
      // add the new model
      this.__model.getChildren().push(a);
    },


    testResetModel: function() {
      this.__controller.resetModel();
      this.assertNull(this.__tree.getRoot(), "Tree is not empty.");
    },


    testChangeChildrenArray : function() {
      // create the new children array
      var children = new qx.data.Array();
      var a = new qx.test.TreeNode();
      a.setName("new");
      children.push(a);

      var oldChildren = this.__a.getChildren();

      // change the children array
      //        this.__model
      //        /    |      \
      // this.__a  this.__b  this.__c
      //    |
      //   a
      this.__a.setChildren(children);

      oldChildren.dispose();

      // Test if the tree nodes exist
      this.assertNotUndefined(this.__tree.getRoot(), "Root node does not exist");
      this.assertNotUndefined(this.__tree.getRoot().getChildren()[0], "First node does not exist");
      this.assertNotUndefined(this.__tree.getRoot().getChildren()[0].getChildren()[0], "New node does not exist");

      // test if its the proper node
      this.assertEquals("new", this.__tree.getRoot().getChildren()[0].getChildren()[0].getLabel());
    },


    testInheritedChildren : function()
    {
      qx.Class.define("qx.test.MyTreeNode", {
        extend : qx.test.TreeNode
      });

      // init (copy of setUp)
      this.__tree.dispose();
      this.__model.dispose();
      this.__a.dispose();
      this.__b.dispose();
      this.__c.dispose();
      this.__tree = new qx.ui.tree.Tree();

      // create a model
      //        this.__model
      //        /    |      \
      // this.__a  this.__b  this.__c
      this.__model = new qx.test.MyTreeNode();

      this.__a = new qx.test.MyTreeNode();
      this.__a.set({
        name: "a",
        name2: "a2",
        icon: "icon a",
        icon2: "icon a2",
        color: "red"
      });

      this.__b = new qx.test.MyTreeNode();
      this.__b.set({
       name: "b",
       name2: "b2",
       icon: "icon b",
       icon2: "icon b2",
       color: "blue"
      });

      this.__c = new qx.test.MyTreeNode();
      this.__c.set({
        name: "c",
        name2: "c2",
        icon: "icon c",
        icon2: "icon c2",
        color: "white"
      });

      this.__model.getChildren().push(this.__a, this.__b, this.__c);
      this.__model.getAltChildren().push(this.__c, this.__b, this.__a);

      // create the controller
      this.__controller.dispose();
      this.__controller = new qx.data.controller.Tree(this.__model, this.__tree, "children", "name");

      // check the initial Labels
      this.assertEquals("root", this.__tree.getRoot().getLabel(), "Root node has a wrong name");
      this.assertEquals("a", this.__tree.getRoot().getChildren()[0].getLabel(), "First node has a wrong name");
      this.assertEquals("b", this.__tree.getRoot().getChildren()[1].getLabel(), "Second node has a wrong name");
      this.assertEquals("c", this.__tree.getRoot().getChildren()[2].getLabel(), "Third node has a wrong name");
    },


    testRemoveEvents : function()
    {
      // BUG #3566

      var nodes = [];
      for (var i = 0; i < 50; ++i)
      {
        nodes[i] = new qx.test.TreeNode();
        if (i != 0) {
          nodes[parseInt(Math.random() * i, 10)].getChildren().push(nodes[i]);
        }
      }

      var tree = new qx.ui.tree.Tree();
      var controller = new qx.data.controller.Tree(nodes[0], tree, "children", "name");

      for (var i = 0; i < nodes.length; ++i) {
        nodes[i].getChildren().removeAll(); // THIS THROWS AN EXCEPTION ON 2ND ELEMENT...
      }

      controller.dispose();
      tree.dispose();

      for (var i = 0; i < nodes.length; ++i) {
        nodes[i].dispose();
      }
    },


    testBindItemDouble: function(){
      var delegate = {
        bindItem : function(controller, item, id) {
          controller.bindProperty("color", "textColor", null, item, id);
          controller.bindProperty("color", "textColor", null, item, id);
        }
      };
      var self = this;
      this.assertException(function() {
        self.__controller.setDelegate(delegate);
      }, Error, /textColor/.g);
    },


    testBindItemDoubleReverse: function(){
      var delegate = {
        bindItem : function(controller, item, id) {
          controller.bindPropertyReverse("color", "textColor", null, item, id);
          controller.bindPropertyReverse("color", "textColor", null, item, id);
        }
      };
      var self = this;
      this.assertException(function() {
        self.__controller.setDelegate(delegate);
      }, Error, /textColor/.g);
    }
  }
});