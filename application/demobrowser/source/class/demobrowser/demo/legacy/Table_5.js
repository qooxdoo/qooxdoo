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
 * This table example shows how to use a modal window for a cell editor.
 * Although this is a very simple one, cell editors using modal windows
 * can be as sophisticated as one likes, so are useful for when a cell's
 * data is composed of many descrete parts that could be edited
 * individually.  In this example, the "A number" column is editable.
 */
qx.Class.define("demobrowser.demo.legacy.Table_5",
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

        // We don't want the focus indicator.
        setShowCellFocusIndicator(false);

        // Specify the cell editor factory.  Can't use default (or,
        // actually, any in-cell editor) with no focus indicator available.
        // We'll instead use a modal cell editor.  Its cell editor factory
        // class, ModalCellEditorFactory(), is declared towards the end of
        // this file.
        tcm.setCellEditorFactory(1, new ModalCellEditorFactory());
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

qx.Class.define("ModalCellEditorFactory",
{
  extend : qx.core.Object,
  implement : qx.legacy.ui.table.ICellEditorFactory,

  members :
  {
    // overridden
    createCellEditor : function(cellInfo)
    {
      // Create the cell editor window, since we need to return it
      // immediately.
      cellEditor = new qx.legacy.ui.window.Window("Cell Editor");
      cellEditor.set(
        {
          width: 180,
          height: 60,
          modal: true,
          centered: true,
          showClose: false,
          showMaximize: false,
          showMinimize: false
        });
      cellEditor.addListener("appear",
                                  function(e)
                                  {
                                    cellEditor.__cellEditor.focus();
                                    cellEditor.__cellEditor.selectAll();
                                  });

      // We'll layout the editor widgets horizontally
      var hLayout = new qx.legacy.ui.layout.HorizontalBoxLayout();
      hLayout.setTop(0);
      hLayout.setLeft(0);
      hLayout.setRight(0);
      hLayout.setBottom(0);
      hLayout.setSpacing(4);

      // Create a text field in which to edit the data
      cellEditor.__cellEditor = new qx.legacy.ui.form.TextField(cellInfo.value);
      hLayout.add(cellEditor.__cellEditor);

      // Create the "Save" button to close the cell editor
      var save = new qx.legacy.ui.form.Button("Save");
      save.addListener("execute",
                            function(e)
                            {
                              cellEditor.close();
                            });
      hLayout.add(save);

      // Let them press Enter from the cell editor text field to finish.
      var command = new qx.event.Command("Enter");
      command.addListener("execute",
                               function(e)
                               {
                                 save.execute();
                                 command.dispose();
                                 command = null;
                               });

      cellEditor.add(hLayout);

      return cellEditor;
    },

    // overridden
    getCellEditorValue : function(cellEditor)
    {
      // Return the value in the text field
      return cellEditor.__cellEditor.getValue() * 1;
    }
  }
});