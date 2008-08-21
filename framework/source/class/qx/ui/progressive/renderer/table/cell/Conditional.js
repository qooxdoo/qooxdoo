/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007 by Tartan Solutions, Inc, http://www.tartansolutions.com
     2008 Derrell Lipman

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Dan Hummon
     * Derrell Lipman (derrell)

************************************************************************ */

/* ************************************************************************

#module(ui_progressive)

************************************************************************ */

/**
 * Table Cell Renderer for Progressive.  EXPERIMENTAL!  INTERFACE MAY CHANGE.
 */
qx.Class.define("qx.ui.progressive.renderer.table.cell.Conditional",
{
  extend     : qx.ui.progressive.renderer.table.cell.Abstract,


  /**
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

    this.__numericAllowed =
      [
        "==",
        "!=",
        ">",
        "<",
        ">=",
        "<="
      ];

    this.__betweenAllowed =
      [
        "between",
        "!between"
      ];

    this.__conditions = [ ];

    this.__defaultTextAlign = align || "";
    this.__defaultColor = color || "";
    this.__defaultFontStyle = style || "";
    this.__defaultFontWeight = weight || "";
  },



  members :
  {

    /**
     * Applies the cell styles to the style map.
     *
     * @param condition {Array}
     *   The matched condition
     *
     * @param style {Map}
     *   map of already applied styles.
     */
    __applyFormatting : function(condition, style)
    {
      if (condition.align)
      {
        style["text-align"] = condition.align;
      }

      if (condition.color)
      {
        style["color"] = condition.color;
      }

      if (condition.style)
      {
        style["font-style"] = condition.style;
      }

      if (condition.weight)
      {
        style["font-weight"] = condition.weight;
      }
    },


    /**
     * The addNumericCondition method is used to add a basic numeric condition
     * to the cell renderer.
     *
     * Note: Passing null is different from passing an empty string in the
     * align, color, style and weight arguments. Null will allow pre-existing
     * formatting to pass through, where an empty string will clear it back to
     * the default formatting set in the constructor.
     *
     *
     *
     * @param condition {String}
     *   The type of condition. Accepted strings are "==", "!=", ">", "<",
     *   ">=", and "<=".
     *
     * @param value1 {Integer}
     *   The value to compare against.
     *
     * @param align {String}
     *   The alignment to format the cell with if the condition matches.
     *
     * @param color {String}
     *   The color to format the cell with if the condition matches.
     *
     * @param style {String}
     *   The style to format the cell with if the condition matches.
     *
     * @param weight {String}
     *   The weight to format the cell with if the condition matches.
     *
     * @param target {String}
     *   The text value of the column to compare against. If this is null,
     *   comparisons will be against the contents of this cell.
     */
    addNumericCondition : function(condition, value1, align,
                                   color, style, weight, target)
    {
      if (! qx.lang.Array.contains(this.__numericAllowed, condition) ||
          value1 == null)
      {
        throw new Error("Condition not recognized or value is null!");
      }

      this.__conditions.push(
        {
          condition : condition,
          align     : align,
          color     : color,
          style     : style,
          weight    : weight,
          value1    : value1,
          target    :target
        });
    },


    /**
     * The addBetweenCondition method is used to add a between condition to
     * the cell renderer.
     *
     * Note: Passing null is different from passing an empty string in the
     * align, color, style and weight arguments. Null will allow pre-existing
     * formatting to pass through, where an empty string will clear it back to
     * the default formatting set in the constructor.
     *
     *
     *
     * @param condition {String}
     *   The type of condition. Accepted strings are "between" and "!between".
     *
     * @param value1 {Integer}
     *   The first value to compare against.
     *
     * @param value2 {Integer}
     *   The second value to compare against.
     *
     * @param align {String}
     *   The alignment to format the cell with if the condition matches.
     *
     * @param color {String}
     *   The color to format the cell with if the condition matches.
     *
     * @param style {String}
     *   The style to format the cell with if the condition matches.
     *
     * @param weight {String}
     *   The weight to format the cell with if the condition matches.
     *
     * @param target {String}
     *   The text value of the column to compare against. If this is null,
     *   comparisons will be against the contents of this cell.
     *
     * @return {void}
     *
     * @throws TODOC
     */
    addBetweenCondition : function(condition, value1, value2, align,
                                   color, style, weight, target)
    {
      if (! qx.lang.Array.contains(this.__betweenAllowed, condition) ||
          value1 == null ||
          value2 == null)
      {
        throw new Error("Condition not recognized or value1/value2 is null!");
      }

      this.__conditions.push(
        {
          condition : condition,
          align     : align,
          color     : color,
          style     : style,
          weight    : weight,
          value1    : value1,
          value2    : value2,
          target    : target
        });
    },


    /**
     * The addRegex method is used to add a regular expression condition to
     * the cell renderer.
     *
     * Note: Passing null is different from passing an empty string in the
     * align, color, style and weight arguments. Null will allow pre-existing
     * formatting to pass through, where an empty string will clear it back to
     * the default formatting set in the constructor.
     *
     *
     *
     * @param regex {String}
     *   The regular expression to match against.
     *
     * @param align {String}
     *   The alignment to format the cell with if the condition matches.
     *
     * @param color {String}
     *   The color to format the cell with if the condition matches.
     *
     * @param style {String}
     *   The style to format the cell with if the condition matches.
     *
     * @param weight {String}
     *   The weight to format the cell with if the condition matches.
     *
     * @param target {String}
     *   The text value of the column to compare against. If this is null,
     *   comparisons will be against the contents of this cell.
     */
    addRegex : function(regex, align, color, style, weight, target)
    {
      if (! regex)
      {
        throw new Error("regex cannot be null!");
      }

      this.__conditions.push(
        {
          condition : "regex",
          align     : align,
          color     : color,
          style     : style,
          weight    : weight,
          regex     : regex,
          target    : target
        });
    },


    /**
     * Overridden; called whenever the cell updates. The cell will iterate
     * through each available condition and apply formatting for those that
     * match. Multiple conditions can match, but later conditions will
     * override earlier ones. Conditions with null values will stack with
     * other conditions that apply to that value.
     *
     *
     * @param cellInfo {Map}
     *   The information about the cell.  See {@link #createDataCellHtml}.
     *
     * @return {Map}
     */
    _getCellStyle : function(cellInfo)
    {
      if (this.__conditions.length == 0)
      {
        return cellInfo.style || "";
      }

      var i;
      var bTestPassed;
      var compareValue;

      var style =
        {
          "text-align"  : this.__defaultTextAlign,
          "color"       : this.__defaultColor,
          "font-style"  : this.__defaultFontStyle,
          "font-weight" : this.__defaultFontWeight
        };

      for (i = 0; i < this.__conditions.length; i++)
      {
        var test = this.__conditions[i];

        bTestPassed = false;

        if (qx.lang.Array.contains(this.__numericAllowed, test.condition))
        {
          if (test.target == null)
          {
            compareValue = cellInfo.cellData;
          }
          else
          {
            compareValue = cellInfo.element.data[test.target];
          }

          switch(test.condition)
          {
          case "==":
            if (compareValue == test.value1)
            {
              bTestPassed = true;
            }

            break;

          case "!=":
            if (compareValue != test.value1)
            {
              bTestPassed = true;
            }

            break;

          case ">":
            if (compareValue > test.value1)
            {
              bTestPassed = true;
            }

            break;

          case "<":
            if (compareValue < test.value1)
            {
              bTestPassed = true;
            }

            break;

          case ">=":
            if (compareValue >= test.value1)
            {
              bTestPassed = true;
            }

            break;

          case "<=":
            if (compareValue <= test.value1)
            {
              bTestPassed = true;
            }

            break;
          }
        }
        else if (qx.lang.Array.contains(this.__betweenAllowed,
                                        test.condition))
        {
          if (test.target == null)
          {
            compareValue = cellInfo.cellData;
          }
          else
          {
            compareValue = cellInfo.element.data[test.target];
          }

          switch(test.condition)
          {
          case "between":
            if (compareValue >= test.value1 &&
                compareValue <= test.value2)
            {
              bTestPassed = true;
            }

            break;

          case "!between":
            if (compareValue < test.value1 &&
                compareValue > test.value2)
            {
              bTestPassed = true;
            }

            break;
          }
        }
        else if (test.condition == "regex")
        {
          if (test.target == null)
          {
            compareValue = cellInfo.cellData;
          }
          else
          {
            compareValue = cellInfo.element.data[test.target];
          }

          var the_pattern = new RegExp(test.value1, 'g');
          bTestPassed = the_pattern.test(compareValue);
        }

        // Apply formatting, if any.
        if (bTestPassed)
        {
          this.__applyFormatting(test, style);
        }

        var styleString = [];
        for(var key in style)
        {
          if (style[key])
          {
            styleString.push(key, ":", style[key], ";");
          }
        }
      }

      return styleString.join("");
    }
  },

  destruct : function()
  {
    this._disposeFields("__numericAllowed",
                        "__betweenAllowed",
                        "__conditions",
                        "__defaultTextAlign",
                        "__defaultColor",
                        "__defaultFontStyle",
                        "__defaultFontWeight");
  }
});
