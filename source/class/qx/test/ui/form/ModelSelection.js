/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
qx.Class.define("qx.test.ui.form.ModelSelection", {
  extend: qx.test.ui.LayoutTestCase,

  members: {
    __testGetSingle(widget, children) {
      var children = children || widget.getChildren();

      // check the model selection
      widget.setSelection([children[0]]);
      this.assertEquals(1, widget.getModelSelection().getItem(0));

      // check the model selection again
      widget.setSelection([children[2]]);
      this.assertEquals(3, widget.getModelSelection().getItem(0));
    },

    __testGetMulti(widget, children) {
      var children = children || widget.getChildren();

      // check the model selection
      widget.setSelection([children[0]]);
      this.assertEquals(1, widget.getModelSelection().getItem(0));

      // check the model selection again
      widget.setSelection([children[1], children[2]]);
      this.assertEquals(
        2,
        widget.getModelSelection().getLength(),
        "Wrong length"
      );

      this.assertTrue(widget.getModelSelection().contains(2));
      this.assertTrue(widget.getModelSelection().contains(3));
    },

    __testSetSingle(widget, children) {
      var children = children || widget.getChildren();

      // check the set selection
      widget.setModelSelection([2]);
      this.assertEquals(children[1], widget.getSelection()[0]);

      // check the set selection again
      widget.setModelSelection([3]);
      this.assertEquals(children[2], widget.getSelection()[0]);
    },

    __testSetMulti(widget, children) {
      var children = children || widget.getChildren();

      // check the set selection
      widget.setModelSelection([2]);
      this.assertEquals(children[1], widget.getSelection()[0]);

      // check the set selection again
      widget.setModelSelection([2, 3]);
      this.assertEquals(2, widget.getSelection().length);
      this.assertTrue(widget.getSelection().includes(children[1]));
      this.assertTrue(widget.getSelection().includes(children[2]));
    },

    __createSelectBox() {
      var box = new qx.ui.form.SelectBox();
      this.__addListItems(box);
      return box;
    },

    __createList() {
      var list = new qx.ui.form.List();
      this.__addListItems(list);
      return list;
    },

    __addListItems(widget) {
      for (var i = 0; i < 3; i++) {
        var l = new qx.ui.form.ListItem("I" + (i + 1));
        l.setModel(i + 1);
        widget.add(l);
      }
    },

    __createRadioGroup() {
      var group = new qx.ui.form.RadioGroup();
      this.__addRadioButton(group);
      return group;
    },

    __createRadioButtonGroup() {
      var group = new qx.ui.form.RadioButtonGroup();
      this.__addRadioButton(group);
      return group;
    },

    __addRadioButton(widget) {
      for (var i = 0; i < 3; i++) {
        var r = new qx.ui.form.RadioButton();
        r.setModel(i + 1);
        widget.add(r);
      }
    },

    __createTree() {
      var tree = new qx.ui.tree.Tree();
      var t2 = new qx.ui.tree.TreeFolder().set({ model: 3 });
      var t1 = new qx.ui.tree.TreeFolder().set({ model: 2 });
      var t0 = new qx.ui.tree.TreeFolder().set({ model: 1 });
      tree.setRoot(t0);
      t0.add(t1);
      t1.add(t2);
      // keep one folder closed because the behavior could change if the
      // folders should be opened
      t1.setOpen(true);
      return tree;
    },

    __getRidOf(box) {
      var children = box.getChildren();
      for (var i = 0; i < children.length; i++) {
        children[i].dispose();
      }
      box.dispose();
    },

    testSelectBoxGetSingle() {
      var box = this.__createSelectBox();
      this.__testGetSingle(box);
      this.__getRidOf(box);
    },

    testSelectBoxSetSingle() {
      var box = this.__createSelectBox();
      this.__testSetSingle(box);
      this.__getRidOf(box);
    },

    testListGetSingle() {
      var list = this.__createList();
      this.__testGetSingle(list);
      this.__getRidOf(list);
    },

    testListSetSingle() {
      var list = this.__createList();
      this.__testSetSingle(list);
      this.__getRidOf(list);
    },

    testListGetMulti() {
      var list = this.__createList();
      list.setSelectionMode("multi");
      this.__testGetMulti(list);
      this.__getRidOf(list);
    },

    testListSetMulti() {
      var list = this.__createList();
      list.setSelectionMode("multi");
      this.__testSetMulti(list);
      this.__getRidOf(list);
    },

    testRadioGroupGetSingle() {
      var group = this.__createRadioGroup();
      this.__testGetSingle(group);
      this.__getRidOf(group);
    },

    testRadioGroupSetSingle() {
      var group = this.__createRadioGroup();
      this.__testSetSingle(group);
      this.__getRidOf(group);
    },

    testRadioButtonGroupGetSingle() {
      var group = this.__createRadioButtonGroup();
      this.__testGetSingle(group);
      this.__getRidOf(group);
    },

    testRadioButtonGroupSetSingle() {
      var group = this.__createRadioButtonGroup();
      this.__testSetSingle(group);
      this.__getRidOf(group);
    },

    testTreeGetSingle() {
      var widget = this.__createTree();
      var children = widget.getItems(true);
      this.__testGetSingle(widget, children);
      widget.destroy();
    },

    testTreeSetSingle() {
      var widget = this.__createTree();
      var children = widget.getItems(true);
      this.__testSetSingle(widget, children);
      widget.destroy();
    },

    testTreeGetMulti() {
      var widget = this.__createTree();
      widget.setSelectionMode("multi");
      var children = widget.getItems(true);
      this.__testGetMulti(widget, children);
      widget.destroy();
    },

    testTreeSetMulti() {
      var widget = this.__createTree();
      widget.setSelectionMode("multi");
      var children = widget.getItems(true);
      this.__testSetMulti(widget, children);
      widget.destroy();
    }
  }
});
