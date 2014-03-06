/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2014 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Romeo Kenfack Tsakem (rkenfack)

************************************************************************ */
/**
 * @group (Widget)
 */
qx.Bootstrap.define("qx.ui.website.Table", {

  extend: qx.ui.website.Widget,

  construct: function(selector, context) {
    this.base(arguments, selector, context);
  },


  statics: {
    /**
     *
     * @attach {qxWeb}
     */
    table: function(model) {
      var table = new qx.ui.website.Table(this);
      table.init(model);
      return table;
    }
  },



  members: {

    init: function(model) {
      if (!this.base(arguments)) {
        return false;
      }
      this.setTableCellValue("qx-cell-value-class");
      this.__setModel(model);
      return true;
    },


    setTableCellValue: function(className) {
      this.setProperty("cellValueClass", className);
    },

    setModel: function(model) {
      if (qx.lang.Type.isArray(model) && (model.length > 0)) {
        this.setProperty("model", model);
        this.setProperty("initialModel", model.slice(0));
        this.render();
      }
    },

    getModel: function() {
      return this.getProperty("model");
    },

    getCell: function(i, j) {
      console.log("3e")
      return qxWeb(this[0].rows(i).item(j));
    },

    getCellValue: function(i, j) {
      return this.__getCellValue(this.getCell(i, j))
    },

    setCellValue: function(i, j, value) {
      this.__setCellValue(this.getCell(i, j), value);
    },

    sort: function(columnIndex, dir) {
      this.setProperty("sortingClass", this.__setSortingClass(columnIndex, dir));
      if (this.getProperty("model")) {
        this.setProperty("initialModel", this.getProperty("model").slice(0));
      }
      this.setProperty("model", this.__sort(this.getModel(), columnIndex, dir));
      this.render();
    },

    render: function() {
      if (this.getProperty("model")) {
        var sortedModel = this.getProperty("model");
        var initialModel = this.getProperty("initialModel");
        for (var i = 0, rows = sortedModel.length; i < rows; i++) {
          for (var j = 0, cols = sortedModel[i].length; j < cols; j++) {
            this.__setCellValue(initialModel[i][j].cell, sortedModel[i][j].value);
          }
        }

        this.setProperty("model", initialModel);
        this.setProperty("initialModel", this.getProperty("model").slice(0));
      }
    },


    //Private API

    __setModel: function(model) {
      if (qx.lang.Type.isArray(model) && (model.length > 0)) {
        this.setModel(model);
      } else {
        this.setProperty("model", this.__getModelFromHTML());
      }
    },

    __setSortingClass: function(columnIndex, dir) {

      var oldClass = this.getProperty("sortingClass");
      if (oldClass) {
        this.removeClass(oldClass);
      }
      var className = "qx-sort";
      if (dir == "asc") {
        className += "Asc" + "-" + columnIndex;
      } else if (dir == "desc") {
        className += "Desc" + "-" + columnIndex;
      }
      this.addClass(className);

      return className;
    },


    __sort: function(model, columnIndex, direction) {
      return model.sort(function(a, b) {
        var x = a[columnIndex].value;
        var y = b[columnIndex].value;
        if (direction == "asc") {
          return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        } else if (direction == "desc") {
          return ((x > y) ? -1 : ((x < y) ? 1 : 0));
        }
        return 0;
      });
    },


    __getCellValue: function(cell) {
      var valueNode = cell.find("." + this.getProperty("cellValueClass"));
      if (valueNode.length == 0) {
        valueNode = cell;
      }
      return valueNode.getTextContent();
    },


    __setCellValue: function(cell, value) {

      var valueNode = cell.find("." + this.getProperty("cellValueClass"));
      if (valueNode.length == 0) {
        valueNode = cell;
      }
      valueNode.setTextContent(value);
    },


    __getModelFromHTML: function() {

      var tableNode = this[0];
      var tHead = qxWeb(tableNode.tHead);
      var rows = tableNode.rows,
        cells = null,
        model = [],
        currentRow = [];

      for (var i = 0, l = rows.length; i < l; i++) {
        currentRow = [];
        cells = rows.item(i).cells;
        if ((tHead.length > 0 && qxWeb(cells[0]).isChildOf(tHead)) || (cells[0].nodeName.toUpperCase() != "TD")) {
          continue;
        }
        for (var j = 0, l2 = cells.length; j < l2; j++) {
          currentRow.push({
            cell: qxWeb(cells[j]),
            value: this.__getCellValue(qxWeb(cells[j]))
          });
        }
        model.push(currentRow);
      }

      return model;
    }

  },


  defer: function(statics) {
    qxWeb.$attach({
      table: statics.table
    });
  }

});
