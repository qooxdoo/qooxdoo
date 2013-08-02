/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2013 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
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
        name: "Root", icon: "Root", kids: [
          {name: "Node1", icon: "Node1", kids:[]},
          {name: "Node2", icon: "Node2", kids:[]},
          {name: "Leaf1", icon: "Leaf1"},
          {name: "Leaf2", icon: "Leaf2"}
        ]
      };
      this.model = qx.data.marshal.Json.createModel(rawData);
    },


    tearDown : function()
    {
      this.model.dispose();
      this.model = null;
    },


    "test is node or leaf" : function()
    {
      var model = this.model;
      this.assertTrue(qx.ui.tree.core.Util.isNode(model, "kids"));

      var children = model.getKids();
      for (var i = 0, l = children.getLength(); i < l; i++)
      {
        var item = children.getItem(i);
        var result = qx.ui.tree.core.Util.isNode(item, "kids");

        if (item.getKids != null) {
          this.assertTrue(result);      
        } else {
          this.assertFalse(result);
        }
      }
    },


    "test is node with invalid child property" : function() {
      this.assertFalse(qx.ui.tree.core.Util.isNode(this.model, "noChildProperty"));
    }
  }
});
