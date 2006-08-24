/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2006 by STZ-IDA, Germany, http://www.stz-ida.de

   License:
     LGPL 2.1: http://www.gnu.org/licenses/lgpl.html

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
qx.OO.defineClass("qx.ui.table.TablePane", qx.ui.basic.Terminator,
function() {
  qx.ui.basic.Terminator.call(this);

  this.debug("USE_ARRAY_JOIN:" + qx.ui.table.TablePane.USE_ARRAY_JOIN + ", USE_TABLE:" + qx.ui.table.TablePane.USE_TABLE);

  this._lastColCount = 0;
  this._lastRowCount = 0;
});

/** The height of the table rows. */
qx.OO.addProperty({ name:"tableRowHeight", type:qx.constant.Type.NUMBER, defaultValue:1 });

/** The index of the first row to show. */
qx.OO.addProperty({ name:"firstVisibleRow", type:qx.constant.Type.NUMBER, defaultValue:0 });

/** The number of rows to show. */
qx.OO.addProperty({ name:"visibleRowCount", type:qx.constant.Type.NUMBER, defaultValue:0 });

/** The selection model. */
qx.OO.addProperty({ name:"selectionModel", type:qx.constant.Type.OBJECT, instance : "qx.ui.table.SelectionModel" });

/** The table model. */
qx.OO.addProperty({ name:"tableModel", type:qx.constant.Type.OBJECT, instance : "qx.ui.table.TableModel" });

/** The table column model. */
qx.OO.addProperty({ name:"tableColumnModel", type:qx.constant.Type.OBJECT, instance : "qx.ui.table.TableColumnModel" });

/** The table pane model. */
qx.OO.addProperty({ name:"tablePaneModel", type:qx.constant.Type.OBJECT, instance : "qx.ui.table.TablePaneModel" });


// property modifier
qx.Proto._modifyFirstVisibleRow = function(propValue, propOldValue, propData) {
  if (this.isSeeable()) {
    this._updateContent();
  }
  return true;
}


// property modifier
qx.Proto._modifyVisibleRowCount = function(propValue, propOldValue, propData) {
  if (this.isSeeable()) {
    this._updateContent();
  }
  return true;
}


// property modifier
qx.Proto._modifySelectionModel = function(propValue, propOldValue, propData) {
  if (propOldValue != null) {
    propOldValue.removeEventListener("selectionChanged", this._onSelectionChanged, this);
  }
  propValue.addEventListener("selectionChanged", this._onSelectionChanged, this);

  return true;
}


// property modifier
qx.Proto._modifyTableModel = function(propValue, propOldValue, propData) {
  if (propOldValue != null) {
    propOldValue.removeEventListener(qx.ui.table.TableModel.EVENT_TYPE_DATA_CHANGED, this._onTableModelDataChanged, this);
    propOldValue.removeEventListener(qx.ui.table.TableModel.EVENT_TYPE_META_DATA_CHANGED, this._onTableModelMetaDataChanged, this);
  }
  propValue.addEventListener(qx.ui.table.TableModel.EVENT_TYPE_DATA_CHANGED, this._onTableModelDataChanged, this);
  propValue.addEventListener(qx.ui.table.TableModel.EVENT_TYPE_META_DATA_CHANGED, this._onTableModelMetaDataChanged, this);

  return true;
}


// property modifier
qx.Proto._modifyTableColumnModel = function(propValue, propOldValue, propData) {
  if (propOldValue != null) {
    propOldValue.removeEventListener("widthChanged", this._onWidthChanged, this);
    propOldValue.removeEventListener("orderChanged", this._onOrderChanged, this);
  }
  propValue.addEventListener("widthChanged", this._onWidthChanged, this);
  propValue.addEventListener("orderChanged", this._onOrderChanged, this);
  return true;
}


// property modifier
qx.Proto._modifyTablePaneModel = function(propValue, propOldValue, propData) {
  if (propOldValue != null) {
    propOldValue.removeEventListener(qx.ui.table.TablePaneModel.EVENT_TYPE_MODEL_CHANGED, this._onPaneModelChanged, this);
  }
  propValue.addEventListener(qx.ui.table.TablePaneModel.EVENT_TYPE_MODEL_CHANGED, this._onPaneModelChanged, this);
  return true;
}


