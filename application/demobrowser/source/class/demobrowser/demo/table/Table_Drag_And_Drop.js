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
 * A table with virtual scrolling, model-view-controller, renderer,
 * editing, sorting, column resizing, column reordering,
 * column hiding.
 *
 * @tag noPlayground
 * @tag showcase
 */
qx.Class.define("demobrowser.demo.table.Table_Drag_And_Drop",
{
  extend : demobrowser.demo.table.TableDemo,

  members :
  {
    getCaption : function() {
      return "Table";
    },


    createTable : function()
    {
      // table model
      var tableModel = this._tableModel = new qx.ui.table.model.Simple();
      tableModel.setColumns([ "ID", "A number", "A date", "Boolean" ]);
      tableModel.setData(this.createRandomRows(100));

      // make second column editable
      tableModel.setColumnEditable(1, true);

      // table
      var table = new qx.ui.table.Table(tableModel).set({
        decorator: null
      })

      var tcm = table.getTableColumnModel();

      // Display a checkbox in column 3
      tcm.setDataCellRenderer(3, new qx.ui.table.cellrenderer.Boolean());

      // use a different header renderer
      tcm.setHeaderCellRenderer(2, new qx.ui.table.headerrenderer.Icon("icon/16/apps/office-calendar.png", "A date"));


      table.setDraggable(true);
      table.setDroppable(true);
      table.setFocusCellOnMouseMove(true);

      table.addListener("dragstart", this._handleDragStart, this);
      table.addListener("droprequest", this._handleDropRequest, this);
      table.addListener("drop", this._handleDrop, this);

      return table;
    },


    _handleDragStart: function(e) {
      e.addAction("move");
      e.addType("movetransfer");
    },


    _handleDropRequest: function(e)
    {
      var type = e.getCurrentType();
      var sel = this._table.getSelectionModel().getSelectedRanges();

      var selMap = [];

      for (var i=0; i<sel.length; i++)
      {
        for (var s = sel[i].minIndex; s <= sel[i].maxIndex; s++)
        {
          var rowdata = this._table.getTableModel().getRowData(s);
          if (rowdata == null)
          {
            continue;
          }
          rowdata.rowId = s;
          selMap.push(rowdata);
        }
      }
      e.addData(type, selMap);
    },


    _handleDrop: function(e)
    {
      if (e.supportsType("movetransfer"))
      {
        var data = e.getData("movetransfer");
        var dm = this._table.getTableModel();
        dm.removeRows(data[0].rowId, data.length);
        dm.addRows(data, this._table.getFocusedRow() );
      }
    }
  },

  /*
   *****************************************************************************
      DESTRUCT
   *****************************************************************************
   */

  destruct : function()
  {
    this._disposeObjects("_tableModel");
  }
});

