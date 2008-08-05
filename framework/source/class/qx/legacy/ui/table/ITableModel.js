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
 * The data model of a table.
 */
qx.Interface.define("qx.legacy.ui.table.ITableModel",
{
  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events : {
    /**
     * Fired when the table data changed (the stuff shown in the table body).
     * The data property of the event may be null or a map having the following attributes:
     * <ul>
     *   <li>firstRow: The index of the first row that has changed.</li>
     *   <li>lastRow: The index of the last row that has changed.</li>
     *   <li>firstColumn: The model index of the first column that has changed.</li>
     *   <li>lastColumn: The model index of the last column that has changed.</li>
     * </ul>
     */
    "dataChanged" : "qx.event.type.DataEvent",

    /**
     * Fired when the meta data changed (the stuff shown in the table header).
     */
    "metaDataChanged" : "qx.event.type.DataEvent"
  },



  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {

    /** {string} The type of the event fired when the data changed. */
    EVENT_TYPE_DATA_CHANGED      : "dataChanged",

    /** {string} The type of the event fired when the meta data changed. */
    EVENT_TYPE_META_DATA_CHANGED : "metaDataChanged"
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Returns the number of rows in the model.
     *
     * @abstract
     * @return {Integer} the number of rows.
     */
    getRowCount : function() {
      return true;
    },


    /**
     *
     * Returns the data of one row. This function may be overriden by models which hold
     * all data of a row in one object. By using this function, clients have a way of
     * quickly retrieving the entire row data.
     *
     * <b>Important:</b>Models which do not have their row data accessible in one object
     * may return null.
     *
     * @param rowIndex {Integer} the model index of the row.
     * @return {Object} the row data as an object or null if the model does not support row data
     *                    objects. The details on the object returned are determined by the model
     *                    implementation only.
     */
    getRowData : function(rowIndex) {
      return true;
    },


    /**
     * Returns the number of columns in the model.
     *
     * @abstract
     * @return {Integer} the number of columns.
     */
    getColumnCount : function() {
      return true;
    },


    /**
     * Returns the ID of column. The ID may be used to identify columns
     * independent from their index in the model. E.g. for being aware of added
     * columns when saving the width of a column.
     *
     * @abstract
     * @param columnIndex {Integer} the index of the column.
     * @return {String} the ID of the column.
     */
    getColumnId : function(columnIndex) {
      return true;
    },


    /**
     * Returns the index of a column.
     *
     * @abstract
     * @param columnId {String} the ID of the column.
     * @return {Integer} the index of the column.
     */
    getColumnIndexById : function(columnId) {
      return true;
    },


    /**
     * Returns the name of a column. This name will be shown to the user in the
     * table header.
     *
     * @abstract
     * @param columnIndex {Integer} the index of the column.
     * @return {String} the name of the column.
     */
    getColumnName : function(columnIndex) {
      return true
    },


    /**
     * Returns whether a column is editable.
     *
     * @param columnIndex {Integer} the column to check.
     * @return {Boolean} whether the column is editable.
     */
    isColumnEditable : function(columnIndex) {
      return true;
    },


    /**
     * Returns whether a column is sortable.
     *
     * @param columnIndex {Integer} the column to check.
     * @return {Boolean} whether the column is sortable.
     */
    isColumnSortable : function(columnIndex) {
      return true;
    },


    /**
     * Sorts the model by a column.
     *
     * @param columnIndex {Integer} the column to sort by.
     * @param ascending {Boolean} whether to sort ascending.
     * @return {void}
     */
    sortByColumn : function(columnIndex, ascending) {
      return true;
    },


    /**
     * Returns the column index the model is sorted by. If the model is not sorted
     * -1 is returned.
     *
     * @return {Integer} the column index the model is sorted by.
     */
    getSortColumnIndex : function() {
      return true;
    },


    /**
     * Returns whether the model is sorted ascending.
     *
     * @return {Boolean} whether the model is sorted ascending.
     */
    isSortAscending : function() {
      return true;
    },


    /**
     * Prefetches some rows. This is a hint to the model that the specified rows
     * will be read soon.
     *
     * @param firstRowIndex {Integer} the index of first row.
     * @param lastRowIndex {Integer} the index of last row.
     * @return {void}
     */
    prefetchRows : function(firstRowIndex, lastRowIndex) {
      return true;
    },


    /**
     * Returns a cell value by column index.
     *
     * @abstract
     * @param columnIndex {Integer} the index of the column.
     * @param rowIndex {Integer} the index of the row.
     * @return {var} The value of the cell.
     * @see #getValueById
     */
    getValue : function(columnIndex, rowIndex) {
      return true;
    },


    /**
     * Returns a cell value by column ID.
     *
     * Whenever you have the choice, use {@link #getValue()} instead,
     * because this should be faster.
     *
     * @param columnId {String} the ID of the column.
     * @param rowIndex {Integer} the index of the row.
     * @return {var} the value of the cell.
     */
    getValueById : function(columnId, rowIndex) {
      return true;
      //return this.getValue(this.getColumnIndexById(columnId), rowIndex);
    },


    /**
     * Sets a cell value by column index.
     *
     * @abstract
     * @param columnIndex {Integer} The index of the column.
     * @param rowIndex {Integer} the index of the row.
     * @param value {var} The new value.
     * @return {void}
     * @see #setValueById
     */
    setValue : function(columnIndex, rowIndex, value) {
      return true;
    },


    /**
     * Sets a cell value by column ID.
     *
     * Whenever you have the choice, use {@link #setValue()} instead,
     * because this should be faster.
     *
     * @param columnId {String} The ID of the column.
     * @param rowIndex {Integer} The index of the row.
     * @param value {var} The new value.
     * @return {var} TODOC
     */
    setValueById : function(columnId, rowIndex, value) {
      return true;
    }
  }
});
