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
  extend : qx.test.ui.list.AbstractListTest,

  members :
  {
    testCreation : function()
    {
      this._list.setWidth(300);
      this._list.setItemHeight(30);

      this.flush();

      this.assertEquals(300, this._list.getPane().getColumnConfig().getItemSize(0));
      this.assertEquals(30, this._list.getPane().getRowConfig().getDefaultItemSize());
      this.assertEquals(this._model.getLength(), this._list.getPane().getRowConfig().getItemCount());
      this.assertEquals(this._model, this._list.getModel());
      this.assertEquals(0, this._list.getSelection().getLength());
    },

    testChangeModelSize : function()
    {
      this._model.push("new item");
      
      this.assertModelEqualsRowData(this._model, this._list);
      this.assertEquals(this._model.getLength(), this._list.getPane().getRowConfig().getItemCount());
      
      this._model = new qx.data.Array();
      this._model.push("item");
      this._list.setModel(this._model);

      this.assertModelEqualsRowData(this._model, this._list);
      this.assertEquals(this._model.getLength(), this._list.getPane().getRowConfig().getItemCount());
    },
    
    testChangeModelContent : function()
    {
      this._model.setItem(0, "new item");
      
      this.flush();
      
      this.assertModelEqualsRowData(this._model, this._list);
      this.assertEquals(this._model.getLength(), this._list.getPane().getRowConfig().getItemCount());
      this.assertEquals("new item", this._list._layer.getRenderedCellWidget(0,0).getLabel());
    },
    
    testResetModel : function()
    {
      var model = new qx.data.Array();
      model.push("item");
      
      this._list.setModel(model);
      this.flush();
      
      this.assertModelEqualsRowData(model, this._list);
      
      this._list.resetModel();
      this.flush();

      this.assertModelEqualsRowData(this._model, this._list);

      this.assertEquals(this._model, this._list.getModel());      
      this.assertEquals(this._list.getModel().getLength(), this._list.getPane().getRowConfig().getItemCount(), "b");
    }
  }
});
