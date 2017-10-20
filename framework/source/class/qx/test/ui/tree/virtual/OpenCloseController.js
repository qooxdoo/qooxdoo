/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2017 Derrell Lipman

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Derrell Lipman (derrell)

************************************************************************ */

qx.Class.define("qx.test.ui.tree.virtual.OpenCloseController",
{
  extend : qx.dev.unit.TestCase,
  implement : qx.ui.tree.core.IVirtualTree,
  include : qx.dev.unit.MMock,

  events :
  {
    open : "qx.event.type.Data",
    close : "qx.event.type.Data"
  },

  properties :
  {
    openProperty : {
      check : "String",
      init : null
    }
  },

  members :
  {
    model : null,
    controller : null,
    nodesOpen : null,

    setUp : function()
    {
      if (! this.spyOpenNode)
      {
        this.spyOpenNode = this.spy(this, "openNode");
        this.spyCloseNode = this.spy(this, "closeNode");
      }

      var rawData = 
      [
        {
          name : "Root",
          open : false,
          kids :
          [
            {
              name : "Branch 1",
              open : false,
              kids :
              [
                {
                  name : "Leaf 1.1"
                },
                {
                  name : "Leaf 1.2"
                },
                {
                  name : "Branch 1.3",
                  open : false,
                  kids :
                  [
                    {
                      name : "Branch 1.3.1",
                      open : false,
                      kids :
                      [
                        {
                          name : "Leaf 1.3.1.1"
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ];

      this.model = qx.data.marshal.Json.createModel(rawData, true);
      this.setOpenProperty("open");
      this.controller =
        new qx.ui.tree.core.OpenCloseController(this, this.model, "open");

      this.nodesOpen = {};
    },


    tearDown : function()
    {
      this.controller.dispose();
      this.controller = null;

      this.model.dispose();
      this.model = null;
    },


    testModelToTree : function()
    {
      var node;
      var openNodeNames;

      // Reset the spies
      this.spyOpenNode.reset();
      this.spyCloseNode.reset();

      // get the Branch 1 node
      node = this.model.getItem(0).getKids().getItem(0);

      // open Branch 1
      node.setOpen(true);

      // openNode should have been called exactly once
      this.assertCalledOnce(this.spyOpenNode);

      // there should be only one node open
      openNodeNames = Object.keys(this.nodesOpen);
      this.assertEquals(openNodeNames.length, 1);

      // the name of the open node should be "Branch 1"
      this.assertEquals(openNodeNames[0], "Branch 1");

      // close Branch 1
      this.model.getItem(0).getKids().getItem(0).setOpen(false);

      // closeNode should have been called exactly once
      this.assertCalledOnce(this.spyCloseNode);

      // there should be no nodes open
      openNodeNames = Object.keys(this.nodesOpen);
      this.assertEquals(openNodeNames.length, 0);
    },


    testTreeToModel : function()
    {
      var node;
      var openNodeNames;

      // Reset the spies
      this.spyOpenNode.reset();
      this.spyCloseNode.reset();

      // get the Branch 1 node
      node = this.model.getItem(0).getKids().getItem(0);

      // send an open event to the controller as if the open button were clicked
      this.fireDataEvent("open", node);

      // openNode should have been called exactly once
      this.assertCalledOnce(this.spyOpenNode);

      // there should be only one node open
      openNodeNames = Object.keys(this.nodesOpen);
      this.assertEquals(openNodeNames.length, 1);

      // the name of the open node should be "Branch 1"
      this.assertEquals(openNodeNames[0], "Branch 1");

      // the model value should now be true
      this.assertTrue(node.getOpen())

      // send a close event to the controller as if the open button were clicked
      this.fireDataEvent("close", node);

      // closeNode should have been called exactly once
      this.assertCalledOnce(this.spyCloseNode);

      // there should be no nodes open
      openNodeNames = Object.keys(this.nodesOpen);
      this.assertEquals(openNodeNames.length, 0);

      // the model value should now be false
      this.assertFalse(node.getOpen())
    },


    /*
    ---------------------------------------------------------------------------
      MOCK API
    ---------------------------------------------------------------------------
    */

    isShowTopLevelOpenCloseIcons : function() {
      return true;
    },


    isShowLeafs : function() {
      return true;
    },


    getSelection : function()
    {
      throw new Error("getSelection called unexpectedly");
    },


    getLookupTable : function()
    {
      throw new Error("getLookupTable called unexpectedly");
    },


    isNode : function(item)
    {
      throw new Error("isNode called unexpectedly");
    },


    isNodeOpen : function(node)
    {
      return this.nodesOpen[node.getName()];
    },


    getLevel : function(row)
    {
      throw new Error("getLevel called unexpectedly");
    },


    hasChildren : function(node)
    {
      throw new Error("hasChildren called unexpectedly");
    },

    openNode : function(node)
    {
      this.nodesOpen[node.getName()] = true;
    },
    
    closeNode : function(node)
    {
      delete this.nodesOpen[node.getName()];
    },

    openNodeWithoutScrolling : function(node) {},
    closeNodeWithoutScrolling : function(node) {}
  }
});
