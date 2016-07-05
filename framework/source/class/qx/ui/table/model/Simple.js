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
 * A simple table model that provides an API for changing, filtering the model data.
 *
 * This is a example for filtering :
 *
<pre class='javascript'>
var model = new qx.ui.table.model.Simple();
model.setColumns(["Login", "Name", "Email"], ["login", "name", "email"]);

var table = new qx.ui.table.Table(model);

var data = [{
  login : "darthvader",
  name : "Darth Vader",
  email : "darthvader@tatooine.org"
}, {
  login : "anakin",
  name : "Anakin Skywalker",
  email : "anakin@skywalker.org"
}, {
  login : "luke",
  name : "Luke Skywalker",
  email : "luke@tatooine.org"
}, {
  login : "obi-wan",
  name : "Obi-Wan Kenobi",
  email : "obiwan@jedi.org"
}, {
  login : "rey",
  name : "Rey",
  email : "rey@jakku.sw"
}];

model.setDataAsMapArray(data);

this.getRoot().add(table);

var search = new qx.ui.form.TextField();
search.set({
  liveUpdate : true,
  placeholder : "Search login"
});

search.addListener("changeValue", function(e) {
  var value = e.getData();

  model.resetHiddenRows();
  model.addNotRegex(value, "login", true);
  model.applyFilters();
});

this.getRoot().add(search, {top : 500, left : 10});
</pre>

 */
