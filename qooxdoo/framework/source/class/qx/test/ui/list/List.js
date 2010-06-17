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
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

qx.Class.define("qx.test.ui.list.List",
{
  extend : qx.test.ui.LayoutTestCase,

  members :
  {
    __model : null,

    __list : null,

    setUp : function()
    {
      this.base(arguments);

      this.__model = new qx.data.Array();
      this.__model.push("item 1");
      this.__model.push("item 2");
      this.__model.push("item 3");

      this.__list = new qx.ui.list.List(this.__model);
      this.getRoot().add(this.__list);
      
      this.flush();
    },

    tearDown : function()
    {
      this.base(arguments);

      this.__list.destroy();
      this.__list = null;
      this.__model = null;
    },

    assertModelEqualsRowData : function(model, list)
    {
      for (var i = 0; i < model.getLength(); i++) {
        this.assertEquals(model.getItem(i), list.getDataFromRow(i));
      }
    },

    testCreation : function()
    {
      this.__list.setWidth(300);
      this.__list.setItemHeight(30);

      this.flush();

      this.assertEquals(300, this.__list.getPane().getColumnConfig().getItemSize(0));
      this.assertEquals(30, this.__list.getPane().getRowConfig().getDefaultItemSize());
      this.assertEquals(this.__model.getLength(), this.__list.getPane().getRowConfig().getItemCount());
      this.assertEquals(this.__model, this.__list.getModel());
      this.assertEquals(0, this.__list.getSelection().getLength());
    },

    testGetDataFromRow : function()
    {
      this.assertModelEqualsRowData(this.__model, this.__list);
      
      this.assertNull(this.__list.getDataFromRow(-1));
      this.assertNull(this.__list.getDataFromRow(this.__model.getLength() + 1));
    },
    
    testChangeModelSize : function()
    {
      this.__model.push("new item");
      
      this.assertModelEqualsRowData(this.__model, this.__list);
      this.assertEquals(this.__model.getLength(), this.__list.getPane().getRowConfig().getItemCount());
      
      this.__model = new qx.data.Array();
      this.__model.push("item");
      this.__list.setModel(this.__model);

      this.assertModelEqualsRowData(this.__model, this.__list);
      this.assertEquals(this.__model.getLength(), this.__list.getPane().getRowConfig().getItemCount());
    },
    
    testChangeModelContent : function()
    {
      this.__model.setItem(0, "new item");
      
      this.flush();
      
      this.assertModelEqualsRowData(this.__model, this.__list);
      this.assertEquals(this.__model.getLength(), this.__list.getPane().getRowConfig().getItemCount());
      this.assertEquals("new item", this.__list._layer.getRenderedCellWidget(0,0).getLabel());
    },
    
    testResetModel : function()
    {
      var model = new qx.data.Array();
      model.push("item");
      
      this.__list.setModel(model);
      this.flush();
      
      this.assertModelEqualsRowData(model, this.__list);
      
      this.__list.resetModel();
      this.flush();

      this.assertModelEqualsRowData(this.__model, this.__list);

      this.assertEquals(this.__model, this.__list.getModel());      
      this.assertEquals(this.__list.getModel().getLength(), this.__list.getPane().getRowConfig().getItemCount(), "b");
    },
    
    testSelection : function()
    {
      var selection = this.__list.getSelection();
      selection.push(this.__model.getItem(1));
      this.flush();
      
      this.assertEquals(1, this.__list.getSelection().getLength());
            
      var item = this.__list._manager.getSelectedItem();
      item = this.__list.getDataFromRow(item);
      
      this.assertEquals(this.__model.getItem(1), item);
      this.assertTrue(selection.equals(new qx.data.Array([this.__model.getItem(1)])));
    },
    
    testInvalidSelection : function()
    {
      var selection = this.__list.getSelection();
      selection.push(this.__model.getItem(1));
      selection.push(this.__model.getItem(2)); 
      this.flush();
      
      this.assertEquals(1, this.__list.getSelection().getLength());
      this.assertTrue(selection.equals(new qx.data.Array([this.__model.getItem(2)])));
      
      var item = this.__list._manager.getSelectedItem();
      item = this.__list.getDataFromRow(item);
      
      this.assertEquals(this.__model.getItem(2), item); 
    },
    
    testSelectionByUser : function() {
      var selection = this.__list.getSelection();
      
      var self = this;
      this.assertEventFired(selection, "change", 
        function() 
        {
          this.__list._manager.selectedItem(3);
          this.flush();
        }, 
        function(e)
        {
          var selected = e.getData();
          this.assertEquals(this.__model.getItem(3), selected);
        }
      );
    }
  }
});
