/*
#require(qx.ui.table.selection.Manager)
*/

qx.Mixin.define("demobrowser.demo.table.MUtil",
{
  construct : function() {
    this._tableLeft = 10;
  },

  members :
  {
    getTableMock : function()
    {
      var columnModel = this.getColumnModelMock();
      var model = this.getModelMock();
      var selection = new qx.ui.table.selection.Model();
      var selectionManager = new qx.ui.table.selection.Manager();
      selectionManager.setSelectionModel(selection);

      var table = {
        getTableModel : function() { return model; },
        getTableColumnModel : function() { return columnModel; },
        getRowHeight : function() { return 20; },
        getForceLineHeight : function() { return true; },
        getSelectionModel : function() { return selection; },
        getDataRowRenderer : function() { return new qx.ui.table.rowrenderer.Default(table)},
        updateContent : function() {},
        setFocusedCell : function(col, row) {},
        getKeepFirstVisibleRowComplete : function() { return true; },
        getSelectionManager : function() { return selectionManager; },
        getNewTablePaneHeader : function(obj) {
          return function(obj) {
            var header = new qx.ui.table.pane.Header(obj);
            return header;
          }
        },
        getNewTablePane : function(obj) {
          return function(obj) {
            return new qx.ui.table.pane.Pane(obj);
          }
        },
        getEnabled : function() { return true; }
      }

      return table;
    },


    getSelectionMock : function()
    {
      return {
        isSelectedIndex : function(index) { return index == 0; },
        clearSelection : function() {}
      };
    },


    getColumnModelMock : function()
    {
      return {
        getColumnCount : function() { return 4; },
        getVisibleColumnCount : function() { return 4; },
        getVisibleColumnAtX : function(x) {return x; },
        getColumnWidth : function(col) { return 100; },
        setColumnWidth : function(col, width) {},
        getVisibleX : function(x) { return x; },
        getHeaderCellRenderer : function(col) {
          return new qx.ui.table.headerrenderer.Default();
        },
        getDataCellRenderer : function() {
          return new qx.ui.table.cellrenderer.Default();
        },
        addListener : function() {}
      };
    },


    getPaneModelMock : function()
    {
      model = {
        getColumnAtX : function(x) { return x; },
        getColumnCount : function() { return 4; },
        getX : function(col) { return col; },
        getColumnLeft : function(col) { return col * 100; },
        getTotalWidth : function() { return 4 * 100; }
      }
      return model;
    },


    getModelMock : function()
    {
      return {
        getSortColumnIndex : function() { return 0; },
        isSortAscending : function() { return true; },
        isColumnSortable : function(col) { return true; },
        getColumnName : function(col) { return "Column #" + col; },
        isColumnEditable : function(col) { return false; },
        sortByColumn : function(col, ascending) {},
        getRowCount : function() { return 500; },
        prefetchRows : function() {},
        getRowData : function(row) {
          var data = [];
          for (var i=0; i<4; i++) {
            data.push("Cell " + i + "x" + row)
          }
          return data;
        },
        getValue : function(col, row) { return "Cell " + col + "x" + row; }
      }
    },


    getPaneMock : function()
    {
      return {
        getFirstVisibleRow : function() { return 0; }
      }
    },


    getScrollerMock : function()
    {
      var table = this.getTableMock();
      var paneModel = this.getPaneModelMock();
      var pane = this.getPaneMock();

      return {
        getTable : function() { return table; },
        getTablePaneModel : function() { return paneModel; },
        getTablePane : function() { return pane; }
      }
    },


    _getNewTableDiv : function(width)
    {
      var div = qx.bom.Element.create("div");
      qx.bom.element.Style.setStyles(div, {
        position : "absolute",
        left: this._tableLeft + "px",
        width: (width || 150) + "px",
        top: 20 + "px",
        height: "500px",
        backgroundColor : "#FFE"
      });
      this._tableLeft += (width || 150) + 20;
      document.body.appendChild(div);
      return div;
    },


    permute :function(options, callback, context)
    {
      var keys = qx.lang.Object.getKeys(options);

      // init
      var map = {};
      var indices = [];
      for (var i=0; i<keys.length; i++)
      {
        indices[i] = 0;
        var key = keys[i];
        map[key] = options[key][0]
      }

      var _perm = function(index, ignore)
      {
        if (index >= keys.length) {
          return;
        }

        var key = keys[index];
        var values = options[key];

        for (var i=0; i<values.length; i++)
        {
          if (ignore !== i)
          {
            indices[index] = i;
            map[key] = values[i];
            callback.call(context || window, map);
          }
          _perm(index+1, indices[index+1]);
        }
      }

      _perm(0, -1);
    }
  }
});