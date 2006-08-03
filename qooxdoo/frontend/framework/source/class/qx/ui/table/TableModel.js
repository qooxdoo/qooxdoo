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

#module(table)

************************************************************************ */

/**
 * The data model of a table.
 */
qx.OO.defineClass("qx.ui.table.TableModel", qx.core.Target,
function() {
  qx.core.Target.call(this);
});


/**
 * Returns the number of rows in the model.
 *
 * @return {int} the number of rows.
 */
qx.Proto.getRowCount = function() {
  throw new Error("getRowCount is abstract");
}


/**
 * Returns the number of columns in the model.
 *
 * @return {int} the number of columns.
 */
qx.Proto.getColumnCount = function() {
  throw new Error("getColumnCount is abstract");
}


/**
 * Returns the ID of column. The ID may be used to identify columns
 * independent from their index in the model. E.g. for being aware of added
 * columns when saving the width of a column.
 *
 * @param columnIndex {int} the index of the column.
 * @return {string} the ID of the column.
 */
qx.Proto.getColumnId = function(columnIndex) {
  throw new Error("getColumnId is abstract");
}


/**
 * Returns the index of a column.
 *
 * @param columnId {string} the ID of the column.
 * @return {int} the index of the column.
 */
qx.Proto.getColumnIndexById = function(columnId) {
  throw new Error("getColumnIndexById is abstract");
}


/**
 * Returns the name of a column. This name will be shown to the user in the
 * table header.
 *
 * @param columnIndex {int} the index of the column.
 * @return {string} the name of the column.
 */
qx.Proto.getColumnName = function(columnIndex) {
  throw new Error("getColumnName is abstract");
}


/**
 * Returns whether a column is editable.
 *
 * @param columnIndex {int} the column to check.
 * @return {boolean} whether the column is editable.
 */
qx.Proto.isColumnEditable = function(columnIndex) {
  return false;
}


/**
 * Returns whether a column is sortable.
 *
 * @param columnIndex {int} the column to check.
 * @return {boolean} whether the column is sortable.
 */
qx.Proto.isColumnSortable = function(columnIndex) {
  return false;
}


/**
 * Sorts the model by a column.
 *
 * @param columnIndex {int} the column to sort by.
 * @param ascending {boolean} whether to sort ascending.
 */
qx.Proto.sortByColumn = function(columnIndex, ascending) {
}


/**
 * Returns the column index the model is sorted by. If the model is not sorted
 * -1 is returned.
 *
 * @return {int} the column index the model is sorted by.
 */
qx.Proto.getSortColumnIndex = function() {
  return -1;
}


/**
 * Returns whether the model is sorted ascending.
 *
 * @return {boolean} whether the model is sorted ascending.
 */
qx.Proto.isSortAscending = function() {
  return true;
}


/**
 * Prefetches some rows. This is a hint to the model that the specified rows
 * will be read soon.
 *
 * @param firstRowIndex {int} the index of first row.
 * @param lastRowIndex {int} the index of last row.
 */
qx.Proto.prefetchRows = function(firstRowIndex, lastRowIndex) {
}


/**
 * Returns a cell value by column index.
 *
 * @param columnIndex {int} the index of the column.
 * @param rowIndex {int} the index of the row.
 * @return {var} The value of the cell.
 * @see #getValueById()
 */
qx.Proto.getValue = function(columnIndex, rowIndex) {
  throw new Error("getValue is abstract");
}


/**
 * Returns a cell value by column ID.
 * <p>
 * Whenever you have the choice, use {@link #getValueByIndex()} instead,
 * because this should be faster.
 *
 * @param columnId {string} the ID of the column.
 * @param rowIndex {int} the index of the row.
 * @return {var} the value of the cell.
 */
qx.Proto.getValueById = function(columnId, rowIndex) {
  return self.getValueByIndex(self.getColumnIndexById(columnId), rowIndex);
}


/**
 * Sets a cell value by column index.
 *
 * @param columnIndex {int} The index of the column.
 * @param rowIndex {int} the index of the row.
 * @param value {var} The new value.
 * @see #setValueById()
 */
qx.Proto.setValue = function(columnIndex, rowIndex, value) {
  throw new Error("setValue is abstract");
}


/**
 * Sets a cell value by column ID.
 * <p>
 * Whenever you have the choice, use {@link #setValueByIndex()} instead,
 * because this should be faster.
 *
 * @param columnId {string} The ID of the column.
 * @param rowIndex {int} The index of the row.
 * @param value {var} The new value.
 */
qx.Proto.setValueById = function(columnId, rowIndex, value) {
  return self.setValueByIndex(self.getColumnIndexById(columnId), rowIndex, value);
}


/** {string} The type of the event fired when the data changed. */
qx.Class.EVENT_TYPE_DATA_CHANGED = "dataChanged";

/** {string} The type of the event fired when the meta data changed. */
qx.Class.EVENT_TYPE_META_DATA_CHANGED = "metaDataChanged";
