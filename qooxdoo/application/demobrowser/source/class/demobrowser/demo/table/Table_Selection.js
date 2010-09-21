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
#asset(qx/icon/${qx.icontheme}/22/status/dialog-information.png)
#asset(qx/icon/${qx.icontheme}/16/apps/office-calendar.png)

************************************************************************ */

/**
 * A table with virtual scrolling, model-view-controller, renderer,
 * editing, sorting, column resizing, column reordering,
 * column hiding.
 * @tag noPlayground
 */
qx.Class.define("demobrowser.demo.table.Table_Selection",
{
  extend : demobrowser.demo.table.TableDemo,

  members :
  {
    getCaption : function() {
      return "Table";
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
      tableModel.setColumnSortable(3, false);

      // table
      var table = new qx.ui.table.Table(tableModel);

      table.set({
        width: 600,
        height: 400
      });

      table.getSelectionModel().setSelectionMode(qx.ui.table.selection.Model.SINGLE_SELECTION);

      var tcm = table.getTableColumnModel();

      // Display a checkbox in column 3
      tcm.setDataCellRenderer(3, new qx.ui.table.cellrenderer.Boolean());

      // use a different header renderer
      tcm.setHeaderCellRenderer(2, new qx.ui.table.headerrenderer.Icon("icon/16/apps/office-calendar.png", "A date"));

      return table;
    },


    createControls : function()
    {
      var bar = new qx.ui.toolbar.ToolBar();
      var button, part;


      part = new qx.ui.toolbar.Part();
      bar.add(part);

      var selectBox = new qx.ui.form.SelectBox().set({
        allowGrowY: false,
        alignY: "middle"
      });
      var Model = qx.ui.table.selection.Model;
      var selections = {
        "Single selection" : Model.SINGLE_SELECTION,
        "Single interval" : Model.SINGLE_INTERVAL_SELECTION,
        "Multiple intervals" : Model.MULTIPLE_INTERVAL_SELECTION,
        "Multiple intervals (toggle)" : Model.MULTIPLE_INTERVAL_SELECTION_TOGGLE,
        "No selection" : Model.NO_SELECTION
      };
      for (var key in selections)
      {
        var item = new qx.ui.form.ListItem(key);
        item.setUserData("value", selections[key] + "");
        selectBox.add(item);
      }
      selectBox.addListener("changeSelection", function(e) {
        this._table.getSelectionModel().setSelectionMode(parseInt(e.getData()[0].getUserData("value")));
      }, this);
      part.add(selectBox);


      part = new qx.ui.toolbar.Part();
      bar.add(part);

      button = new qx.ui.toolbar.Button("Add 5 rows", "icon/22/actions/list-add.png");
      button.addListener("execute", function(evt) {
        var rowData = this.createRandomRows(10);
        this._tableModel.addRows(rowData);
        this.info("5 rows added");
      }, this);
      part.add(button);

      button = new qx.ui.toolbar.Button("Remove 5 rows", "icon/22/actions/list-remove.png");
      button.addListener("execute", function(evt) {
        var rowCount = this._tableModel.getRowCount();
        this._tableModel.removeRows(rowCount-5, 5);
        this.info("5 rows removed");
      }, this);
      part.add(button);


      part = new qx.ui.toolbar.Part();
      bar.add(part);

      button = new qx.ui.toolbar.Button("Reset Selection");
      button.addListener("execute", function(evt) {
        this._table.resetSelection();
      }, this);
      part.add(button);

      button = new qx.ui.toolbar.Button("Reset Cell Focus");
      button.addListener("execute", function(evt) {
        this._table.resetCellFocus();
      }, this);
      part.add(button);

      var btnHideCellFocus = new qx.ui.toolbar.CheckBox("Hide Cell Focus");
      btnHideCellFocus.addListener("changeValue", function(evt) {
        this._table.setShowCellFocusIndicator(!btnHideCellFocus.isValue());
      }, this);
      part.add(btnHideCellFocus);

      button = new qx.ui.toolbar.Button("Show selection", "icon/22/status/dialog-information.png");
      button.addListener("execute", function(evt)
      {
        var selection = [];
        this._table.getSelectionModel().iterateSelection(function(ind) {
          selection.push(ind + "");
        });
        this.showDialog("Selected rows:<br>" + selection.join(", "));
      }, this);
      part.add(button);

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

