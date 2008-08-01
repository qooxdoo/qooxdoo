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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Escaping and unescaping of XML strings.
 */
qx.Bootstrap.define("qx.xml.String",
{
  statics :
  {
    /** Mapping of XML entity names to the corresponding char code */
    TO_CHARCODE :
    {
      "quot" : 34, // " - double-quote
      "amp"  : 38, // &
      "lt"   : 60, // <
      "gt"   : 62, // >
      "apos" : 39 // XML apostrophe
    },

    /** Mapping of char codes to XML entity names */
    FROM_CHARCODE :
    {
      34: "quot", // " - double-quote
      38: "amp",  // &
      60: "lt",   // <
      62: "gt",   // >
      39: "apos"  // XML apostrophe
    },


    /**
     * Escapes the characters in a <code>String</code> using XML entities.
     *
     * For example: <tt>"bread" & "butter"</tt> =>
     * <tt>&amp;quot;bread&amp;quot; &amp;amp; &amp;quot;butter&amp;quot;</tt>.
     *
     * Supports only the four basic XML entities (gt, lt, quot, amp).
     * Does not support DTDs or external entities.
     * Note that unicode characters greater than 0x7f are currently escaped to their numerical \\u equivalent.
     *
     * @param str {String} the string to be escaped
     * @return {String} the escaped string
     */
    escape : function(str) {
      return qx.util.StringEscape.escape(str, this.FROM_CHARCODE);
    },


    /**
     * Unescapes a string containing XML entity escapes to a string
     * containing the actual Unicode characters corresponding to the
     * escapes.
     *
     * Supports only the four basic XML entities (gt, lt, quot, amp).
     * Does not support DTDs or external entities.
     *
     * @param str {String} the string to be unescaped
     * @return {String} the unescaped string
     */
    unescape : function(str) {
      return qx.util.StringEscape.unescape(str, this.TO_CHARCODE);
    }
  }
});
