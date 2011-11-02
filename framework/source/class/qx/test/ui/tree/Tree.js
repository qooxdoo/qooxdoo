/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (d_wagner)
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */
qx.Class.define("qx.test.ui.tree.Tree",
{
  extend : qx.test.ui.LayoutTestCase,

  members :
  {
    _tree : null,

    setUp : function()
    {
      this.base(arguments);

      this._tree = new qx.ui.tree.Tree();
      this.getRoot().add(this._tree);
      var tRoot = new qx.ui.tree.TreeFolder("root");
      this._tree.setRoot(tRoot);
      tRoot.setOpen(false);

      this.flush();
    },

    tearDown : function()
    {
      this.base(arguments);
      this._disposeObjects("_tree");
    },

    testGetPreviousSiblingOf : function()
    {
      var tRoot = this._tree.getRoot();
      var item1 = new qx.ui.tree.TreeFile("1");
      tRoot.add(item1);
      var item1_1 = new qx.ui.tree.TreeFile("1_1");
      item1.add(item1_1);
      var item1_2 = new qx.ui.tree.TreeFile("1_2");
      item1.add(item1_2);
      var item2 = new qx.ui.tree.TreeFile("2");
      tRoot.add(item2);

      this.assertNull(this._tree.getPreviousSiblingOf(item1_1));
      this.assertIdentical(item1, this._tree.getPreviousSiblingOf(item2));
    },

    testGetNextSiblingOf : function()
    {
      var tRoot = this._tree.getRoot();
      var item1 = new qx.ui.tree.TreeFile("1");
      tRoot.add(item1);
      var item1_1 = new qx.ui.tree.TreeFile("1_1");
      item1.add(item1_1);
      var item1_2 = new qx.ui.tree.TreeFile("1_2");
      item1.add(item1_2);
      var item2 = new qx.ui.tree.TreeFile("2");
      tRoot.add(item2);

      this.assertNull(this._tree.getNextSiblingOf(item1_2));
      this.assertIdentical(item2, this._tree.getNextSiblingOf(item1));
    },

    testGetNextNodeOf : function()
    {
      var tRoot = this._tree.getRoot();
      var item1 = new qx.ui.tree.TreeFile("1");
      tRoot.add(item1);
      var item1_1 = new qx.ui.tree.TreeFile("1_1");
      item1.add(item1_1);
      var item1_2 = new qx.ui.tree.TreeFile("1_2");
      item1.add(item1_2);
      var item2 = new qx.ui.tree.TreeFile("2");
      tRoot.add(item2);

      this.assertIdentical(item1_1, this._tree.getNextNodeOf(item1));
      this.assertIdentical(item1_2, this._tree.getNextNodeOf(item1_1));
      this.assertNull(this._tree.getNextNodeOf(item2));
    },

    testGetNextNodeOfInvisible : function()
    {
      var tRoot = this._tree.getRoot();
      tRoot.setOpen(true);
      var item1 = new qx.ui.tree.TreeFile("1");
      tRoot.add(item1);
      var item1_1 = new qx.ui.tree.TreeFile("1_1");
      item1.add(item1_1);
      var item1_2 = new qx.ui.tree.TreeFile("1_2");
      item1.add(item1_2);
      var item2 = new qx.ui.tree.TreeFile("2");
      tRoot.add(item2);

      this.assertIdentical(item2, this._tree.getNextNodeOf(item1, false));
      item1.setOpen(true);
      this.assertIdentical(item1_1, this._tree.getNextNodeOf(item1, false));
    },

    testGetPreviousNodeOf : function()
    {
      var tRoot = this._tree.getRoot();
      var item1 = new qx.ui.tree.TreeFile("1");
      tRoot.add(item1);
      var item1_1 = new qx.ui.tree.TreeFile("1_1");
      item1.add(item1_1);
      var item1_2 = new qx.ui.tree.TreeFile("1_2");
      item1.add(item1_2);
      var item2 = new qx.ui.tree.TreeFile("2");
      tRoot.add(item2);

      this.assertIdentical(item1_2, this._tree.getPreviousNodeOf(item2));
      this.assertIdentical(item1_1, this._tree.getPreviousNodeOf(item1_2));
      this.assertNull(this._tree.getPreviousNodeOf(tRoot));
    },

    testGetPreviousNodeOfInvisible : function()
    {
      var tRoot = this._tree.getRoot();
      tRoot.setOpen(true);
      var item1 = new qx.ui.tree.TreeFile("1");
      tRoot.add(item1);
      var item1_1 = new qx.ui.tree.TreeFile("1_1");
      item1.add(item1_1);
      var item1_2 = new qx.ui.tree.TreeFile("1_2");
      item1.add(item1_2);
      var item2 = new qx.ui.tree.TreeFile("2");
      tRoot.add(item2);

      this.assertIdentical(item1, this._tree.getPreviousNodeOf(item2, false));
      item1.setOpen(true);
      this.assertIdentical(item1_2, this._tree.getPreviousNodeOf(item2, false));
    },

    testAddBefore : function()
    {
      /*
       * root  => add 2 befor 3 =>  root
       *  - 1                        - 1
       *  - 3                        - 2
       *  - 4                        - 3
       *                             - 4
       */

      var tRoot = this._tree.getRoot();
      tRoot.setOpen(true);
      var item1 = new qx.ui.tree.TreeFile("1");
      tRoot.add(item1);
      var item3 = new qx.ui.tree.TreeFile("3");
      tRoot.add(item3);
      var item4 = new qx.ui.tree.TreeFile("4");
      tRoot.add(item4);

      //this.info("before addBefore: " + this.__printChildren(tRoot.getChildren()));
      var item2 = new qx.ui.tree.TreeFile("2");
      tRoot.addBefore(item2, item3);
      //this.info("after addBefore: " + this.__printChildren(tRoot.getChildren()));

      this.assertIdentical(item1, this._tree.getPreviousNodeOf(item2), "check: 1 before 2");
      this.assertIdentical(item3, this._tree.getNextNodeOf(item2), "check: 3 after 2");
    },

    testAddAfter : function()
    {
      /*
       * root  => add 2 after 1 =>  root
       *  - 1                        - 1
       *  - 3                        - 2
       *  - 4                        - 3
       *                             - 4
       */

      var tRoot = this._tree.getRoot();
      tRoot.setOpen(true);
      var item1 = new qx.ui.tree.TreeFile("1");
      tRoot.add(item1);
      var item3 = new qx.ui.tree.TreeFile("3");
      tRoot.add(item3);
      var item4 = new qx.ui.tree.TreeFile("4");
      tRoot.add(item4);

      //this.info("before addAfter: " + this.__printChildren(tRoot.getChildren()));
      var item2 = new qx.ui.tree.TreeFile("2");
      tRoot.addAfter(item2, item1);
      //this.info("after addAfter: " + this.__printChildren(tRoot.getChildren()));

      this.assertIdentical(item1, this._tree.getPreviousNodeOf(item2), "check: 1 before 2");
      this.assertIdentical(item3, this._tree.getNextNodeOf(item2), "check: 3 after 2");
    },

    testChangeOrderWithAddBefore : function()
    {
      /*
       * root  => add 1 before 3 =>  root
       *  - 1                         - 2
       *  - 2                         - 1
       *  - 3                         - 3
       *  - 4                         - 4
       */

      var tRoot = this._tree.getRoot();
      tRoot.setOpen(true);
      var item1 = new qx.ui.tree.TreeFile("1");
      tRoot.add(item1);
      var item2 = new qx.ui.tree.TreeFile("2");
      tRoot.add(item2);
      var item3 = new qx.ui.tree.TreeFile("3");
      tRoot.add(item3);
      var item4 = new qx.ui.tree.TreeFile("4");
      tRoot.add(item4);

      //this.info("before addBefore: " + this.__printChildren(tRoot.getChildren()));
      tRoot.addBefore(item1, item3);
      //this.info("after addBefore: " + this.__printChildren(tRoot.getChildren()));

      this.assertIdentical(item1, this._tree.getPreviousNodeOf(item3), "check: 1 before 3");
      this.assertIdentical(item1, this._tree.getNextNodeOf(item2), "check: 1 after 2");
    },

    testChangeOrderWithAddAfter : function()
    {
      /*
       * root  => add 1 after 3 =>  root
       *  - 1                         - 2
       *  - 2                         - 3
       *  - 3                         - 1
       *  - 4                         - 4
       */

      var tRoot = this._tree.getRoot();
      tRoot.setOpen(true);
      var item1 = new qx.ui.tree.TreeFile("1");
      tRoot.add(item1);
      var item2 = new qx.ui.tree.TreeFile("2");
      tRoot.add(item2);
      var item3 = new qx.ui.tree.TreeFile("3");
      tRoot.add(item3);
      var item4 = new qx.ui.tree.TreeFile("4");
      tRoot.add(item4);

      //this.info("before addAfter: " + this.__printChildren(tRoot.getChildren()));
      tRoot.addAfter(item1, item3);
      //this.info("after addAfter: " + this.__printChildren(tRoot.getChildren()));

      this.assertIdentical(item1, this._tree.getPreviousNodeOf(item4), "check: 1 before 4");
      this.assertIdentical(item1, this._tree.getNextNodeOf(item3), "check: 1 after 3");
    },

    __printChildren : function(children)
    {
      var result = "";
      for (var i = 0; i < children.length; i++) {
        result += children[i].getLabel();

        if (i < children.length - 1) {
          result += "->";
        }
      }
      return result;
    }
  }
});