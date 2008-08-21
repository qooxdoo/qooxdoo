/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#asset(qx/icon/${qx.icontheme}/22/actions/list-add.png)
#asset(qx/icon/${qx.icontheme}/22/actions/list-remove.png)
#asset(qx/icon/${qx.icontheme}/22/actions/edit-undo.png)
#asset(qx/icon/${qx.icontheme}/22/status/dialog-information.png)
#asset(qx/icon/${qx.icontheme}/16/apps/office-calendar.png)

************************************************************************ */

/**
 * A really huge table
 */
qx.Class.define("demobrowser.demo.table.Table_Huge",
{
  extend : demobrowser.demo.table.TableDemo,

  members :
  {
    getCaption : function() {
      return "Table";
    },

    COL_COUNT : 50,
    ROW_COUNT : 10000,


    createRandomRows: function(rowCount)
    {
      var rowData = [];
      for (var row = 0; row < rowCount; row++)
      {
        var row1 = [];
        for (var i = 0; i < this.COL_COUNT; i++) {
          row1.push("Cell " + i + "x" + row);
        }
        rowData.push(row1);
      }
      return rowData;
    },

    createTable: function()
    {
      // Create the initial data
      var rowData = this.createRandomRows(this.ROW_COUNT);

      // table model
      var tableModel = this._tableModel = new qx.ui.table.model.Simple();
      var headers = [];

      for (var i = 0; i < this.COL_COUNT; i++) {
        headers.push("Column " + i);
      }
      tableModel.setColumns(headers);
      tableModel.setData(rowData);

      // table
      var table = new qx.ui.table.Table(tableModel);

      return table;
    }
  }
});