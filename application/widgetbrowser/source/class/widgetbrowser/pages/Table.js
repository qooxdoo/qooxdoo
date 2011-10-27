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
     * Tristan Koch (tristankoch)

************************************************************************ */

/* ************************************************************************

#asset(qx/icon/${qx.icontheme}/16/apps/office-calendar.png)

************************************************************************ */

/**
 * Demonstrates qx.ui.table(...):
 *
 * Table
 * columnmenu.Button
 * columnmenu.MenuItem
 * headerrenderer.HeaderCell
 * pane.Clipper
 * pane.FocusIndicator
 * pane.Header
 * pane.Pane
 * pane.Scroller
 *
 */

qx.Class.define("widgetbrowser.pages.Table",
{
  extend: widgetbrowser.pages.AbstractPage,

  construct: function()
  {
    this.base(arguments);

    this.initWidgets();
  },

  members :
  {

    __nextId: 0,

    initWidgets: function()
    {
      var widgets = this._widgets = new qx.type.Array();

      var table = this.__createTable();
      table.setFocusedCell(2,5);
      widgets.push(table);
      this.add(table);
    },

    __createTable : function()
    {
      var rowData = this.__createRandomRows(50);

      var tableModel = new qx.ui.table.model.Simple();
      tableModel.setColumns([ "ID", "A number", "A date", "Boolean" ]);
      tableModel.setData(rowData);
      tableModel.setColumnEditable(1, true);
      tableModel.setColumnEditable(2, true);
      tableModel.setColumnSortable(3, false);

      var table = new qx.ui.table.Table(tableModel);

      table.set({
        width: 600,
        height: 400,
        decorator : null
      });

      table.getSelectionModel().setSelectionMode(qx.ui.table.selection.Model.MULTIPLE_INTERVAL_SELECTION);

      var tcm = table.getTableColumnModel();

      tcm.setDataCellRenderer(3, new qx.ui.table.cellrenderer.Boolean());
      tcm.setHeaderCellRenderer(2, new qx.ui.table.headerrenderer.Icon("icon/16/apps/office-calendar.png", "A date"));

      return table;
    },

    __createRandomRows : function(rowCount)
    {
      var rowData = [];
      var now = new Date().getTime();
      var dateRange = 400 * 24 * 60 * 60 * 1000; // 400 days
      for (var row = 0; row < rowCount; row++) {
        var date = new Date(now + Math.random() * dateRange - dateRange / 2);
        rowData.push([ this.__nextId++, Math.random() * 10000, date, (Math.random() > 0.5) ]);
      }
      return rowData;
    }
  }
});