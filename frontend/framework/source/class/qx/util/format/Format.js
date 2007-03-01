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

/* ************************************************************************


************************************************************************ */

/**
 * Superclass for formatters and parsers.
 */
qx.Class.define("qx.util.format.Format",
{
  extend : qx.core.Object,
  type : "abstract",



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function() {
    this.base(arguments);
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Formats an object.
     *
     * @type member
     * @abstract
     * @param obj {var} The object to format.
     * @return {String} the formatted object.
     * @throws the abstract function warning.
     */
    format : function(obj) {
      throw new Error("format is abstract");
    },


    /**
     * Parses an object.
     *
     * @type member
     * @abstract
     * @param str {String} the string to parse.
     * @return {var} the parsed object.
     * @throws the abstract function warning.
     */
    parse : function(str) {
      throw new Error("parse is abstract");
    }
  }
});
