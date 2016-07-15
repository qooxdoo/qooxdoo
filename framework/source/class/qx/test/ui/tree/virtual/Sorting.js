/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

/**
 * @ignore(qx.test.ui.tree.virtual.Node)
 */
qx.Class.define("qx.test.ui.tree.virtual.Sorting",
{
  extend : qx.test.ui.tree.virtual.AbstractTreeTest,

  members :
  {
    testSorter : function()
    {
      var sorter = function(a, b)
      {
        a = a.getName();
        b = b.getName();
        return a < b ? 1 : a > b ? -1 : 0;
      };

      var sortedModel = this.createModel(2);
      var root = this.createModelAndSetModel(2);

      this.tree.openNode(root.getChildren().getItem(2));
      this.tree.openNode(root.getChildren().getItem(2).getChildren().getItem(4));

      var openNodes = [
        sortedModel,
        sortedModel.getChildren().getItem(2),
        sortedModel.getChildren().getItem(2).getChildren().getItem(4)
      ];

      this.__sortModel(sortedModel, sorter);

      var delegate = {
        sorter : sorter
      };
      this.tree.setDelegate(delegate);
      this.flush();

      var expected = this.getVisibleItemsFrom(sortedModel, openNodes);
      qx.lang.Array.insertAt(expected, sortedModel, 0);

      this.__testBuildLookupTable(expected);

      //this.__logModel(sortedModel);
      sortedModel.dispose();
    },


    testModelUnmodified : function()
    {
      var sorter = function(a, b)
      {
        a = a.getName();
        b = b.getName();
        return a < b ? 1 : a > b ? -1 : 0;
      };

      var root = this.createModelAndSetModel(1);
      var rootChildrenClone = root.getChildren().concat([]);

      var delegate = {
        sorter : sorter
      };
      this.tree.setDelegate(delegate);
      this.flush();

      this.__testOrderNotChanged(rootChildrenClone.toArray(), root.getChildren().toArray());

      rootChildrenClone.dispose();
    },


    testSorterAndFilter : function()
    {
      var sorter = function(a, b)
      {
        a = a.getName();
        b = b.getName();
        return a < b ? 1 : a > b ? -1 : 0;
      };

      var sortedModel = this.createModel(1);
      var root = this.createModelAndSetModel(1);

      // remove filtered node "Node 2"
      sortedModel.getChildren().removeAt(2);

      this.__sortModel(sortedModel, sorter);

      var delegate = {
        sorter : sorter,

        filter : function(child) {
          return child.getName() == "Node 2" ? false : true;
        }
      };
      this.tree.setDelegate(delegate);
      this.flush();

      var expected = this.getVisibleItemsFrom(sortedModel, []);
      qx.lang.Array.insertAt(expected, sortedModel, 0);

      this.__testBuildLookupTable(expected);

      //this.__logModel(sortedModel);
      sortedModel.dispose();
    },


    __sortModel : function(model, sorter)
    {
      var children = model.getChildren();
      children.sort(sorter);

      for (var i = 0; i < children.getLength(); i++)
      {
        var child = children.getItem(i);

        if (child instanceof qx.test.ui.tree.virtual.Node) {
          this.__sortModel(child, sorter);
        }
      }
    },


    __testBuildLookupTable : function(expected)
    {
      var found = this.tree.getLookupTable().toArray();
      var msg = "Expected [" + expected.join(", ") +
        "], but found [" + found.join(", ") + "]";

      this.assertEquals(expected.length, found.length, msg);
      for (var i=0; i<expected.length; i++) {
        this.assertTrue(expected[i].equals(found[i]), msg);
      }
      this.assertEquals(expected.length, this.tree.getPane().getRowConfig().getItemCount());
    },


    __testOrderNotChanged : function(expected, found)
    {
      var msg = "Expected [" + expected.join(", ") +
        "], but found [" + found.join(", ") + "]";

      this.assertEquals(expected.length, found.length, msg);
      for (var i = 0; i < expected.length; i++) {
        this.assertTrue(expected[i].equals(found[i]), msg);
      }
    },


    /*
    ---------------------------------------------------------------------------
      HELPER METHOD TO LOG TREE MODEL
    ---------------------------------------------------------------------------
    */


    __logModel : function(model, level)
    {
      level = level != null ? level : 0;

      var prefix = "";
      for (var i = 0; i < level; i++) {
        prefix += "-";
      }
      console.log(prefix + ">", model.getName());

      if (model.getChildren == null) {
        return;
      }

      var children = model.getChildren();
      for (var i = 0; i < children.getLength(); i++) {
        this.__logModel(children.getItem(i), level + 1);
      }
    }
  }
});