qx.Class.define("qx.ui.table.model.Simple",
{
  extend : qx.ui.table.model.Abstract,


  construct : function()
  {
    this.base(arguments);

    this.__rowArr = [];
    this.__sortColumnIndex = -1;

    // Array of objects, each with property "ascending" and "descending"
    this.__sortMethods = [];

    this.__editableColArr = null;

    this.numericAllowed = ["==", "!=", ">", "<", ">=", "<="];
    this.betweenAllowed = ["between", "!between"];
    this.__applyingFilters = false;
    this.Filters = [];
  },

  properties :
  {
    /**
     * Whether sorting should be case sensitive
     */
    caseSensitiveSorting :
    {
      check : "Boolean",
      init : true
    }
  },


  statics :
  {
    /**
     * Default ascending sort method to use if no custom method has been
     * provided.
     *
     * @param row1 {var} first row
     * @param row2 {var} second row
     * @return {Integer} 1 of row1 is > row2, -1 if row1 is < row2, 0 if row1 == row2
     */
    _defaultSortComparatorAscending : function(row1, row2)
    {
      var obj1 = row1[arguments.callee.columnIndex];
      var obj2 = row2[arguments.callee.columnIndex];
      if (qx.lang.Type.isNumber(obj1) && qx.lang.Type.isNumber(obj2)) {
        var result = isNaN(obj1) ? isNaN(obj2) ?  0 : 1 : isNaN(obj2) ? -1 : null;
        if (result != null) {
          return result;
        }
      }
      return (obj1 > obj2) ? 1 : ((obj1 == obj2) ? 0 : -1);
    },


    /**
     * Same as the Default ascending sort method but using case insensitivity
     *
     * @param row1 {var} first row
     * @param row2 {var} second row
     * @return {Integer} 1 of row1 is > row2, -1 if row1 is < row2, 0 if row1 == row2
     */
    _defaultSortComparatorInsensitiveAscending : function(row1, row2)
    {
      var obj1 = (row1[arguments.callee.columnIndex].toLowerCase ?
            row1[arguments.callee.columnIndex].toLowerCase() : row1[arguments.callee.columnIndex]);
      var obj2 = (row2[arguments.callee.columnIndex].toLowerCase ?
            row2[arguments.callee.columnIndex].toLowerCase() : row2[arguments.callee.columnIndex]);

      if (qx.lang.Type.isNumber(obj1) && qx.lang.Type.isNumber(obj2)) {
        var result = isNaN(obj1) ? isNaN(obj2) ?  0 : 1 : isNaN(obj2) ? -1 : null;
        if (result != null) {
          return result;
        }
      }
      return (obj1 > obj2) ? 1 : ((obj1 == obj2) ? 0 : -1);
    },


    /**
     * Default descending sort method to use if no custom method has been
     * provided.
     *
     * @param row1 {var} first row
     * @param row2 {var} second row
     * @return {Integer} 1 of row1 is > row2, -1 if row1 is < row2, 0 if row1 == row2
     */
    _defaultSortComparatorDescending : function(row1, row2)
    {
      var obj1 = row1[arguments.callee.columnIndex];
      var obj2 = row2[arguments.callee.columnIndex];
      if (qx.lang.Type.isNumber(obj1) && qx.lang.Type.isNumber(obj2)) {
        var result = isNaN(obj1) ? isNaN(obj2) ?  0 : 1 : isNaN(obj2) ? -1 : null;
        if (result != null) {
          return result;
        }
      }
      return (obj1 < obj2) ? 1 : ((obj1 == obj2) ? 0 : -1);
    },


    /**
     * Same as the Default descending sort method but using case insensitivity
     *
     * @param row1 {var} first row
     * @param row2 {var} second row
     * @return {Integer} 1 of row1 is > row2, -1 if row1 is < row2, 0 if row1 == row2
     */
    _defaultSortComparatorInsensitiveDescending : function(row1, row2)
    {
      var obj1 = (row1[arguments.callee.columnIndex].toLowerCase ?
          row1[arguments.callee.columnIndex].toLowerCase() : row1[arguments.callee.columnIndex]);
      var obj2 = (row2[arguments.callee.columnIndex].toLowerCase ?
          row2[arguments.callee.columnIndex].toLowerCase() : row2[arguments.callee.columnIndex]);
      if (qx.lang.Type.isNumber(obj1) && qx.lang.Type.isNumber(obj2)) {
        var result = isNaN(obj1) ? isNaN(obj2) ?  0 : 1 : isNaN(obj2) ? -1 : null;
        if (result != null) {
          return result;
        }
      }
      return (obj1 < obj2) ? 1 : ((obj1 == obj2) ? 0 : -1);
    }

  },


  members :
  {
    __rowArr : null,
    __editableColArr : null,
    __sortableColArr : null,
    __sortMethods : null,
    __sortColumnIndex : null,
    __sortAscending : null,
    __fullArr : null,
    __applyingFilters : null,


    // overridden
    getRowData : function(rowIndex)
    {
      var rowData = this.__rowArr[rowIndex];
      if (rowData == null || rowData.originalData == null) {
        return rowData;
      } else {
        return rowData.originalData;
      }
    },


    /**
     * Returns the data of one row as map containing the column IDs as key and
     * the cell values as value. Also the meta data is included.
     *
     * @param rowIndex {Integer} the model index of the row.
     * @return {Map} a Map containing the column values.
     */
    getRowDataAsMap : function(rowIndex)
    {
      var rowData = this.__rowArr[rowIndex];

      if (rowData != null) {
        var map = {};
        // get the current set data
        for (var col = 0; col < this.getColumnCount(); col++) {
          map[this.getColumnId(col)] = rowData[col];
        }

        if (rowData.originalData != null) {
          // merge in the meta data
          for (var key in rowData.originalData) {
            if (map[key] == undefined) {
              map[key] = rowData.originalData[key];
            }
          }
        }

        return map;
      }
      // may be null, which is ok
      return (rowData && rowData.originalData) ? rowData.originalData : null;
    },


    /**
     * Gets the whole data as an array of maps.
     *
     * Note: Individual items are retrieved by {@link #getRowDataAsMap}.
     * @return {Map[]} Array of row data maps
     */
    getDataAsMapArray: function() {
      var len = this.getRowCount();
      var data = [];

      for (var i = 0; i < len; i++)
      {
        data.push(this.getRowDataAsMap(i));
      }

      return data;
    },


    /**
     * Sets all columns editable or not editable.
     *
     * @param editable {Boolean} whether all columns are editable.
     */
    setEditable : function(editable)
    {
      this.__editableColArr = [];

      for (var col=0; col<this.getColumnCount(); col++) {
        this.__editableColArr[col] = editable;
      }

      this.fireEvent("metaDataChanged");
    },


    /**
     * Sets whether a column is editable.
     *
     * @param columnIndex {Integer} the column of which to set the editable state.
     * @param editable {Boolean} whether the column should be editable.
     */
    setColumnEditable : function(columnIndex, editable)
    {
      if (editable != this.isColumnEditable(columnIndex))
      {
        if (this.__editableColArr == null) {
          this.__editableColArr = [];
        }

        this.__editableColArr[columnIndex] = editable;

        this.fireEvent("metaDataChanged");
      }
    },

    // overridden
    isColumnEditable : function(columnIndex) {
      return this.__editableColArr ? (this.__editableColArr[columnIndex] == true) : false;
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
        if (this.__sortableColArr == null) {
          this.__sortableColArr = [];
        }

        this.__sortableColArr[columnIndex] = sortable;
        this.fireEvent("metaDataChanged");
      }
    },


    // overridden
    isColumnSortable : function(columnIndex) {
      return (
        this.__sortableColArr
        ? (this.__sortableColArr[columnIndex] !== false)
        : true
      );
    },

    // overridden
    sortByColumn : function(columnIndex, ascending)
    {
      // NOTE: We use different comparators for ascending and descending,
      //     because comparators should be really fast.
      var comparator;

      var sortMethods = this.__sortMethods[columnIndex];
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
      this.__rowArr.sort(comparator);

      this.__sortColumnIndex = columnIndex;
      this.__sortAscending = ascending;

      var data =
        {
          columnIndex : columnIndex,
          ascending   : ascending
        };
      this.fireDataEvent("sorted", data);

      this.fireEvent("metaDataChanged");
    },


    /**
     * Specify the methods to use for ascending and descending sorts of a
     * particular column.
     *
     * @param columnIndex {Integer}
     *   The index of the column for which the sort methods are being
     *   provided.
     *
     * @param compare {Function|Map}
     *   If provided as a Function, this is the comparator function to sort in
     *   ascending order. It takes two parameters: the two arrays of row data,
     *   row1 and row2, being compared. It may determine which column of the
     *   row data to sort on by accessing arguments.callee.columnIndex.  The
     *   comparator function must return 1, 0 or -1, when the column in row1
     *   is greater than, equal to, or less than, respectively, the column in
     *   row2.
     *
     *   If this parameter is a Map, it shall have two properties: "ascending"
     *   and "descending". The property value of each is a comparator
     *   function, as described above.
     *
     *   If only the "ascending" function is provided (i.e. this parameter is
     *   a Function, not a Map), then the "descending" function is built
     *   dynamically by passing the two parameters to the "ascending" function
     *   in reversed order. <i>Use of a dynamically-built "descending" function
     *   generates at least one extra function call for each row in the table,
     *   and possibly many more. If the table is expected to have more than
     *   about 1000 rows, you will likely want to provide a map with a custom
     *   "descending" sort function as well as the "ascending" one.</i>
     *
     */
    setSortMethods : function(columnIndex, compare)
    {
      var methods;
      if (qx.lang.Type.isFunction(compare))
      {
        methods =
          {
            ascending  : compare,
            descending : function(row1, row2)
            {
              return compare(row2, row1);
            }
          };
      }
      else
      {
        methods = compare;
      }
      this.__sortMethods[columnIndex] = methods;
    },


    /**
     * Returns the sortMethod(s) for a table column.
     *
     * @param columnIndex {Integer} The index of the column for which the sort
     *   methods are being  provided.
     *
     * @return {Map} a map with the two properties "ascending"
     *   and "descending" for the specified column.
     *   The property value of each is a comparator function, as described
     *   in {@link #setSortMethods}.
     */
    getSortMethods : function(columnIndex) {
      return this.__sortMethods[columnIndex];
    },


    /**
     * Clears the sorting.
     */
    clearSorting : function()
    {
      if (this.__sortColumnIndex != -1)
      {
        this.__sortColumnIndex = -1;
        this.__sortAscending = true;

        this.fireEvent("metaDataChanged");
      }
    },

    // overridden
    getSortColumnIndex : function() {
      return this.__sortColumnIndex;
    },

    /**
     * Set the sort column index
     *
     * WARNING: This should be called only by subclasses with intimate
     *          knowledge of what they are doing!
     *
     * @param columnIndex {Integer} index of the column
     */
    _setSortColumnIndex : function(columnIndex)
    {
      this.__sortColumnIndex = columnIndex;
    },

    // overridden
    isSortAscending : function() {
      return this.__sortAscending;
    },

    /**
     * Set whether to sort in ascending order or not.
     *
     * WARNING: This should be called only by subclasses with intimate
     *          knowledge of what they are doing!
     *
     * @param ascending {Boolean}
     *   <i>true</i> for an ascending sort;
     *   <i> false</i> for a descending sort.
     */
    _setSortAscending : function(ascending)
    {
      this.__sortAscending = ascending;
    },

    // overridden
    getRowCount : function() {
      return this.__rowArr.length;
    },

    // overridden
    getValue : function(columnIndex, rowIndex)
    {
      if (rowIndex < 0 || rowIndex >= this.__rowArr.length) {
        throw new Error("this.__rowArr out of bounds: " + rowIndex + " (0.." + this.__rowArr.length + ")");
      }

      return this.__rowArr[rowIndex][columnIndex];
    },

    // overridden
    setValue : function(columnIndex, rowIndex, value)
    {
      if (this.__rowArr[rowIndex][columnIndex] != value)
      {
        this.__rowArr[rowIndex][columnIndex] = value;

        // Inform the listeners
        if (this.hasListener("dataChanged"))
        {
          var data =
          {
            firstRow    : rowIndex,
            lastRow     : rowIndex,
            firstColumn : columnIndex,
            lastColumn  : columnIndex
          };

          this.fireDataEvent("dataChanged", data);
        }

        if (columnIndex == this.__sortColumnIndex) {
          this.clearSorting();
        }
      }
    },


    /**
     * Sets the whole data in a bulk.
     *
     * @param rowArr {var[][]} An array containing an array for each row. Each
     *          row-array contains the values in that row in the order of the columns
     *          in this model.
     * @param clearSorting {Boolean ? true} Whether to clear the sort state.
     */
    setData : function(rowArr, clearSorting)
    {
      this.__fullArr = qx.lang.Array.clone(rowArr);
      this.Filters = [];

      this.__rowArr = rowArr;

      // Inform the listeners
      if (this.hasListener("dataChanged"))
      {
        var data =
        {
          firstRow    : 0,
          lastRow     : rowArr.length - 1,
          firstColumn : 0,
          lastColumn  : this.getColumnCount() - 1
        };

        this.fireDataEvent("dataChanged", data);
      }

      if (clearSorting !== false) {
        this.clearSorting();
      }
    },


    /**
     * Returns the data of this model.
     *
     * Warning: Do not alter this array! If you want to change the data use
     * {@link #setData}, {@link #setDataAsMapArray} or {@link #setValue} instead.
     *
     * @return {var[][]} An array containing an array for each row. Each
     *           row-array contains the values in that row in the order of the columns
     *           in this model.
     */
    getData : function() {
      return this.__rowArr;
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
     * @param rowArr {var[][]} An array containing an array for each row. Each
     *          row-array contains the values in that row in the order of the columns
     *          in this model.
     * @param startIndex {Integer ? null} The index where to insert the new rows. If null,
     *          the rows are appended to the end.
     * @param clearSorting {Boolean ? true} Whether to clear the sort state.
     */
    addRows : function(rowArr, startIndex, clearSorting)
    {
      if (startIndex == null) {
        startIndex = this.__rowArr.length;
      }

      // Prepare the rowArr so it can be used for apply
      rowArr.splice(0, 0, startIndex, 0);

      // Insert the new rows
      Array.prototype.splice.apply(this.__rowArr, rowArr);

      // Inform the listeners
      var data =
      {
        firstRow    : startIndex,
        lastRow     : this.__rowArr.length - 1,
        firstColumn : 0,
        lastColumn  : this.getColumnCount() - 1
      };
      this.fireDataEvent("dataChanged", data);

      if (clearSorting !== false) {
        this.clearSorting();
      }
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
     * @param clearSorting {Boolean ? true} Whether to clear the sort state.
     */
    addRowsAsMapArray : function(mapArr, startIndex, rememberMaps, clearSorting) {
      this.addRows(this._mapArray2RowArr(mapArr, rememberMaps), startIndex, clearSorting);
    },


    /**
     * Sets rows in the model. The rows overwrite the old rows starting at
     * <code>startIndex</code> to <code>startIndex+rowArr.length</code>.
     *
     * Warning: The given array will be altered!
     *
     * @param rowArr {var[][]} An array containing an array for each row. Each
     *          row-array contains the values in that row in the order of the columns
     *          in this model.
     * @param startIndex {Integer ? null} The index where to insert the new rows. If null,
     *          the rows are set from the beginning (0).
     * @param clearSorting {Boolean ? true} Whether to clear the sort state.
     */
    setRows : function(rowArr, startIndex, clearSorting)
    {
      if (startIndex == null) {
        startIndex = 0;
      }

      // Prepare the rowArr so it can be used for apply
      rowArr.splice(0, 0, startIndex, rowArr.length);

      // Replace rows
      Array.prototype.splice.apply(this.__rowArr, rowArr);

      // Inform the listeners
      var data =
      {
        firstRow    : startIndex,
        lastRow     : this.__rowArr.length - 1,
        firstColumn : 0,
        lastColumn  : this.getColumnCount() - 1
      };
      this.fireDataEvent("dataChanged", data);

      if (clearSorting !== false) {
        this.clearSorting();
      }
    },


    /**
     * Set rows in the model. The rows overwrite the old rows starting at
     * <code>startIndex</code> to <code>startIndex+rowArr.length</code>.
     *
     * Warning: The given array (mapArr) will be altered!
     *
     * @param mapArr {Map[]} An array containing a map for each row. Each
     *        row-map contains the column IDs as key and the cell values as value.
     * @param startIndex {Integer ? null} The index where to insert the new rows. If null,
     *        the rows are appended to the end.
     * @param rememberMaps {Boolean ? false} Whether to remember the original maps.
     *        If true {@link #getRowData} will return the original map.
     * @param clearSorting {Boolean ? true} Whether to clear the sort state.
     */
    setRowsAsMapArray : function(mapArr, startIndex, rememberMaps, clearSorting) {
      this.setRows(this._mapArray2RowArr(mapArr, rememberMaps), startIndex, clearSorting);
    },


    /**
     * Removes some rows from the model.
     *
     * @param startIndex {Integer} the index of the first row to remove.
     * @param howMany {Integer} the number of rows to remove.
     * @param clearSorting {Boolean ? true} Whether to clear the sort state.
     */
    removeRows : function(startIndex, howMany, clearSorting)
    {
      this.__rowArr.splice(startIndex, howMany);

      // Inform the listeners
      var data =
      {
        firstRow    : startIndex,
        lastRow     : this.__rowArr.length - 1,
        firstColumn : 0,
        lastColumn  : this.getColumnCount() - 1,
        removeStart : startIndex,
        removeCount : howMany
      };

      this.fireDataEvent("dataChanged", data);
      if (clearSorting !== false) {
        this.clearSorting();
      }
    },


    /**
     * Creates an array of maps to an array of arrays.
     *
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
    },


    /**
     * Whether the given string (needle) is in the array (haystack)
     *
     * @param the_needle {String} String to search
     * @param the_haystack {Array} Array, which should be searched
     * @return {Boolean} whether the search string was found.
     * @deprecated {6.0} please use qx.lang.Array#contains instead
     */
    _js_in_array : function(the_needle, the_haystack)
    {
      var func = this._js_in_array;
      qx.log.Logger.deprecatedMethodWarning(
          func,
          qx.lang.String.format("The method '%1' is deprecated. Please use 'qx.lang.Array#contains' instead.", [func.name])
        );
      qx.log.Logger.deprecateMethodOverriding(
          this,
          qx.ui.table.model.Filtered,
          func.name,
          "The method '_js_in_array' is deprecated. Please use 'qx.lang.Array#contains' instead."
      );
      var the_hay = the_haystack.toString();

      if (the_hay == '') {
        return false;
      }

      var the_pattern = new RegExp(the_needle, 'g');
      var matched = the_pattern.test(the_haystack);
      return matched;
    },


    /**
     * The addBetweenFilter method is used to add a between filter to the
     * table model.
     *
     * @param filter {String}
     *    The type of filter. Accepted strings are "between" and "!between".
     *
     * @param value1 {Integer}
     *    The first value to compare against.
     *
     * @param value2 {Integer}
     *    The second value to compare against.
     *
     * @param target {String}
     *    The text value of the column to compare against.
     *
     *
     * @throws {Error} If the filter can not recognized or one of the values
     * is null.
     */
    addBetweenFilter : function(filter, value1, value2, target)
    {
      if (qx.lang.Array.contains(this.betweenAllowed, filter) && target != null)
      {
        if (value1 != null && value2 != null) {
          var temp = new Array(filter, value1, value2, target);
        }
      }

      if (temp != null) {
        this.Filters.push(temp);
      } else {
        throw new Error("Filter not recognized or value1/value2 is null!");
      }
    },


    /**
     * The addNumericFilter method is used to add a basic numeric filter to
     * the table model.
     *
     * @param filter {String}
     *    The type of filter. Accepted strings are:
     *    "==", "!=", ">", "<", ">=", and "<=".
     *
     * @param value1 {Integer}
     *    The value to compare against.
     *
     * @param target {String}
     *    The text value of the column to compare against.
     *
     *
     * @throws {Error} If the filter can not recognized or the target is null.
     */
    addNumericFilter : function(filter, value1, target)
    {
      var temp = null;

      if (qx.lang.Array.contains(this.numericAllowed, filter) && target != null)
      {
        if (value1 != null) {
          temp = [filter, value1, target];
        }
      }

      if (temp != null) {
        this.Filters.push(temp);
      } else {
        throw new Error("Filter not recognized: value or target is null!");
      }
    },


    /**
     * The addRegex method is used to add a regular expression filter to the
     * table model.
     *
     * @param regex {String}
     *    The regular expression to match against.
     *
     * @param target {String}
     *    The text value of the column to compare against.
     *
     * @param ignorecase {Boolean}
     *    If true, the regular expression will ignore case.
     *
     *
     * @throws {Error} If the regex is not valid.
     */
    addRegex : function(regex, target, ignorecase)
    {
      var regexarg;
      if (ignorecase) { regexarg ='gi'; } else { regexarg ='g'; }
      if (regex != null && target != null) {
        var temp = new Array("regex", regex, target, regexarg);
      }

      if (temp != null) {
        this.Filters.push(temp);
      } else {
        throw new Error("regex cannot be null!");
      }
    },


    /**
     * The addNotRegex method is used to add a regular expression filter to the
     * table model and filter cells that do not match.
     *
     * @param regex {String}
     *    The regular expression to match against.
     *
     * @param target {String}
     *    The text value of the column to compare against.
     *
     * @param ignorecase {Boolean}
     *    If true, the regular expression will ignore case.
     *
     *
     * @throws {Error} If the regex is null.
     */
    addNotRegex : function(regex, target, ignorecase)
    {
      var regexarg;
      if (ignorecase) { regexarg ='gi'; } else { regexarg ='g'; }
      if (regex != null && target != null) {
        var temp = new Array("notregex", regex, target, regexarg);
      }

      if (temp != null) {
        this.Filters.push(temp);
      } else {
        throw new Error("notregex cannot be null!");
      }
    },


    /**
     * The applyFilters method is called to apply filters to the table model.
     */
    applyFilters : function()
    {
      var i;
      var filter_test;
      var compareValue;
      var rowArr = this.getData();
      var rowLength = rowArr.length;
      var count;
      var hidden = 0;
      var rowsToHide = [];

      for (var row = 0; row < rowLength; row++) {
        filter_test = false;

        for (i in this.Filters) {

          if (qx.lang.Array.contains(this.numericAllowed, this.Filters[i][0]) && filter_test === false) {
            compareValue = this.getValueById(this.Filters[i][2], row);

            switch(this.Filters[i][0]) {

              case "==":
                if (compareValue == this.Filters[i][1]) {
                  filter_test = true;
                }
                break;

              case "!=":
                if (compareValue != this.Filters[i][1]) {
                  filter_test = true;
                }
                break;

              case ">":
                if (compareValue > this.Filters[i][1]) {
                  filter_test = true;
                }
                break;

              case "<":
                if (compareValue < this.Filters[i][1]) {
                  filter_test = true;
                }
                break;

            case ">=":
              if (compareValue >= this.Filters[i][1]) {
                filter_test = true;
              }
              break;

            case "<=":
              if (compareValue <= this.Filters[i][1]) {
                filter_test = true;
              }
              break;
            }
          } else if (qx.lang.Array.contains(this.betweenAllowed, this.Filters[i][0]) && filter_test === false) {
            compareValue = this.getValueById(this.Filters[i][3], row);

            switch(this.Filters[i][0]) {

              case "between":
                if (compareValue >= this.Filters[i][1] && compareValue <= this.Filters[i][2]) {
                  filter_test = true;
                }
                break;

              case "!between":
                if (compareValue < this.Filters[i][1] || compareValue > this.Filters[i][2]) {
                  filter_test = true;
                }
                break;
            }
          } else if (this.Filters[i][0] == "regex" && filter_test === false) {
            compareValue = this.getValueById(this.Filters[i][2], row);

            var the_pattern = new RegExp(this.Filters[i][1], this.Filters[i][3]);
            filter_test = the_pattern.test(compareValue);
          } else if (this.Filters[i][0] == "notregex" && filter_test === false) {
            compareValue = this.getValueById(this.Filters[i][2], row);

            var the_pattern = new RegExp(this.Filters[i][1], this.Filters[i][3]);
            filter_test = !the_pattern.test(compareValue);
          }
        }

        // instead of hiding a single row, push it into the hiding-store for later hiding.
        if (filter_test === true) {
          rowsToHide.push(row);
        }
      }

      var rowsToHideLength = rowsToHide.length;

      var rowArr = this.getData();

      if (!this.__applyingFilters) {
        this.__fullArr = rowArr.slice(0);
        this.__applyingFilters = true;
      }

      rowArr = rowArr.filter(function(obj, index) {
        return !qx.lang.Array.contains(rowsToHide, index);
      });

      this.__rowArr = qx.lang.Array.clone(rowArr);

      var data = {
        firstRow    : 0,
        lastRow     : this.getData().length - 1,
        firstColumn : 0,
        lastColumn  : this.getColumnCount() - 1
      };

      // Inform the listeners
      this.fireDataEvent("dataChanged", data);
    },


    /**
     * Hides a specified number of rows.
     *
     * @param rowNum {Integer}
     *    Index of the first row to be hidden in the table.
     *
     * @param numOfRows {Integer}
     *    The number of rows to be hidden sequentially after rowNum.
     *
     * @param dispatchEvent {Boolean?true} Whether a model change event should
     *    be fired.
     *
     */
    hideRows : function(rowNum, numOfRows, dispatchEvent)
    {
      var rowArr = this.getData();

      dispatchEvent = (dispatchEvent != null ? dispatchEvent : true);
      if (!this.__applyingFilters) {
        this.__fullArr = rowArr.slice(0);
        this.__applyingFilters = true;
      }

      if (!numOfRows) {
        numOfRows = 1;
      }

      for (var i = rowNum; i < (rowArr.length - numOfRows); ++i) {
        rowArr[i] = rowArr[i + numOfRows];
      }
      this.removeRows(i, numOfRows);

      // Inform the listeners
      if (dispatchEvent) {
        var data = {
          firstRow    : 0,
          lastRow     : rowArr.length - 1,
          firstColumn : 0,
          lastColumn  : this.getColumnCount() - 1
        };

        this.fireDataEvent("dataChanged", data);
      }
    },


    /**
     * Return the table to the original state with all rows shown and clears
     * all filters.
     *
     */
    resetHiddenRows : function()
    {
      if (!this.__fullArr) {
        // nothing to reset
        return;
      }
      this.Filters = [];

      this.setData(qx.lang.Array.clone(this.__fullArr));
    }
  },


  destruct : function()
  {
    this.__rowArr = this.__editableColArr = this.__sortMethods =
      this.__sortableColArr = null;

    this.__fullArr = this.numericAllowed = this.betweenAllowed =
      this.Filters = null;
  }
});
