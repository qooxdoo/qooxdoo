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

/**
 * An abstract table model that performs the column handling, so subclasses only
 * need to care for row handling.
 */
qx.Class.define("qx.ui.table.model.Abstract",
{
  type : "abstract",
  extend : qx.core.Object,
  implement : qx.ui.table.ITableModel,


  events :
  {
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


  construct : function()
  {
    this.base(arguments);

    this.__columnIdArr = [];
    this.__columnNameArr = [];
    this.__columnIndexMap = {};
  },


  members :
  {
    __columnIdArr : null,
    __columnNameArr : null,
    __columnIndexMap : null,
    __internalChange : null,


    getRowCount : function() {
      throw new Error("getRowCount is abstract");
    },

    getRowData : function(rowIndex) {
      return null;
    },

    isColumnEditable : function(columnIndex) {
      return false;
    },

    isColumnSortable : function(columnIndex) {
      return false;
    },

    sortByColumn : function(columnIndex, ascending) {
    },

    getSortColumnIndex : function() {
      return -1;
    },

    isSortAscending : function() {
      return true;
    },

    prefetchRows : function(firstRowIndex, lastRowIndex) {
    },

    getValue : function(columnIndex, rowIndex) {
      throw new Error("getValue is abstract");
    },

    getValueById : function(columnId, rowIndex) {
      return this.getValue(this.getColumnIndexById(columnId), rowIndex);
    },

    setValue : function(columnIndex, rowIndex, value) {
      throw new Error("setValue is abstract");
    },

    setValueById : function(columnId, rowIndex, value) {
      return this.setValue(this.getColumnIndexById(columnId), rowIndex, value);
    },

    // overridden
    getColumnCount : function() {
      return this.__columnIdArr.length;
    },

    // overridden
    getColumnIndexById : function(columnId) {
      return this.__columnIndexMap[columnId];
    },

    // overridden
    getColumnId : function(columnIndex) {
      return this.__columnIdArr[columnIndex];
    },

    // overridden
    getColumnName : function(columnIndex) {
      return this.__columnNameArr[columnIndex];
    },


    /**
     * Sets the column IDs. These IDs may be used internally to identify a
     * column.
     *
     * Note: This will clear previously set column names.
     *
     *
     * @param columnIdArr {String[]} the IDs of the columns.
     * @return {void}
     * @see #setColumns
     */
    setColumnIds : function(columnIdArr)
    {
      this.__columnIdArr = columnIdArr;

      // Create the reverse map
      this.__columnIndexMap = {};

      for (var i=0; i<columnIdArr.length; i++) {
        this.__columnIndexMap[columnIdArr[i]] = i;
      }

      this.__columnNameArr = new Array(columnIdArr.length);

      // Inform the listeners
      if (!this.__internalChange) {
        this.fireEvent(qx.ui.table.ITableModel.EVENT_TYPE_META_DATA_CHANGED);
      }
    },


    /**
     * Sets the column names. These names will be shown to the user.
     *
     * Note: The column IDs have to be defined before.
     *
     *
     * @param columnNameArr {String[]} the names of the columns.
     * @return {void}
     * @throws TODOC
     * @see #setColumnIds
     */
    setColumnNamesByIndex : function(columnNameArr)
    {
      if (this.__columnIdArr.length != columnNameArr.length) {
        throw new Error("this.__columnIdArr and columnNameArr have different length: " + this.__columnIdArr.length + " != " + columnNameArr.length);
      }

      this.__columnNameArr = columnNameArr;

      // Inform the listeners
      this.fireEvent(qx.ui.table.ITableModel.EVENT_TYPE_META_DATA_CHANGED);
    },


    /**
     * Sets the column names. These names will be shown to the user.
     *
     * Note: The column IDs have to be defined before.
     *
     *
     * @param columnNameMap {Map} a map containing the column IDs as keys and the
     *          column name as values.
     * @return {void}
     * @see #setColumnIds
     */
    setColumnNamesById : function(columnNameMap)
    {
      this.__columnNameArr = new Array(this.__columnIdArr.length);

      for (var i=0; i<this.__columnIdArr.length; ++i) {
        this.__columnNameArr[i] = columnNameMap[this.__columnIdArr[i]];
      }
    },


    /**
     * Sets the column names (and optionally IDs)
     *
     * Note: You can not change the _number_ of columns this way.  The number
     *       of columns is highly intertwined in the entire table operation,
     *       and dynamically changing it would require as much work as just
     *       recreating your table.  If you must change the number of columns
     *       in a table then you should remove the table and add a new one.
     *
     * @param columnNameArr {String[]} The column names. These names will be shown to
     *          the user.
     * @param columnIdArr {String[] ? null} The column IDs. These IDs may be used
     *          internally to identify a column. If null, the column names are used as
     *          IDs.
     * @return {void}
     * @throws TODOC
     */
    setColumns : function(columnNameArr, columnIdArr)
    {
      if (columnIdArr == null) {
        columnIdArr = columnNameArr;
      }

      if (columnIdArr.length != columnNameArr.length) {
        throw new Error("columnIdArr and columnNameArr have different length: " + columnIdArr.length + " != " + columnNameArr.length);
      }

      this.__internalChange = true;
      this.setColumnIds(columnIdArr);
      this.__internalChange = false;
      this.setColumnNamesByIndex(columnNameArr);
    }
  },


  destruct : function() {
    this._disposeFields("__columnIdArr", "__columnNameArr", "__columnIndexMap");
  }
});
