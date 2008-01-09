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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#module(ui_table)

************************************************************************ */

/**
 * The table pane that shows a certain section from a table. This class handles
 * the display of the data part of a table and is therefore the base for virtual
 * scrolling.
 */
qx.Class.define("qx.ui.table.pane.Pane",
{
  extend : qx.ui.basic.Terminator,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param paneScroller {qx.ui.table.pane.Scroller} the TablePaneScroller the header belongs to.
   */
  construct : function(paneScroller)
  {
    this.base(arguments);

    this._paneScroller = paneScroller;

    this._lastColCount = 0;
    this._lastRowCount = 0;
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
    },


    /**
     * Maximum number of cached rows. If the value is <code>-1</code> the cache
     * size is unlimited
     */
    maxCacheLines :
    {
      check : "Number",
      init : 1000,
      apply : "_applyMaxCacheLines"
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
    _applyFirstVisibleRow : function(value, old) {
      this._updateContent(false, value-old);
    },

    // property modifier
    _applyVisibleRowCount : function(value, old) {
      this._updateContent();
    },


    // overridden
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
     * @return {qx.ui.table.pane.Scroller} the TablePaneScroller.
     */
    getPaneScroller : function() {
      return this._paneScroller;
    },


    /**
     * Returns the table this pane belongs to.
     *
     * @type member
     * @return {qx.ui.table.Table} the table.
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
        var oldRow = this._focusedRow;
        this._focusedCol = col;
        this._focusedRow = row;

        // Update the focused row background
        if (row != oldRow && !massUpdate)
        {
          // NOTE: Only the old and the new row need update
          this._updateContent(false, null, oldRow, true);
          this._updateContent(false, null, row, true);
        }
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
      this.__rowCacheClear();

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


    // sparse array to cache rendered rows
    __rowCache : [],
    __rowCacheCount : 0,


    // property apply method
    _applyMaxCacheLines : function(value, old)
    {
      if (this.__rowCacheCount >= value && value !== -1) {
        this.__rowCacheClear();
      }
    },


    /**
     * Clear the row cache
     */
    __rowCacheClear : function() {
      this.__rowCache = [];
      this.__rowCacheCount = 0;
    },


    /**
     * Get a line from the row cache.
     *
     * @param row {Integer} Row index to get
     * @param selected {Boolean} Whether the row is currently selected
     * @param focused {Boolean} Whether the row is currently focused
     * @return {String|null} The cached row or null if a row with the given
     *     index is not cached.
     */
    __rowCacheGet : function(row, selected, focused)
    {
      if (!selected && !focused && this.__rowCache[row]) {
        return this.__rowCache[row];
      } else {
        return null;
      }
    },


    /**
     * Add a line to the row cache.
     *
     * @param row {Integer} Row index to set
     * @param rowString {String} computed row string to cache
     * @param selected {Boolean} Whether the row is currently selected
     * @param focused {Boolean} Whether the row is currently focused
     */
    __rowCacheSet : function(row, rowString, selected, focused)
    {
      if (!selected && !focused && !this.__rowCache[row]) {
        this._applyMaxCacheLines(this.getMaxCacheLines());
        this.__rowCache[row] = rowString;
        this.__rowCacheCount += 1;
      }
    },


    /**
     * Updates the content of the pane.
     *
     * @type member
     * @param completeUpdate {Boolean ? false} if true a complete update is performed.
     *      On a complete update all cell widgets are recreated.
     * @param scrollOffset {Integer ? null} If set specifies how many rows to scroll.
     * @param onlyRow {Integer ? null} if set only the specified row will be updated.
     * @param onlySelectionOrFocusChanged {Boolean ? false} if true, cell values won't
     *          be updated. Only the row background will.
     * @return {void}
     */
    _updateContent : function(completeUpdate, scrollOffset, onlyRow, onlySelectionOrFocusChanged)
    {
      if (completeUpdate) {
        this.__rowCacheClear();
      }

      if (!this.isSeeable())
      {
        this._updateWantedWhileInvisible = true;
        return;
      }

      if (this._layoutPending)
      {
        window.clearTimeout(this._layoutPending);
        this._updateAllRows();
        return;
      }

      //var start = new Date();

      if (scrollOffset && Math.abs(scrollOffset) <= Math.min(10, this.getVisibleRowCount()))
      {
        //this.debug("scroll", scrollOffset);
        this._scrollContent(scrollOffset);
      }
      else if (onlySelectionOrFocusChanged && !this.getTable().getAlwaysUpdateCells())
      {
        //this.debug("update row styles");
        this._updateRowStyles(onlyRow);
      }
      else
      {
        //this.debug("full update");
        this._updateAllRows();
      }

      //this.debug("render time: " + (new Date() - start) + "ms");
    },


    /**
     * If only focus or selection changes it is sufficient to only update the
     * row styles. This method updates the row styles of all visible rows or
     * of just one row.
     *
     * @param onlyRow {Integer|null ? null} If this parameter is set only the row
     *     with this index is updated.
     */
    _updateRowStyles : function(onlyRow)
    {
      var elem = this.getElement();
      if (!elem.firstChild) {
        this._updateAllRows();
        return;
      }

      var table = this.getTable();
      var selectionModel = table.getSelectionModel();
      var tableModel = table.getTableModel();
      var rowRenderer = table.getDataRowRenderer();
      var rowNodes = elem.firstChild.childNodes;
      var cellInfo = { table : table };

      // We don't want to execute the row loop below more than necessary. If
      // onlyrow is not null, we want to do the loop only for that row.
      // In that case, was start at (set the "row" variable to) that row, and
      // stop at (set the "end" variable to the offset of) the next row; .
      var row = this.getFirstVisibleRow();
      var y = 0;

      // How many rows do we need to update?
      var end = rowNodes.length;

      if (onlyRow != null)
      {
        // How many rows are we skipping?
        var offset = onlyRow - row;
        if (offset >= 0 && offset < end)
        {
          row = onlyRow;
          y = offset;
          end = offset + 1;
        }
        else
          return;
      }

      for (; y<end; y++, row++)
      {
        cellInfo.row = row;
        cellInfo.selected = selectionModel.isSelectedIndex(row);
        cellInfo.focusedRow = (this._focusedRow == row);
        cellInfo.rowData = tableModel.getRowData(row);

        rowRenderer.updateDataRowElement(cellInfo, rowNodes[y]);
      };
    },


    /**
     * Get the HTML table fragment for the given row range.
     *
     * @param firstRow {Integer} Index of the first row
     * @param rowCount {Integer} Number of rows
     * @return {String} The HTML table fragment for the given row range.
     */
    _getRowsHtml : function(firstRow, rowCount)
    {
      var table = this.getTable();

      var selectionModel = table.getSelectionModel();
      var tableModel = table.getTableModel();
      var columnModel = table.getTableColumnModel();
      var paneModel = this.getPaneScroller().getTablePaneModel();
      var rowRenderer = table.getDataRowRenderer();

      tableModel.prefetchRows(firstRow, firstRow + rowCount - 1);

      var rowHeight = table.getRowHeight();
      var colCount = paneModel.getColumnCount();
      var left = 0;
      var cols = [];

      // precompute column properties
      for (var x=0; x<colCount; x++)
      {
        var col = paneModel.getColumnAtX(x);
        var cellWidth = columnModel.getColumnWidth(col);
        cols.push({
          col: col,
          xPos: x,
          editable: tableModel.isColumnEditable(col),
          focusedCol: this._focusedCol == col,
          styleLeft: left,
          styleWidth: cellWidth
        });

        left += cellWidth;
      }

      var rowsArr = [];
      for (var row=firstRow; row < firstRow + rowCount; row++)
      {
        var selected = selectionModel.isSelectedIndex(row);
        var focusedRow = (this._focusedRow == row);

        var cachedRow = this.__rowCacheGet(row, selected, focusedRow);
        if (cachedRow) {
          rowsArr.push(cachedRow);
          continue;
        }

        var rowHtml = [];

        var cellInfo = { table : table };
        cellInfo.styleHeight = rowHeight;

        cellInfo.row = row;
        cellInfo.selected = selected;
        cellInfo.focusedRow = focusedRow;
        cellInfo.rowData = tableModel.getRowData(row);

        rowHtml.push('<div ');

        var rowClass = rowRenderer.getRowClass(cellInfo);
        if (rowClass) {
          rowHtml.push('class="', rowClass, '" ');
        }

        var rowStyle = rowRenderer.createRowStyle(cellInfo);
        rowStyle += ";position:relative;height:" + rowHeight + "px; width:" + paneModel.getTotalWidth() + "px;";
        if (rowStyle) {
          rowHtml.push('style="', rowStyle, '" ');
        }
        rowHtml.push('>');

        for (var x=0; x<colCount; x++)
        {
          var col_def = cols[x];
          for (var attr in col_def) {
            cellInfo[attr] = col_def[attr];
          }
          var col = cellInfo.col;

          // AB: use the "getValue" method of the tableModel to get the cell's value
          // working directly on the "rowData" object (-> cellInfo.rowData[col];) is not a solution
          // because you can't work with the columnIndex -> you have to use the columnId of the columnIndex
          // This is exactly what the method "getValue" does
          cellInfo.value = tableModel.getValue(col, row);
          var cellRenderer = columnModel.getDataCellRenderer(col);
          cellRenderer.createDataCellHtml(cellInfo, rowHtml);
        }
        rowHtml.push('</div>');

        var rowString = rowHtml.join("");

        this.__rowCacheSet(row, rowString, selected, focusedRow);
        rowsArr.push(rowString);
      }
      return rowsArr.join("");
    },


    /**
     * Scrolls the pane's contents by the given offset.
     *
     * @param rowOffset {Integer} Number of lines to scroll. Scrolling up is
     *     represented by a negative offset.
     */
    _scrollContent : function(rowOffset)
    {
      if (!this.getElement().firstChild) {
        this._updateAllRows();
        return;
      }

      var tableBody = this.getElement().firstChild;
      var tableChildNodes = tableBody.childNodes;
      var rowCount = this.getVisibleRowCount();
      var firstRow = this.getFirstVisibleRow();


      var modelRowCount = this.getTable().getTableModel().getRowCount();

      // don't handle this special case here
      if (firstRow + rowCount > modelRowCount) {
        this._updateAllRows();
        return;
      }

      // remove old lines
      var removeRowBase = rowOffset < 0 ? rowCount + rowOffset : 0;
      var addRowBase = rowOffset < 0 ? 0: rowCount - rowOffset;

      for (i=Math.abs(rowOffset)-1; i>=0; i--)
      {
        var rowElem = tableChildNodes[removeRowBase];
        try {
          tableBody.removeChild(rowElem);
        } catch(e) {
          break;
        }
      }

      // render new lines
      if (!this._tableContainer) {
        this._tableContainer = document.createElement("div");
      }
      var tableDummy = '<div>';
      tableDummy += this._getRowsHtml(firstRow + addRowBase, Math.abs(rowOffset));
      tableDummy += '</div>';
      this._tableContainer.innerHTML = tableDummy;
      var newTableRows = this._tableContainer.firstChild.childNodes;

      // append new lines
      if (rowOffset > 0)
      {
        for (var i=newTableRows.length-1; i>=0; i--)
        {
          var rowElem = newTableRows[0];
          tableBody.appendChild(rowElem);
        }
      }
      else
      {
        for (var i=newTableRows.length-1; i>=0; i--)
        {
          var rowElem = newTableRows[newTableRows.length-1];
          tableBody.insertBefore(rowElem, tableBody.firstChild);
        }
      }

      // update focus indicator
      this._updateRowStyles(this._focusedRow - rowOffset);
      this._updateRowStyles(this._focusedRow);

      // force immediate layouting
      // this prevents Firefox from flickering
      if (qx.core.Variant.isSet("qx.client", "gecko")) {
        rowElem.offsetHeight;
      }
    },


    /**
     * Updates the content of the pane (implemented using array joins).
     */
    _updateAllRows : function()
    {
      var table = this.getTable();

      var tableModel = table.getTableModel();
      var paneModel = this.getPaneScroller().getTablePaneModel();

      var colCount = paneModel.getColumnCount();
      var rowHeight = table.getRowHeight();
      var firstRow = this.getFirstVisibleRow();

      var rowCount = this.getVisibleRowCount();
      var modelRowCount = tableModel.getRowCount();

      if (firstRow + rowCount > modelRowCount) {
        rowCount = Math.max(0, modelRowCount - firstRow);
      }

      var rowWidth = paneModel.getTotalWidth();

      var htmlArr = [
        "<div style='",
        "width: ", rowWidth, "px;",
        "line-height: ", rowHeight, "px;",
        "overflow: hidden;",
        "font-size: 11px;",
        "font-family: 'Segoe UI', Corbel, Calibri, Tahoma, 'Lucida Sans Unicode', sans-serif;",
        "'>",
        this._getRowsHtml(firstRow, rowCount),
        "</div>"
      ];

      var elem = this.getElement();
      var data = htmlArr.join("");

      //this.debug(">>>" + data + "<<<")

      var self = this;
      this._layoutPending = window.setTimeout(function()
      {
        elem.innerHTML = data;

        // force immediate layouting
        // this prevents Firefox from flickering
        if (qx.core.Variant.isSet("qx.client", "gecko")) {
          elem.childNodes[0].offsetHeight;
        }
        self._layoutPending = null;
      }, 10);

      /*
      elem.innerHTML = data;

      // force immediate layouting
      // this prevents Firefox from flickering
      if (qx.core.Variant.isSet("qx.client", "gecko")) {
        elem.childNodes[0].offsetHeight;
      }
      */

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