/**
 * Calculates the preferred height of a row shown in this pane.
 *
 * @return {int} the preferred row height in pixels.
 */
qx.Proto.calculateTableRowHeight = function() {
  // TODO: Create one row and measure its height
  return 15;
}


/**
 * Sets the currently focused cell.
 *
 * @param col {int} the model index of the focused cell's column.
 * @param row {int} the model index of the focused cell's row.
 * @param massUpdate {boolean,false} Whether other updates are planned as well.
 *        If true, no repaint will be done.
 */
qx.Proto.setFocusedCell = function(col, row, massUpdate) {
  if (col != this._focuesCol || row != this._focusedRow) {
    var oldCol = this._focusedCol;
    var oldRow = this._focusedRow;
    this._focusedCol = col;
    this._focusedRow = row;

    // Update the focused row background
    if (row != oldRow && !massUpdate) {
      // NOTE: Only the old and the new row need update
      this._updateContent(false, oldRow, true);
      this._updateContent(false, row, true);
    }
  }
}


/**
 * Event handler. Called when the selection has changed.
 *
 * @param evt {Map} the event.
 */
qx.Proto._onSelectionChanged = function(evt) {
  this._updateContent(false, null, true);
}


/**
 * Event handler. Called when the width of a column has changed.
 *
 * @param evt {Map} the event.
 */
qx.Proto._onWidthChanged = function(evt) {
  this._updateContent(true);
}


/**
 * Event handler. Called the column order has changed.
 *
 * @param evt {Map} the event.
 */
qx.Proto._onOrderChanged = function(evt) {
  this._updateContent(true);
}


/**
 * Event handler. Called when the pane model has changed.
 *
 * @param evt {Map} the event.
 */
qx.Proto._onPaneModelChanged = function(evt) {
  this._updateContent(true);
}


/**
 * Event handler. Called when the table model data has changed.
 *
 * @param evt {Map} the event.
 */
qx.Proto._onTableModelDataChanged = function(evt) {
  var data = evt.getData();

  var firstRow = this.getFirstVisibleRow();
  var rowCount = this.getVisibleRowCount();
  if (data.lastRow == -1 || data.lastRow >= firstRow && data.firstRow < firstRow + rowCount) {
    // The change intersects this pane
    this._updateContent();
  }
}


/**
 * Event handler. Called when the table model meta data has changed.
 *
 * @param evt {Map} the event.
 */
qx.Proto._onTableModelMetaDataChanged = function(evt) {
  this._updateContent();
}


/**
 * Updates the content of the pane.
 *
 * @param completeUpdate {boolean,false} if true a complete update is performed.
 *    On a complete update all cell widgets are recreated.
 * @param onlyRow {int,null} if set only the specified row will be updated.
 * @param onlySelectionOrFocusChanged {boolean,false} if true, cell values won't
 *        be updated. Only the row background will.
 */
qx.Proto._updateContent = function(completeUpdate, onlyRow,
  onlySelectionOrFocusChanged)
{
  if (! this.isSeeable()) {
    return;
  }

  if (qx.ui.table.TablePane.USE_ARRAY_JOIN) {
    this._updateContent_array_join(completeUpdate, onlyRow, onlySelectionOrFocusChanged);
  } else {
    this._updateContent_orig(completeUpdate, onlyRow, onlySelectionOrFocusChanged);
  }
}


