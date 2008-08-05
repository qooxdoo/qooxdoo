/* ************************************************************************

    qooxdoo - the new era of web development

    http://qooxdoo.org

    Copyright:
      2007 by Tartan Solutions, Inc, http://www.tartansolutions.com

    License:
      LGPL 2.1: http://www.gnu.org/licenses/lgpl.html
      EPL: http://www.eclipse.org/org/documents/epl-v10.php

    Authors:
      * Dan Hummon

************************************************************************ */

/* ************************************************************************

#module(ui_table)
#require(qx.util.format.NumberFormat)

************************************************************************ */


qx.Class.define("qx.legacy.ui.table.cellrenderer.Conditional",
{
  extend : qx.legacy.ui.table.cellrenderer.Default,




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

    this.numericAllowed = ["==", "!=", ">", "<", ">=", "<="];
    this.betweenAllowed = ["between", "!between"];
    this.conditions = [];

    this._defaultTextAlign = align || "";
    this._defaultColor = color || "";
    this._defaultFontStyle = style || "";
    this._defaultFontWeight = weight || "";
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {

    /**
     * Applies the cell styles to the style map.
     * @param condition {Array} The matched condition
     * @param style {Map} map of already applied styles.
     */
    __applyFormatting : function(condition, style)
    {
      if (condition[1] != null) {
        style["text-align"] = condition[1];
      }

      if (condition[2] != null) {
        style["color"] = condition[2];
      }

      if (condition[3] != null) {
        style["font-style"] = condition[3];
      }

      if (condition[4] != null) {
        style["font-weight"] = condition[4];
      }
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
     * @param condition {String} The type of condition. Accepted strings are "==", "!=", ">", "<", ">=",
     *     and "<=".
     * @param value1 {Integer} The value to compare against.
     * @param align {String} The alignment to format the cell with if the condition matches.
     * @param color {String} The color to format the cell with if the condition matches.
     * @param style {String} The style to format the cell with if the condition matches.
     * @param weight {String} The weight to format the cell with if the condition matches.
     * @param target {String} The text value of the column to compare against. If this is null,
     *     comparisons will be against the contents of this cell.
     */
    addNumericCondition : function(condition, value1, align, color, style, weight, target)
    {
      var temp = null;

      if (qx.lang.Array.contains(this.numericAllowed, condition))
      {
        if (value1 != null) {
          temp = [condition, align, color, style, weight, value1, target];
        }
      }

      if (temp != null) {
        this.conditions.push(temp);
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
      if (qx.lang.Array.contains(this.betweenAllowed, condition))
      {
        if (value1 != null && value2 != null) {
          var temp = [condition, align, color, style, weight, value1, value2, target];
        }
      }

      if (temp != null) {
        this.conditions.push(temp);
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
     * @param regex {String} The regular expression to match against.
     * @param align {String} The alignment to format the cell with if the condition matches.
     * @param color {String} The color to format the cell with if the condition matches.
     * @param style {String} The style to format the cell with if the condition matches.
     * @param weight {String} The weight to format the cell with if the condition matches.
     * @param target {String} The text value of the column to compare against. If this is null,
     *     comparisons will be against the contents of this cell.
     */
    addRegex : function(regex, align, color, style, weight, target)
    {
      if (regex != null) {
        var temp = ["regex", align, color, style, weight, regex, target];
      }

      if (temp != null) {
        this.conditions.push(temp);
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
     * @param cellInfo {Map} The information about the cell.
     *          See {@link #createDataCellHtml}.
     * @return {Map}
     */
    _getCellStyle : function(cellInfo)
    {
      if (!this.conditions.length)
        return cellInfo.style || "";

      var tableModel = cellInfo.table.getTableModel();
      var i;
      var cond_test;
      var compareValue;

      var style =
      {
        "text-align": this._defaultTextAlign,
        "color": this._defaultColor,
        "font-style": this._defaultFontStyle,
        "font-weight": this._defaultFontWeight
      };

      for (i in this.conditions)
      {
        cond_test = false;

        if (qx.lang.Array.contains(this.numericAllowed, this.conditions[i][0]))
        {
          if (this.conditions[i][6] == null) {
            compareValue = cellInfo.value;
          } else {
            compareValue = tableModel.getValueById(this.conditions[i][6], cellInfo.row);
          }

          switch(this.conditions[i][0])
          {
            case "==":
              if (compareValue == this.conditions[i][5]) {
                cond_test = true;
              }

              break;

            case "!=":
              if (compareValue != this.conditions[i][5]) {
                cond_test = true;
              }

              break;

            case ">":
              if (compareValue > this.conditions[i][5]) {
                cond_test = true;
              }

              break;

            case "<":
              if (compareValue < this.conditions[i][5]) {
                cond_test = true;
              }

              break;

            case ">=":
              if (compareValue >= this.conditions[i][5]) {
                cond_test = true;
              }

              break;

            case "<=":
              if (compareValue <= this.conditions[i][5]) {
                cond_test = true;
              }

              break;
          }
        }
        else if (qx.lang.Array.contains(this.betweenAllowed, this.conditions[i][0]))
        {
          if (this.conditions[i][7] == null) {
            compareValue = cellInfo.value;
          } else {
            compareValue = tableModel.getValueById(this.conditions[i][7], cellInfo.row);
          }

          switch(this.conditions[i][0])
          {
            case "between":
              if (compareValue >= this.conditions[i][5] && compareValue <= this.conditions[i][6]) {
                cond_test = true;
              }

              break;

            case "!between":
              if (compareValue < this.conditions[i][5] && compareValue > this.conditions[i][6]) {
                cond_test = true;
              }

              break;
          }
        }
        else if (this.conditions[i][0] == "regex")
        {
          if (this.conditions[i][6] == null) {
            compareValue = cellInfo.value;
          } else {
            compareValue = tableModel.getValueById(this.conditions[i][6], cellInfo.row);
          }

          var the_pattern = new RegExp(this.conditions[i][5], 'g');
          cond_test = the_pattern.test(compareValue);
        }

        // Apply formatting, if any.
        if (cond_test == true) {
          this.__applyFormatting(this.conditions[i], style);
        }
      }

      var styleString = [];
      for(var key in style) {
        if (style[key]) {
          styleString.push(key, ":", style[key], ";");
        }
      }
      return styleString.join("");
    }
  }
});
