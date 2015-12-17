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
 * This exception is thrown by the {@link qx.event.GlobalError} handler if a
 * <code>window.onerror</code> event occurs in the browser.
 */
qx.Bootstrap.define("qx.core.WindowError",
{
  extend : Error,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param failMessage {String} The error message
   * @param uri {String} URI where error was raised
   * @param lineNumber {Integer} The line number where the error was raised
   * @param columnNumber {Integer} The column where the error was raised
   * @param stack {String} Stack trace, where available
   */
  construct : function(failMessage, uri, lineNumber, columnNumber, stack)
  {
    var inst = Error.call(this, failMessage);
    // map stack trace properties since they're not added by Error's constructor
    if (inst.stack) {
      this.stack = inst.stack;
    }
    if (inst.stacktrace) {
      this.stacktrace = inst.stacktrace;
    }

    this.__failMessage = failMessage;
    this.__uri = uri || "";
    this.__lineNumber = lineNumber === undefined ? -1 : lineNumber;
    this.__columnNumber = columnNumber === undefined ? -1 : columnNumber;
    this.__stack = stack||null;
  },



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __failMessage : null,
    __uri : null,
    __lineNumber : null,
    __columnNumber : null,
    __stack : null,


    /**
     * Returns the error message.
     *
     * @return {String} error message
     */
    toString : function() {
      return this.__failMessage;
    },


    /**
     * Get the URI where error was raised
     *
     * @return {String} URI where error was raised
     */
    getUri : function() {
      return this.__uri;
    },


    /**
     * Get the line number where the error was raised
     *
     * @return {Integer} The line number where the error was raised
     */
    getLineNumber : function() {
      return this.__lineNumber;
    },
    
    
    /**
     * Get the column number where the error was raised
     */
    getColumnNumber: function() {
      return this.__columnNumber;
    },
    
    
    /**
     * Get the stack trace of where the error was raised, not available on all platforms
     */
    getStack: function() {
      return this.__stack;
    }
  }
});
