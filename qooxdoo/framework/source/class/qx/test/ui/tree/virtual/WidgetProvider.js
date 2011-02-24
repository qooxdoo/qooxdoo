/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

qx.Class.define("qx.test.ui.tree.virtual.WidgetProvider",
{
  extend : qx.dev.unit.TestCase,
  implement : qx.ui.tree.core.IVirtualTree,
  include : qx.dev.unit.MMock,

  construct : function()
  {
    this.base(arguments);

    var rawData = {
      label: "Root", kids: [
        {label: "Node1", kids:[]},
        {label: "Node2", kids:[]},
        {label: "Leaf1"},
        {label: "Leaf2"}
      ]
    };
    this.model = qx.data.marshal.Json.createModel(rawData);
  },


  members :
  {
    model : null,
    
    
    provider : null,
    
    
    lookupTable : null,
    
    
    setUp : function()
    {
      this.provider = new qx.ui.tree.provider.WidgetProvider(this);
      this.provider.setLabelPath("label");
      this.provider.setChildProperty("kids");
    },


    tearDown : function()
    {
      this.provider.dispose();
      this.provider = null;
      
      if (this.lookupTable != null) {
        this.lookupTable.dispose();
        this.lookupTable = null;
      }
    },


    testCreation : function()
    {
      this.provider.dispose();
      this.provider = new qx.ui.tree.provider.WidgetProvider(this);
      
      this.assertNull(
        this.provider.getChildProperty(), 
        "Initial 'childProperty' property value is wrong!"
      );
      this.assertNull(
        this.provider.getLabelPath(), 
        "Initial 'labelPath' property value is wrong!"
      );
    },


    testCreateLayer : function()
    {
      this.assertInstance(
        this.provider.createLayer(), 
        qx.ui.virtual.layer.WidgetCell
      );
    },
    
    
    testGetRootNodeWidget : function()
    {
      var spy = this.spy(this.provider, "_bindNode");
      var widget = this.provider.getCellWidget(0,0);
      
      this.assertInstance(widget, qx.ui.tree.VirtualTreeFolder);
      this.assertEquals("node", widget.getUserData("cell.type"));
      this.assertTrue(widget.getUserData("cell.children"));
      this.assertEquals(0, widget.getUserData("cell.level"));
      this.assertTrue(widget.isOpen());
      this.assertTrue(widget.hasListener("changeOpen"));
      this.assertCalledOnce(spy);
      this.assertCalledWith(spy, widget, 0);
    },
    
    
    testGetNodeWidget : function()
    {
      var spy = this.spy(this.provider, "_bindNode");
      var widget = this.provider.getCellWidget(1,0);
      
      this.assertInstance(widget, qx.ui.tree.VirtualTreeFolder);
      this.assertEquals("node", widget.getUserData("cell.type"));
      this.assertTrue(widget.getUserData("cell.children"));
      this.assertEquals(1, widget.getUserData("cell.level"));
      this.assertFalse(widget.isOpen());
      this.assertTrue(widget.hasListener("changeOpen"));
      this.assertCalledOnce(spy);
      this.assertCalledWith(spy, widget, 1);
    },


    testGetLeafWidget : function()
    {
      var spy = this.spy(this.provider, "_bindLeaf");
      var widget = this.provider.getCellWidget(3,0);

      this.assertInstance(widget, qx.ui.tree.VirtualTreeFile);
      this.assertEquals("leaf", widget.getUserData("cell.type"));
      this.assertNull(widget.getUserData("cell.children"));
      this.assertEquals(1, widget.getUserData("cell.level"));
      this.assertCalledOnce(spy);
      this.assertCalledWith(spy, widget, 3);
    },
    
    
    testPoolNodeWidget : function()
    {
      var widget = this.provider.getCellWidget(0,0);

      var spyPool = this.spy(this.provider._nodeRenderer, "pool");
      var spyBinding = this.spy(this.provider, "_removeBindingsFrom");

      this.provider.poolCellWidget(widget);
      this.assertCalledOnce(spyPool);
      this.assertCalledWith(spyPool, widget);
      this.assertCalledOnce(spyBinding);
      this.assertCalledWith(spyBinding, widget);
      this.assertFalse(widget.hasListener("changeOpen"));
    },


    testPoolLeafWidget : function()
    {
      var widget = this.provider.getCellWidget(3,0);

      var spyPool = this.spy(this.provider._leafRenderer, "pool");
      var spyBinding = this.spy(this.provider, "_removeBindingsFrom");

      this.provider.poolCellWidget(widget);
      this.assertCalledOnce(spyPool);
      this.assertCalledWith(spyPool, widget);
      this.assertCalledOnce(spyBinding);
      this.assertCalledWith(spyBinding, widget);
    },


    testBindNode : function()
    {
      var widget = new qx.ui.tree.VirtualTreeFolder();

      this.provider._bindNode(widget, 0);
      this.assertEquals(1, this.getLookupTable().getBindings().length, "Bindings count not correct!");
      this.assertEquals("Root", widget.getLabel());

      this.provider._bindNode(widget, 1);
      this.assertEquals(2, this.getLookupTable().getBindings().length, "Bindings count not correct!");
      this.assertEquals("Node1", widget.getLabel());
    },


    testBindLeaf : function()
    {
      var widget = new qx.ui.tree.VirtualTreeFile();

      this.provider._bindLeaf(widget, 3);
      this.assertEquals(1, this.getLookupTable().getBindings().length, "Bindings count not correct!");
      this.assertEquals("Leaf1", widget.getLabel());
    },
   

    testRemoveBindingsFromNode : function()
    {
      var widget = new qx.ui.tree.VirtualTreeFolder();
      var oldWidgetBindungs = widget.getBindings().length;
      var oldModelBindungs = this.getLookupTable().getBindings().length;
      
      this.provider._bindNode(widget, 0);
      this.provider._removeBindingsFrom(widget);
      
      var newWidgetBindungs = widget.getBindings().length;
      var newModelBindungs = this.getLookupTable().getBindings().length;
      
      this.assertEquals(oldWidgetBindungs, newWidgetBindungs, "Binding on widget is not removed!");
      this.assertEquals(oldModelBindungs, newModelBindungs, "Binding on model is not removed!");
    },
    
    
    /*
    ---------------------------------------------------------------------------
      MOCK API
    ---------------------------------------------------------------------------
    */
    
    
    getLookupTable : function()
    {
      if (this.lookupTable != null) {
        return this.lookupTable;
      }
      
      var model = this.model;
      this.lookupTable = new qx.data.Array([model]);
      for (var i = 0; i < model.getKids().getLength(); i++) {
        this.lookupTable.push(model.getKids().getItem(i));
      }
      return this.lookupTable;
    },
    
    
    isNode : function(item)
    {
      var index = this.getLookupTable().indexOf(item);
      if (index == -1) {
        throw new Error("Item is not part of the model!");
      }
      if (index == 0 || index == 1 || index == 2) {
        return true;
      }
      return false;
    },
    
    
    isNodeOpen : function(node)
    {
      var index = this.getLookupTable().indexOf(node);
      if (index == -1) {
        throw new Error("Node is not part of the model!");
      }
      if (node == this.model) {
        return true;
      }
      return false;
    },


    getLevel : function(row)
    {
      if (row > this.getLookupTable().getLength() || row < 0) {
        throw new Error("Row is not in range of the model!");
      }
      if (row == 0) {
        return 0;
      }
      return 1;
    },
    

    hasChildren : function(node)
    {
      if (this.isNode(node)) {
        return true;
      } else {
        return false;
      }
    },

    
    openNode : function(node) {},

    
    closeNode : function(node) {}
  },


  destruct : function() {
    var model = this.model;
    for (var i = 0; model.getKids().getLength(); i++) {
      model.getKids().getItem(i).dispose();
    }
    model.dispose();
    this.model = null;
  }
});