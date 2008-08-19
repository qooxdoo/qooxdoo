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

#asset(qx/icon/${qx.icontheme}/22/actions/media-record.png)
#asset(qx/icon/${qx.icontheme}/16/actions/edit-cut.png)
#asset(qx/icon/${qx.icontheme}/16/actions/edit-copy.png)
#asset(qx/icon/${qx.icontheme}/16/actions/edit-paste.png)

************************************************************************ */

/**
 * A table with virtual scrolling, model-view-controller, renderer,
 * editing, sorting, column resizing, column reordering,
 * column hiding.
 */
qx.Class.define("demobrowser.demo.table.Table_Events",
{
  extend : demobrowser.demo.table.TableDemo,

  members :
  {
    getCaption : function() {
      return "Table";
    },


    main : function()
    {
      this.base(arguments);

      var eventsWin = this._eventsWin = new qx.ui.window.Window("Event log").set({
        height: 400,
        width: 290,
        showClose: false,
        showMinimize: false
      });
      eventsWin.setLayout(new qx.ui.layout.Canvas());
      eventsWin.open();

      this.getRoot().add(eventsWin, {left: 670, top: 10});

      this._events = new qx.ui.table.model.Simple();
      this._events.setColumns(["Name", "Row", "Column"]);
      this._events.setData([]);

      var table = new qx.ui.table.Table(this._events);
      table.getTableColumnModel().setColumnWidth(0, 150);
      table.getTableColumnModel().setColumnWidth(1, 60);
      table.getTableColumnModel().setColumnWidth(2, 60);

      eventsWin.add(table, {edge: 0});
    },


    createTable : function()
    {
      // Create the initial data
      var rowData = this.createRandomRows(50);

      // table model
      var tableModel = this._tableModel = new qx.ui.table.model.Simple();
      tableModel.setColumns([ "ID", "A number", "A date", "Boolean" ]);
      tableModel.setData(rowData);
      tableModel.setColumnEditable(1, true);
      tableModel.setColumnEditable(2, true);


      // table
      var table = new qx.ui.table.Table(tableModel);
      table.getSelectionModel().setSelectionMode(qx.ui.table.selection.Model.MULTIPLE_INTERVAL_SELECTION);

      // Display a checkbox in column 3
      var tcm = table.getTableColumnModel();

      tcm.setDataCellRenderer(3, new qx.ui.table.cellrenderer.Boolean());

      var logTableEvent = function(e) {
        this._events.addRows([[e.getType(), "", "", ""]], 0);
      };

      var logCellEvent = function(e) {
        this._events.addRows([[e.getType(), e.getRow(), e.getColumn()]], 0);
      };

      table.addListener("columnVisibilityMenuCreateStart", logTableEvent, this);
      table.addListener("columnVisibilityMenuCreateEnd", logTableEvent, this);
      table.addListener("tableWidthChanged", logTableEvent, this);
      table.addListener("verticalScrollBarChanged", logTableEvent, this);
      table.addListener("cellClick", logCellEvent, this);
      table.addListener("cellDblclick", logCellEvent, this);
      table.addListener("cellContextmenu", logCellEvent, this);

      table.setContextMenu(this.getContextMenu());

      return table;
    },


    createControls : function()
    {
      var bar = new qx.ui.toolbar.ToolBar();
      var button, part, checkBox;

      part = new qx.ui.toolbar.Part();
      bar.add(part);

      button = new qx.ui.toolbar.CheckBox("Capture events", "icon/22/actions/media-record.png").set({
        checked: true
      });
      part.add(button);

      button.addListener("changeChecked", function(e) {
        if (button.isChecked())
        {
          this._events.setData([]);
          this._eventsWin.open();
        }
        else
        {
          this._eventsWin.close();
        }
      }, this);

      return bar;
    },


    getContextMenu : function()
    {
      var menu = new qx.ui.menu.Menu();

      var cutButton = new qx.ui.menu.Button("Cut", "icon/16/actions/edit-cut.png");
      var copyButton = new qx.ui.menu.Button("Copy", "icon/16/actions/edit-copy.png");
      var pasteButton = new qx.ui.menu.Button("Paste", "icon/16/actions/edit-paste.png");

      menu.add(cutButton);
      menu.add(copyButton);
      menu.add(pasteButton);

      return menu;
    }
  }
});

