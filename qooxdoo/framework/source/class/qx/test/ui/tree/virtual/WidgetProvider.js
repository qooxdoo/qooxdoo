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
    
    
    setUp : function() {
      this.provider = new qx.ui.tree.provider.WidgetProvider(this);
    },


    tearDown : function()
    {
      this.provider.dispose();
      this.provider = null;
    },


    testCreation : function()
    {
      this.assertEquals(
        "dblclick", 
        this.provider.getOpenMode(), 
        "Initial 'openMode' property value is wrong!"
      );
      this.assertFalse(
        this.provider.isRootOpenClose(), 
        "Initial 'rootOpenClose' property value is wrong!"
      );
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
    
    
    testGetNodeWidget : function()
    {
      this.provider.setLabelPath("label");
      this.provider.setChildProperty("kids");
      var widget = this.provider.getCellWidget(0,0);

      this.assertInstance(widget, qx.ui.tree.VirtualTreeFolder);
      this.assertEquals("node", widget.getUserData("cell.type"));
      this.assertTrue(widget.getUserData("cell.children"));
      this.assertEquals(0, widget.getUserData("cell.level"));
      this.assertTrue(widget.isOpen());
      this.assertTrue(widget.hasListener("changeOpen"));
      this.assertEquals("Root", widget.getLabel(name));
    },
    
    
    testGetLeafWidget : function()
    {
      this.provider.setLabelPath("label");
      this.provider.setChildProperty("kids");
      var widget = this.provider.getCellWidget(3,0);

      this.assertInstance(widget, qx.ui.tree.VirtualTreeFile);
      this.assertEquals("leaf", widget.getUserData("cell.type"));
      this.assertNull(widget.getUserData("cell.children"));
      this.assertEquals(1, widget.getUserData("cell.level"));
      this.assertEquals("Leaf1", widget.getLabel(name));
    },
    
    
    /*
    ---------------------------------------------------------------------------
      MOCK API
    ---------------------------------------------------------------------------
    */
    
    
    getLookupTable : function()
    {
      var model = this.model;
      var lookupTable = [model];
        for (var i = 0; i < model.getKids().getLength(); i++) {
          lookupTable.push(model.getKids().getItem(i));
        }
        return lookupTable;
      return [];
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
      if (row > this.getLookupTable().length || row < 0) {
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