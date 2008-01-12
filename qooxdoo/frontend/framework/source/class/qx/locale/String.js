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
 * Create a new instance of qx.locale.String
 */
qx.Class.define("qx.locale.String",
{
  statics :
  {
    /**
     * Get quotation start sign
     *
     * @type static
     * @param locale {String} optional locale to be used
     * @return {qx.locale.LocalizedString} quotation start sign
     */
    getQuotationStart : function(locale) {
      return new qx.locale.LocalizedString("cldr_quotationStart", [], locale);
    },


    /**
     * Get quotation end sign
     *
     * @type static
     * @param locale {String} optional locale to be used
     * @return {qx.locale.LocalizedString} quotation end sign
     */
    getQuotationEnd : function(locale) {
      return new qx.locale.LocalizedString("cldr_quotationEnd", [], locale);
    },


    /**
     * Get quotation alternative start sign
     *
     * @type static
     * @param locale {String} optional locale to be used
     * @return {qx.locale.LocalizedString} alternative quotation start sign
     */
    getAlternateQuotationStart : function(locale) {
      return new qx.locale.LocalizedString("cldr_alternateQuotationStart", [], locale);
    },


    /**
     * Get quotation alternative end sign
     *
     * @type static
     * @param locale {String} optional locale to be used
     * @return {qx.locale.LocalizedString} alternative quotation end sign
     */
    getAlternateQuotationEnd : function(locale) {
      return new qx.locale.LocalizedString("cldr_alternateQuotationEnd", [], locale);
    }
  }
});
