/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Create a new instance of qx.locale.Number
 */
qx.Class.define("qx.locale.Number",
{
  statics :
  {
    /**
     * Get deciaml separator for number formatting
     *
     * @type static
     * @param locale {String} optional locale to be used
     * @return {qx.locale.LocalizedString} deciaml separator.
     */
    getDecimalSeparator : function(locale) {
      return new qx.locale.LocalizedString("cldr_number_decimal_separator", [], locale);
    },


    /**
     * Get thousand grouping separator for number formatting
     *
     * @type static
     * @param locale {String} optional locale to be used
     * @return {qx.locale.LocalizedString} group separator.
     */
    getGroupSeparator : function(locale) {
      return new qx.locale.LocalizedString("cldr_number_group_separator", [], locale);
    },


    /**
     * Get percent format string
     *
     * @type static
     * @param locale {String} optional locale to be used
     * @return {qx.locale.LocalizedString} percent format string.
     */
    getPercentFormat : function(locale) {
      return new qx.locale.LocalizedString("cldr_number_percent_format", [], locale);
    }
  }
});
