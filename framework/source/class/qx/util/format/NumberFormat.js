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
 * A formatter and parser for numbers.
 * 
 * NOTE: Instances of this class must be disposed of after use
 *
 */
qx.Class.define("qx.util.format.NumberFormat",
{
  extend : qx.core.Object,
  implement : [ qx.util.format.IFormat, qx.core.IDisposable ],


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param locale {String} optional locale to be used
   * @throws {Error} If the argument is not a string.
   */
  construct : function(locale)
  {
    this.base(arguments);

    if (arguments.length > 0) {
      if (arguments.length === 1) {
        if (qx.lang.Type.isString(locale)) {
          this.setLocale(locale);
        } else {
          throw new Error("Wrong argument type. String is expected.");
        }
      } else {
        throw new Error("Wrong number of arguments.");
      }
    }

    if (!locale) {
      this.setLocale(qx.locale.Manager.getInstance().getLocale());
      if (qx.core.Environment.get("qx.dynlocale")) {
        qx.locale.Manager.getInstance().bind("locale", this, "locale");
      }
    }
  },


  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /**
     * The minimum number of integer digits (digits before the decimal separator).
     * Missing digits will be filled up with 0 ("19" -> "0019").
     */
    minimumIntegerDigits :
    {
      check : "Number",
      init : 0
    },


    /**
     * The maximum number of integer digits (superfluous digits will be cut off
     * ("1923" -> "23").
     */
    maximumIntegerDigits :
    {
      check : "Number",
      nullable : true
    },


    /**
     * The minimum number of fraction digits (digits after the decimal separator).
     * Missing digits will be filled up with 0 ("1.5" -> "1.500")
     */
    minimumFractionDigits :
    {
      check : "Number",
      init : 0
    },


    /**
     * The maximum number of fraction digits (digits after the decimal separator).
     * Superfluous digits will cause rounding ("1.8277" -> "1.83")
     */
    maximumFractionDigits :
    {
      check : "Number",
      nullable : true
    },


    /** Whether thousand groupings should be used {e.g. "1,432,234.65"}. */
    groupingUsed :
    {
      check : "Boolean",
      init : true
    },


    /** The prefix to put before the number {"EUR " -> "EUR 12.31"}. */
    prefix :
    {
      check : "String",
      init : "",
      event : "changeNumberFormat"
    },


    /** Sets the postfix to put after the number {" %" -> "56.13 %"}. */
    postfix :
    {
      check : "String",
      init : "",
      event : "changeNumberFormat"
    },

    /** Locale used */
    locale :
    {
      check : "String",
      init : null,
      event : "changeLocale"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {

    /**
     * Formats a number.
     *
     * @param num {Number} the number to format.
     * @return {String} the formatted number as a string.
     */
    format : function(num)
    {
      // handle special cases
      if (isNaN(num)) {
        return "NaN";
      }

      switch (num) {
        case Infinity:
          return "Infinity";

        case -Infinity:
          return "-Infinity";
      }

      var negative = (num < 0);

      if (negative) {
        num = -num;
      }

      if (this.getMaximumFractionDigits() != null)
      {
        // Do the rounding
        var mover = Math.pow(10, this.getMaximumFractionDigits());
        num = Math.round(num * mover) / mover;
      }

      var integerDigits = String(Math.floor(num)).length;

      var numStr = "" + num;

      // Prepare the integer part
      var integerStr = numStr.substring(0, integerDigits);

      while (integerStr.length < this.getMinimumIntegerDigits()) {
        integerStr = "0" + integerStr;
      }

      if (this.getMaximumIntegerDigits() != null && integerStr.length > this.getMaximumIntegerDigits())
      {
        // NOTE: We cut off even though we did rounding before, because there
        //     may be rounding errors ("12.24000000000001" -> "12.24")
        integerStr = integerStr.substring(integerStr.length - this.getMaximumIntegerDigits());
      }

      // Prepare the fraction part
      var fractionStr = numStr.substring(integerDigits + 1);

      while (fractionStr.length < this.getMinimumFractionDigits()) {
        fractionStr += "0";
      }

      if (this.getMaximumFractionDigits() != null && fractionStr.length > this.getMaximumFractionDigits())
      {
        // We have already rounded -> Just cut off the rest
        fractionStr = fractionStr.substring(0, this.getMaximumFractionDigits());
      }

      // Add the thousand groupings
      if (this.getGroupingUsed())
      {
        var origIntegerStr = integerStr;
        integerStr = "";
        var groupPos;

        for (groupPos=origIntegerStr.length; groupPos>3; groupPos-=3) {
          integerStr = "" + qx.locale.Number.getGroupSeparator(this.getLocale()) + origIntegerStr.substring(groupPos - 3, groupPos) + integerStr;
        }

        integerStr = origIntegerStr.substring(0, groupPos) + integerStr;
      }

      // Workaround: prefix and postfix are null even their defaultValue is "" and
      //             allowNull is set to false?!?
      var prefix = this.getPrefix() ? this.getPrefix() : "";
      var postfix = this.getPostfix() ? this.getPostfix() : "";

      // Assemble the number
      var str = prefix + (negative ? "-" : "") + integerStr;

      if (fractionStr.length > 0) {
        str += "" + qx.locale.Number.getDecimalSeparator(this.getLocale()) + fractionStr;
      }

      str += postfix;

      return str;
    },


    /**
     * Parses a number.
     *
     * @param str {String} the string to parse.
     * @return {Double} the number.
     * @throws {Error} If the number string does not match the number format.
     */
    parse : function(str)
    {
      // use the escaped separators for regexp
      var groupSepEsc = qx.lang.String.escapeRegexpChars(qx.locale.Number.getGroupSeparator(this.getLocale()) + "");
      var decimalSepEsc = qx.lang.String.escapeRegexpChars(qx.locale.Number.getDecimalSeparator(this.getLocale()) + "");

      var regex = new RegExp(
        "^(" +
        qx.lang.String.escapeRegexpChars(this.getPrefix()) +
        ')?([-+]){0,1}'+
        '([0-9]{1,3}(?:'+ groupSepEsc + '{0,1}[0-9]{3}){0,}){0,1}' +
        '(' + decimalSepEsc + '\\d+){0,1}(' +
        qx.lang.String.escapeRegexpChars(this.getPostfix()) +
        ")?$"
      );

      var hit = regex.exec(str);

      if (hit == null) {
        throw new Error("Number string '" + str + "' does not match the number format");
      }

      // hit[1] = potential prefix
      var negative = (hit[2] == "-");
      var integerStr = hit[3] || "0";
      var fractionStr = hit[4];
      // hit[5] = potential postfix

      // Remove the thousand groupings
      integerStr = integerStr.replace(new RegExp(groupSepEsc, "g"), "");

      var asStr = (negative ? "-" : "") + integerStr;

      if (fractionStr != null && fractionStr.length != 0)
      {
        // Remove the leading decimal separator from the fractions string
        fractionStr = fractionStr.replace(new RegExp(decimalSepEsc), "");
        asStr += "." + fractionStr;
      }

      return parseFloat(asStr);
    }
  },


  destruct: function() {
    if (qx.core.Environment.get("qx.dynlocale")) {
      qx.locale.Manager.getInstance().removeRelatedBindings(this);
    }
  }
});
