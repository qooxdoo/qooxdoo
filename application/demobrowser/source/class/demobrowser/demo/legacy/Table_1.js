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
#asset(qx/compat/icon/CrystalClear/16/apps/accessories-date.png)

************************************************************************ */

qx.Class.define("demobrowser.demo.legacy.Table_1",
{
  extend : qx.legacy.application.Gui,

  members :
  {
    main : function()
    {
      this.base(arguments);
      var d = qx.legacy.ui.core.ClientDocument.getInstance();

      var main = new qx.legacy.ui.layout.VerticalBoxLayout();
      main.set({ left:20, top:20, right:20, bottom:20, spacing:5 });

      var nextId = 0;
      var createRandomRows = function(rowCount) {
        var rowData = [];
        var now = new Date().getTime();
        var dateRange = 400 * 24 * 60 * 60 * 1000; // 400 days
        for (var row = 0; row < rowCount; row++) {
          var date = new Date(now + Math.random() * dateRange - dateRange / 2);
          rowData.push([ nextId++, Math.random() * 10000, date, (Math.random() > 0.5) ]);
        }
        return rowData;
      };

      // Create the initial data
      var rowData = createRandomRows(50);

      // Add some encoding relevant stuff
      rowData[15][1] = "<b>A html &amp; entities escaping test</b>";

      // table model
      var tableModel = new qx.legacy.ui.table.model.Simple();
      tableModel.setColumns([ "ID", "A number", "A date", "Boolean test" ]);
      tableModel.setData(rowData);
      tableModel.setColumnEditable(1, true);
      tableModel.setColumnEditable(2, true);

      // Customize the table column model.  We want one that automatically
      // resizes columns.
      var custom =
        {
          tableColumnModel :
            function(obj)
            {
              return new qx.legacy.ui.table.columnmodel.Resize(obj);
            }
        };

      // table
      var table = new qx.legacy.ui.table.Table(tableModel, custom);
      with (table) {
        set({ width:"100%", height:"1*", border:"inset-thin" });
        getSelectionModel().setSelectionMode(qx.legacy.ui.table.selection.Model.MULTIPLE_INTERVAL_SELECTION);

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

        // The default is { width:"1*" } so this one is not necessary:
        // resizeBehavior.set(2, { width:"1*" });

        // Set one fixed width column
        resizeBehavior.set(3, { width:100 });

        // Display a checkbox in column 3
        tcm.setDataCellRenderer(3, new qx.legacy.ui.table.cellrenderer.Boolean());
        tcm.setHeaderCellRenderer(2, new qx.legacy.ui.table.headerrenderer.Icon("icon/16/apps/accessories-date.png", "A date"));
      };

      main.add(table);

      var buttonBar = new qx.legacy.ui.layout.HorizontalBoxLayout();
      buttonBar.set({ width:"100%", height:"auto", spacing:5 });
      main.add(buttonBar);

      var button = new qx.legacy.ui.form.Button("Change row with ID 10");
      button.addListener("execute", function(evt) {
        var rowData = createRandomRows(1);
        for (var i = 1; i < tableModel.getColumnCount(); i++) {
          tableModel.setValue(i, 10, rowData[0][i]);
        }
        this.info("Row 10 changed");
      });
      buttonBar.add(button);

      var button = new qx.legacy.ui.form.Button("Add 10 rows");
      button.addListener("execute", function(evt) {
        var rowData = createRandomRows(10);
        tableModel.addRows(rowData);
        this.info("10 rows added");
      });
      buttonBar.add(button);

      var button = new qx.legacy.ui.form.Button("Remove 5 rows");
      button.addListener("execute", function(evt) {
        var rowCount = tableModel.getRowCount();
        tableModel.removeRows(rowCount-5, 5);
        this.info("5 rows removed");
      });
      buttonBar.add(button);

      var checkBox =
        new qx.legacy.ui.form.CheckBox("keepFirstVisibleRowComplete",
                                null, null,
                                table.getKeepFirstVisibleRowComplete());
      checkBox.setToolTip(new qx.legacy.ui.popup.ToolTip(
                            "Whether the the first visible row should " +
                            "be rendered completely when scrolling."));
      checkBox.addListener(
        "changeChecked",
        function(evt)
        {
          table.setKeepFirstVisibleRowComplete(this.getChecked());
          this.info("Set keepFirstVisibleRowComplete to: " +
                    this.getChecked());
        },
        checkBox);
      buttonBar.add(checkBox);

      var tcm = table.getTableColumnModel();

      var checkBox =
        new qx.legacy.ui.form.CheckBox("Sort ID column even/odd",
                                null, null,
                                false);
      checkBox.setToolTip(new qx.legacy.ui.popup.ToolTip(
                            "Demonstrate use of alternate sorting algorithm."));
      checkBox.addListener(
        "changeChecked",
        function(evt)
        {
          if (evt.getData())
          {
            var ascending = function(row1, row2)
              {
                var obj1 = row1[arguments.callee.columnIndex];
                var obj2 = row2[arguments.callee.columnIndex];
                if (obj1 % 2 == 1 && obj2 % 2 == 0)
                {
                  return 1;
                }
                if (obj2 % 2 == 1 && obj1 % 2 == 0)
                {
                  return -1;
                }
                return (obj1 > obj2) ? 1 : ((obj1 == obj2) ? 0 : -1);
              };

            var descending = function(row1, row2)
              {
                var obj1 = row1[arguments.callee.columnIndex];
                var obj2 = row2[arguments.callee.columnIndex];
                if (obj1 % 2 == 1 && obj2 % 2 == 0)
                {
                  return -1;
                }
                if (obj2 % 2 == 1 && obj1 % 2 == 0)
                {
                  return 1;
                }
                return (obj1 < obj2) ? 1 : ((obj1 == obj2) ? 0 : -1);
              }

            table.getTableModel().setSortMethods(0,
                                                 {
                                                   ascending  : ascending,
                                                   descending : descending
                                                 });
          }
          else
          {
            table.getTableModel().setSortMethods(0, null);
          }
        },
        checkBox);
      buttonBar.add(checkBox);


      d.add(main);
    }
  }
});

