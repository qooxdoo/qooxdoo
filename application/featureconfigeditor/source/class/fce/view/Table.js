/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (d_wagner)

************************************************************************ */

/**
 * Filtered table to display a number of model items.
 */
qx.Class.define("fce.view.Table", {

  extend : qx.ui.table.Table,

  construct : function()
  {
    this.base(arguments);
    this.setColumnVisibilityButtonVisible(false);

    var selectionModel = this.getSelectionModel();
    selectionModel.setSelectionMode(qx.ui.table.selection.Model.MULTIPLE_INTERVAL_SELECTION);
    selectionModel.addListener("changeSelection", this.__onTableSelectionChange, this);

    this.__columnIds = [];
    this._setUpDragDrop();

    this.setDecorator("main");

    this.addListener("keydown", function(ev) {
      var key = ev.getKeyIdentifier();
      if (key === "A" && ev.isCtrlOrCommandPressed()) {
        var rows = this.getTableModel().getRowCount() - 1;
        this.getSelectionModel().addSelectionInterval(0, rows);
      }
    }, this);
  },


  properties :
  {
    /** Data model */
    model :
    {
      apply : "_applyModel"
    },

    /** Data array of model items selected by the user */
    selectedItems :
    {
      init : new qx.data.Array(),
      event : "changeSelectedItems"
    },

    /** The column id/model item property that should act as the default data
     * source, e.g. for drag and drop operations */
    sourceProperty :
    {
      init : null,
      nullable : true,
      check : "String",
      event : "changeSourceProperty"
    },

    /** Filter string for the table model */
    filter :
    {
      apply : "_applyFilter"
    }

    /*
    ,

    selectedColumn :
    {
      init : "detected",
      event : "changeSelectedColumn"
    }
    */
  },

  members :
  {

    __columnIds : null,

    /**
     * Returns the approriate renderer (boolean, number or string) for the given
     * cell data

     * @param cellInfo {Map} Cell information map
     * @return {qx.ui.table.cellrenderer.Boolean|qx.ui.table.cellrenderer.Number|qx.ui.table.cellrenderer.String}
     *   Cell renderer
     */
    __cellRendererFactoryFunction : function(cellInfo)
    {
      var colIndex = cellInfo.col;
      switch(typeof cellInfo.rowData[colIndex]) {
        case "boolean":
          return new qx.ui.table.cellrenderer.Boolean();
        case "number":
          return new qx.ui.table.cellrenderer.Number();
        default:
          return new qx.ui.table.cellrenderer.String();
      }
    },


    /**
     * Sets the table up for drag and drop
     */
    _setUpDragDrop : function()
    {
      this.setDraggable(true);
      this.addListener("dragstart", function(e)
      {
        e.addType("items");
        e.addAction("copy");
      });

      this.addListener("droprequest", function(e) {
        var action = e.getCurrentAction();
        var type = e.getCurrentType();

        if (type == "items" && action == "copy") {
          var items = this.getSelectedItems();
          e.addData(type, items);
        }

      }, this);

    },


    /**
     * Adds the model items corresponding with the selected table rows to the
     * {@link #selectedItems} property
     */
    __onTableSelectionChange : function()
    {
      var dataCellIndex = this.getTableModel().getColumnCount() - 1;
      this.getSelectedItems().removeAll();
      this.getSelectionModel().iterateSelection(function(index) {
        var item = this.getTableModel().getValue(dataCellIndex, index);
        this.getSelectedItems().push(item);
      }, this);
    },


    // property apply
    _applyModel : function(value, old)
    {
      var tableModel = new qx.ui.table.model.Filtered();
      this.__columnIds = this._getModelProperties(value);

      if (this.__columnIds.indexOf("distinctValues") >= 0) {
        this.__columnIds.push(qx.lang.Array.removeAt(this.__columnIds,
          this.__columnIds.indexOf("distinctValues")));
      }
      this.__columnIds.push("item");
      tableModel.setColumns(this.__columnIds);
      tableModel.setData(this._getRowData(value));
      this.setTableModel(tableModel);

      this._configureColumnModel();
    },

    /**
     * Returns a list of all model item property names
     *
     * @param dataModel {qx.data.Array} data array of model items
     * @return {String[]} List of item property names
     */
    _getModelProperties : function(dataModel)
    {
      var uniquePropertyNames = [];
      for (var i=0, l=dataModel.length; i<l; i++) {
        var item = dataModel.getItem(i);
        var itemProperties = qx.util.PropertyUtil.getProperties(item.constructor);
        for (var propertyName in itemProperties) {
          if (!qx.lang.Array.contains(uniquePropertyNames, propertyName)) {
            uniquePropertyNames.push(propertyName);
          }
        }
      }
      return uniquePropertyNames;
    },


    /*
    _getColumnHeadersFromIds : function(idList)
    {
      var headers = [];
      for (var i=0, l=idList.length; i<l; i++) {
        var header = idList[i].replace(/[a-z]()[A-Z]/g, "$` $'");
        header = header.replace(/[a-z]()[0-9]/g, "$` $'");
        headers.push(qx.lang.String.firstUp(header));
      }
      return headers;
    },
    */


    /**
     * Converts the given data model to a row data array
     *
     * @param dataModel {qx.data.Array} data model
     * @return {Array} row data array
     */
    _getRowData : function(dataModel)
    {
      var rowData = [];
      for (var i=0, l=dataModel.length; i<l; i++) {
        var row = [];
        var item = dataModel.getItem(i);
        var itemProperties = qx.util.PropertyUtil.getProperties(item.constructor);
        for (var x=0, y=this.__columnIds.length; x<y; x++) {
          var columnId = this.__columnIds[x];
          if (columnId in itemProperties) {
            row.push(item.get(columnId));
          }
          else if (columnId == "item") {
            row.push(item);
          }
          else {
            row.push(undefined);
          }
        }
        rowData.push(row);
      }
      return rowData;
    },

    /**
     * Assigns the default cell renderer to all data columns (all except the
     * first and last column)
     */
    _configureColumnModel : function()
    {
      var columnModel = this.getTableColumnModel();
      columnModel.addListener("orderChanged", function(ev) {
        this.setSourceProperty(this._getFirstVisibleColumnId());
      }, this);
      columnModel.addListener("visibilityChanged", function(ev) {
        this.setSourceProperty(this._getFirstVisibleColumnId());
      }, this);
      var cellRendererFactory = new qx.ui.table.cellrenderer.Dynamic(this.__cellRendererFactoryFunction);
      var dataCellIndex = this.getTableModel().getColumnCount() - 1;
      for (var i=1; i<dataCellIndex; i++) {
        columnModel.setDataCellRenderer(i, cellRendererFactory);
      }
      columnModel.setColumnWidth(0, 200);
      columnModel.setColumnVisible(dataCellIndex, false);
    },

    /**
     * Returns the ID of the leftmost visible table column
     *
     * @return {String} column ID
     */
    _getFirstVisibleColumnId : function()
    {
      var model = this.getTableModel();
      var cols = this.getTableColumnModel().getVisibleColumns();
      for (var i=0, l=cols.length; i<l; i++) {
        var colId = model.getColumnId(cols[i]);
        if (colId !== "name" && colId !== "distinctValues") {
          return model.getColumnId(cols[i]);
        }
      }
      return null;
    },

    // property apply
    _applyFilter : function(value, old)
    {
      var tableModel = this.getTableModel();
      if (old) {
        tableModel.resetHiddenRows();
      }

      if (value && value !== "") {
        tableModel.addNotRegex(value, "name");
        tableModel.applyFilters();
      }
      this.getSelectionModel().resetSelection();
    }

  }
});