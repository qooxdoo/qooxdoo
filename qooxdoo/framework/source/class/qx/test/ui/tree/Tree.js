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
    }

  }
});