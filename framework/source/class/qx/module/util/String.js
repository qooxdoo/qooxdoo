/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)

************************************************************************ */
/**
 * Utility module to give some support to work with strings.
 */
qx.Bootstrap.define("qx.module.util.String", {
  statics : {
    /**
     * Converts a hyphenated string (separated by '-') to camel case.
     *
     * Example:
     * <pre class='javascript'>q.string.camelCase("I-like-cookies"); //returns "ILikeCookies"</pre>
     * The implementation does not force a lowerCamelCase or upperCamelCase version.
     * The first letter of the parameter keeps its case.
     *
     * @attachStatic {q, string.camelCase}
     * @param str {String} hyphenated string
     * @return {String} camelcase string
     */
    camelCase : function(str) {
      return qx.lang.String.camelCase.call(qx.lang.String, str);
    },


    /**
     * Converts a camelcased string to a hyphenated (separated by '-') string.
     *
     * Example:
     * <pre class='javascript'>q.string.hyphenate("ILikeCookies"); //returns "I-like-cookies"</pre>
     * The implementation does not force a lowerCamelCase or upperCamelCase version.
     * The first letter of the parameter keeps its case.
     *
     * @attachStatic {q, string.hyphenate}
     * @param str {String} camelcased string
     * @return {String} hyphenated string
     */
    hyphenate : function(str) {
      return qx.lang.String.hyphenate.call(qx.lang.String, str);
    },


    /**
     * Convert the first character of the string to upper case.
     *
     * @attachStatic {q, string.firstUp}
     * @signature function(str)
     * @param str {String} the string
     * @return {String} the string with an upper case first character
     */
    firstUp : qx.lang.String.firstUp,


    /**
     * Convert the first character of the string to lower case.
     *
     * @attachStatic {q, string.firstLow}
     * @signature function(str)
     * @param str {String} the string
     * @return {String} the string with a lower case first character
     */
    firstLow : qx.lang.String.firstLow,


    /**
     * Check whether the string starts with the given substring.
     *
     * @attachStatic {q, string.startsWith}
     * @signature function(fullstr, substr)
     * @param fullstr {String} the string to search in
     * @param substr {String} the substring to look for
     * @return {Boolean} whether the string starts with the given substring
     */
    startsWith : qx.lang.String.startsWith,


    /**
     * Check whether the string ends with the given substring.
     *
     * @attachStatic {q, string.endsWith}
     * @signature function(fullstr, substr)
     * @param fullstr {String} the string to search in
     * @param substr {String} the substring to look for
     * @return {Boolean} whether the string ends with the given substring
     */
    endsWith : qx.lang.String.endsWith,


    /**
     * Escapes all chars that have a special meaning in regular expressions.
     *
     * @attachStatic {q, string.escapeRegexpChars}
     * @signature function(str)
     * @param str {String} the string where to escape the chars.
     * @return {String} the string with the escaped chars.
     */
    escapeRegexpChars : qx.lang.String.escapeRegexpChars
  },


  defer : function(statics) {
    q.$attachStatic({
      string : {
        camelCase : statics.camelCase,
        hyphenate : statics.hyphenate,
        firstUp : statics.firstUp,
        firstLow : statics.firstLow,
        startsWith : statics.startsWith,
        endsWith : statics.endsWith,
        escapeRegexpChars : statics.escapeRegexpChars
      }
    });
  }
});
