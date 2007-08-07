/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2006 STZ-IDA, Germany, http://www.stz-ida.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Til Schneider (til132)

************************************************************************ */

/* ************************************************************************

#module(ui_table)

************************************************************************ */

/**
 * The table pane that shows a certain section from a table. This class handles
 * the display of the data part of a table and is therefore the base for virtual
 * scrolling.
 */
qx.Class.define("qx.ui.table2.pane.Pane",
{
  extend : qx.ui.basic.Terminator,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param paneScroller {TablePaneScroller} the TablePaneScroller the header belongs to.
   */
  construct : function(paneScroller)
  {
    this.base(arguments);

    this._paneScroller = paneScroller;

    // this.debug("USE_ARRAY_JOIN:" + qx.ui.table2.pane.Pane.USE_ARRAY_JOIN + ", USE_TABLE:" + qx.ui.table2.pane.Pane.USE_TABLE);
    this._lastColCount = 0;
    this._lastRowCount = 0;

    this.__initTableArray();
  },




  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    USE_ARRAY_JOIN               : true,
    USE_TABLE                    : true,

    CONTENT_ROW_FONT_FAMILY_TEST : "'Segoe UI', Corbel, Calibri, Tahoma, 'Lucida Sans Unicode', sans-serif",
    CONTENT_ROW_FONT_SIZE_TEST   : "11px"
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    appearance :
    {
      refine : true,
      init : "table-pane"
    },

    /** The index of the first row to show. */
    firstVisibleRow :
    {
      check : "Number",
      init : 0,
      apply : "_applyFirstVisibleRow"
    },

    /** The number of rows to show. */
    visibleRowCount :
    {
      check : "Number",
      init : 0,
      apply : "_applyVisibleRowCount"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // property modifier
    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyFirstVisibleRow : function(value, old) {
      this._updateContent();
    },

    // property modifier
    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyVisibleRowCount : function(value, old) {
      this._updateContent();
    },

    // overridden
    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _afterAppear : function()
    {
      this.base(arguments);

      if (this._updateWantedWhileInvisible)
      {
        // We are visible now and an update was wanted while we were invisible
        // -> Do the update now
        this._updateContent();
        this._updateWantedWhileInvisible = false;
      }
    },


    /**
     * Returns the TablePaneScroller this pane belongs to.
     *
     * @type member
     * @return {qx.ui.table2.pane.Scroller} the TablePaneScroller.
     */
    getPaneScroller : function() {
      return this._paneScroller;
    },


    /**
     * Returns the table this pane belongs to.
     *
     * @type member
     * @return {qx.ui.table2.Table} the table.
     */
    getTable : function() {
      return this._paneScroller.getTable();
    },


    /**
     * Sets the currently focused cell.
     *
     * @type member
     * @param col {Integer} the model index of the focused cell's column.
     * @param row {Integer} the model index of the focused cell's row.
     * @param massUpdate {Boolean ? false} Whether other updates are planned as well.
     *          If true, no repaint will be done.
     * @return {void}
     */
    setFocusedCell : function(col, row, massUpdate)
    {
      if (col != this._focusedCol || row != this._focusedRow)
      {
        var oldCol = this._focusedCol;
        var oldRow = this._focusedRow;
        this._focusedCol = col;
        this._focusedRow = row;
/*
        // Update the focused row background
        if (row != oldRow && !massUpdate)
        {
          // NOTE: Only the old and the new row need update
          this._updateContent(false, oldRow, true);
          this._updateContent(false, row, true);
        } */
      }
    },


    /**
     * Event handler. Called when the selection has changed.
     *
     * @type member
     * @param evt {Map} the event.
     * @return {void}
     */
    _onSelectionChanged : function(evt) {
      this._updateContent(false, null, true);
    },


    /**
     * Event handler. Called when the table gets or looses the focus.
     *
     * @type member
     * @param evt {Map} the event.
     * @return {void}
     */
    _onFocusChanged : function(evt) {
      this._updateContent(false, null, true);
    },


    /**
     * Event handler. Called when the width of a column has changed.
     *
     * @type member
     * @param evt {Map} the event.
     * @return {void}
     */
    _onColWidthChanged : function(evt) {
      this._updateContent(true);
    },


    /**
     * Event handler. Called the column order has changed.
     *
     * @type member
     * @param evt {Map} the event.
     * @return {void}
     */
    _onColOrderChanged : function(evt) {
      this._updateContent(true);
    },


    /**
     * Event handler. Called when the pane model has changed.
     *
     * @type member
     * @param evt {Map} the event.
     * @return {void}
     */
    _onPaneModelChanged : function(evt) {
      this._updateContent(true);
    },


    /**
     * Event handler. Called when the table model data has changed.
     *
     * @type member
     * @param evt {Map} the event.
     * @return {void}
     */
    _onTableModelDataChanged : function(evt)
    {
      var data = evt.getData ? evt.getData() : null;

      var firstRow = this.getFirstVisibleRow();
      var rowCount = this.getVisibleRowCount();

      if (data == null || data.lastRow == -1 || data.lastRow >= firstRow && data.firstRow < firstRow + rowCount)
      {
        // The change intersects this pane
        this._updateContent();
      }
    },


    /**
     * Event handler. Called when the table model meta data has changed.
     *
     * @type member
     * @param evt {Map} the event.
     * @return {void}
     */
    _onTableModelMetaDataChanged : function(evt) {
      this._updateContent();
    },


    /**
     * Updates the content of the pane.
     *
     * @type member
     * @param completeUpdate {Boolean ? false} if true a complete update is performed.
     *      On a complete update all cell widgets are recreated.
     * @param onlyRow {Integer ? null} if set only the specified row will be updated.
     * @param onlySelectionOrFocusChanged {Boolean ? false} if true, cell values won't
     *          be updated. Only the row background will.
     * @return {void}
     */
    _updateContent : function(completeUpdate, onlyRow, onlySelectionOrFocusChanged)
    {
      if (!this.isSeeable())
      {
        this._updateWantedWhileInvisible = true;
        return;
      }

      if (qx.ui.table2.pane.Pane.USE_ARRAY_JOIN) {
        this._updateContent_array_join(completeUpdate, onlyRow, onlySelectionOrFocusChanged);
      } else {
        this._updateContent_orig(completeUpdate, onlyRow, onlySelectionOrFocusChanged);
      }
    },


    __rowCache : [],

    __initTableArray : function()
    {
      this.TABLE_ARR = [];

      var i=0;
      this.TABLE_ARR[i++] = '<table cellspacing\="0" cellpadding\="0" style\="table-layout:fixed;font-family:';
      this.TAB_FONT_FAMILY = i++;
      this.TABLE_ARR[i++] = ';font-size:';
      this.TAB_FONT_SIZE = i++;
      this.TABLE_ARR[i++] = ';width:';
      this.TAB_ROW_HEIGHT = i++;
      this.TABLE_ARR[i++] = 'px"><colgroup>';
      this.TAB_COLGROUP = i++;
      this.TABLE_ARR[i++] = '</colgroup><tbody>';
      this.TAB_BODY = i++;
      this.TABLE_ARR[i++] = '</tbody></table>';
    },


    /**
     * Updates the content of the pane (implemented using array joins).
     *
     * @type member
     * @param completeUpdate {Boolean ? false} if true a complete update is performed.
     *      On a complete update all cell widgets are recreated.
     * @param onlyRow {Integer ? null} if set only the specified row will be updated.
     * @param onlySelectionOrFocusChanged {Boolean ? false} if true, cell values won't
     *          be updated. Only the row background will.
     * @return {void}
     */
    _updateContent_array_join : function(completeUpdate, onlyRow, onlySelectionOrFocusChanged)
    {
      //var start = new Date();
      var TablePane = qx.ui.table2.pane.Pane;

      var table = this.getTable();

      var selectionModel = table.getSelectionModel();
      var tableModel = table.getTableModel();
      var columnModel = table.getTableColumnModel();
      var paneModel = this.getPaneScroller().getTablePaneModel();
      var rowRenderer = table.getDataRowRenderer();

      var colCount = paneModel.getColumnCount();
      var rowHeight = table.getRowHeight();

      var firstRow = this.getFirstVisibleRow();
      var rowCount = this.getVisibleRowCount();
      var modelRowCount = tableModel.getRowCount();

      if (firstRow + rowCount > modelRowCount) {
        rowCount = Math.max(0, modelRowCount - firstRow);
      }

      var cellInfo = { table : table };
      cellInfo.styleHeight = rowHeight;

      var htmlArr = [];
      var rowWidth = paneModel.getTotalWidth();

      if (TablePane.USE_TABLE)
      {
        this.TABLE_ARR[this.TAB_FONT_FAMILY] = qx.ui.table2.pane.Pane.CONTENT_ROW_FONT_FAMILY_TEST;
        this.TABLE_ARR[this.TAB_FONT_SIZE] =qx.ui.table2.pane.Pane.CONTENT_ROW_FONT_SIZE_TEST;
        this.TABLE_ARR[this.TAB_ROW_WIDTH] = rowWidth;

        var i=0;
        var colArr = [];
        for (var x=0; x<colCount; x++)
        {
          var col = paneModel.getColumnAtX(x);

          colArr[i++] = '<col width="';
          colArr[i++] = columnModel.getColumnWidth(col);
          colArr[i++] = '"/>';
        }

        this.TABLE_ARR[this.TAB_COLGROUP] = colArr.join("");
      }

      tableModel.prefetchRows(firstRow, firstRow + rowCount - 1);

      var rowsArr = [];
      for (var y=0; y<rowCount; y++)
      {
        var row = firstRow + y;
        var selected = selectionModel.isSelectedIndex(row);

        var rowHtml = [];

        if (!selected && this.__rowCache[row]) {
          rowsArr[y] = this.__rowCache[row];
          continue;
        }

        cellInfo.row = row;
        cellInfo.selected = selectionModel.isSelectedIndex(row);
        cellInfo.focusedRow = (this._focusedRow == row);
        cellInfo.rowData = tableModel.getRowData(row);

        // Update this row
        if (TablePane.USE_TABLE)
        {
          rowHtml.push('<tr style\="height:');
          rowHtml.push(rowHeight);
        }
        else
        {
          rowHtml.push('<div style\="position:absolute;left:0px;top:');
          rowHtml.push(y * rowHeight);
          rowHtml.push('px;width:');
          rowHtml.push(rowWidth);
          rowHtml.push('px;height:');
          rowHtml.push(rowHeight);
          rowHtml.push('px');
        }

        rowRenderer._createRowStyle_array_join(cellInfo, rowHtml);

        rowHtml.push('">');

        var left = 0;

        for (var x=0; x<colCount; x++)
        {
          var col = paneModel.getColumnAtX(x);
          cellInfo.xPos = x;
          cellInfo.col = col;
          cellInfo.editable = tableModel.isColumnEditable(col);
          cellInfo.focusedCol = (this._focusedCol == col);
          cellInfo.value = tableModel.getValue(col, row);
          var cellWidth = columnModel.getColumnWidth(col);

          cellInfo.styleLeft = left;
          cellInfo.styleWidth = cellWidth;

          var cellRenderer = columnModel.getDataCellRenderer(col);
          cellRenderer.createDataCellHtml_array_join(cellInfo, rowHtml);

          left += cellWidth;
        }

        if (TablePane.USE_TABLE) {
          rowHtml.push('</tr>');
        } else {
          rowHtml.push('</div>');
        }

        var rowString = rowHtml.join("");
        if (!selected) {
          this.__rowCache[row] = rowString;
        }
        rowsArr[y] = rowString;
      }

      if (TablePane.USE_TABLE) {
        this.TABLE_ARR[this.TAB_BODY] = rowsArr.join("");
      }

      var elem = this.getElement();

      // this.debug(">>>" + htmlArr.join("") + "<<<")
      //this.debug("compute time: " + (new Date() - start) + "ms");

      //var start = new Date();
      if (TablePane.USE_TABLE) {
        elem.innerHTML = this.TABLE_ARR.join("");
      } else {
        elem.innerHTML = htmlArr.join("");
      }
      //this.debug("render time: " + (new Date() - start) + "ms");

      this.setHeight(rowCount * rowHeight);

      this._lastColCount = colCount;
      this._lastRowCount = rowCount;
    },


    /**
     * Updates the content of the pane (old implementation).
     *
     * @type member
     * @param completeUpdate {Boolean ? false} if true a complete update is performed.
     *      On a complete update all cell widgets are recreated.
     * @param onlyRow {Integer ? null} if set only the specified row will be updated.
     * @param onlySelectionOrFocusChanged {Boolean ? false} if true, cell values won't
     *          be updated. Only the row background will.
     * @return {void}
     * @throws TODOC
     */
    _updateContent_orig : function(completeUpdate, onlyRow, onlySelectionOrFocusChanged)
    {
      var TablePane = qx.ui.table2.pane.Pane;

      var table = this.getTable();

      var alwaysUpdateCells = table.getAlwaysUpdateCells();

      var selectionModel = table.getSelectionModel();
      var tableModel = table.getTableModel();
      var columnModel = table.getTableColumnModel();
      var paneModel = this.getPaneScroller().getTablePaneModel();
      var rowRenderer = table.getDataRowRenderer();

      var colCount = paneModel.getColumnCount();
      var rowHeight = table.getRowHeight();

      var firstRow = this.getFirstVisibleRow();
      var rowCount = this.getVisibleRowCount();
      var modelRowCount = tableModel.getRowCount();

      if (firstRow + rowCount > modelRowCount) {
        rowCount = Math.max(0, modelRowCount - firstRow);
      }

      // Remove the rows that are not needed any more
      if (completeUpdate || this._lastRowCount > rowCount)
      {
        var firstRowToRemove = completeUpdate ? 0 : rowCount;
        this._cleanUpRows(firstRowToRemove);
      }

      if (TablePane.USE_TABLE) {
        throw new Error("Combination of USE_TABLE==true and USE_ARRAY_JOIN==false is not yet implemented");
      }

      var elem = this.getElement();
      var childNodes = elem.childNodes;
      var cellInfo = { table : table };
      tableModel.prefetchRows(firstRow, firstRow + rowCount - 1);

      for (var y=0; y<rowCount; y++)
      {
        var row = firstRow + y;

        if ((onlyRow != null) && (row != onlyRow)) {
          continue;
        }

        cellInfo.row = row;
        cellInfo.selected = selectionModel.isSelectedIndex(row);
        cellInfo.focusedRow = (this._focusedRow == row);
        cellInfo.rowData = tableModel.getRowData(row);

        // Update this row
        var rowElem;
        var recyleRowElem;

        if (y < childNodes.length)
        {
          rowElem = childNodes[y];
          recyleRowElem = true;
        }
        else
        {
          var rowElem = document.createElement("div");

          // rowElem.style.position = "relative";
          rowElem.style.position = "absolute";
          rowElem.style.left = "0px";
          rowElem.style.top = (y * rowHeight) + "px";

          rowElem.style.height = rowHeight + "px";
          elem.appendChild(rowElem);
          recyleRowElem = false;
        }

        rowRenderer.updateDataRowElement(cellInfo, rowElem);

        if (alwaysUpdateCells || !recyleRowElem || !onlySelectionOrFocusChanged)
        {
          var html = "";
          var left = 0;

          for (var x=0; x<colCount; x++)
          {
            var col = paneModel.getColumnAtX(x);
            cellInfo.xPos = x;
            cellInfo.col = col;
            cellInfo.editable = tableModel.isColumnEditable(col);
            cellInfo.focusedCol = (this._focusedCol == col);
            cellInfo.value = tableModel.getValue(col, row);
            var width = columnModel.getColumnWidth(col);
            cellInfo.style = 'position:absolute;left:' + left + 'px;top:0px;width:' + width + 'px; height:' + rowHeight + "px";

            var cellRenderer = columnModel.getDataCellRenderer(col);

            if (recyleRowElem)
            {
              var cellElem = rowElem.childNodes[x];
              cellRenderer.updateDataCellElement(cellInfo, cellElem);
            }
            else
            {
              html += cellRenderer.createDataCellHtml(cellInfo);
            }

            left += width;
          }

          if (!recyleRowElem)
          {
            rowElem.style.width = left + "px";
            rowElem.innerHTML = html;
          }
        }
      }

      this.setHeight(rowCount * rowHeight);

      this._lastColCount = colCount;
      this._lastRowCount = rowCount;
    },


    /**
     * Cleans up the row widgets.
     *
     * @type member
     * @param firstRowToRemove {Integer} the visible index of the first row to clean up.
     *      All following rows will be cleaned up, too.
     * @return {void}
     */
    _cleanUpRows : function(firstRowToRemove)
    {
      var elem = this.getElement();

      if (elem)
      {
        var childNodes = this.getElement().childNodes;
        var paneModel = this.getPaneScroller().getTablePaneModel();
        var colCount = paneModel.getColumnCount();

        for (var y=childNodes.length-1; y>=firstRowToRemove; y--) {
          elem.removeChild(childNodes[y]);
        }
      }
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeObjects("_paneScroller");
  }
});
