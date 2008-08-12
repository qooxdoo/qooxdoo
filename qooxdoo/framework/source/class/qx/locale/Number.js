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
 * Provides information about local-dependend number formatting (like the decimal
 * separator).
 */

qx.Class.define("qx.locale.Number",
{
  statics :
  {
    /**
     * Get deciaml separator for number formatting
     *
     * @param locale {String} optional locale to be used
     * @return {String} deciaml separator.
     */
    getDecimalSeparator : function(locale) {
      return qx.locale.Manager.getInstance().localize("cldr_number_decimal_separator", [], locale)
    },


    /**
     * Get thousand grouping separator for number formatting
     *
     * @param locale {String} optional locale to be used
     * @return {String} group separator.
     */
    getGroupSeparator : function(locale) {
      return qx.locale.Manager.getInstance().localize("cldr_number_group_separator", [], locale)
    },


    /**
     * Get percent format string
     *
     * @param locale {String} optional locale to be used
     * @return {String} percent format string.
     */
    getPercentFormat : function(locale) {
      return qx.locale.Manager.getInstance().localize("cldr_number_percent_format", [], locale)
    }
  }
});
