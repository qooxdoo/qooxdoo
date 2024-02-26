/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Provides information about locale-dependent number formatting (like the decimal
 * separator).
 *
 * @ignore(Intl.NumberFormat)
 */

qx.Class.define("qx.locale.Number", {
  statics: {
    /**
     * Get decimal separator for number formatting
     *
     * @param locale {String} optional locale to be used
     * @return {String} decimal separator.
     */
    getDecimalSeparator(locale) {
      locale = this.__transformLocale(locale);
      const f = new Intl.NumberFormat(locale);
      const value = f.format(1.1).charAt(1);
      return new qx.locale.LocalizedString(
        value,
        "cldr_number_decimal_separator",
        [],
        true
      );
    },

    /**
     * Get thousand grouping separator for number formatting
     *
     * @param locale {String} optional locale to be used
     * @return {String} group separator.
     */
    getGroupSeparator(locale) {
      locale = this.__transformLocale(locale);
      const f = new Intl.NumberFormat(locale);
      const value = f.format(1000).charAt(1);
      return new qx.locale.LocalizedString(
        value,
        "cldr_number_group_separator",
        [],
        true
      );
    },

    /**
     * Get percent format string
     *
     * @param locale {String} optional locale to be used
     * @return {String} percent format string.
     */
    getPercentFormat(locale) {
      locale = this.__transformLocale(locale);

      var n = 0.00001;

      var option = {
        style: 'percent',
        minimumFractionDigits: 3,
        maximumFractionDigits: 3
      };

      var formatter = new Intl.NumberFormat(locale, option);
      var parts = formatter.formatToParts(n);

      var result = [];

      for (var part of parts){
        var t = part.type;
        var value = part.value;
        if (t === "decimal" || t === "percentSign" || t === "literal"){
          result.push(value);
        } else if (t === "integer"){
          result.push("#".repeat(value.length));
        } else if (t === "fraction"){
          result.push("#".repeat(value.length - 1));
          result.push("0");
        }
      }

      return new qx.locale.LocalizedString(
        result.join(""),
        "cldr_number_percent_format",
        [],
        true
      );
    },

    __transformLocale(locale) {
      if (locale === "C") {
        return "en";
      }
      return locale.replace("_", "-");
    }
  }
});
