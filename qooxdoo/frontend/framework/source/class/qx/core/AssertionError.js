/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Assertion errors are thrown if an assertion in {@link qx.core.Assertion}
 * fails.
 */
qx.Class.define("qx.core.AssertionError",
{
  extend : Error,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param comment {String} Comment passed to the assertion call
   * @param failMessage {String} Fail message provided by the assertion
   */
  construct : function(comment, failMessage)
  {
    Error.call(this, failMessage);

    this._comment = comment || "";
    this._msg = failMessage || "";

    this._trace = qx.dev.StackTrace.getStackTrace();
  },



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Comment passed to the assertion call
     *
     * @return {String} The comment passed to the assertion call
     */
    getComment : function() {
      return this._comment;
    },


    /**
     *  Fail message provided by the assertion
     *
     *  @return {String} Fail message provided by the assertion
     */
    message : function() {
      return this._msg;
    },


    /**
     * Get the error message
     *
     * @return {String} The error message
     */
    toString : function() {
      return this._comment + ": " + this._msg;
    },


    /**
     * Stack trace of the error
     *
     * @return {String[]} The stack trace of the location the exception was thrown
     */
    getStackTrace : function() {
      return this._trace;
    }
  }
});
