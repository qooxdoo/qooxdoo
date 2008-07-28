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

************************************************************************ */

qx.Class.define("demobrowser.demo.table.Table_Resize_Columns",
{
  extend : demobrowser.demo.table.TableDemo,

  members :
  {
    getCaption : function() {
      return "Table with automatic column sizes";
    },


    createTable : function()
    {
      // Create the initial data
      var rowData = this.createRandomRows(50);

      // table model
      var tableModel = this._tableModel = new qx.ui.table.model.Simple();
      tableModel.setColumns([ "ID", "A number", "A date", "Boolean test" ]);
      tableModel.setData(rowData);

      // Customize the table column model.  We want one that automatically
      // resizes columns.
      var custom =
      {
        tableColumnModel : function(obj) {
          return new qx.ui.table.columnmodel.Resize(obj);
        }
      };

      // table
      var table = new qx.ui.table.Table(tableModel, custom);

      table.set({
        width: 600,
        height: 400
      });

      table.getSelectionModel().setSelectionMode(qx.ui.table.selection.Model.MULTIPLE_INTERVAL_SELECTION);

      //
      // Specify the resize behavior...  First, get the table column model,
      // which we specified to be a ResizeTableColumModel object.
      //
      var tcm = table.getTableColumnModel();

      // Obtain the behavior object to manipulate
      var resizeBehavior = tcm.getBehavior();

      // This uses the set() method to set all attriutes at once; uses flex
      resizeBehavior.set(0, { width:"1*", minWidth:40, maxWidth:80  });

      // We could also set them individually:
      resizeBehavior.setWidth(1, "50%");
      resizeBehavior.setMinWidth(1, 100);
      resizeBehavior.setMaxWidth(1, 320);

      // Display a checkbox in column 3
      var tcm = table.getTableColumnModel();
      tcm.setDataCellRenderer(3, new qx.ui.table.cellrenderer.Boolean());
      return table;
    }
  }
});

