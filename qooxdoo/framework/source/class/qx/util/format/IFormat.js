/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2006 STZ-IDA, Germany, http://www.stz-ida.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Til Schneider (til132)

************************************************************************ */

/**
 * Superclass for formatters and parsers.
 */
qx.Interface.define("qx.util.format.IFormat",
{

  members :
  {
    /**
     * Formats an object.
     *
     * @abstract
     * @param obj {var} The object to format.
     * @return {String} the formatted object.
     * @throws the abstract function warning.
     */
    format : function(obj) {},


    /**
     * Parses an object.
     *
     * @abstract
     * @param str {String} the string to parse.
     * @return {var} the parsed object.
     * @throws the abstract function warning.
     */
    parse : function(str) {}
  }
});
