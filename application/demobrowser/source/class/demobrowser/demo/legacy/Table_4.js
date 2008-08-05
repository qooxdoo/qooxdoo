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
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/* ************************************************************************

#use(qx.legacy.theme.ClassicRoyale)

************************************************************************ */

qx.Class.define("demobrowser.demo.legacy.Table_4",
{
  extend : qx.legacy.application.Gui,

  members :
  {

    main: function()
    {
      this.base(arguments);

      // table model
      var tableModel = new qx.legacy.ui.table.model.Simple();
      tableModel.setColumns([ "ID", "A number", "A date", "Boolean test", "HTML Content" ]);
      var rowData = [];
      var now = new Date().getTime();
      var dateRange = 400 * 24 * 60 * 60 * 1000; // 400 days

      for (var row=0; row<20; row++)
      {
        var date = new Date(now + Math.random() * dateRange - dateRange / 2);
        var html = "<b>HTML-Test <i>" + row + "</i></b>";
        rowData.push([ row, Math.random() * 10000, date, (Math.random() > 0.5), html ]);
      }

      tableModel.setData(rowData);
      tableModel.setColumnEditable(1, true);
      tableModel.setColumnEditable(2, true);

      // table
      var table = new qx.legacy.ui.table.Table(tableModel);
      table.set({ width: 550, height: 400 });
      table.setMetaColumnCounts([ 1, -1 ]);
      table.getSelectionModel().setSelectionMode(qx.legacy.ui.table.selection.Model.MULTIPLE_INTERVAL_SELECTION);
      table.getTableColumnModel().setDataCellRenderer(3, new qx.legacy.ui.table.cellrenderer.Boolean());
      table.getTableColumnModel().setDataCellRenderer(4, new qx.legacy.ui.table.cellrenderer.Html());
      table.addToDocument();

      table.setAdditionalStatusBarText(", additional Status.");
    }
  }
});
