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
 * A simple table model that provides an API for changing the model data.
 */
qx.Class.define("qx.ui.table.model.Simple",
{
  extend : qx.ui.table.model.Abstract,


  construct : function()
  {
    this.base(arguments);

    this._rowArr = [];
    this._sortColumnIndex = -1;
    this._sortAscending;

    // Array of objects, each with property "ascending" and "descending"
    this._sortMethods = [];

    this._editableColArr = null;
  },

  properties :
  {
    caseSensitiveSorting :
    {
      check    : "Boolean",
      init : true
    }
  },


  statics :
  {
    /**
     * Default ascendeing sort method to use if no custom method has been
     * provided.
     *
     * @param row1 {var} first row
     * @param row2 {var} second row
     * @return {Integer} 1 of row1 is > row2, -1 if row1 is < row2, 0 if row1 == row2
     */
    _defaultSortComparatorAscending :
      function(row1, row2)
      {
        var obj1 = row1[arguments.callee.columnIndex];
        var obj2 = row2[arguments.callee.columnIndex];
        return (obj1 > obj2) ? 1 : ((obj1 == obj2) ? 0 : -1);
      },


    /**
     * Same as the Default ascending sort method but using case insensitivity
     *
     * @param row1 {var} first row
     * @param row2 {var} second row
     * @return {Integer} 1 of row1 is > row2, -1 if row1 is < row2, 0 if row1 == row2
     */
      _defaultSortComparatorInsensitiveAscending :
  function(row1, row2)
  {
    var obj1 = (isNaN(row1[arguments.callee.columnIndex]) ?
          row1[arguments.callee.columnIndex].toLowerCase() : row1[arguments.callee.columnIndex]);
    var obj2 = (isNaN(row2[arguments.callee.columnIndex]) ?
          row2[arguments.callee.columnIndex].toLowerCase() : row2[arguments.callee.columnIndex]);
    return (obj1 > obj2) ? 1 : ((obj1 == obj2) ? 0 : -1);
  },


    /**
     * Default descendeing sort method to use if no custom method has been
     * provided.
     *
     * @param row1 {var} first row
     * @param row2 {var} second row
     * @return {Integer} 1 of row1 is > row2, -1 if row1 is < row2, 0 if row1 == row2
     */
    _defaultSortComparatorDescending :
      function(row1, row2)
      {
        var obj1 = row1[arguments.callee.columnIndex];
        var obj2 = row2[arguments.callee.columnIndex];
        return (obj1 < obj2) ? 1 : ((obj1 == obj2) ? 0 : -1);
      },


    /**
     * Same as the Default descending sort method but using case insensitivity
     *
     * @param row1 {var} first row
     * @param row2 {var} second row
     * @return {Integer} 1 of row1 is > row2, -1 if row1 is < row2, 0 if row1 == row2
     */
      _defaultSortComparatorInsensitiveDescending :
      function(row1, row2)
      {
  var obj1 = (isNaN(row1[arguments.callee.columnIndex]) ?
        row1[arguments.callee.columnIndex].toLowerCase() : row1[arguments.callee.columnIndex]);
  var obj2 = (isNaN(row2[arguments.callee.columnIndex]) ?
        row2[arguments.callee.columnIndex].toLowerCase() : row2[arguments.callee.columnIndex]);
  return (obj1 < obj2) ? 1 : ((obj1 == obj2) ? 0 : -1);
      }

  },


  members :
  {
    // overridden
    getRowData : function(rowIndex)
    {
      var rowData = this._rowArr[rowIndex];
      if (rowData == null || rowData.originalData == null) {
        return rowData;
      } else {
        return rowData.originalData;
      }
    },


    /**
     * Returns the data of one row as map containing the column IDs as key and
     * the cell values as value.
     *
     * @type member
     * @param rowIndex {Integer} the model index of the row.
     * @return {Map} a Map containing the column values.
     */
    getRowDataAsMap : function(rowIndex)
    {
      var columnArr = this._rowArr[rowIndex];
      var map = {};

      for (var col=0; col<this.getColumnCount(); col++) {
        map[this.getColumnId(col)] = columnArr[col];
      }

      return map;
    },


    /**
     * Sets all columns editable or not editable.
     *
     * @type member
     * @param editable {Boolean} whether all columns are editable.
     * @return {void}
     */
    setEditable : function(editable)
    {
      this._editableColArr = [];

      for (var col=0; col<this.getColumnCount(); col++) {
        this._editableColArr[col] = editable;
      }

      this.createDispatchEvent(qx.ui.table.ITableModel.EVENT_TYPE_META_DATA_CHANGED);
    },


    /**
     * Sets whether a column is editable.
     *
     * @type member
     * @param columnIndex {Integer} the column of which to set the editable state.
     * @param editable {Boolean} whether the column should be editable.
     * @return {void}
     */
    setColumnEditable : function(columnIndex, editable)
    {
      if (editable != this.isColumnEditable(columnIndex))
      {
        if (this._editableColArr == null) {
          this._editableColArr = [];
        }

        this._editableColArr[columnIndex] = editable;

        this.createDispatchEvent(qx.ui.table.ITableModel.EVENT_TYPE_META_DATA_CHANGED);
      }
    },

    // overridden
    isColumnEditable : function(columnIndex) {
      return this._editableColArr ? (this._editableColArr[columnIndex] == true) : false;
    },


    /**
     * Sets whether a column is sortable.
     *
     * @param columnIndex {Integer} the column of which to set the sortable state.
     * @param sortable {Boolean} whether the column should be sortable.
     */
    setColumnSortable : function(columnIndex, sortable)
    {
      if (sortable != this.isColumnSortable(columnIndex))
      {
        if (this._sortableColArr == null) {
          this._sortableColArr = [];
        }

        this._sortableColArr[columnIndex] = sortable;
        this.createDispatchEvent(qx.ui.table.ITableModel.EVENT_TYPE_META_DATA_CHANGED);
      }
    },


    // overridden
    isColumnSortable : function(columnIndex) {
      return this._sortableColArr ? (this._sortableColArr[columnIndex] == true) : true;
    },

    // overridden
    sortByColumn : function(columnIndex, ascending)
    {
      // NOTE: We use different comperators for ascending and descending,
      //     because comperators should be really fast.
      var comparator;

      var sortMethods = this._sortMethods[columnIndex];
      if (sortMethods)
      {
        comparator =
          (ascending
           ? sortMethods.ascending
           : sortMethods.descending);
      }
      else
      {
        if (this.getCaseSensitiveSorting())
        {
          comparator =
            (ascending
             ? qx.ui.table.model.Simple._defaultSortComparatorAscending
             : qx.ui.table.model.Simple._defaultSortComparatorDescending);
        }
        else
        {
          comparator =
            (ascending
             ? qx.ui.table.model.Simple._defaultSortComparatorInsensitiveAscending
             : qx.ui.table.model.Simple._defaultSortComparatorInsensitiveDescending);
        }
      }

      comparator.columnIndex = columnIndex;
      this._rowArr.sort(comparator);

      this._sortColumnIndex = columnIndex;
      this._sortAscending = ascending;

      this.createDispatchEvent(qx.ui.table.ITableModel.EVENT_TYPE_META_DATA_CHANGED);
    },


    /**
     * Specify the methods to use for ascending and descending sorts of a
     * particular column.
     *
     * @param columnIndex {Integer}
     *   The index of the column or which the sort methods are being
     *   provided.
     *
     * @param methods {Map}
     *   Map with two properties: "ascending" and "descending".  The
     *   property value of each is a comparator function which takes two
     *   parameters: the two arrays of row data, row1 and row2, being
     *   compared.  It may determine which column to of the row data to sort
     *   on by accessing arguments.callee.columnIndex.  Each comparator
     *   function must return 1, 0 or -1, when the column in row1 is greater
     *   than, equal to, or less than, respectively, the column in row2.
     *
     * @return {void}
     */
    setSortMethods : function(columnIndex, methods)
    {
      this._sortMethods[columnIndex] = methods;
    },


    /**
     * Clears the sorting.
     *
     * @type member
     * @return {void}
     */
    _clearSorting : function()
    {
      if (this._sortColumnIndex != -1)
      {
        this._sortColumnIndex = -1;
        this._sortAscending = true;

        this.createDispatchEvent(qx.ui.table.ITableModel.EVENT_TYPE_META_DATA_CHANGED);
      }
    },

    // overridden
    getSortColumnIndex : function() {
      return this._sortColumnIndex;
    },

    // overridden
    isSortAscending : function() {
      return this._sortAscending;
    },

    // overridden
    getRowCount : function() {
      return this._rowArr.length;
    },

    // overridden
    getValue : function(columnIndex, rowIndex)
    {
      if (rowIndex < 0 || rowIndex >= this._rowArr.length) {
        throw new Error("this._rowArr out of bounds: " + rowIndex + " (0.." + this._rowArr.length + ")");
      }

      return this._rowArr[rowIndex][columnIndex];
    },

    // overridden
    setValue : function(columnIndex, rowIndex, value)
    {
      if (this._rowArr[rowIndex][columnIndex] != value)
      {
        this._rowArr[rowIndex][columnIndex] = value;

        // Inform the listeners
        if (this.hasEventListeners(qx.ui.table.ITableModel.EVENT_TYPE_DATA_CHANGED))
        {
          var data =
          {
            firstRow    : rowIndex,
            lastRow     : rowIndex,
            firstColumn : columnIndex,
            lastColumn  : columnIndex
          };

          this.createDispatchDataEvent(qx.ui.table.ITableModel.EVENT_TYPE_DATA_CHANGED, data);
        }

        if (columnIndex == this._sortColumnIndex) {
          this._clearSorting();
        }
      }
    },


    /**
     * Sets the whole data in a bulk.
     *
     * @type member
     * @param rowArr {var[][]} An array containing an array for each row. Each
     *          row-array contains the values in that row in the order of the columns
     *          in this model.
     * @param clearSorting {Boolean ? true} Whether to clear the sort state.
     * @return {void}
     */
    setData : function(rowArr, clearSorting)
    {
      this._rowArr = rowArr;

      // Inform the listeners
      if (this.hasEventListeners(qx.ui.table.ITableModel.EVENT_TYPE_DATA_CHANGED)) {
        this.createDispatchEvent(qx.ui.table.ITableModel.EVENT_TYPE_DATA_CHANGED);
      }

    if (clearSorting) {
      this._clearSorting();
    }
    },


    /**
     * Returns the data of this model.
     *
     * Warning: Do not alter this array! If you want to change the data use
     * {@link #setData}, {@link #setDataAsMapArray} or {@link #setValue} instead.
     *
     * @type member
     * @return {var[][]} An array containing an array for each row. Each
     *           row-array contains the values in that row in the order of the columns
     *           in this model.
     */
    getData : function() {
      return this._rowArr;
    },


    /**
     * Sets the whole data in a bulk.
     *
     * @param mapArr {Map[]} An array containing a map for each row. Each
     *        row-map contains the column IDs as key and the cell values as value.
     * @param rememberMaps {Boolean ? false} Whether to remember the original maps.
     *        If true {@link #getRowData} will return the original map.
     * @param clearSorting {Boolean ? true} Whether to clear the sort state.
     */
    setDataAsMapArray : function(mapArr, rememberMaps, clearSorting) {
      this.setData(this._mapArray2RowArr(mapArr, rememberMaps), clearSorting);
    },


    /**
     * Adds some rows to the model.
     *
     * Warning: The given array will be altered!
     *
     * @type member
     * @param rowArr {var[][]} An array containing an array for each row. Each
     *          row-array contains the values in that row in the order of the columns
     *          in this model.
     * @param startIndex {Integer ? null} The index where to insert the new rows. If null,
     *          the rows are appended to the end.
     * @return {void}
     */
    addRows : function(rowArr, startIndex)
    {
      if (startIndex == null) {
        startIndex = this._rowArr.length;
      }

      // Prepare the rowArr so it can be used for apply
      rowArr.splice(0, 0, startIndex, 0);

      // Insert the new rows
      Array.prototype.splice.apply(this._rowArr, rowArr);

      // Inform the listeners
      var data =
      {
        firstRow    : startIndex,
        lastRow     : this._rowArr.length - 1,
        firstColumn : 0,
        lastColumn  : this.getColumnCount() - 1
      };
      this.createDispatchDataEvent(qx.ui.table.ITableModel.EVENT_TYPE_DATA_CHANGED, data);

      this._clearSorting();
    },


    /**
     * Adds some rows to the model.
     *
     * Warning: The given array (mapArr) will be altered!
     *
     * @param mapArr {Map[]} An array containing a map for each row. Each
     *        row-map contains the column IDs as key and the cell values as value.
     * @param startIndex {Integer ? null} The index where to insert the new rows. If null,
     *        the rows are appended to the end.
     * @param rememberMaps {Boolean ? false} Whether to remember the original maps.
     *        If true {@link #getRowData} will return the original map.
     */
    addRowsAsMapArray : function(mapArr, startIndex, rememberMaps) {
      this.addRows(this._mapArray2RowArr(mapArr, rememberMaps), startIndex);
    },


    /**
     * Removes some rows from the model.
     *
     * @type member
     * @param startIndex {Integer} the index of the first row to remove.
     * @param howMany {Integer} the number of rows to remove.
     * @return {void}
     */
    removeRows : function(startIndex, howMany)
    {
      this._rowArr.splice(startIndex, howMany);

      // Inform the listeners
      var data =
      {
        firstRow    : startIndex,
        lastRow     : this._rowArr.length - 1,
        firstColumn : 0,
        lastColumn  : this.getColumnCount() - 1
      };

      this.createDispatchDataEvent(qx.ui.table.ITableModel.EVENT_TYPE_DATA_CHANGED, data);

      this._clearSorting();
    },


    /**
     * Creates an array of maps to an array of arrays.
     *
     * @type member
     * @param mapArr {Map[]} An array containing a map for each row. Each
     *          row-map contains the column IDs as key and the cell values as value.
     * @param rememberMaps {Boolean ? false} Whether to remember the original maps.
     *        If true {@link #getRowData} will return the original map.
     * @return {var[][]} An array containing an array for each row. Each
     *           row-array contains the values in that row in the order of the columns
     *           in this model.
     */
    _mapArray2RowArr : function(mapArr, rememberMaps)
    {
      var rowCount = mapArr.length;
      var columnCount = this.getColumnCount();
      var dataArr = new Array(rowCount);
      var columnArr;
      var j;

      for (var i=0; i<rowCount; ++i)
      {
      columnArr = [];
      if (rememberMaps) {
        columnArr.originalData = mapArr[i];
      }

        for (var j=0; j<columnCount; ++j) {
          columnArr[j] = mapArr[i][this.getColumnId(j)];
        }

        dataArr[i] = columnArr;
      }

      return dataArr;
    }
  },


  destruct : function() {
    this._disposeFields("_rowArr", "_editableColArr", "_sortMethods");
  }
});
