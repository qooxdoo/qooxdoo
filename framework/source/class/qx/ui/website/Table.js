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

          var types = new Array(this.getProperty("__model")[0].length).join('0').split('');
          types = types.map(function(item) {
            return "String"
          });
          this.setColumnTypes(types);

          this.setProperty("caseSensitive", false);

          this.setSortingFunction(this.__defaultColumnSort);

          this.__registerEvents();

          return true;
        },

        setCaseSensitive: function(sensitive) {
          this.setProperty("caseSensitive", sensitive);
          return this;
        },

        getCaseSensitive: function() {
          return this.getProperty("caseSensitive");
        },

        setColumnTypes: function(types) {
          types = types.map(function(type) {
            return type.charAt(0).toUpperCase() + type.slice(1);
          });
          this.setProperty("types", types);
          return this;
        },

        getColumnTypes: function() {
          var types = this.getProperty("types").map(function(type) {
            return type.charAt(0).toLowerCase() + type.slice(1);
          });
          return types;
        },

        setTableCellValue: function(className) {
          this.setProperty("cellValueClass", className);
          return this;
        },


        getCell: function(i, j) {
          return qxWeb(this[0].rows(i).item(j));
        },

        setCompare: function(type, compareFunc) {
          type = type.charAt(0).toUpperCase() + type.slice(1);
          this.setProperty("__compare" + type, compareFunc);
          return this;
        },

        unsetCompare: function(type) {
          type = type.charAt(0).toUpperCase() + type.slice(1);
          var compareFunc = this["__compare" + type] || function(x, y, direction) {
              return 0;
            };
          this.setProperty("__compare" + type, compareFunc);
          return this;
        },

        getCompareFunction: function(type) {
          type = type.charAt(0).toUpperCase() + type.slice(1);
          return this.getProperty("__compare" + type) || this["__compare" + type];
        },

        setSortingFunction: function(func) {
          this.setProperty("__sortingFunction", func);
          return this;
        },

        unsetSortingFunction: function() {
          this.setProperty("__sortingFunction", this.__defaultColumnSort);
          return this;
        },

        sort: function(columnIndex, dir) {
          this.setProperty("sortingClass", this.__setSortingClass(columnIndex, dir));
          this.setProperty("__model", this.__sort(this.getProperty("__model"), columnIndex, dir));
          this.render();
          return this;
        },

        getSortedData: function() {
          var sortingClass = this.getProperty("sortingClass");
          if (sortingClass) {
            sortingClass = sortingClass.split("-");
            return {
              columnIndex: Number(sortingClass[2]),
              direction: sortingClass[1].toLowerCase()
            }
          }
          return null;
        },

        render: function() {
          var sortedModel = this.getProperty("__model");
          for (var i = 0, l = sortedModel.length; i < l; i++) {
            if (i) {
              qxWeb(sortedModel[i]).insertAfter(sortedModel[i - 1]);
            } else {
              var firstRow = qxWeb(sortedModel[i].parentNode.firstChild);
              qxWeb(sortedModel[i]).insertBefore(firstRow);
            }
          }
          return this;
        },


        //Private API
        __registerEvents: function() {

          this.on("click", this.__detectClickedCell);

          this.on("selected", function(data) {
            this.getProperty("__sortingFunction").bind(this)(data);
          }, this);

        },

        __detectClickedCell: function(e) {
          var cell = e.getTarget();
          if (cell.nodeName.toUpperCase() == "TD" || cell.nodeName.toUpperCase() == "TH") {
            var rows = Array.prototype.slice.call(this[0].rows);
            var row = cell.parentNode,
              cells = Array.prototype.slice.call(row.cells);
            var rowIndex = rows.indexOf(row);
            var cellIndex = cells.indexOf(cell);
            this.emit("selected", {
              rowNumber: rowIndex,
              colNumber: cellIndex,
              cell: qxWeb(cell),
              row: qxWeb(row)
            });
          }
        },

        __setModel: function(model) {
          if (qx.lang.Type.isArray(model) && (model.length > 0)) {
             this.setProperty("__model", model);
             this.render();
          } else {
            this.setProperty("__model", this.__getModelFromHTML());
          }
        },

        __setSortingClass: function(columnIndex, dir) {
          var oldClass = this.getProperty("sortingClass");
          if (oldClass) {
            this.removeClass(oldClass);
          }
          var className = "qx-";
          if (dir == "asc") {
            className += "Asc" + "-" + columnIndex;
          } else if (dir == "desc") {
            className += "Desc" + "-" + columnIndex;
          }
          this.addClass(className);

          this.__addSortingClassToCol(this[0].tHead, columnIndex, dir);
          this.__addSortingClassToCol(this[0].tFoot, columnIndex, dir);
          return className;
        },

        __addSortingClassToCol: function(HeaderOrFooter, columnIndex, dir) {
          if (HeaderOrFooter && HeaderOrFooter.rows.length > 0) {
            qxWeb(HeaderOrFooter.rows.item(i).cells).removeClasses(["qx-asc", "qx-desc"]);
            for (var i = 0, l = HeaderOrFooter.rows.length; i < l; i++) {
              qxWeb(HeaderOrFooter.rows.item(i).cells.item(columnIndex)).addClass("qx-" + dir);
            }
          }
        },


        __sort: function(model, columnIndex, direction) {

          var columnType = this.getProperty("types")[columnIndex];

          if (!this["__compare" + columnType]) {
            columnType = "String";
          }
          var compareFunc = this.getCompareFunction(columnType);
          compareFunc = compareFunc.bind(this);
          return model.sort(function(a, b) {
            var x = this.__getCellValue(qxWeb(a.cells.item(columnIndex)));
            var y = this.__getCellValue(qxWeb(b.cells.item(columnIndex)));
            return compareFunc(x, y, direction);
          }.bind(this));
        },


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


        __compareDate: function(x, y, direction) {
          x = (this.__isDate(x)) ? new Date(x) : new Date(0);
          y = (this.__isDate(y)) ? new Date(y) : new Date(0);
          return this.__compareNumber(x.getTime(), y.getTime());
        },

        __compareString: function(x, y, direction) {
          if (!this.getCaseSensitive()) {
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


        __getCellValue: function(cell) {
          var valueNode = cell.find("." + this.getProperty("cellValueClass"));
          if (valueNode.length == 0) {
            valueNode = cell;
          }
          return (valueNode.getTextContent() || "");
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
          var rows = tableNode.rows,
            model = [];
          for (var i = 0, l = rows.length; i < l; i++) {
            cells = rows.item(i).cells;
            if ((cells.length > 0) && (cells[0].nodeName.toUpperCase() != "TD")) {
              continue;
            }
            model.push(rows.item(i));
          }
          return model;
        },


        __defaultColumnSort: function(data) {
          var dir = "asc";
          var sortedData = this.getSortedData();
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

        __isNumber: function(n) {
          return (Object.prototype.toString.call(n) === '[object Number]' ||
            Object.prototype.toString.call(n) === '[object String]') && !isNaN(parseFloat(n)) && isFinite(n.toString().replace(/^-/, ''));
        },

        __isDate: function(val) {
          var d = new Date(val);
          return !isNaN(d.valueOf());
        }
      },


      defer: function(statics) {
        qxWeb.$attach({
          table: statics.table
        });
      }

    });
