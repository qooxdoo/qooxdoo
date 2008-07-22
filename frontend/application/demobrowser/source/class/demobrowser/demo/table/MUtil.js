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
      var selection = this.getSelectionMock();

      var table = {
        getTableModel : function() { return model; },
        getTableColumnModel : function() { return columnModel; },
        getRowHeight : function() { return 20; },
        getForceLineHeight : function() { return true; },
        getSelectionModel : function() { return selection; },
        getDataRowRenderer : function() { return new qx.ui.table.rowrenderer.Default(table)},
        updateContent : function() {}
      }

      return table;
    },


    getSelectionMock : function()
    {
      return {
        isSelectedIndex : function(index) { return index == 0; }
      };
    },


    getColumnModelMock : function()
    {
      return {
        getColumnCount : function() { return 4; },
        getColumnWidth : function(col) { return 100; },
        getHeaderCellRenderer : function(col) {
          return new qx.ui.table.headerrenderer.Default();
        },
        getDataCellRenderer : function() {
          return new qx.ui.table.cellrenderer.Default();
        }
      };
    },


    getPaneModelMock : function()
    {
      return {
        getColumnAtX : function(x) { return x; },
        getColumnCount : function() { return 4; },
        getX : function(col) { return col; },
        getColumnLeft : function(col) { return col * 100; },
        getTotalWidth : function() { return 4 * 100; }
      }
    },


    getModelMock : function()
    {
      return {
        getSortColumnIndex : function() { return 0; },
        isSortAscending : function() { return true; },
        getColumnName : function(col) { return "Column #" + col; },
        isColumnEditable : function(col) { return false; },
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


    _fixBoxModel : function()
    {
      var boxSizingAttr = qx.legacy.core.Client.getInstance().getEngineBoxSizingAttributes();
      var borderBoxCss = boxSizingAttr.join(":border-box;") + ":border-box;";

      qx.bom.Stylesheet.createElement(
        "*{" + borderBoxCss +"} "
      );
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


    permute :function(options, callback)
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
            callback(map);
          }
          _perm(index+1, indices[index+1]);
        }
      }

      _perm(0, -1);
    }
  }
});