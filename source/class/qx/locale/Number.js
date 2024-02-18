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
 * @cldr()
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
      locale = locale.replace("_", "-");
      const f = new Intl.NumberFormat(locale);
      const value = f.format(1.1).charAt(1);
      return new qx.locale.LocalizedString(
        value,
        "cldr_number_decimal_separator"
      );
    },

    /**
     * Get thousand grouping separator for number formatting
     *
     * @param locale {String} optional locale to be used
     * @return {String} group separator.
     */
    getGroupSeparator(locale) {
      locale = locale.replace("_", "-");
      const f = new Intl.NumberFormat(locale);
      const value = f.format(1000).charAt(1);
      return new qx.locale.LocalizedString(
        value,
        "cldr_number_group_separator"
      );
    },

    /**
     * Get percent format string
     *
     * @param locale {String} optional locale to be used
     * @return {String} percent format string.
     */
    getPercentFormat(locale) {
      return qx.locale.Manager.getInstance().localize(
        "cldr_number_percent_format",
        [],
        locale
      );
    }
  }
});
