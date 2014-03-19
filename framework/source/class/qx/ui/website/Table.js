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
    }
  },



  members: {

    // overridden
    init: function() {
      if (!this.base(arguments)) {
        return false;
      }
      var model = arguments[0];
      this._forEachElementWrapped(function(table) {
        if (q.getNodeName(table).toUpperCase() !== "TABLE") {
          throw new Error("collection should contains only table elements !!");
        }
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
     * @param type {Sring} The type of the column
     * @return {qx.ui.website.Table} <code>this</code> reference for chaining.
     */
    setColumnType: function(columnName, type) {
      this._forEachElementWrapped(function(table) {
        var data = this.getProperty("__columnData");
        var types = data.types;
        var index = this.__getColumnIndex(columnName);
        if (index !== -1) {
          data.types[index] = type;
        }
        this.setProperty("__columnData", data);
      }.bind(this));
      return this;
    },

    /**
     * Returns the type of the specified column
     * @param columnName {String} The column name
     * @return {String} The type of the specified column
     */
    getColumnType: function(columnName) {
      var data = this.eq(0).getProperty("__columnData");
      var index = this.__getColumnIndex(columnName);
      if (index !== -1) {
        return data.types[index];
      } else {
        throw new Error("Column " + columnName + " does not exists !");
      }
    },


    /**
     * returns the cell at the given position for the first widget in the collection
     * @param row {Integer} The row number
     * @param col {Integer} The column number
     * @return {qxWeb} The cell foudnd at the given position
     */
    getCell: function(row, col) {
      return qxWeb(this.__getRoot().rows.item(row).cells.item(col));
    },

    /**
     * Defines the comparison function to use to sort columns of the given type
     * @param type {String} The type to define the function for
     * @param compareFunc {Function} The comparison function
     * @return {qx.ui.website.Table} <code>this</code> reference for chaining.
     */
    setCompareFunction: function(type, compareFunc) {
      type = q.string.firstUp(type);
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
      type = q.string.firstUp(type);
      var compareFunc = this["__compare" + type] || this.__compareString;
      this._forEachElementWrapped(function(table) {
        table.setProperty("__compare" + type, compareFunc);
      }.bind(this));
      return this;
    },

    /**
     * Returns the comparison function for the given type
     * @param type {String} The type to get the comparison function for
     * @return {Funtion} The comparison function
     */
    getCompareFunction: function(type) {
      type = q.string.firstUp(type);
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
     * Sort the column with the given index according to the specified direction
     * @param columnName {String} The name of the column to sort
     * @param dir {String} The sorting direction (asc or desc)
     * @return {qx.ui.website.Table} <code>this</code> reference for chaining.
     */
    sort: function(columnName, dir) {
      var columnIndex = 0;
      this._forEachElementWrapped(function(table) {
        var columnIndex = table.__getColumnIndex(columnName);
        if (columnIndex !== -1) {
          table.setProperty("sortingClass", this.__setSortingClass(columnIndex, dir));
          table.__sortDOM(table.__sort(columnIndex, dir));
        } else {
          throw new Error("No column with the name " + columnName + " could be found !");
        }
      }.bind(this));

      return this;
    },


    /**
     * Get the current column sorting information
     * @return {Map} The map containing the current sorting information
     *
     */
    getSortingData: function() {
      var sortingClass = this.eq(0).getProperty("sortingClass");
      if (sortingClass) {
        sortingClass = sortingClass.split("-");
        var columnIndex = Number(sortingClass[2]);
        return {
          columnIndex: columnIndex,
          columnName: this.getProperty("__columnData").names[columnIndex],
          direction: sortingClass[1].toLowerCase()
        }
      }
      return null;
    },


    /**
     * Sets the mustache template of the specified column for the widgets
     * in the collection
     * @param columname {String} The column name
     * @param template {String} The mustache template
     * @return {qx.ui.website.Table} <code>this</code> reference for chaining.
     */
    setItemTemplate: function(columname, template) {
      this._forEachElementWrapped(function(table) {
        var index = table.__getColumnIndex(columname);
        table.getProperty("__columnData").templates[index] = template;
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
        table.getProperty("__columnData").names.forEach(function(columnName, index) {
          this.getProperty("__columnData").templates[index] = template;
        }.bind(table));
        table.__applyTemplate(this.getProperty("__model"));
      });
      return this;
    },

    //overriden
    render: function() {
      this._forEachElementWrapped(function(table) {
        var sortingData = table.getSortingData();
        var columnSelection = table.getConfig("columnSelection");
        if (["multiple", "single"].indexOf(columnSelection) != -1) {
          //TODO Render checkboxes or radios for the selection
        }
        if (sortingData) {
          table.__sortDOM(table.__sort(sortingData.columnIndex, sortingData.direction));
        }
      });
      return this;
    },


    //Private API

    /**
     * Retrieves and initializes meta data form the widget columns
     * @param model {Array} The widget's model
     */
    __getColumnMetaData: function(model) {
      var tHead = this[0].tHead || this.__getRoot(),
        names = [];
      var data = {
        names: [],
        types: [],
        templates: []
      };
      var cells = null,
        colType = null,
        colName = null;
      if (tHead && (tHead.rows.length > 0)) {
        cells = tHead.rows.item(0).cells;
      } else if (model && model.length > 0) {
        cells = model[0]
      }
      for (var i = 0, l = cells.length; i < l; i++) {
        if (cells.item) {
          colType = q(cells.item(i)).getData("type") || "String";
          colName = q(cells.item(i)).getData("name") || String(i);
        } else {
          colType = "String";
          colName = String(i);
        }
        data.names.push(colName);
        data.types.push(colType);
        data.templates.push("<div class='qx-cell-content'>{{& value }}</div>");
      }
      this.setProperty("__columnData", data);
    },

    /**
     * Sorts the rows of the table widget
     * @param dataRows {Array} Array containing the sorted rows
     */
    __sortDOM: function(dataRows) {
      for (var i = 0, l = dataRows.length; i < l; i++) {
        if (i) {
          qxWeb(dataRows[i]).insertAfter(dataRows[i - 1]);
        } else {
          qxWeb(dataRows[i]).insertBefore(q(this.__getRoot().rows.item(0)));
        }
      }
      this.setProperty("__dataRows", dataRows);
    },

    /**
     * registers global events
     */
    __registerEvents: function() {
      this.on("click", this.__detectClickedCell);
      this.on("selected", function(data) {
        this.getProperty("__sortingFunction").bind(this)(data);
      }, this);
    },


    /**
     * Click handler which fires an "selected" event with information about the clicked cell
     *
     * @param e {Event} The native click event.
     */
    __detectClickedCell: function(e) {
      var cell = e.getTarget();
      if (cell.nodeName.toUpperCase() == "TD" || cell.nodeName.toUpperCase() == "TH") {
        var rows = this[0].rows;
        var row = cell.parentNode,
          cells = row.cells;
        var rowIndex = qx.ui.website.Table.__getIndex(rows, row);
        var cellIndex = qx.ui.website.Table.__getIndex(cells, cell);
        this.emit("selected", {
          rowNumber: rowIndex,
          colNumber: cellIndex,
          cell: qxWeb(cell),
          row: qxWeb(row)
        });
      }
    },

    /**
     * Applies the given model to the table cells depending on
     * the mustache template specified before
     * @param model {Array} The model to apply
     */
    __applyTemplate: function(model) {
      var self = this,
        cell;
      var columnData = this.getProperty("__columnData");
      model.forEach(function(row, rowIndex) {
        if (!self.__isRowRendered(rowIndex)) {
          self.__getRoot().insertRow(rowIndex);
        }
        row.forEach(function(col, colIndex) {
          if (!self.__isCellRendered(rowIndex, colIndex)) {
            self.__getRoot().rows.item(rowIndex).insertCell(colIndex);
          }
          cell = self.getCell(rowIndex, colIndex);
          cell.setHtml(qxWeb.template.render(columnData.templates[colIndex], model[rowIndex][colIndex]));
        });
      });
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
     * @param columnIndex {Integer} The index of the sorted column
     * @param dir {String} The sorting direction
     * @return {String} The generated cklass name
     */
    __setSortingClass: function(columnIndex, dir) {
      var oldClass = this.getProperty("sortingClass");
      if (oldClass) {
        this.removeClass(oldClass);
      }
      var className = "qx-" + q.string.firstUp(dir) + "-" + columnIndex;
      this.addClass(className);

      this.__addSortingClassToCol(this[0].tHead, columnIndex, dir);
      this.__addSortingClassToCol(this[0].tFoot, columnIndex, dir);
      return className;
    },

    /**
     * Adds a class to the head or footer of the current sorted column
     * @param HeaderOrFooter {Node} The n
     * @param columnIndex {Integer} The index of the sorted column
     * @param dir {String} The sorting direction
     */
    __addSortingClassToCol: function(HeaderOrFooter, columnIndex, dir) {
      if (HeaderOrFooter && HeaderOrFooter.rows.length > 0) {
        qxWeb(HeaderOrFooter.rows.item(0).cells).removeClasses(["qx-asc", "qx-desc"]);
        for (var i = 0, l = HeaderOrFooter.rows.length; i < l; i++) {
          qxWeb(HeaderOrFooter.rows.item(i).cells.item(columnIndex)).addClass("qx-" + dir);
        }
      }
    },

    /**
     * Sorts the table rows for the given row and direction
     * @param columnIndex {Integer} The column index the consider for the sorting
     * @param direction {String} The sorting direction
     * @return {Array} Array containinfg the sorted rows
     */
    __sort: function(columnIndex, direction) {
      var columnType = q.string.firstUp(this.getProperty("__columnData").types[columnIndex]);
      if (!this["__compare" + columnType]) {
        columnType = "String";
      }
      var compareFunc = this.getCompareFunction(columnType).bind(this);
      var model = this.__getDataRows();
      return model.sort(function(a, b) {
        var x = this.__getCellValue(q(a.cells.item(columnIndex)));
        var y = this.__getCellValue(q(b.cells.item(columnIndex)));
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
      var rows = tableNode.rows,
        model = [],
        cells = [];
      for (var i = 0, l = rows.length; i < l; i++) {
        cells = rows.item(i).cells;
        if ((cells.length > 0) && (cells[0].nodeName.toUpperCase() != "TD")) {
          continue;
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
        if (data.colNumber == sortedData.columnIndex) {
          if (sortedData.direction == dir) {
            dir = "desc";
          }
        }
      }
      if (data.cell[0].nodeName.toUpperCase() == "TH") {
        this.sort(data.colNumber, dir);
      }
    },

    /**
     * Gets the index of the column with the specified name
     * @param columnName {String} The colukn name
     * @return {Integer} The index of the column
     */
    __getColumnIndex: function(columnName) {
      if (!this.getProperty("__columnData")) {
        this.__getColumnMetaData();
      }
      var data = this.getProperty("__columnData");
      var columnIndex = data.names.indexOf(columnName);
      if (columnIndex == -1) {
        if (qx.ui.website.Table.__isNumber(columnName)) {
          columnIndex = Number(columnName);
        }
      }
      return columnIndex;
    }

  },


  defer: function(statics) {
    qxWeb.$attach({
      table: statics.table
    });
  }


});
