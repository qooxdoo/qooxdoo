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
      this._updateContent(false, value-old);
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
          this._updateContent(false, null, oldRow, true);
          this._updateContent(false, null, row, true);
        }
        */
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
      this._updateContent(false, null, null, true);
    },


    /**
     * Event handler. Called when the table gets or looses the focus.
     *
     * @type member
     * @param evt {Map} the event.
     * @return {void}
     */
    _onFocusChanged : function(evt) {
      this._updateContent(false, null, null, true);
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
      this._invalidateRowCache();

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
      this._updateContent(true);
    },


    __rowCache : [],

    _invalidateRowCache : function() {
      this.__rowCache = [];
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
    _updateContent : function(completeUpdate, scrollOffset, onlyRow, onlySelectionOrFocusChanged)
    {
      if (completeUpdate) {
        this._invalidateRowCache();
      }

      if (!this.isSeeable())
      {
        this._updateWantedWhileInvisible = true;
        return;
      }

      var start = new Date();

      if (scrollOffset && Math.abs(scrollOffset) <= 10) {
        console.log("scroll", scrollOffset);
        this._scrollContent(scrollOffset);
      } else if (onlyRow) {
        console.log("singlerow", onlyRow);
        this._updateSingleRow(onlyRow);
      } else {
        console.log("full update");
        this._updateAllRows(onlySelectionOrFocusChanged);
      }

      this.debug("render time: " + (new Date() - start) + "ms");
    },


    __initTableArray : function()
    {
      this.TABLE_ARR = [];

      var i=0;
      this.TABLE_ARR[i++] = '<table cellspacing="0" cellpadding="0" style="table-layout:fixed;font-family:';
      this.TAB_FONT_FAMILY = i++;
      this.TABLE_ARR[i++] = ';font-size:';
      this.TAB_FONT_SIZE = i++;
      this.TABLE_ARR[i++] = ';width:';
      this.TAB_ROW_WIDTH = i++;
      this.TABLE_ARR[i++] = 'px"><colgroup>';
      this.TAB_COLGROUP = i++;
      this.TABLE_ARR[i++] = '</colgroup><tbody>';
      this.TAB_BODY = i++;
      this.TABLE_ARR[i++] = '</tbody></table>';
    },


    _updateSingleRow : function(row)
    {
      if (!this.getElement().firstChild) {
        this._updateAllRows();
        return;
      }

      var tableBody = this.getElement().firstChild.childNodes[1];
      var oldRow = tableBody.childNodes[row-this.getFirstVisibleRow()];

      // render new lines
      if (!this._tableContainer) {
        this._tableContainer = document.createElement("div");
      }
      var tableDummy = '<table cellspacing="0" cellpadding="0" style="table-layout:fixed"><tbody>';
      tableDummy += this._getRowsHtml(row, 1);
      tableDummy += '</tbody></table>';
      this._tableContainer.innerHTML = tableDummy;
      var newRow = this._tableContainer.firstChild.firstChild.childNodes[0];
      tableBody.replaceChild(newRow, oldRow);
    },


    _getRowsHtml : function(firstRow, rowCount)
    {
      var table = this.getTable();

      var selectionModel = table.getSelectionModel();
      var tableModel = table.getTableModel();
      var columnModel = table.getTableColumnModel();
      var paneModel = this.getPaneScroller().getTablePaneModel();
      var rowRenderer = table.getDataRowRenderer();

      tableModel.prefetchRows(firstRow, firstRow + rowCount - 1);

      var rowsArr = [];
      for (var row=firstRow; row < firstRow + rowCount; row++)
      {
        var selected = selectionModel.isSelectedIndex(row);

        if (!selected && this.__rowCache[row]) {
          rowsArr.push(this.__rowCache[row]);
          continue;
        }

        var rowHtml = [];

        var rowHeight = table.getRowHeight();
        var colCount = paneModel.getColumnCount();

        var cellInfo = { table : table };
        cellInfo.styleHeight = rowHeight;

        cellInfo.row = row;
        cellInfo.selected = selected;
        cellInfo.focusedRow = (this._focusedRow == row);
        cellInfo.rowData = tableModel.getRowData(row);

        // Update this row
        //rowHtml.push('<tr height=');
        //rowHtml.push(rowHeight+"px");

        rowHtml.push('<tr style="height:');
        rowHtml.push(rowHeight+"px");
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
          cellRenderer.createDataCellHtml(cellInfo, rowHtml);

          left += cellWidth;
        }
        rowHtml.push('</tr>');

        var rowString = rowHtml.join("");

        if (!selected) {
          this.__rowCache[row] = rowString;
        }
        rowsArr.push(rowString);
      }
      return rowsArr.join("");
    },


    _scrollContent : function(rowOffset)
    {
      if (!this.getElement().firstChild) {
        this._updateAllRows();
        return;
      }

      var tableBody = this.getElement().firstChild.childNodes[1];
      var tableChildNodes = tableBody.childNodes;
      var rowCount = this.getVisibleRowCount();
      var firstRow = this.getFirstVisibleRow();

      // remove old lines
      var removeRowBase = rowOffset < 0 ? rowCount + rowOffset : 0;
      var addRowBase = rowOffset < 0 ? 0: rowCount - rowOffset;

      for (i=Math.abs(rowOffset)-1; i>=0; i--)
      {
        var rowElem = tableChildNodes[removeRowBase];
        tableBody.removeChild(rowElem);
      }

      // render new lines
      if (!this._tableContainer) {
        this._tableContainer = document.createElement("div");
      }
      var tableDummy = '<table cellspacing="0" cellpadding="0" style="table-layout:fixed"><tbody>';
      tableDummy += this._getRowsHtml(firstRow + addRowBase, Math.abs(rowOffset));
      tableDummy += '</tbody></table>';
      this._tableContainer.innerHTML = tableDummy;
      var newTableRows = this._tableContainer.firstChild.firstChild.childNodes;

      // append new lines
      if (rowOffset > 0)
      {
        for (var i=newTableRows.length-1; i>=0; i--)
        {
          var rowElem = newTableRows[i];
          tableBody.appendChild(rowElem);
        }
      }
      else
      {
        for (var i=newTableRows.length-1; i>=0; i--)
        {
          var rowElem = newTableRows[i];
          tableBody.insertBefore(rowElem, tableBody.firstChild);
        }
      }
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
    _updateAllRows : function(onlySelectionOrFocusChanged)
    {
      var TablePane = qx.ui.table2.pane.Pane;

      var table = this.getTable();

      var tableModel = table.getTableModel();
      var columnModel = table.getTableColumnModel();
      var paneModel = this.getPaneScroller().getTablePaneModel();

      var colCount = paneModel.getColumnCount();
      var rowHeight = table.getRowHeight();
      var firstRow = this.getFirstVisibleRow();

      var rowCount = this.getVisibleRowCount();
      var modelRowCount = tableModel.getRowCount();

      if (firstRow + rowCount > modelRowCount) {
        rowCount = Math.max(0, modelRowCount - firstRow);
      }

      var htmlArr = [];
      var rowWidth = paneModel.getTotalWidth();

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
      this.TABLE_ARR[this.TAB_BODY] = this._getRowsHtml(firstRow, rowCount);

      var elem = this.getElement();

      // this.debug(">>>" + this.TABLE_ARR.join("") + "<<<")
      /*
      var data = this.TABLE_ARR.join("") + "<div id='juhu'></div>";;
      window.setTimeout(function() {
        elem.innerHTML = data;
        var j = document.getElementById("juhu").offsetHeight;
      }, 0);
      */
      elem.innerHTML = this.TABLE_ARR.join("");
      elem.childNodes[0].offsetHeight;

      this.setHeight(rowCount * rowHeight);

      this._lastColCount = colCount;
      this._lastRowCount = rowCount;
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
