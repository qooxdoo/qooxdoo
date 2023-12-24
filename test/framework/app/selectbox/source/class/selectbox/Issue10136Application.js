qx.Class.define("selectbox.Issue10136Application", {
  extend: qx.application.Standalone,

  members: {
    main: function () {
      this.base(arguments);

      if (qx.core.Environment.get("qx.debug")) {
        qx.log.appender.Native;
        qx.log.appender.Console;
      }

      var createRandomRows = function (rowCount) {
        var rowData = [];
        var nextId = 0;
        var now = new Date().getTime();
        var dateRange = 400 * 24 * 60 * 60 * 1000; // 400 days
        for (var row = 0; row < rowCount; row++) {
          var date = new Date(now + Math.random() * dateRange - dateRange / 2);
          rowData.push([nextId++, Math.random() * 10000, date, (Math.random() > 0.5)]);
        }
        return rowData;
      }


      // Create the initial data
      var rowData = createRandomRows(10);

      // table model
      var tableModel = new qx.ui.table.model.Simple();
      tableModel.setColumns(["ID", "A number", "A date", "Boolean"]);
      tableModel.setData(rowData);
      tableModel.setColumnEditable(1, true);
      tableModel.setColumnEditable(2, true);
      tableModel.setColumnSortable(3, false);

      // table
      var table = new qx.ui.table.Table(tableModel);

      table.set({
        width: 600,
        height: 400,
        decorator: null,
        rowHeight: 50
      });

      table.getSelectionModel().setSelectionMode(qx.ui.table.selection.Model.MULTIPLE_INTERVAL_SELECTION);

      var tcm = table.getTableColumnModel();

      // Display a checkbox in column 3
      tcm.setDataCellRenderer(3, new qx.ui.table.cellrenderer.Boolean());

      // use a different header renderer
      tcm.setHeaderCellRenderer(2, new qx.ui.table.headerrenderer.Icon("icon/16/apps/office-calendar.png", "A date"));


      // Document is the application root
      var doc = this.getRoot();

      // Add button to document at fixed coordinates
      doc.add(table,
        {
          left: 100,
          top: 50
        });

    }
  }
});
