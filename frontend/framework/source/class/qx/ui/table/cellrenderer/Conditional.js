/* ************************************************************************

    qooxdoo - the new era of web development

    http://qooxdoo.org

    Copyright:
      2007 by Tartan Solutions, Inc, http://www.tartansolutions.com

    License:
      LGPL 2.1: http://www.gnu.org/licenses/lgpl.html

    Authors:
      * Dan Hummon

************************************************************************ */

/* ************************************************************************

#module(ui_table)
#require(qx.util.format.NumberFormat)

************************************************************************ */


qx.Class.define("qx.ui.table.cellrenderer.Conditional",
{
  extend : qx.ui.table.cellrenderer.Default,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param align {String}
   *   The default alignment to format the cell with if the condition matches.
   *
   * @param color {String}
   *   The default color to format the cell with if the condition matches.
   *
   * @param style {String}
   *   The default style to format the cell with if the condition matches.
   *
   * @param weight {String}
   *   The default weight to format the cell with if the condition matches.
   */
  construct : function(align, color, style, weight)
  {
    this.base(arguments);

    this.numericAllowed = new Array("==", "!=", ">", "<", ">=", "<=");
    this.betweenAllowed = new Array("between", "!between");
    this.Conditions = new Array();

    this._defaultTextAlign = (align != null ? align : "");
    this._defaultColor = (color != null ? color : "");
    this._defaultFontStyle = (style != null ? style : "");
    this._defaultFontWeight = (weight != null ? weight : "");
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    _apply_formatting : function(conditions, cond_num, style)
    {
      if (conditions[cond_num][1] != null) {
        style.textAlign = conditions[cond_num][1];
      }

      if (conditions[cond_num][2] != null) {
        style.color = conditions[cond_num][2];
      }

      if (conditions[cond_num][3] != null) {
        style.fontStyle = conditions[cond_num][3];
      }

      if (conditions[cond_num][4] != null) {
        style.fontWeight = conditions[cond_num][4];
      }
    },

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
     * The addNumericCondition method is used to add a basic numeric condition to
     * the cell renderer.
     *
     * Note: Passing null is different from passing an empty string in the align,
     * color, style and weight arguments. Null will allow pre-existing formatting
     * to pass through, where an empty string will clear it back to the default
     * formatting set in the constructor.
     *
     *
     * @type member
     * @param condition {String} The type of condition. Accepted strings are "==", "!=", ">", "<", ">=",
     *     and "<=".
     * @param value1 {Integer} The value to compare against.
     * @param align {String} The alignment to format the cell with if the condition matches.
     * @param color {String} The color to format the cell with if the condition matches.
     * @param style {String} The style to format the cell with if the condition matches.
     * @param weight {String} The weight to format the cell with if the condition matches.
     * @param target {String} The text value of the column to compare against. If this is null,
     *     comparisons will be against the contents of this cell.
     * @return {void}
     * @throws TODOC
     */
    addNumericCondition : function(condition, value1, align, color, style, weight, target)
    {
      var temp = null;

      if (this._js_in_array(condition, this.numericAllowed))
      {
        if (value1 != null) {
          temp = new Array(condition, align, color, style, weight, value1, target);
        }
      }

      if (temp != null) {
        this.Conditions.push(temp);
      } else {
        throw new Error("Condition not recognized or value is null!");
      }
    },


    /**
     * The addBetweenCondition method is used to add a between condition to the
     * cell renderer.
     *
     * Note: Passing null is different from passing an empty string in the align,
     * color, style and weight arguments. Null will allow pre-existing formatting
     * to pass through, where an empty string will clear it back to the default
     * formatting set in the constructor.
     *
     *
     * @type member
     * @param condition {String} The type of condition. Accepted strings are "between" and "!between".
     * @param value1 {Integer} The first value to compare against.
     * @param value2 {Integer} The second value to compare against.
     * @param align {String} The alignment to format the cell with if the condition matches.
     * @param color {String} The color to format the cell with if the condition matches.
     * @param style {String} The style to format the cell with if the condition matches.
     * @param weight {String} The weight to format the cell with if the condition matches.
     * @param target {String} The text value of the column to compare against. If this is null,
     *     comparisons will be against the contents of this cell.
     * @return {void}
     * @throws TODOC
     */
    addBetweenCondition : function(condition, value1, value2, align, color, style, weight, target)
    {
      if (this._js_in_array(condition, this.betweenAllowed))
      {
        if (value1 != null && value2 != null) {
          var temp = new Array(condition, align, color, style, weight, value1, value2, target);
        }
      }

      if (temp != null) {
        this.Conditions.push(temp);
      } else {
        throw new Error("Condition not recognized or value1/value2 is null!");
      }
    },


    /**
     * The addRegex method is used to add a regular expression condition to the
     * cell renderer.
     *
     * Note: Passing null is different from passing an empty string in the align,
     * color, style and weight arguments. Null will allow pre-existing formatting
     * to pass through, where an empty string will clear it back to the default
     * formatting set in the constructor.
     *
     *
     * @type member
     * @param regex {String} The regular expression to match against.
     * @param align {String} The alignment to format the cell with if the condition matches.
     * @param color {String} The color to format the cell with if the condition matches.
     * @param style {String} The style to format the cell with if the condition matches.
     * @param weight {String} The weight to format the cell with if the condition matches.
     * @param target {String} The text value of the column to compare against. If this is null,
     *     comparisons will be against the contents of this cell.
     * @return {void}
     * @throws TODOC
     */
    addRegex : function(regex, align, color, style, weight, target)
    {
      if (regex != null) {
        var temp = new Array("regex", align, color, style, weight, regex, target);
      }

      if (temp != null) {
        this.Conditions.push(temp);
      } else {
        throw new Error("regex cannot be null!");
      }
    },


    /**
     * Overridden; called whenever the cell updates. The cell will iterate through
     * each available condition and apply formatting for those that
     * match. Multiple conditions can match, but later conditions will override
     * earlier ones. Conditions with null values will stack with other conditions
     * that apply to that value.
     *
     * @type member
     * @param cellInfo {var} TODOC
     * @param cellElement {var} TODOC
     * @return {void}
     */
    updateDataCellElement : function(cellInfo, cellElement)
    {
      var style = cellElement.style;
      var tableModel = cellInfo.table.getTableModel();
      var i;
      var cond_test;
      var compareValue;

      style.textAlign = this._defaultTextAlign;
      style.color = this._defaultColor;
      style.fontStyle = this._defaultFontStyle;
      style.fontWeight = this._defaultFontWeight;

      for (i in this.Conditions)
      {
        cond_test = false;

        if (this._js_in_array(this.Conditions[i][0], this.numericAllowed))
        {
          if (this.Conditions[i][6] == null) {
            compareValue = cellInfo.value;
          } else {
            compareValue = tableModel.getValueById(this.Conditions[i][6], cellInfo.row);
          }

          switch(this.Conditions[i][0])
          {
            case "==":
              if (compareValue == this.Conditions[i][5]) {
                cond_test = true;
              }

              break;

            case "!=":
              if (compareValue != this.Conditions[i][5]) {
                cond_test = true;
              }

              break;

            case ">":
              if (compareValue > this.Conditions[i][5]) {
                cond_test = true;
              }

              break;

            case "<":
              if (compareValue < this.Conditions[i][5]) {
                cond_test = true;
              }

              break;

            case ">=":
              if (compareValue >= this.Conditions[i][5]) {
                cond_test = true;
              }

              break;

            case "<=":
              if (compareValue <= this.Conditions[i][5]) {
                cond_test = true;
              }

              break;
          }
        }
        else if (this._js_in_array(this.Conditions[i][0], this.betweenAllowed))
        {
          if (this.Conditions[i][7] == null) {
            compareValue = cellInfo.value;
          } else {
            compareValue = tableModel.getValueById(this.Conditions[i][7], cellInfo.row);
          }

          switch(this.Conditions[i][0])
          {
            case "between":
              if (compareValue >= this.Conditions[i][5] && compareValue <= this.Conditions[i][6]) {
                cond_test = true;
              }

              break;

            case "!between":
              if (compareValue < this.Conditions[i][5] && compareValue > this.Conditions[i][6]) {
                cond_test = true;
              }

              break;
          }
        }
        else if (this.Conditions[i][0] == "regex")
        {
          if (this.Conditions[i][6] == null) {
            compareValue = cellInfo.value;
          } else {
            compareValue = tableModel.getValueById(this.Conditions[i][6], cellInfo.row);
          }

          var the_pattern = new RegExp(this.Conditions[i][5], 'g');
          cond_test = the_pattern.test(compareValue);
        }

        // Apply formatting, if any.
        if (cond_test == true) {
          this._apply_formatting(this.Conditions, i, style);
        }
      }

      var textNode = cellElement.firstChild;

      if (textNode != null) {
        textNode.nodeValue = this._formatValue(cellInfo);
      } else {
        cellElement.innerHTML = qx.html.String.escape(this._formatValue(cellInfo));
      }
    }
  }
});