qx.Proto._updateContent_array_join = function(completeUpdate, onlyRow,
  onlySelectionOrFocusChanged)
{
  var TablePane = qx.ui.table.TablePane;

  var selectionModel = this.getSelectionModel();
  var tableModel = this.getTableModel();
  var columnModel = this.getTableColumnModel();
  var paneModel = this.getTablePaneModel();

  var colCount = paneModel.getColumnCount();
  var rowHeight = this.getTableRowHeight();

  var firstRow = this.getFirstVisibleRow();
  var rowCount = this.getVisibleRowCount();
  var modelRowCount = tableModel.getRowCount();
  if (firstRow + rowCount > modelRowCount) {
    rowCount = Math.max(0, modelRowCount - firstRow);
  }

  var cellInfo = {};
  cellInfo.styleHeight = rowHeight;

  var htmlArr = [];
  var rowWidth = paneModel.getTotalWidth();

  if (TablePane.USE_TABLE) {
    htmlArr.push(TablePane.TABLE_START);
    htmlArr.push(rowWidth);
    htmlArr.push(TablePane.TABLE_COLGROUP);

    for (var x = 0; x < colCount; x++) {
      var col = paneModel.getColumnAtX(x);

      htmlArr.push(TablePane.TABLE_COL);
      htmlArr.push(columnModel.getColumnWidth(col));
      htmlArr.push(TablePane.TABLE_COLEND);
    }

    htmlArr.push(TablePane.TABLE_TBODY);
  }

  for (var y = 0; y < rowCount; y++) {
    var row = firstRow + y;

    cellInfo.row = row;
    cellInfo.selected = selectionModel.isSelectedIndex(row);
    cellInfo.focusedRow = (this._focusedRow == row);

    // Update this row
    if (TablePane.USE_TABLE) {
      htmlArr.push(TablePane.TABLE_TR);
      htmlArr.push(rowHeight);
      htmlArr.push(TablePane.TABLE_BGCOLOR);
    } else {
      htmlArr.push(TablePane.ARRAY_JOIN_ROW_DIV_START);
      htmlArr.push(y * rowHeight);
      htmlArr.push(TablePane.ARRAY_JOIN_ROW_DIV_WIDTH);
      htmlArr.push(rowWidth);
      htmlArr.push(TablePane.ARRAY_JOIN_ROW_DIV_HEIGHT);
      htmlArr.push(rowHeight);
      htmlArr.push(TablePane.ARRAY_JOIN_ROW_DIV_BG_COLOR);
    }

    if (cellInfo.focusedRow) {
      htmlArr.push(cellInfo.selected ? TablePane.CONTENT_BGCOL_FOCUSED_SELECTED : TablePane.CONTENT_BGCOL_FOCUSED);
    } else {
      htmlArr.push(cellInfo.selected ? TablePane.CONTENT_BGCOL_SELECTED : ((cellInfo.row % 2 == 0) ? TablePane.CONTENT_BGCOL_EVEN : TablePane.CONTENT_BGCOL_ODD));
    }
    htmlArr.push(TablePane.ARRAY_JOIN_ROW_DIV_COLOR);
    htmlArr.push(cellInfo.selected ? TablePane.CONTENT_COL_SELECTED : TablePane.CONTENT_COL);
    htmlArr.push(TablePane.ARRAY_JOIN_ROW_DIV_START_END);

    var left = 0;
    for (var x = 0; x < colCount; x++) {
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
      cellRenderer.createDataCellHtml_array_join(cellInfo, htmlArr);

      left += cellWidth;
    }

    if (TablePane.USE_TABLE) {
      htmlArr.push(TablePane.TABLE_TR_END);
    } else {
      htmlArr.push(TablePane.ARRAY_JOIN_ROW_DIV_END);
    }
  }

  if (TablePane.USE_TABLE) {
    htmlArr.push(TablePane.TABLE_TBODY_END);
  }

  var elem = this.getElement();
  // this.debug(">>>" + htmlArr.join(qx.constant.Core.EMPTY) + "<<<")
  elem.innerHTML = htmlArr.join(qx.constant.Core.EMPTY);

  this.setHeight(rowCount * rowHeight);

  this._lastColCount = colCount;
  this._lastRowCount = rowCount;
}


