/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */
qx.Class.define("qx.test.ui.table.columnmodel.Basic",
{
  extend : qx.test.ui.LayoutTestCase,

  members :
  {

    createModel : function()
    {
      var tableModel = new qx.ui.table.model.Simple();
      tableModel.setColumns([ "ID", "A number", "String", "A date", "Boolean" ]);
      tableModel.setData(this.createRandomRows(5));

      return tableModel;
    },

    createRandomRows : function(rowCount)
    {
      var rowData = [];
      var nextId = 0;
      var strings = ["a", "b", "c", "d"];
      for (var row = 0; row < rowCount; row++) {
        var date = new Date(row * row * row);
        var number = row % 2 == 0 ? row / 2 : NaN;
        rowData.push([ nextId++, number, strings[row % 4], date, (row % 2 == 1) ]);
      }
      return rowData;
    },

    testSetColumnWidth : function()
    {
     var model = this.createModel();
     var table = new qx.ui.table.Table(model);
     var tcm = table.getTableColumnModel();

     if (qx.core.Environment.get("qx.debug"))
     {
       this.assertException(function(){
         tcm.setColumnWidth(6, 10);
       }, qx.core.AssertionError, "Column not found in table model", "Invalid column width.");
     }

      table.destroy();
      model.dispose();
    },


    testGetColumnWidth : function()
    {
     var model = this.createModel();
     var table = new qx.ui.table.Table(model);
     var tcm = table.getTableColumnModel();

     if (qx.core.Environment.get("qx.debug"))
     {
       this.assertException(function()
       {
         tcm.getColumnWidth(6, 10);
       }, qx.core.AssertionError, "Column not found in table model", "Invalid column width.");
     }


      table.destroy();
      model.dispose();
    },



    testSetHeaderCellRenderer : function()
    {
     var model = this.createModel();
     var table = new qx.ui.table.Table(model);
     var tcm = table.getTableColumnModel();

     if (qx.core.Environment.get("qx.debug"))
     {
       this.assertException(function()
       {
         tcm.setHeaderCellRenderer(6, new qx.ui.table.headerrenderer.Default);
       }, qx.core.AssertionError, "Column not found in table model", "Invalid column width.");
     }

      table.destroy();
      model.dispose();
    },

    testGetHeaderCellRenderer : function()
    {
     var model = this.createModel();
     var table = new qx.ui.table.Table(model);
     var tcm = table.getTableColumnModel();

     if (qx.core.Environment.get("qx.debug"))
     {
       this.assertException(function()
       {
         tcm.getHeaderCellRenderer(6);
       }, qx.core.AssertionError, "Column not found in table model", "Invalid column width.");
     }

      table.destroy();
      model.dispose();
    },


    testSetDataCellRenderer : function()
    {
     var model = this.createModel();
     var table = new qx.ui.table.Table(model);
     var tcm = table.getTableColumnModel();

     if (qx.core.Environment.get("qx.debug"))
     {
       this.assertException(function()
       {
         tcm.setDataCellRenderer(6, qx.ui.table.cellrenderer.Default);
       }, qx.core.AssertionError, "Column not found in table model", "Invalid column width.");
     }

      table.destroy();
      model.dispose();
    },


    testGetDataCellRenderer : function()
    {
     var model = this.createModel();
     var table = new qx.ui.table.Table(model);
     var tcm = table.getTableColumnModel();

     if (qx.core.Environment.get("qx.debug"))
     {
       this.assertException(function()
       {
         tcm.getDataCellRenderer(6);
       }, qx.core.AssertionError, "Column not found in table model", "Invalid column width.");
     }

      table.destroy();
      model.dispose();
    },


    testSetCellEditorFactory : function()
    {
     var model = this.createModel();
     var table = new qx.ui.table.Table(model);
     var tcm = table.getTableColumnModel();

     if (qx.core.Environment.get("qx.debug"))
     {
       this.assertException(function()
       {
         tcm.setCellEditorFactory(6, qx.ui.table.celleditor.SelectBox);
       }, qx.core.AssertionError, "Column not found in table model", "Invalid column width.");
     }

      table.destroy();
      model.dispose();
    },


    testGetCellEditorFactory : function()
    {
     var model = this.createModel();
     var table = new qx.ui.table.Table(model);
     var tcm = table.getTableColumnModel();

     if (qx.core.Environment.get("qx.debug"))
     {
       this.assertException(function()
       {
         tcm.getCellEditorFactory(6);
       }, qx.core.AssertionError, "Column not found in table model", "Invalid column width.");
     }

      table.destroy();
      model.dispose();
    }






  }
});
