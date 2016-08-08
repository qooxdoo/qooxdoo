/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * This class contains the translation of a message and all information
 * to translate it again into a different language.
 */
qx.Class.define("qx.locale.LocalizedString",
{
  extend : qx.type.BaseString,

  /**
   * @param translation {String} The translated message
   * @param messageId {String} The messageId to translate
   * @param args {Array} list of arguments passed used as values for format strings
   */
  construct : function(translation, messageId, args)
  {
    this.base(arguments, translation);

    this.__messageId = messageId;
    this.__args = args;
  },

  members :
  {

    __messageId : null,
    __args : null,

    /**
     * Get a translation of the string using the current locale.
     *
     * @return {LocalizedString} This string translated using the current
     *    locale.
     */
    translate : function() {
      return qx.locale.Manager.getInstance().translate(this.__messageId, this.__args);
    },

    /**
     * Returns the messageId.
     *
     * @return {String} The messageId of this localized String
     */
    getMessageId : function() {
      return this.__messageId;
    }
  }
});