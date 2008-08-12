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
 * Provides information about locale-dependend string formatting (like quotation
 * signs).
 */

qx.Class.define("qx.locale.String",
{
  statics :
  {
    /**
     * Get quotation start sign
     *
     * @param locale {String} optional locale to be used
     * @return {String} quotation start sign
     */
    getQuotationStart : function(locale) {
      return qx.locale.Manager.getInstance().localize("cldr_quotationStart", [], locale);
    },


    /**
     * Get quotation end sign
     *
     * @param locale {String} optional locale to be used
     * @return {String} quotation end sign
     */
    getQuotationEnd : function(locale) {
      return qx.locale.Manager.getInstance().localize("cldr_quotationEnd", [], locale)
    },


    /**
     * Get quotation alternative start sign
     *
     * @param locale {String} optional locale to be used
     * @return {String} alternative quotation start sign
     */
    getAlternateQuotationStart : function(locale) {
      return qx.locale.Manager.getInstance().localize("cldr_alternateQuotationStart", [], locale)
    },


    /**
     * Get quotation alternative end sign
     *
     * @param locale {String} optional locale to be used
     * @return {String} alternative quotation end sign
     */
    getAlternateQuotationEnd : function(locale) {
      return qx.locale.Manager.getInstance().localize("cldr_alternateQuotationEnd", [], locale)
    }
  }
});
