/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

qx.Class.define("qx.util.Normalization",
{
  statics :
  {
    __umlautsRegExp : new RegExp("[\xE4\xF6\xFC\xDF\xC4\xD6\xDC]", "g"),

    __umlautsShortData :
    {
      "\xC4" : "A",
      "\xD6" : "O",
      "\xDC" : "U",
      "\xE4" : "a",
      "\xF6" : "o",
      "\xFC" : "u",
      "\xDF" : "s"
    },


    /**
     * Private helper
     *
     * @type static
     * @param vChar {String} char to convert
     * @return {String} TODOC
     */
    __umlautsShort : function(vChar) {
      return qx.util.Normalization.__umlautsShortData[vChar];
    },


    /**
     * Converts (German) umlauts in the string to a one letter ASCI form.
     * Example: &Auml; -> A, &uuml; -> u, &szlig; -> s, ...
     *
     * @type static
     * @param vString {String} string to normalize
     * @return {String} normalized string
     */
    umlautsShort : function(vString) {
      return vString.replace(
        qx.util.Normalization.__umlautsRegExp,
        qx.lang.Function.bind(this.__umlautsShort, this)
      );
    },

    __umlautsLongData :
    {
      "\xC4" : "Ae",
      "\xD6" : "Oe",
      "\xDC" : "Ue",
      "\xE4" : "ae",
      "\xF6" : "oe",
      "\xFC" : "ue",
      "\xDF" : "ss"
    },


    /**
     * Private helper
     *
     * @type static
     * @param vChar {String} char to convert
     * @return {String} TODOC
     */
    __umlautsLong : function(vChar) {
      return qx.util.Normalization.__umlautsLongData[vChar];
    },


    /**
     * Converts (German) umlauts in the string to a two letter ASCI form.
     * Example: &Auml; -> Ae, &uuml; -> ue, &szlig; -> ss, ...
     *
     * @type static
     * @param vString {String} string to normalize
     * @return {String} normalized string
     */
    umlautsLong : function(vString) {
      return vString.replace(
        qx.util.Normalization.__umlautsRegExp,
        qx.lang.Function.bind(this.__umlautsLong, this)
      );
    }
  }
});
