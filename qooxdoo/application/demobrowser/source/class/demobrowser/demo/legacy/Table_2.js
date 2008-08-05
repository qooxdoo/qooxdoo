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

#use(qx.legacy.theme.ClassicRoyale)

************************************************************************ */

/**
 * A table with fixed columns.
 */
qx.Class.define("demobrowser.demo.legacy.Table_2",
{
  extend : qx.legacy.application.Gui,

  members :
  {
    main : function()
    {
      this.base(arguments);
      var d = qx.legacy.ui.core.ClientDocument.getInstance();

      // table model
      var tableModel = new qx.legacy.ui.table.model.Simple();
      tableModel.setColumns([ "ID", "A number", "A date", "Boolean test" ]);
      var rowData = [];
      var now = new Date().getTime();
      var dateRange = 400 * 24 * 60 * 60 * 1000; // 400 days
      for (var row = 0; row < 100; row++) {
        var date = new Date(now + Math.random() * dateRange - dateRange / 2);
        rowData.push([ row, Math.random() * 10000, date, (Math.random() > 0.5) ]);
      }
      tableModel.setData(rowData);
      tableModel.setColumnEditable(1, true);
      tableModel.setColumnEditable(2, true);

      // table
      var table = new qx.legacy.ui.table.Table(tableModel);
      with (table) {
        set({ left:20, top:20, width:350, height:300, border:"inset-thin" });
        setMetaColumnCounts([1, -1]);
        getSelectionModel().setSelectionMode(qx.legacy.ui.table.selection.Model.MULTIPLE_INTERVAL_SELECTION);
        getTableColumnModel().setDataCellRenderer(3, new qx.legacy.ui.table.cellrenderer.Boolean());
      };

      d.add(table);
    }
  }
});