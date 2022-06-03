/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2006 STZ-IDA, Germany, http://www.stz-ida.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Til Schneider (til132)

************************************************************************ */

/**
 * An abstract table model that performs the column handling, so subclasses only
 * need to care for row handling.
 */
qx.Class.define("qx.ui.table.model.Abstract", {
  type: "abstract",
  extend: qx.core.Object,
  implement: qx.ui.table.ITableModel,

  events: {
    /**
     * Fired when the table data changed (the stuff shown in the table body).
     * The data property of the event will be a map having the following
     * attributes:
     * <ul>
     *   <li>firstRow: The index of the first row that has changed.</li>
     *   <li>lastRow: The index of the last row that has changed.</li>
     *   <li>firstColumn: The model index of the first column that has changed.</li>
     *   <li>lastColumn: The model index of the last column that has changed.</li>
     * </ul>
     *
     * Additionally, if the data changed as a result of rows being removed
     * from the data model, then these additional attributes will be in the
     * data:
     * <ul>
     *   <li>removeStart: The model index of the first row that was removed.</li>
     *   <li>removeCount: The number of rows that were removed.</li>
     * </ul>
     */
    dataChanged: "qx.event.type.Data",

    /**
     * Fired when the meta data changed (the stuff shown in the table header).
     */
    metaDataChanged: "qx.event.type.Event",

    /**
     * Fired after the table is sorted (but before the metaDataChanged event)
     */
    sorted: "qx.event.type.Data"
  },

  construct() {
    super();

    this.__columnIdArr = [];
    this.__columnNameArr = [];
    this.__columnIndexMap = {};
  },

  statics: {
    /**
     * Member to control if a table should throw an error when you try to change the
     * data model data whilst there is an incomplete edit. It could possibly break
     * current implementations so only introduce the change from QX v8.
     * Ref: https://github.com/qooxdoo/qooxdoo/pull/10377#discussion_r818697343
     */
    THROW_ON_MODEL_CHANGE_DURING_EDIT:
      parseInt(qx.core.Environment.get("qx.version"), 10) >= 8
  },

  members: {
    __columnIdArr: null,
    __columnNameArr: null,
    __columnIndexMap: null,
    __internalChange: null,
    __table: null,

    /**
     * Initialize the table model <--> table interaction. The table model is
     * passed to the table constructor, but the table model doesn't otherwise
     * know anything about the table nor can it operate on table
     * properties. This function provides the capability for the table model
     * to specify characteristics of the table. It is called when the table
     * model is applied to the table.
     *
     * @param table {qx.ui.table.Table}
     *   The table to which this model is attached
     */
    init(table) {
      // store a reference back to the table
      this.__table = table;
    },

    /**
     *
     *
     * @returns table {qx.ui.table.Table}
     */
    getTable() {
      return this.__table;
    },

    /**
     * Abstract method
     * @throws {Error} An error if this method is called.
     */
    getRowCount() {
      throw new Error("getRowCount is abstract");
    },

    getRowData(rowIndex) {
      return null;
    },

    isColumnEditable(columnIndex) {
      return false;
    },

    isColumnSortable(columnIndex) {
      return false;
    },

    sortByColumn(columnIndex, ascending) {},

    getSortColumnIndex() {
      return -1;
    },

    isSortAscending() {
      return true;
    },

    prefetchRows(firstRowIndex, lastRowIndex) {},

    /**
     * Abstract method
     *
     * @param columnIndex {Integer} the index of the column
     * @param rowIndex {Integer} the index of the row
     *
     * @throws {Error} An error if this method is called.
     */
    getValue(columnIndex, rowIndex) {
      throw new Error("getValue is abstract");
    },

    getValueById(columnId, rowIndex) {
      return this.getValue(this.getColumnIndexById(columnId), rowIndex);
    },

    /**
     * Abstract method
     *
     * @param columnIndex {Integer} index of the column
     * @param rowIndex {Integer} index of the row
     * @param value {var} Value to be set
     *
     * @throws {Error} An error if this method is called.
     */
    setValue(columnIndex, rowIndex, value) {
      throw new Error("setValue is abstract");
    },

    setValueById(columnId, rowIndex, value) {
      this.setValue(this.getColumnIndexById(columnId), rowIndex, value);
    },

    // overridden
    getColumnCount() {
      return this.__columnIdArr.length;
    },

    // overridden
    getColumnIndexById(columnId) {
      return this.__columnIndexMap[columnId];
    },

    // overridden
    getColumnId(columnIndex) {
      return this.__columnIdArr[columnIndex];
    },

    // overridden
    getColumnName(columnIndex) {
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
     * @see #setColumns
     */
    setColumnIds(columnIdArr) {
      this.__columnIdArr = columnIdArr;

      // Create the reverse map
      this.__columnIndexMap = {};

      for (var i = 0; i < columnIdArr.length; i++) {
        this.__columnIndexMap[columnIdArr[i]] = i;
      }

      this.__columnNameArr = new Array(columnIdArr.length);

      // Inform the listeners
      if (!this.__internalChange) {
        this.fireEvent("metaDataChanged");
      }
    },

    /**
     * Sets the column names. These names will be shown to the user.
     *
     * Note: The column IDs have to be defined before.
     *
     *
     * @param columnNameArr {String[]} the names of the columns.
     * @throws {Error} If the amount of given columns is different from the table.
     * @see #setColumnIds
     */
    setColumnNamesByIndex(columnNameArr) {
      if (this.__columnIdArr.length != columnNameArr.length) {
        throw new Error(
          "this.__columnIdArr and columnNameArr have different length: " +
            this.__columnIdArr.length +
            " != " +
            columnNameArr.length
        );
      }

      this.__columnNameArr = columnNameArr;

      // Inform the listeners
      this.fireEvent("metaDataChanged");
    },

    /**
     * Sets the column names. These names will be shown to the user.
     *
     * Note: The column IDs have to be defined before.
     *
     *
     * @param columnNameMap {Map} a map containing the column IDs as keys and the
     *          column name as values.
     * @see #setColumnIds
     */
    setColumnNamesById(columnNameMap) {
      this.__columnNameArr = new Array(this.__columnIdArr.length);

      for (var i = 0; i < this.__columnIdArr.length; ++i) {
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
     * @param columnNameArr {String[]}
     *   The column names. These names will be shown to the user.
     *
     * @param columnIdArr {String[] ? null}
     *   The column IDs. These IDs may be used internally to identify a
     *   column. If null, the column names are used as IDs unless ID values
     *   have already been set. If ID values have already been set, they will
     *   continue to be used if no ID values are explicitly provided here.
     *
     * @throws {Error} If the amount of given columns is different from the table.
     *
     */
    setColumns(columnNameArr, columnIdArr) {
      var bSetIds = this.__columnIdArr.length == 0 || columnIdArr;

      if (columnIdArr == null) {
        if (this.__columnIdArr.length == 0) {
          columnIdArr = columnNameArr;
        } else {
          columnIdArr = this.__columnIdArr;
        }
      }

      if (columnIdArr.length != columnNameArr.length) {
        throw new Error(
          "columnIdArr and columnNameArr have different length: " +
            columnIdArr.length +
            " != " +
            columnNameArr.length
        );
      }

      if (bSetIds) {
        this.__internalChange = true;
        this.setColumnIds(columnIdArr);
        this.__internalChange = false;
      }

      this.setColumnNamesByIndex(columnNameArr);
    },

    _checkEditing() {
      if (!qx.ui.table.model.Abstract.THROW_ON_MODEL_CHANGE_DURING_EDIT) {
        return;
      }
      if (this.getTable() && this.getTable().isEditing()) {
        throw new Error(
          "A cell is currently being edited. Commit or cancel the edit before setting the table data"
        );
      }
    }
  },

  destruct() {
    this.__columnIdArr = this.__columnNameArr = this.__columnIndexMap = null;
  }
});
