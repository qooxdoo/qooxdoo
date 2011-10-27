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
qx.Class.define("qx.test.ui.form.ModelSelection",
{
  extend : qx.test.ui.LayoutTestCase,

  members :
  {
    __testGetSingle : function(widget, children)
    {
      var children = children || widget.getChildren();

      // check the model selection
      widget.setSelection([children[0]]);
      this.assertEquals(1, widget.getModelSelection().getItem(0));

      // check the model selection again
      widget.setSelection([children[2]]);
      this.assertEquals(3, widget.getModelSelection().getItem(0));
    },


    __testGetMulti : function(widget, children)
    {
      var children = children || widget.getChildren();

      // check the model selection
      widget.setSelection([children[0]]);
      this.assertEquals(1, widget.getModelSelection().getItem(0));

      // check the model selection again
      widget.setSelection([children[1], children[2]]);
      this.assertEquals(2, widget.getModelSelection().getLength(), "Wrong length");
      this.assertTrue(widget.getModelSelection().contains(2));
      this.assertTrue(widget.getModelSelection().contains(3));
    },


    __testSetSingle : function(widget, children)
    {
      var children = children || widget.getChildren();

      // check the set selection
      widget.setModelSelection([2]);
      this.assertEquals(children[1], widget.getSelection()[0]);

      // check the set selection again
      widget.setModelSelection([3]);
      this.assertEquals(children[2], widget.getSelection()[0]);
    },


    __testSetMulti : function(widget, children)
    {
      var children = children || widget.getChildren();

      // check the set selection
      widget.setModelSelection([2]);
      this.assertEquals(children[1], widget.getSelection()[0]);

      // check the set selection again
      widget.setModelSelection([2, 3]);
      this.assertEquals(2, widget.getSelection().length);
      this.assertTrue(qx.lang.Array.contains(widget.getSelection(), children[1]));
      this.assertTrue(qx.lang.Array.contains(widget.getSelection(), children[2]));
    },



    __createSelectBox : function()
    {
      var box = new qx.ui.form.SelectBox();
      this.__addListItems(box);
      return box;
    },


    __createList : function()
    {
      var list = new qx.ui.form.List();
      this.__addListItems(list);
      return list;
    },


    __addListItems : function(widget) {
      for (var i = 0; i < 3; i++) {
        var l = new qx.ui.form.ListItem("I" + (i + 1));
        l.setModel(i + 1);
        widget.add(l);
      }
    },


    __createRadioGroup : function() {
      var group = new qx.ui.form.RadioGroup();
      this.__addRadioButton(group);
      return group;
    },


    __createRadioButtonGroup : function() {
      var group = new qx.ui.form.RadioButtonGroup();
      this.__addRadioButton(group);
      return group;
    },


    __addRadioButton : function(widget) {
      for (var i = 0; i < 3; i++) {
        var r = new qx.ui.form.RadioButton();
        r.setModel(i + 1);
        widget.add(r);
      }
    },


    __createTree : function()
    {
      var tree = new qx.ui.tree.Tree();
      var t2 = new qx.ui.tree.TreeFolder().set({model: 3});
      var t1 = new qx.ui.tree.TreeFolder().set({model: 2});
      var t0 = new qx.ui.tree.TreeFolder().set({model: 1});
      tree.setRoot(t0);
      t0.add(t1);
      t1.add(t2);
      // keep one folder closed because the behavior could change if the
      // forlders should be openend
      t1.setOpen(true);
      return tree;
    },


    __getRidOf : function (box)
    {
      var children = box.getChildren();
      for (var i = 0; i < children.length; i++) {
        children[i].dispose();
      }
      box.dispose();
    },


    testSelectBoxGetSingle : function()
    {
      var box = this.__createSelectBox();
      this.__testGetSingle(box);
      this.__getRidOf(box);
    },


    testSelectBoxSetSingle : function()
    {
      var box = this.__createSelectBox();
      this.__testSetSingle(box);
      this.__getRidOf(box);
    },


    testListGetSingle : function()
    {
      var list = this.__createList();
      this.__testGetSingle(list);
      this.__getRidOf(list);
    },


    testListSetSingle : function()
    {
      var list = this.__createList();
      this.__testSetSingle(list);
      this.__getRidOf(list);
    },


    testListGetMulti : function()
    {
      var list = this.__createList();
      list.setSelectionMode("multi");
      this.__testGetMulti(list);
      this.__getRidOf(list);
    },


    testListSetMulti : function()
    {
      var list = this.__createList();
      list.setSelectionMode("multi");
      this.__testSetMulti(list);
      this.__getRidOf(list);
    },


    testRadioGroupGetSingle : function()
    {
      var group = this.__createRadioGroup();
      this.__testGetSingle(group);
      this.__getRidOf(group);
    },


    testRadioGroupSetSingle : function()
    {
      var group = this.__createRadioGroup();
      this.__testSetSingle(group);
      this.__getRidOf(group);
    },


    testRadioButtonGroupGetSingle : function()
    {
      var group = this.__createRadioButtonGroup();
      this.__testGetSingle(group);
      this.__getRidOf(group);
    },


    testRadioButtonGroupSetSingle : function()
    {
      var group = this.__createRadioButtonGroup();
      this.__testSetSingle(group);
      this.__getRidOf(group);
    },


    testTreeGetSingle : function()
    {
      var widget = this.__createTree();
      var children = widget.getItems(true);
      this.__testGetSingle(widget, children);
      widget.destroy();
    },


    testTreeSetSingle : function()
    {
      var widget = this.__createTree();
      var children = widget.getItems(true);
      this.__testSetSingle(widget, children);
      widget.destroy();
    },


    testTreeGetMulti : function()
    {
      var widget = this.__createTree();
      widget.setSelectionMode("multi");
      var children = widget.getItems(true);
      this.__testGetMulti(widget, children);
      widget.destroy();
    },


    testTreeSetMulti : function()
    {
      var widget = this.__createTree();
      widget.setSelectionMode("multi");
      var children = widget.getItems(true);
      this.__testSetMulti(widget, children);
      widget.destroy();
    }
  }
});
