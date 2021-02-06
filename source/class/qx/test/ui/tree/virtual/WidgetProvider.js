/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

qx.Class.define("qx.test.ui.tree.virtual.WidgetProvider",
{
  extend : qx.dev.unit.TestCase,
  implement : qx.ui.tree.core.IVirtualTree,
  include : qx.dev.unit.MMock,

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


    provider : null,


    lookupTable : null,


    selection : null,


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

      this.provider = new qx.ui.tree.provider.WidgetProvider(this);
      this.provider.setLabelPath("name");
      this.provider.setIconPath("icon");
      this.provider.setChildProperty("kids");
    },


    tearDown : function()
    {
      this.provider.dispose();
      this.provider = null;

      for (var i = 0; i < this.model.getKids().getLength(); i++) {
        this.model.getKids().getItem(i).dispose();
      }
      this.model.dispose();
      this.model = null;

      if (this.lookupTable != null) {
        this.lookupTable.dispose();
        this.lookupTable = null;
      }

      if (this.selection != null) {
        this.selection.dispose();
        this.selection = null;
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
      this.assertNull(
        this.provider.getIconPath(),
        "Initial 'iconPath' property value is wrong!"
      );
    },


    testCreateLayer : function()
    {
      var layer = this.provider.createLayer();
      this.assertInstance(
        layer,
        qx.ui.virtual.layer.WidgetCell
      );
      layer.dispose();
    },


    testGetRootNodeWidget : function()
    {
      var spyBinding = this.spy(this.provider, "_bindItem");
      var spySelection = this.spy(this.provider, "_styleUnselectabled");
      var widget = this.provider.getCellWidget(0,0);

      this.assertInstance(widget, qx.ui.tree.VirtualTreeItem);
      this.assertTrue(widget.hasChildren());
      this.assertTrue(widget.getUserData("cell.showLeafs"));
      this.assertTrue(widget.getUserData("cell.showLeafs"));
      this.assertEquals(0, widget.getUserData("cell.level"));
      this.assertTrue(widget.isOpen());
      this.assertTrue(widget.hasListener("changeOpen"));
      this.assertCalledOnce(spyBinding);
      this.assertCalledWith(spyBinding, widget, 0);
      this.assertCalledOnce(spySelection);
      this.assertCalledWith(spySelection, widget);

      widget.dispose();
    },


    testGetNodeWidget : function()
    {
      var spyBinding = this.spy(this.provider, "_bindItem");
      var spySelection = this.spy(this.provider, "_styleUnselectabled");
      var widget = this.provider.getCellWidget(1,0);

      this.assertInstance(widget, qx.ui.tree.VirtualTreeItem);
      this.assertFalse(widget.hasChildren());
      this.assertTrue(widget.getUserData("cell.showLeafs"));
      this.assertEquals(1, widget.getUserData("cell.level"));
      this.assertFalse(widget.isOpen());
      this.assertTrue(widget.hasListener("changeOpen"));
      this.assertCalledOnce(spyBinding);
      this.assertCalledWith(spyBinding, widget, 1);
      this.assertCalledOnce(spySelection);
      this.assertCalledWith(spySelection, widget);

      widget.dispose();
    },


    testGetLeafWidget : function()
    {
      var spyBinding = this.spy(this.provider, "_bindItem");
      var spySelection = this.spy(this.provider, "_styleUnselectabled");
      var widget = this.provider.getCellWidget(3,0);

      this.assertInstance(widget, qx.ui.tree.VirtualTreeItem);
      this.assertFalse(widget.hasChildren());
      this.assertTrue(widget.getUserData("cell.showLeafs"));
      this.assertEquals(1, widget.getUserData("cell.level"));
      this.assertFalse(widget.isOpen());
      this.assertTrue(widget.hasListener("changeOpen"));
      this.assertCalledOnce(spyBinding);
      this.assertCalledWith(spyBinding, widget, 3);
      this.assertCalledOnce(spySelection);
      this.assertCalledWith(spySelection, widget);

      widget.dispose();
    },


    testPoolWidget : function()
    {
      var widget = this.provider.getCellWidget(3,0);

      var spyPool = this.spy(this.provider._renderer, "pool");
      var spyBinding = this.spy(this.provider, "_removeBindingsFrom");

      this.provider.poolCellWidget(widget);
      this.assertCalledOnce(spyPool);
      this.assertCalledWith(spyPool, widget);
      this.assertCalledOnce(spyBinding);
      this.assertCalledWith(spyBinding, widget);

      widget.dispose();
    },


    testDefaultNodeBinding : function()
    {
      var widget = new qx.ui.tree.VirtualTreeItem();

      this.provider._bindItem(widget, 0);
      this.assertEquals(4, this.getLookupTable().getBindings().length, "Bindings count not correct!");
      this.assertEquals("Root", widget.getLabel());
      this.assertEquals("Root", widget.getIcon());
      this.assertEquals("virtual-tree-folder", widget.getAppearance());
      this.assertEquals(this.model, widget.getModel());

      this.provider._bindItem(widget, 1);
      this.assertEquals(8, this.getLookupTable().getBindings().length, "Bindings count not correct!");
      this.assertEquals("Node1", widget.getLabel());
      this.assertEquals("Node1", widget.getIcon());
      this.assertEquals("virtual-tree-folder", widget.getAppearance());
      this.assertEquals(this.model.getKids().getItem(0), widget.getModel());

      widget.dispose();
    },


    testDefaultLeafBinding : function()
    {
      var widget = new qx.ui.tree.VirtualTreeItem();

      this.provider._bindItem(widget, 3);
      this.assertEquals(3, this.getLookupTable().getBindings().length, "Bindings count not correct!");
      this.assertEquals("Leaf1", widget.getLabel());
      this.assertEquals("Leaf1", widget.getIcon());
      this.assertEquals("virtual-tree-file", widget.getAppearance());
      this.assertEquals(this.model.getKids().getItem(2), widget.getModel());

      widget.dispose();
    },


    testRemoveBindingsFromNode : function()
    {
      var widget = new qx.ui.tree.VirtualTreeItem();
      var oldWidgetBindungs = widget.getBindings().length;
      var oldModelBindungs = this.getLookupTable().getBindings().length;

      this.provider._bindItem(widget, 0);
      this.provider._removeBindingsFrom(widget);

      var newWidgetBindungs = widget.getBindings().length;
      var newModelBindungs = this.getLookupTable().getBindings().length;

      this.assertEquals(oldWidgetBindungs, newWidgetBindungs, "Binding on widget is not removed!");
      this.assertEquals(oldModelBindungs, newModelBindungs, "Binding on model is not removed!");

      widget.dispose();
    },


    testReverseBinding : function()
    {
      var widget = new qx.ui.tree.VirtualTreeItem();
      var oldWidgetBindungs = widget.getBindings().length;
      var oldModelBindungs = this.getLookupTable().getBindings().length;

      this.provider.bindPropertyReverse("name", "label", null, widget, 0);
      widget.setLabel("ort-zerreiber");
      this.assertEquals("ort-zerreiber", this.model.getName());

      this.provider._removeBindingsFrom(widget);
      var newWidgetBindungs = widget.getBindings().length;
      var newModelBindungs = this.getLookupTable().getBindings().length;
      this.assertEquals(oldWidgetBindungs, newWidgetBindungs, "Binding on widget is not removed!");
      this.assertEquals(oldModelBindungs, newModelBindungs, "Binding on model is not removed!");

      widget.dispose();
    },


    testRemoveAllBindings : function()
    {
      var widget1 = new qx.ui.tree.VirtualTreeItem();
      var widget2 = new qx.ui.tree.VirtualTreeItem();

      var oldWidget1Bindungs = widget1.getBindings().length;
      var oldWidget2Bindungs = widget2.getBindings().length;
      var oldModelBindungs = this.getLookupTable().getBindings().length;

      this.provider.bindProperty("name", "label", null, widget1, 0);
      this.provider.bindProperty("name", "label", null, widget2, 1);
      this.provider.bindPropertyReverse("name", "label", null, widget1, 0);
      this.provider.bindPropertyReverse("name", "label", null, widget2, 1);

      this.provider.removeBindings();

      var newWidget1Bindungs = widget1.getBindings().length;
      var newWidget2Bindungs = widget2.getBindings().length;
      var newModelBindungs = this.getLookupTable().getBindings().length;
      this.assertEquals(oldWidget1Bindungs, newWidget1Bindungs, "Binding on first widget is not removed!");
      this.assertEquals(oldWidget1Bindungs, newWidget1Bindungs, "Binding on second widget is not removed!");
      this.assertEquals(oldModelBindungs, newModelBindungs, "Binding on model is not removed!");

      widget1.dispose();
      widget2.dispose();
    },


    testRemoveAllBindingsOnDispose : function()
    {
      var provider = new qx.ui.tree.provider.WidgetProvider(this);

      var spy = this.spy(provider, "removeBindings");

      provider.dispose();
      this.assertCalledOnce(spy);
    },


    testCreateItem : function() {
      var delegate = {
        createItem : function() {
          return new qx.ui.tree.VirtualTreeItem();
        }
      };

      var spy = this.spy(delegate, "createItem");
      this.provider.setDelegate(delegate);

      var widget = this.provider.getCellWidget(4,0);
      this.assertCalledOnce(spy);
      widget.dispose();
    },


    testConfigureItem : function() {
      var delegate = {
        configureItem : function(leaf) {}
      };

      var spy = this.spy(delegate, "configureItem");
      this.provider.setDelegate(delegate);

      var widget = this.provider.getCellWidget(4,0);
      this.assertCalledOnce(spy);
      this.assertCalledWith(spy, widget);
      widget.dispose();
    },


    testBindItem : function() {
      var delegate = {
        bindItem : function(controller, leaf, id) {}
      };

      var spy = this.spy(delegate, "bindItem");
      this.provider.setDelegate(delegate);

      var widget = this.provider.getCellWidget(4,0);
      this.assertCalledOnce(spy);
      this.assertCalledWith(spy, this.provider, widget, 4);
      widget.dispose();
    },


    testOnPool : function() {
      var delegate = {
        onPool : function(item) {}
      };

      var spy = this.spy(delegate, "onPool");
      this.provider.setDelegate(delegate);

      var widget = this.provider.getCellWidget(4,0);
      this.provider.poolCellWidget(widget);
      this.assertCalledOnce(spy);
      this.assertCalledWith(spy, widget);
      widget.dispose();
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
      if (this.selection != null) {
        return this.selection;
      }

      this.selection = new qx.data.Array();
      return this.selection;
    },


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
        return node.getKids().getLength() > 0;
      } else {
        return false;
      }
    },


    openNode : function(node) {},
    openNodeWithoutScrolling : function(node) {},


    closeNode : function(node) {},
    closeNodeWithoutScrolling : function(node) {}
  }
});