qx.Proto._updateContent_orig = function(completeUpdate, onlyRow,
  onlySelectionOrFocusChanged)
{
  var TablePane = qx.ui.table.TablePane;

  var selectionModel = this.getSelectionModel();
  var tableModel = this.getTableModel();
  var columnModel = this.getTableColumnModel();
  var paneModel = this.getTablePaneModel();

  var colCount = paneModel.getColumnCount();
  var rowHeight = this.getTableRowHeight();

  var firstRow = this.getFirstVisibleRow();
  var rowCount = this.getVisibleRowCount();
  var modelRowCount = tableModel.getRowCount();
  if (firstRow + rowCount > modelRowCount) {
    rowCount = Math.max(0, modelRowCount - firstRow);
  }

  // Remove the rows that are not needed any more
  if (completeUpdate || this._lastRowCount > rowCount) {
    var firstRowToRemove = completeUpdate ? 0 : rowCount;
    this._cleanUpRows(firstRowToRemove);
  }

  if (TablePane.USE_TABLE) {
    throw new Error("Combination of USE_TABLE==true and USE_ARRAY_JOIN==false is not yet implemented");
  }

  var elem = this.getElement();
  var childNodes = elem.childNodes;
  var cellInfo = {};
  for (var y = 0; y < rowCount; y++) {
    var row = firstRow + y;
    if ((onlyRow != null) && (row != onlyRow)) {
      continue;
    }

    cellInfo.row = row;
    cellInfo.selected = selectionModel.isSelectedIndex(row);
    cellInfo.focusedRow = (this._focusedRow == row);

    // Update this row
    var rowElem;
    var recyleRowElem;
    if (y < childNodes.length) {
      rowElem = childNodes[y];
      recyleRowElem = true
    } else {
      var rowElem = document.createElement(qx.constant.Tags.DIV);

      //rowElem.style.position = "relative";
      rowElem.style.position = qx.constant.Style.POSITION_ABSOLUTE;
      rowElem.style.left = qx.constant.Core.ZEROPIXEL;
      rowElem.style.top = (y * rowHeight) + qx.constant.Core.PIXEL;

      rowElem.style.height = rowHeight + qx.constant.Core.PIXEL;
      rowElem.style.fontFamily = TablePane.CONTENT_ROW_FONT_FAMILY;
      rowElem.style.fontSize = TablePane.CONTENT_ROW_FONT_SIZE;
      elem.appendChild(rowElem);
      recyleRowElem = false;
    }

    if (cellInfo.focusedRow) {
      rowElem.style.backgroundColor = cellInfo.selected ? TablePane.CONTENT_BGCOL_FOCUSED_SELECTED : TablePane.CONTENT_BGCOL_FOCUSED;
    } else {
      rowElem.style.backgroundColor = (cellInfo.selected ? TablePane.CONTENT_BGCOL_SELECTED : ((cellInfo.row % 2 == 0) ? TablePane.CONTENT_BGCOL_EVEN : TablePane.CONTENT_BGCOL_ODD));
    }
    rowElem.style.color = cellInfo.selected ? TablePane.CONTENT_COL_SELECTED : TablePane.CONTENT_COL;

    if (!recyleRowElem || !onlySelectionOrFocusChanged) {
      var html = "";
      var left = 0;
      for (var x = 0; x < colCount; x++) {
        var col = paneModel.getColumnAtX(x);
        cellInfo.xPos = x;
        cellInfo.col = col;
        cellInfo.editable = tableModel.isColumnEditable(col);
        cellInfo.focusedCol = (this._focusedCol == col);
        cellInfo.value = tableModel.getValue(col, row);
        var width = columnModel.getColumnWidth(col);
        cellInfo.style = TablePane.CONTENT_CELL_STYLE_LEFT + left
          + TablePane.CONTENT_CELL_STYLE_WIDTH + width
          + TablePane.CONTENT_CELL_STYLE_HEIGHT + rowHeight + qx.constant.Core.PIXEL;

        var cellRenderer = columnModel.getDataCellRenderer(col);
        if (recyleRowElem) {
          var cellElem = rowElem.childNodes[x];
          cellRenderer.updateDataCellElement(cellInfo, cellElem);
        } else {
          html += cellRenderer.createDataCellHtml(cellInfo);
        }

        left += width;
      }
      if (! recyleRowElem) {
        rowElem.style.width = left + qx.constant.Core.PIXEL;
        rowElem.innerHTML = html;
      }
    }
  }

  this.setHeight(rowCount * rowHeight);

  this._lastColCount = colCount;
  this._lastRowCount = rowCount;
}


/**
 * Cleans up the row widgets.
 *
 * @param firstRowToRemove {int} the visible index of the first row to clean up.
 *    All following rows will be cleaned up, too.
 */
