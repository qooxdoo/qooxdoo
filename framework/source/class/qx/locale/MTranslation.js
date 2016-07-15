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
 * This mixin contains the methods needed to use the translation features
 * of qooxdoo.
 *
 * @ignore(qx.locale.Manager)
 */
qx.Mixin.define("qx.locale.MTranslation",
{
  members:
  {
    /**
     * Translate a message
     * Mark the message for translation.
     *
     * @param messageId {String} message id (may contain format strings)
     * @param varargs {Object} variable number of arguments applied to the format string
     * @return {String | LocalizedString} The translated message or localized string
     */
    tr : function(messageId, varargs)
    {
      var nlsManager = qx.locale.Manager;
      if (nlsManager) {
        return nlsManager.tr.apply(nlsManager, arguments);
      }

      throw new Error("To enable localization please include qx.locale.Manager into your build!");
    },


    /**
     * Translate a plural message
     * Mark the messages for translation.
     *
     * Depending on the third argument the plural or the singular form is chosen.
     *
     * @param singularMessageId {String} message id of the singular form (may contain format strings)
     * @param pluralMessageId {String} message id of the plural form (may contain format strings)
     * @param count {Integer} if greater than 1 the plural form otherwise the singular form is returned.
     * @param varargs {Object} variable number of arguments applied to the format string
     * @return {String | LocalizedString} The translated message or localized string
     */
    trn : function(singularMessageId, pluralMessageId, count, varargs)
    {
      var nlsManager = qx.locale.Manager;
      if (nlsManager) {
        return nlsManager.trn.apply(nlsManager, arguments);
      }

      throw new Error("To enable localization please include qx.locale.Manager into your build!");
    },


    /**
     * Translate a message with translation hint
     * Mark the messages for translation.
     *
     * @param hint {String} hint for the translator of the message. Will be included in the .po file.
     * @param messageId {String} message id (may contain format strings)
     * @param varargs {Object} variable number of arguments applied to the format string
     * @return {String | LocalizedString} The translated message or localized string
     */
    trc : function(hint, messageId, varargs)
    {
      var nlsManager = qx.locale.Manager;
      if (nlsManager) {
        return nlsManager.trc.apply(nlsManager, arguments);
      }

      throw new Error("To enable localization please include qx.locale.Manager into your build!");
    },


    /**
     * Translate a plural message with translation hint
     * Mark the messages for translation.
     *
     * Depending on the third argument the plural or the singular form is chosen.
     *
     * @param hint {String} hint for the translator of the message. Will be included in the .po file.
     * @param singularMessageId {String} message id of the singular form (may contain format strings)
     * @param pluralMessageId {String} message id of the plural form (may contain format strings)
     * @param count {Integer} if greater than 1 the plural form otherwise the singular form is returned.
     * @param varargs {Object} variable number of arguments applied to the format string
     * @return {String | LocalizedString} The translated message or localized string
     */
    trnc : function(hint, singularMessageId, pluralMessageId, count, varargs)
    {
      var nlsManager = qx.locale.Manager;
      if (nlsManager) {
        return nlsManager.trnc.apply(nlsManager, arguments);
      }

      throw new Error("To enable localization please include qx.locale.Manager into your build!");
    },


    /**
     * Mark the message for translation but return the original message.
     *
     * @param messageId {String} the message ID
     * @return {String} messageId
     */
    marktr : function(messageId)
    {
      var nlsManager = qx.locale.Manager;
      if (nlsManager) {
        return nlsManager.marktr.apply(nlsManager, arguments);
      }

      throw new Error("To enable localization please include qx.locale.Manager into your build!");
    }
  }
});
