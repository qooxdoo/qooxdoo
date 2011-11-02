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

************************************************************************ */

/**
 * A table with virtual scrolling, model-view-controller, renderer,
 * editing, sorting, column resizing, column reordering,
 * column hiding.
 * @tag noPlayground
 */
qx.Class.define("demobrowser.demo.table.Table_Context_Menu",
{
  extend : demobrowser.demo.table.TableDemo,

  members :
  {
    main : function()
    {
      // Add the context menu mixin to the Table class
      qx.Class.include(qx.ui.table.Table, qx.ui.table.MTableContextMenu);

      this.base(arguments);

      // Allow showing the native contextmenu
      this.getRoot().setNativeContextMenu(true);
    },

    getCaption : function()
    {
      return "Table";
    },


    createTable : function()
    {
      // Create the initial data
      var rowData = this.createRandomRows(50);

      // table model
      var tableModel = this._tableModel = new qx.ui.table.model.Simple();
      tableModel.setColumns(
        [
          "Default ctx menu #1",
          "Default ctx menu #2",
          "Disabled ctx menu",
          "Context-menu selectable"
        ]);
      tableModel.setData(rowData);

      // table
      var table = new qx.ui.table.Table(tableModel);

      table.set({
        width: 600,
        height: 400,
        decorator : null
      });


      var tcm = table.getTableColumnModel();

      // Display a checkbox in column 3
      tcm.setDataCellRenderer(3, new qx.ui.table.cellrenderer.Boolean());

      // Establish a context menu for the boolean field, to select its value
      table.setContextMenuHandler(3, this._contextMenuHandlerBoolean);

      // Prevent display of the browser context menu handler in column 2
      // This leaves columns 0&1 to display the default (browser) context menu
      table.setContextMenuHandler(2, this._contextMenuHandlerNull);

      return table;
    },


    /**
     * Context menu handler for a right-click in the boolean column.
     *
     * @param col {Integer}
     *   The number of the column in which the right click was issued.
     *
     * @param row {Integer}
     *   The number of the row in which the right click was issued
     *
     * @param table {qx.ui.table.Table}
     *   The table in which the right click was issued
     *
     * @param dataModel {qx.ui.table.model.Simple}
     *   Complete data model of the table
     *
     * @param contextMenu
     *   Menu in which buttons can be added to implement this context menu.
     */
    _contextMenuHandlerBoolean : function(col,
                                          row,
                                          table,
                                          dataModel,
                                          contextMenu)
    {
      // Add our two choices
      var menuEntry;
      for (var i = 0; i <= 1; i++)
      {
        menuEntry = new qx.ui.menu.Button(i ? "On" : "Off");
        menuEntry.setUserData("value", i ? true : false)
        menuEntry.addListener(
          "execute",
          function(e)
          {
            // Toggle the value
            dataModel.setValue(col, row, this.getUserData("value"));
          });
        contextMenu.add(menuEntry);
      }

      return true;
    },


    /**
     * Context menu handler to ignore right-click in a column.
     *
     * @param col {Integer}
     *   The number of the column in which the right click was issued.
     *
     * @param row {Integer}
     *   The number of the row in which the right click was issued
     *
     * @param table {qx.ui.table.Table}
     *   The table in which the right click was issued
     *
     * @param dataModel {qx.ui.table.model.Simple}
     *   Complete data model of the table
     *
     * @param contextMenu
     *   Menu in which buttons can be added to implement this context menu.
     */
    _contextMenuHandlerNull : function(col,
                                       row,
                                       table,
                                       dataModel,
                                       contextMenu)
    {
      // Provide an empty context menu
      return true;
    },


    createControls : function()
    {
      var bar = new qx.ui.toolbar.ToolBar();
      var button, part, checkBox;

      part = new qx.ui.toolbar.Part();
      bar.add(part);

      button = new qx.ui.toolbar.Button("Change row with ID 10", "icon/22/actions/edit-undo.png");
      button.addListener("execute", function(evt) {
        var rowData = this.createRandomRows(1);
        for (var i = 1; i < this._tableModel.getColumnCount(); i++) {
          this._tableModel.setValue(i, 10, rowData[0][i]);
        }
        this.info("Row 10 changed");
      }, this);
      part.add(button);

      button = new qx.ui.toolbar.Button("Add 10 rows", "icon/22/actions/list-add.png");
      button.addListener("execute", function(evt) {
        var rowData = this.createRandomRows(10);
        this._tableModel.addRows(rowData);
        this.info("10 rows added");
      }, this);
      part.add(button);

      button = new qx.ui.toolbar.Button("Remove 5 rows", "icon/22/actions/list-remove.png");
      button.addListener("execute", function(evt) {
        var rowCount = this._tableModel.getRowCount();
        this._tableModel.removeRows(rowCount-5, 5);
        this.info("5 rows removed");
      }, this);
      part.add(button);

      button = new qx.ui.toolbar.Button("Show selection", "icon/22/status/dialog-information.png");
      button.addListener("execute", function(evt)
      {
        var selection = [];
        table.getSelectionModel().iterateSelection(function(ind) {
          selection.push(ind + "");
        });
        this.showDialog("Selected rows:<br>" + selection.join(", "));
      }, this);
      part.add(button);


      part = new qx.ui.toolbar.Part();
      bar.add(part);

      var table = this._table;

      checkBox = new qx.ui.toolbar.CheckBox("Keep first row");
      checkBox.set({
        value: table.getKeepFirstVisibleRowComplete(),
        toolTip: new qx.ui.tooltip.ToolTip(
          "Whether the the first visible row should " +
          "be rendered completely when scrolling."
        )
      });
      checkBox.addListener("changeValue", function(evt) {
        table.setKeepFirstVisibleRowComplete(this.getValue());
      },
      checkBox);
      part.add(checkBox);

      checkBox = new qx.ui.toolbar.CheckBox("Change ID sort method");
      checkBox.set({
        value: table.getKeepFirstVisibleRowComplete(),
        toolTip: new qx.ui.tooltip.ToolTip("Demonstrate use of alternate sorting algorithm.")
      });
      checkBox.addListener("changeValue", function(evt)
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

          table.getTableModel().setSortMethods(0, {
            ascending  : ascending,
            descending : descending
          });
        }
        else
        {
          table.getTableModel().setSortMethods(0, null);
        }
      }, checkBox);
      part.add(checkBox);

      return bar;
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

