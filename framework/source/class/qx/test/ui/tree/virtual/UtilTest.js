/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2013 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

qx.Class.define("qx.test.ui.tree.virtual.UtilTest",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    model : null,


    setUp : function()
    {
      var rawData = {
        name: "Root", kids: [
          {name: "Node1", kids: [{name: "Leaf1.1"}]},
          {name: "Node2", kids: []},
          {name: "Node3", kids: null},
          {name: "Leaf1"},
          {name: "Leaf2"}
        ]
      };
      this.model = qx.data.marshal.Json.createModel(rawData);
    },


    tearDown : function()
    {
      this.model.dispose();
      this.model = null;
    },


    "test isNode with nodes and leafs" : function()
    {
      var model = this.model;
      this.assertTrue(qx.ui.tree.core.Util.isNode(model, "kids"));

      var children = model.getKids();
      for (var i = 0, l = children.getLength(); i < l; i++)
      {
        var item = children.getItem(i);
        var result = qx.ui.tree.core.Util.isNode(item, "kids");

        if (item.getKids !== undefined) {
          this.assertTrue(result);
        } else {
          this.assertFalse(result);
        }
      }
    },


    "test isNode with invalid child property" : function() {
      this.assertFalse(qx.ui.tree.core.Util.isNode(this.model, "noChildProperty"));
    },


    "test isNode with null calls" : function()
    {
      this.assertFalse(qx.ui.tree.core.Util.isNode(null, "kids"));
      this.assertFalse(qx.ui.tree.core.Util.isNode(this.model, null));
      this.assertFalse(qx.ui.tree.core.Util.isNode(null, null));
    },


    "test hasChildren with leafs" : function()
    {
      var model = this.model;
      var children = model.getKids();

      this.assertTrue(qx.ui.tree.core.Util.hasChildren(model, "kids"));
      this.assertTrue(qx.ui.tree.core.Util.hasChildren(children.getItem(0), "kids"));
      this.assertFalse(qx.ui.tree.core.Util.hasChildren(children.getItem(1), "kids"));
      this.assertFalse(qx.ui.tree.core.Util.hasChildren(children.getItem(2), "kids"));
      this.assertFalse(qx.ui.tree.core.Util.hasChildren(children.getItem(3), "kids"));
      this.assertFalse(qx.ui.tree.core.Util.hasChildren(children.getItem(4), "kids"));
    },


    "test hasChildren and ignore leafs" : function()
    {
      var model = this.model;
      var children = model.getKids();

      this.assertTrue(qx.ui.tree.core.Util.hasChildren(model, "kids", true));
      this.assertFalse(qx.ui.tree.core.Util.hasChildren(children.getItem(0), "kids", true));
      this.assertFalse(qx.ui.tree.core.Util.hasChildren(children.getItem(1), "kids", true));
      this.assertFalse(qx.ui.tree.core.Util.hasChildren(children.getItem(2), "kids", true));
      this.assertFalse(qx.ui.tree.core.Util.hasChildren(children.getItem(3), "kids", true));
      this.assertFalse(qx.ui.tree.core.Util.hasChildren(children.getItem(4), "kids", true));
    },


    "test hasChildren with invalid child property" : function() {
      this.assertFalse(qx.ui.tree.core.Util.hasChildren(this.model, "noChildProperty"));
    },


    "test hasChildren with null calls" : function()
    {
      this.assertFalse(qx.ui.tree.core.Util.hasChildren(null, "kids"));
      this.assertFalse(qx.ui.tree.core.Util.hasChildren(this.model, null));
      this.assertFalse(qx.ui.tree.core.Util.hasChildren(null, null));
    }
  }
});
