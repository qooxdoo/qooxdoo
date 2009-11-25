/* ************************************************************************

    qooxdoo - the new era of web development

    http://qooxdoo.org

    Copyright:
      2007 by Tartan Solutions, Inc, http://www.tartansolutions.com

     License:
       LGPL: http://www.gnu.org/licenses/lgpl.html
       EPL: http://www.eclipse.org/org/documents/epl-v10.php
       See the LICENSE file in the project's top-level directory for details.

    Authors:
      * Dan Hummon

************************************************************************ */

/**
 * A filtered table model to provide support for hiding and filtering table
 * rows. Any rows that match any applied filters will be hidden.
 */
qx.Class.define("qx.ui.table.model.Filtered",
{
  extend : qx.ui.table.model.Simple,


  construct : function()
  {
    this.base(arguments);

    this.numericAllowed = new Array("==", "!=", ">", "<", ">=", "<=");
    this.betweenAllowed = new Array("between", "!between");
    this.__applyingFilters = false;
    this.Filters = new Array();

  },


  members :
  {
    __fullArr : null,
    __applyingFilters : null,


    /**
     * Whether the given string (needle) is in the array (haystack)
     *
     * @param the_needle {String} String to search
     * @param the_haystack {Array} Array, which should be searched
     * @return {Boolean} whether the search string was found.
     */
    _js_in_array : function(the_needle, the_haystack)
    {
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
     * @return {void}
     *
     * @throws {Error} If the filter can not recognized or one of the values
     * is null.
     */
    addBetweenFilter : function(filter, value1, value2, target)
    {
      if (this._js_in_array(filter, this.betweenAllowed) && target != null)
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
     * @return {void}
     *
     * @throws {Error} If the filter can not recognized or the target is null.
     */
    addNumericFilter : function(filter, value1, target)
    {
      var temp = null;

      if (this._js_in_array(filter, this.numericAllowed) && target != null)
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
     * @param ignorecase {boolean}
     *    If true, the regular expression will ignore case.
     *
     * @return {void}
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
     * @param ignorecase {boolean}
     *    If true, the regular expression will ignore case.
     *
     * @return {void}
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
      for (var row = 0; row<rowLength;row++)
      {
        filter_test = false;
        for (i in this.Filters)
        {

          if (this._js_in_array(this.Filters[i][0],
                                this.numericAllowed) &&
              filter_test == false)
          {
            compareValue = this.getValueById(this.Filters[i][2], row);
            switch(this.Filters[i][0])
            {
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
          }
          else if (this._js_in_array(this.Filters[i][0],
                                     this.betweenAllowed) &&
                   filter_test == false)
          {
            compareValue = this.getValueById(this.Filters[i][3], row);

            switch(this.Filters[i][0])
            {
            case "between":
              if (compareValue >= this.Filters[i][1] &&
                  compareValue <= this.Filters[i][2]) {
                filter_test = true;
              }

              break;

            case "!between":
              if (compareValue < this.Filters[i][1] &&
                  compareValue > this.Filters[i][2]) {
                filter_test = true;
              }

              break;
            }
          }
          else if (this.Filters[i][0] == "regex" && filter_test == false)
          {
            compareValue = this.getValueById(this.Filters[i][2], row);

            var the_pattern = new RegExp(this.Filters[i][1], this.Filters[i][3]);
            filter_test = the_pattern.test(compareValue);
          }
          else if (this.Filters[i][0] == "notregex" && filter_test == false)
          {
            compareValue = this.getValueById(this.Filters[i][2], row);

            var the_pattern = new RegExp(this.Filters[i][1], this.Filters[i][3]);
            filter_test = !the_pattern.test(compareValue);
          }
        }

        // Hide row if necessary.
        if (filter_test == true) {
          this.hideRows(row, 1, false);
          row--;
          rowLength--;
        }
      }

      var data =
      {
        firstRow    : 0,
        lastRow     : rowLength - 1,
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
     * @return {void}
     */
    hideRows : function(rowNum, numOfRows, dispatchEvent)
    {
      var rowArr = this.getData();

      dispatchEvent = (dispatchEvent != null ? dispatchEvent : true);
      if (!this.__applyingFilters) {
        this.__fullArr = rowArr.slice(0);
        this.__applyingFilters = true;
      }

      if (numOfRows == null || numOfRows < 1) {
        numOfRows = 1;
      }

      for (var kludge = rowNum;
           kludge<(rowArr.length - numOfRows);
           kludge++) {
        rowArr[kludge] = rowArr[kludge + numOfRows];
      }
      this.removeRows(kludge, numOfRows);

      // Inform the listeners
      if (dispatchEvent)
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
    },


    /**
     * Return the table to the original state with all rows shown and clears
     * all filters.
     *
     * @return {void}
     */
    resetHiddenRows : function()
    {
      if (!this.__fullArr) {
        // nothing to reset
        return;
      }
      this.Filters = [];

      this.setData(qx.lang.Array.clone(this.__fullArr));
    },


    // overridden
    setData : function(rowArr, clearSorting)
    {
      this.__fullArr = qx.lang.Array.clone(rowArr);
      this.Filters = [];
      this.base(arguments, rowArr, clearSorting);
    }
  },


  destruct : function()
  {
    this.__fullArr = this.numericAllowed = this.betweenAllowed =
      this.Filters = null;
  }
});
