
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2013 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Romeo Kenfack Tsakem (rkenfack)

************************************************************************ */



/**
 * This is a widget that enhances an HTML table with some basic features like
 * Sorting.
 *
 * EXPERIMENTAL - NOT READY FOR PRODUCTION
 *
 * @group (Widget)
 *
 */
qx.Bootstrap.define("qx.ui.website.Table", {

  extend: qx.ui.website.Widget,

  construct: function(selector, context) {
    this.base(arguments, selector, context);
  },

  events : {
    /** Fires at each model change */
    "modelChanged" : "Array",
    /** Fires at each selection change */
    "selectionChanged" : "qxWeb",
    /** Fires each time a cell of the widget is clicked */
    "cellClicked" : "Object",
    /** Fires after the model has been applied to the widget */
    "modelApplied" : "Array",
    /** Fires each time the value of a cell is rendered into the cell */
    "cellRender" : "Object"
  },


  statics: {

    _config: {
      caseSensitive: false,
      cellValueClass: "qx-cell-value-class",
      columnSelection: "none"
    },

    /**
     * Factory method which converts the current collection into a collection of
     * table widgets.
     * @param model {Array} The model of the widgets in the collection
     * @return {qx.ui.website.Table} A new table collection.
     * @attach {qxWeb}
     */
    table: function(model) {
      var table = new qx.ui.website.Table(this);
      table.init(model);
      return table;
    },

    /**
     * Checks if a given string is a number
     * @param n {String} The String to check the type for
     * @return {Boolean} The result of the check
     */
    __isNumber: function(n) {
      return (Object.prototype.toString.call(n) === '[object Number]' ||
        Object.prototype.toString.call(n) === '[object String]') && !isNaN(parseFloat(n)) && isFinite(n.toString().replace(/^-/, ''));
    },

    /**
     * Checks if a given string is a Date
     * @param val {String} The String to check the type for
     * @return {Boolean} The result of the check
     */
    __isDate: function(val) {
      var d = new Date(val);
      return !isNaN(d.valueOf());
    },

    /**
     * Gets the index of an HTMLElement inside of an HTMLCollection
     * @param htmlCollection {HTMLCollection} The HTMLCollection
     * @param htmlElement {HTMLElement} The HTMLElement
     * @return {Integer} The position of the htmlElement or -1
     */
    __getIndex: function(htmlCollection, htmlElement) {
      var index = -1;
      for (var i = 0, l = htmlCollection.length; i < l; i++) {
        if (htmlCollection.item(i) == htmlElement) {
          index = i;
          break;
        }
      }
      return index;
    },

    /**
    * Generates an unique id
    * @return {String} The generated id
    */
    __getUID: function() {
      return ((new Date()).getTime() + "" + Math.floor(Math.random() * 1000000)).substr(0, 18);
    },

    /** */
    __selectionTypes: ["single", "multiple", "none"],
    /** */
    __internalCellClass: "qx-table-cell",

    __internalHeaderClass: "qx-table-header",
    /** */
    __internalSelectionClass: "qx-row-selection-class",
    /** */
    __internalInputClass: "qx-selection-input"

  },



  members: {

    // overridden
    init: function() {
      if (!this.base(arguments)) {
        return false;
      }
      var model = arguments[0];
      this._forEachElementWrapped(function(table) {
        if (qxWeb.getNodeName(table).toUpperCase() !== "TABLE") {
          throw new Error("collection should contains only table elements !!");
        }
        table.setProperty("__inputName", "input" + qx.ui.website.Table.__getUID());
        table.__getColumnMetaData(model);
        table.setModel(model);
        table.setSortingFunction(table.__defaultColumnSort);
        table.__registerEvents();
      }.bind(this));
      return true;
    },

    /**
     * Sets the given model to the widgets in the collection
     *
     * @param model {Array} The model to be set
     * @return {qx.ui.website.Table} <code>this</code> reference for chaining.
     */
    setModel: function(model) {
      this._forEachElementWrapped(function(table) {
        if (typeof model != "undefined") {
          if (qx.lang.Type.isArray(model)) {
            table.setProperty("__model", model);
            table.__applyTemplate(model);
            this.emit("modelChanged", model);
          } else {
            throw new Error("model must be an Array !!");
          }
        } else {
          table.setProperty("__model", table.__getDataRows());
        }
      });
      return this;
    },


    /**
     * Set the column types for the table widgets in the collection
     * @param columnName {String} The column name
     * @param type {String} The type of the column
     * @return {qx.ui.website.Table} <code>this</code> reference for chaining.
     */
    setColumnType: function(columnName, type) {

      this._forEachElementWrapped(function(table) {
        table.__checkColumnExistance(columnName);
        table.getProperty("__columnMeta")[columnName].type = type;
      }.bind(this));
      return this;
    },


    /**
     * Returns the type of the specified column
     * @param columnName {String} The column name
     * @return {String} The type of the specified column
     */
    getColumnType: function(columnName) {
      this.eq(0).__checkColumnExistance(columnName);
      return this.eq(0).getProperty("__columnMeta")[columnName].type;
    },


    /**
     * Returns the cell at the given position for the first widget in the collection
     * @param row {Integer} The row number
     * @param col {Integer} The column number
     * @return {qxWeb} The cell found at the given position
     */
    getCell: function(row, col) {
      return qxWeb(this.eq(0).__getRoot().rows.item(row).cells.item(col));
    },


    /**
     * Defines the comparison function to use to sort columns of the given type
     * @param type {String} The type to define the function for
     * @param compareFunc {Function} The comparison function
     * @return {qx.ui.website.Table} <code>this</code> reference for chaining.
     */
    setCompareFunction: function(type, compareFunc) {
      type = qxWeb.string.firstUp(type);
      this._forEachElementWrapped(function(table) {
        table.setProperty("__compare" + type, compareFunc);
      }.bind(this));
      return this;
    },


    /**
     * Unset the compare function for the given type
     * @param type {String} The type to unset the function for
     * @return {qx.ui.website.Table} <code>this</code> reference for chaining.
     */
    unsetCompareFunction: function(type) {
      type = qxWeb.string.firstUp(type);
      var compareFunc = this["__compare" + type] || this.__compareString;
      this._forEachElementWrapped(function(table) {
        table.setProperty("__compare" + type, compareFunc);
      }.bind(this));
      return this;
    },


    /**
     * Returns the comparison function for the given type
     * @param type {String} The type to get the comparison function for
     * @return {Function} The comparison function
     */
    getCompareFunction: function(type) {
      type = qxWeb.string.firstUp(type);
      return this.eq(0).getProperty("__compare" + type) || this["__compare" + type];
    },


    /**
     * Set the function that control the sorting process
     * @param func {Function} The sorting function
     * @return {qx.ui.website.Table} <code>this</code> reference for chaining.
     */
    setSortingFunction: function(func) {
      this._forEachElementWrapped(function(table) {
        table.setProperty("__sortingFunction", func);
      }.bind(this));
      return this;
    },


    /**
     * Unset the function that control the sorting process
     * @return {qx.ui.website.Table} <code>this</code> reference for chaining.
     */
    unsetSortingFunction: function() {
      this._forEachElementWrapped(function(table) {
        table.setProperty("__sortingFunction", this.__defaultColumnSort);
      }.bind(this));
      return this;
    },


    /**
     * Sort the column with the given name according to the specified direction
     * @param columnName {String} The name of the column to sort
     * @param dir {String} The sorting direction (asc or desc)
     * @return {qx.ui.website.Table} <code>this</code> reference for chaining.
     */
    sort: function(columnName, dir) {

      this.__checkColumnExistance(columnName);
      this._forEachElementWrapped(function(table) {
        table.__setSortingClass(columnName, dir);

        table.__sortDOM(table.__sort(columnName, dir));
      }.bind(this));
      return this;
    },


    /**
     * Get the current column sorting information for the first widget in the collection
     * @return {Map} The map containing the current sorting information
     */
    getSortingData: function() {
      return this.eq(0).getProperty("__sortingData");
    },


    /**
     * Set the mustache template of the specified column for the widgets
     * in the collection
     * @param columnName {String} The column name
     * @param template {String} The mustache template
     * @return {qx.ui.website.Table} <code>this</code> reference for chaining.
     */
    setItemTemplate: function(columnName, template) {
      this._forEachElementWrapped(function(table) {
        table.getProperty("__columnMeta")[columnName].template = template;
        table.__applyTemplate(table.getProperty("__model"));
      });
      return this;
    },


    /**
     * Sets the mustache template for all the collumns of the widgets
     * in the collection
     * @param template {String} The mustache template
     * @return {qx.ui.website.Table} <code>this</code> reference for chaining.
     */
    setItemTemplates: function(template) {
      this._forEachElementWrapped(function(table) {
        for (var key in this.getProperty("__columnMeta")) {
          this.getProperty("__columnMeta")[key].template = template;
        }
        table.__applyTemplate(this.getProperty("__model"));
      });
      return this;
    },


    //overriden
    render: function() {
      this._forEachElementWrapped(function(table) {
        var sortingData = table.getSortingData();
        var columnSelection = table.getConfig("columnSelection");

        if (qx.ui.website.Table.__selectionTypes.indexOf(columnSelection) != -1) {
          table.__processSelectionInputs(columnSelection);
        }

        if (sortingData) {
          table.__sortDOM(table.__sort(sortingData.columnName, sortingData.direction));
        }
      });
      return this;
    },


    //Private API

    /**
    * Renders or removes the selection inputs according to the specified widget selection mode
    * @param columnSelection {String} The selection mode
    * @return {qx.ui.website.Table} <code>this</code> reference for chaining.
    */
    __processSelectionInputs: function(columnSelection) {

      var currentSelection = this.getProperty("__columnSelection") || "none";

      switch (columnSelection) {

        case "none":
          if (currentSelection != "none") {
            qxWeb("." + qx.ui.website.Table.__internalSelectionClass).remove();
          }
          break;

        case "multiple":
          if (currentSelection == "none") {
            this.__createInputs("checkbox");
          } else if (currentSelection == "single") {
            qxWeb("." + qx.ui.website.Table.__internalSelectionClass + " input").setAttribute("type", "checkbox");
          }
          break;

        case "single":
          if (currentSelection == "none") {
            this.__createInputs("radio");
          } else if (currentSelection == "multiple") {
            qxWeb("." + qx.ui.website.Table.__internalSelectionClass + " input").setAttribute("type", "radio");
          }
          break;
      }

      this.setProperty("__columnSelection", columnSelection);
      return this;
    },

    /**
     * Creates input nodes for the row selection
     * @param type {String} The type of the inputs to creates
     * @return {qx.ui.website.Table} <code>this</code> reference for chaining.
     */
    __createInputs: function(type) {
      var rows = this[0].rows;
      for (var i = 0; i < rows.length; i++) {
        this.__createInput(rows.item(i), type);
      }
      return this;
    },


    /**
    * Creates an input an input node for a specific row
    * @param row {HTMLTableRowElement} The row to create the input for
    * @param type {String} The type of the input tom create (radio or checkbox)
    * @param nodeName {String} The nodename of the table cell that will contain the input
    */
    __createInput: function(row, type, nodeName) {
      if (typeof nodeName == "undefined") {
        nodeName = qxWeb.getNodeName(qxWeb(row.cells.item(0)));
      }

      var clazz = qx.ui.website.Table, inputName = this.getProperty("__inputName");
      var className = (nodeName == "th") ? clazz.__internalSelectionClass + " " + clazz.__internalHeaderClass : clazz.__internalSelectionClass;

      var inputNode = qxWeb.create("<" + nodeName + " class='" + className + "'><input name='" + inputName + "' class='" + clazz.__internalInputClass + "' type='" + type + "' /></" + nodeName + ">");
      if (row.cells.item(0)) {
        inputNode.insertBefore(qxWeb(row.cells.item(0)));
      } else {
        inputNode.appendTo(qxWeb(row))
      }
    },


    /**
    * Checks if a column with the specified name exists
    * @param columnName {String} The name of the column to check
    */
    __checkColumnExistance: function(columnName) {
      var data = this.getProperty("__columnMeta");
      if (data && !data[columnName]) {
        throw new Error("Column " + columnName + " does not exists !");
      }
    },


    /**
    * Returns the row containing the cells with the column names
    * @return {HTMLTableRowElement} The row with meta information
    */
    __getHeaderRow : function(){
      var clazz = qx.ui.website.Table;
      var tHeadOrFoot = this[0].tHead || this[0].tFoot;
      if(tHeadOrFoot){
        return tHeadOrFoot.rows.item(0);
      }else{
        var headers = qxWeb("[data-name]."+clazz.__internalCellClass);
        return headers[0].parentNode;
      }
    },


    /**
     * Initializes columns metadata
     * @param model {Array} The widget's model
    * @return {qx.ui.website.Table} <code>this</code> reference for chaining.
     */
    __getColumnMetaData: function(model) {

      var tHead = this[0].tHead || this.__getRoot();
      var data = {};

      this.__addClassToHeaderAndFooter(this[0].tHead);
      this.__addClassToHeaderAndFooter(this[0].tFoot);

      var cells = null,
        colType = null,
        colName = null,
        uid = 0,
        cell = null;
      if (tHead && (tHead.rows.length > 0)) {
        cells = tHead.rows.item(0).cells;
      } else if (model && model.length > 0) {
        cells = model[0]
      }

      for (var i = 0, l = cells.length; i < l; i++) {
        uid = qx.ui.website.Table.__getUID();
        if (cells.item) {
          cell = qxWeb(cells.item(i));
          colType = cell.getData("type") || "String";
          colName = this.__getColumName(cells.item(i));
          if (!colName) {
            colName = uid;
            cell.setData("name", colName);
          }
        } else {
          colType = "String";
          colName = uid;
        }

        data[colName] = {
          template: null,
          type: colType,
          name: colName
        };
      }

      this.setProperty("__columnMeta", data);

      return this;
    },


    /**
     * Adds the internal css class to the header and footer cells
     * @param footOrHead {HTMLElement} Html element representing the header or footer of the table
    * @return {qx.ui.website.Table} <code>this</code> reference for chaining.
     */
    __addClassToHeaderAndFooter: function(footOrHead) {
      if (footOrHead && footOrHead.rows.length > 0) {
        if (footOrHead.rows.item(0).cells.length > 0) {
          if (!qxWeb(footOrHead.rows.item(0).cells.item(0)).hasClass(qx.ui.website.Table.__internalHeaderClass)) {
            qxWeb(footOrHead.rows.item(0).cells).addClass(qx.ui.website.Table.__internalHeaderClass);
          }
        }
      }
      return this;
    },


    /**
     * Sorts the rows of the table widget
     * @param dataRows {Array} Array containing the sorted rows
     * @return {qx.ui.website.Table} <code>this</code> reference for chaining.
     */
    __sortDOM: function(dataRows) {
      for (var i = 0, l = dataRows.length; i < l; i++) {
        if (i) {
          qxWeb(dataRows[i]).insertAfter(dataRows[i - 1]);
        } else {
          qxWeb(dataRows[i]).insertBefore(qxWeb(this.__getRoot().rows.item(0)));
        }
      }
      this.setProperty("__dataRows", dataRows);
      return this;
    },


    /**
     * registers global events
     * @return {qx.ui.website.Table} <code>this</code> reference for chaining.
     */
    __registerEvents: function() {
      this.on("click", this.__detectClickedCell);
      this.on("cellClicked", function(data) {
        this.getProperty("__sortingFunction").bind(this)(data);
      }, this);
      return this;
    },


    /**
    * Checks if the selection inputs are already rendered
    * @return {Boolean} True if the inputs are rendered and false otherwise
    */
    __selectionRendered: function() {
      return qxWeb("." + qx.ui.website.Table.__internalSelectionClass).length > 0;
    },


    /**
    * Handles clicks that happen on the selection inputs
    * @param cell {qxWeb} The table cell containing the clicked input
    * @return {qx.ui.website.Table} <code>this</code> reference for chaining.
    */
    __processSelection: function(cell) {

      var clazz = qx.ui.website.Table;
      var inputs = qxWeb("." + clazz.__internalInputClass);
      var clickedInput = cell.find("input");
      var selectionMode = this.getConfig("columnSelection");
      var headerInput = qxWeb("." + clazz.__internalHeaderClass + " input");
      var selection = [];

      if (selectionMode == "multiple") {
        if (cell.hasClass(clazz.__internalHeaderClass)) {
          inputs.setAttribute("checked", clickedInput[0].checked);
        }

        var checked = true;
        for (var i = 0; i < inputs.length; i++) {
          if ((inputs[i] != headerInput[0]) && (!inputs[i].checked)) {
            checked = false;
            break;
          }
        }

        headerInput.setAttribute("checked", checked);
        inputs = inputs.toArray();

        if (checked) {
          qxWeb.array.remove(inputs, headerInput[0]);
          selection = inputs;
        } else {
          selection = inputs.filter(function(input) {
            return input.checked;
          });
        }
      } else {
        if (clickedInput[0] != headerInput[0]) {
          selection.push(clickedInput[0]);
        }
      }

      var selectedRows = selection.map(function(elem) {
        return elem.parentNode.parentNode;
      });

      this.emit("selectionChanged", qxWeb(selectedRows));

      return this;
    },


    /**
     * Click callbak
     *
     * @param e {Event} The native click event.
     * @return {qx.ui.website.Table} <code>this</code> reference for chaining.
     */
    __detectClickedCell: function(e) {

      var target = e.getTarget();

      var cell = qxWeb(target);
      var clazz = qx.ui.website.Table;

      while (!(cell.hasClass(clazz.__internalCellClass) || cell.hasClass(clazz.__internalHeaderClass) || cell.hasClass(clazz.__internalSelectionClass))) {
        if (cell.hasClass("qx.ui.website.Table")) {
          cell = null;
          break;
        }
        cell = cell.getParents().eq(0);
      }

      if (cell.hasClass(clazz.__internalSelectionClass)) {
        if (target.nodeName.toUpperCase() == "INPUT") {
          this.__processSelection(cell);
        }
      }else{
        if (cell && cell.length > 0) {
          var rows = this[0].rows;
          var row = cell[0].parentNode,
            cells = row.cells;
          var colNumber = qx.ui.website.Table.__getIndex(cells, cell[0]);
          var tHead = this.__getHeaderRow();
          var headCell = tHead.cells.item(colNumber);
          var colName = this.__getColumName(headCell);

          this.emit("cellClicked", {
            columnName: colName,
            cell: qxWeb(cell)
          });
        }
      }
      return this;
    },


    /**
     * Applies the given model to the table cells depending on
     * the mustache template specified before
     * @param model {Array} The model to apply
     * @return {qx.ui.website.Table} <code>this</code> reference for chaining.
     */
    __applyTemplate: function(model) {

      var self = this, cell, row;
      var columnData = this.getProperty("__columnMeta");
      var tHead = this.__getHeaderRow();
      var createdRow = null, colMeta = null;
      var inputType = (this.getConfig("columnSelection") == "single") ? "radio" : "checkbox";

      if (this.__getRoot().rows.length > model.length) {
        this.__deleteRows(model.length + 1);
      }

      var renderedColIndex = 0, templateApplied = true;

      for (var i = 0, rowCount = model.length; i < rowCount; i++) {

        row = model[i];

        if (!this.__isRowRendered(i)) {
          createdRow = this.__getRoot().insertRow(i);
          if (this.__selectionRendered()) {
            this.__createInput(createdRow, inputType, "td");
          }
        }

        for (var j = 0, colCount = row.length; j < colCount; j++) {
          renderedColIndex = j;
          if (self.__selectionRendered()) {
            renderedColIndex = j + 1;
          }
          colMeta = self.__getDataForColumn(self.__getColumName(tHead.cells.item(renderedColIndex)));
          if (!colMeta.template) {
            templateApplied = false;
            break;
          }

          if (!self.__isCellRendered(i, renderedColIndex)) {
            self.__getRoot().rows.item(i).insertCell(renderedColIndex);
          }
          cell = self.getCell(i, renderedColIndex);
          if (!cell.hasClass(qx.ui.website.Table.__internalCellClass) && !cell.hasClass("qx-select-cell")) {
            cell.addClass(qx.ui.website.Table.__internalCellClass);
          }
          cell.setHtml(qxWeb.template.render(colMeta.template, model[i][j]));
          this.emit("cellRender", {cell : cell, value : model[i][j]});
        }

        if (!colMeta.template) {
          templateApplied = false;
          break;
        }
      }

      if (templateApplied) {
        this.emit("modelApplied", model);
      }

      return this;
    },


    /**
    * Removes row from the DOM starting from the specified index
    * @param startIndex {Integer} The start index
    * @return {qx.ui.website.Table} <code>this</code> reference for chaining.
    */
    __deleteRows: function(startIndex) {
      var renderedRows = this.__getRoot().rows;
      for (var i = startIndex; i < renderedRows.length; i++) {
        this.__getRoot().deleteRow(i);
      }
      return this
    },


    /**
    * Gets the metadata of the column width the specified name
    * @param columName {String} The name of the column to get the metadata for
    * @return {Map} Map containing the metadata
    */
    __getDataForColumn: function(columName) {
      return this.getProperty("__columnMeta")[columName];
    },


    /**
     * Gets the Root element contening the data rows
     * @return {HTMLElement} The element containing the data rows
     */
    __getRoot: function() {
      return this[0].tBodies.item(0) || this[0];
    },


    /**
     * Checks if the row with the given index is rendered
     * @param index {Integer} The index of the row to check
     * @return {Boolean} The result of the check
     */
    __isRowRendered: function(index) {
      if (this.__getRoot().rows.item(index)) {
        return true;
      }
      return false;
    },


    /**
     * Checks if the cell with the given row and column indexes is rendered
     * @param rowIndex {Integer} The index of the row to check
     * @param colIndex {Integer} The index of the column
     * @return {Boolean} The result of the check
     */
    __isCellRendered: function(rowIndex, colIndex) {
      if (!this.__isRowRendered(rowIndex)) {
        return false;
      }
      if (this.__getRoot().rows.item(rowIndex).cells.item(colIndex)) {
        return true;
      }
      return false;
    },


    /**
     * Adds a class to the head and footer of the current sorted column
     * @param columnName {String} The name of the sorted column
     * @param dir {String} The sorting direction
     */
    __setSortingClass: function(columnName, dir) {
      var data = {
        columnName: columnName,
        direction: dir
      };
      this.setProperty("__sortingData", data);
      this.__addSortingClassToCol(this[0].tHead, columnName, dir);
      this.__addSortingClassToCol(this[0].tFoot, columnName, dir);
    },


    /**
     * Adds a class to the head or footer of the current sorted column
     * @param HeaderOrFooter {Node} The n
     * @param columnName {String} The name of the sorted column
     * @param dir {String} The sorting direction
     */
    __addSortingClassToCol: function(HeaderOrFooter, columnName, dir) {
      if (HeaderOrFooter && HeaderOrFooter.rows.length > 0) {
        qxWeb(HeaderOrFooter.rows.item(0).cells).removeClasses(["qx-asc", "qx-desc"]);
        var cell = qxWeb("[data-name='" + columnName + "'], #" + columnName);
        cell.addClass("qx-" + dir);
      }
    },


    /**
     * Sorts the table rows for the given row and direction
     * @param columnName {String} The name of the column to be sorted
     * @param direction {String} The sorting direction
     * @return {Array} Array containinfg the sorted rows
     */
    __sort: function(columnName, direction) {
      var meta = this.__getDataForColumn(columnName);
      var columnType = qxWeb.string.firstUp(meta.type);
      if (!this["__compare" + columnType]) {
        columnType = "String";
      }
      var compareFunc = this.getCompareFunction(columnType).bind(this);
      var model = this.__getDataRows();
      var columnIndex = this.__getColumnIndex(columnName);
      return model.sort(function(a, b) {
        var x = this.__getCellValue(qxWeb(a.cells.item(columnIndex)));
        var y = this.__getCellValue(qxWeb(b.cells.item(columnIndex)));
        return compareFunc(x, y, direction);
      }.bind(this));
    },


    /**
     * Compares two number
     * @param x {String} The String value of the first number to compare
     * @param y {String} The String value of the second number to compare
     * @param direction {String} The sorting direction
     * @return {Integer} The result of the comparison
     */
    __compareNumber: function(x, y, direction) {
      x = Number(x) || 0;
      y = Number(y) || 0;
      if (direction == "asc") {
        return x - y;
      } else if (direction == "desc") {
        return y - x;
      }
      return 0;
    },


    /**
    * Gets the name of the column containing the given cell
    * @param headerCell {HTMLTableCellElement} The cell to get the column name for
    * @return {String} The column name
    */
    __getColumName: function(headerCell) {
      return headerCell.getAttribute("data-name") || headerCell.getAttribute("id");
    },


    /**
     * Compares two Dates
     * @param x {String} The String value of the first date to compare
     * @param y {String} The String value of the second date to compare
     * @param direction {String} The sorting direction
     * @return {Integer} The result of the comparison
     */
    __compareDate: function(x, y, direction) {
      x = qx.ui.website.Table.__isDate(x) ? new Date(x) : new Date(0);
      y = qx.ui.website.Table.__isDate(y) ? new Date(y) : new Date(0);
      return this.__compareNumber(x.getTime(), y.getTime());
    },


    /**
     * Compares two Strings
     * @param x {String} The first string to compare
     * @param y {String} The second string to compare
     * @param direction {String} The sorting direction
     * @return {Integer} The result of the comparison
     */
    __compareString: function(x, y, direction) {
      if (!this.getConfig("caseSensitive")) {
        x = x.toLowerCase();
        y = y.toLowerCase();
      }
      if (direction == "asc") {
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
      } else if (direction == "desc") {
        return ((x > y) ? -1 : ((x < y) ? 1 : 0));
      }
      return 0;
    },


    /**
     * Returns the value of the cell that will be used for sorting
     * @param cell {qxWeb} The cell to get the value of
     * @return {String} The text content of the cell
     */
    __getCellValue: function(cell) {
      var valueNode = cell.find("." + this.getConfig("cellValueClass"));
      if (valueNode.length == 0) {
        valueNode = cell;
      }
      return (valueNode.getTextContent() || "");
    },


    /**
     * Gets the table's data rows from the DOM
     * @return {Array} Array containing the rows of the table
     */
    __getDataRows: function() {
      var tableNode = this[0];
      var rows = tableNode.rows, model = [], cell=null,  cells = [];

      for (var i = 0, l = rows.length; i < l; i++) {
        cells = rows.item(i).cells;
        if ((cells.length > 0) && (cells[0].nodeName.toUpperCase() != "TD")) {
          continue;
        }

        for (var j = 0, len = cells.length; j < len; j++) {
          cell = qxWeb(cells[j]);
          if (!cell.hasClass(qx.ui.website.Table.__internalCellClass) && !cell.hasClass("qx-select-cell")) {
            cell.addClass(qx.ui.website.Table.__internalCellClass);
          }
        }

        model.push(rows.item(i));
      }
      return model;
    },


    /**
     * Default sorting processing
     * @param data {Map} Sorting data
     */
    __defaultColumnSort: function(data) {
      var dir = "asc";
      var sortedData = this.getSortingData();
      if (sortedData) {
        if (data.columnName == sortedData.columnName) {
          if (sortedData.direction == dir) {
            dir = "desc";
          }
        }
      }
      if (data.cell[0].nodeName.toUpperCase() == "TH") {
        var meta = this.__getDataForColumn(data.columnName);
        this.sort(data.columnName, dir);
      }
    },


    /**
     * Gets the index of the column with the specified name
     * @param columnName {String} The colukn name
     * @return {Integer} The index of the column
     */
    __getColumnIndex: function(columnName) {
      var tHead = this.__getHeaderRow();
      var cells = tHead.cells;
      var columnIndex = -1;
      for (var i = 0; i < cells.length; i++) {
        if (columnName == this.__getColumName(cells.item(i))) {
          return i;
        }
      }
      return -1;
    }

  },


  defer: function(statics) {
    qxWeb.$attach({
      table: statics.table
    });
  }

});
