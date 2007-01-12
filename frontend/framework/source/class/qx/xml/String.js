/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2006 by STZ-IDA, Germany, http://www.stz-ida.de

   License:
     LGPL 2.1: http://www.gnu.org/licenses/lgpl.html

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#require(qx.lang.Object)

************************************************************************ */

/**
 * A Collection of utility functions to escape and unescape strings.
 */
qx.OO.defineClass("qx.xml.String");


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
 * @see #unescapeXml
 *
 * @param str {String} the String to escape
 * @return {String} a new escaped String
 */
qx.Class.escape = function(str) {
  return qx.dom.String.escapeEntities(
    str,
    qx.xml.Entity.FROM_CHARCODE
  );
};


/**
 * Unescapes a string containing XML entity escapes to a string
 * containing the actual Unicode characters corresponding to the
 * escapes.
 *
 * Supports only the four basic XML entities (gt, lt, quot, amp).
 * Does not support DTDs or external entities.
 *
 * @see #escapeXml
 *
 * @param str {String} the String to unescape
 * @return {String} a new unescaped String
 */
qx.Class.unescape = function(str) {
  return qx.dom.String.unescapeEntities(
    str,
    qx.xml.Entity.TO_CHARCODE
  );
};