qx.Proto._cleanUpRows = function(firstRowToRemove) {
  var elem = this.getElement();
  if (elem) {
    var childNodes = this.getElement().childNodes;
    var paneModel = this.getTablePaneModel();
    var colCount = paneModel.getColumnCount();
    for (var y = childNodes.length - 1; y >= firstRowToRemove; y--) {
      elem.removeChild(childNodes[y]);
    }
  }
}


// overridden
qx.Proto.dispose = function() {
  if (this.getDisposed()) {
    return true;
  }

  if (this._selectionModel != null) {
    this._selectionModel.removeEventListener("selectionChanged", this._onSelectionChanged, this);
  }

  if (this._tableModel != null) {
    this._tableModel.removeEventListener(qx.ui.table.TableModel.EVENT_TYPE_DATA_CHANGED, this._onTableModelDataChanged, this);
    this._tableModel.removeEventListener(qx.ui.table.TableModel.EVENT_TYPE_META_DATA_CHANGED, this._onTableModelMetaDataChanged, this);
  }

  if (this._tableColumnModel != null) {
    this._tableColumnModel.removeEventListener("widthChanged", this._onWidthChanged, this);
    this._tableColumnModel.removeEventListener("orderChanged", this._onOrderChanged, this);
  }

  if (this._tablePaneModel != null) {
    this._tablePaneModel.removeEventListener(qx.ui.table.TablePaneModel.EVENT_TYPE_MODEL_CHANGED, this._onPaneModelChanged, this);
  }

  this._cleanUpRows(0);

  return qx.ui.basic.Terminator.prototype.dispose.call(this);
}


qx.Class.USE_ARRAY_JOIN = false;
qx.Class.USE_TABLE = false;

qx.Class.ARRAY_JOIN_ROW_DIV_START = '<div style="position:absolute;font-family:\'Segoe UI\', Corbel, Calibri, Tahoma, \'Lucida Sans Unicode\', sans-serif;font-size:11px;left:0px;top:';
qx.Class.ARRAY_JOIN_ROW_DIV_WIDTH = 'px;width:';
qx.Class.ARRAY_JOIN_ROW_DIV_HEIGHT = 'px;height:';
qx.Class.ARRAY_JOIN_ROW_DIV_BG_COLOR = 'px;background-color:';
qx.Class.ARRAY_JOIN_ROW_DIV_COLOR = ';color:';
qx.Class.ARRAY_JOIN_ROW_DIV_START_END = '">';
qx.Class.ARRAY_JOIN_ROW_DIV_END = '</div>';

qx.Class.CONTENT_ROW_FONT_FAMILY = '"Segoe UI", Corbel, Calibri, Tahoma, "Lucida Sans Unicode", sans-serif';
qx.Class.CONTENT_ROW_FONT_SIZE = "11px";
qx.Class.CONTENT_BGCOL_FOCUSED_SELECTED = "#5a8ad3";
qx.Class.CONTENT_BGCOL_FOCUSED = "#ddeeff";
qx.Class.CONTENT_BGCOL_SELECTED = "#335ea8";
qx.Class.CONTENT_BGCOL_EVEN = "#faf8f3";
qx.Class.CONTENT_BGCOL_ODD = "white";
qx.Class.CONTENT_COL_SELECTED = "white";
qx.Class.CONTENT_COL = "black";
qx.Class.CONTENT_CELL_STYLE_LEFT = 'position:absolute;left:';
qx.Class.CONTENT_CELL_STYLE_WIDTH = 'px;top:0px;width:';
qx.Class.CONTENT_CELL_STYLE_HEIGHT = 'px; height:';

qx.Class.TABLE_START = '<table cellspacing="0" cellpadding="0" style="table-layout:fixed;font-family:\'Segoe UI\', Corbel, Calibri, Tahoma, \'Lucida Sans Unicode\', sans-serif;font-size:11px;width:';
qx.Class.TABLE_COLGROUP = 'px"><colgroup>';
qx.Class.TABLE_COL = '<col width="';
qx.Class.TABLE_COLEND = '"/>';
qx.Class.TABLE_TBODY = '</colgroup><tbody>';
qx.Class.TABLE_TR = '<tr style="height:';
qx.Class.TABLE_BGCOLOR = 'px;background-color:';
qx.Class.TABLE_TR_END = "</tr>";
qx.Class.TABLE_TBODY_END = '</tbody></table>';
