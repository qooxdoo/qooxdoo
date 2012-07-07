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
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * This class is the common super class for all error classes in qooxdoo.
 *
 * It has a comment and a fail message as members. The toString method returns
 * the comment and the fail message separated by a colon.
 */
qx.Class.define("qx.type.BaseError",
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
    var inst = Error.call(this, failMessage);
    // map stack trace properties since they're not added by Error's constructor
    if (inst.stack) {
      this.stack = inst.stack;
    }
    if (inst.stacktrace) {
      this.stacktrace = inst.stacktrace;
    }
    // Workaround for PhantomJS bug http://code.google.com/p/phantomjs/issues/detail?id=335
    // See http://bugzilla.qooxdoo.org/show_bug.cgi?id=6069
    // This can be removed once the issue is fixed
    if (!(inst.stack || inst.stacktrace)) {
      this.__sTrace = qx.dev.StackTrace.getStackTraceFromCaller(arguments);
    }

    this.__comment = comment || "";
    // opera 10 crashes if the message is an empty string!!!?!?!
    this.message = failMessage || qx.type.BaseError.DEFAULTMESSAGE;
  },



  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */
  statics :
  {
    DEFAULTMESSAGE : "error"
  },



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __sTrace : null,
    __comment : null,

    /** {String} Fail message provided by the assertion */
    message : null,


    /**
     * Comment passed to the assertion call
     *
     * @return {String} The comment passed to the assertion call
     */
    getComment : function() {
      return this.__comment;
    },


    /**
     * Workaround for PhantomJS bug http://code.google.com/p/phantomjs/issues/detail?id=335
     * See http://bugzilla.qooxdoo.org/show_bug.cgi?id=6069
     * This can be removed once the issue is fixed
     *
     * @return {String[]} Stack trace
     */
    getStackTrace : function()
    {
      if (this.stack || this.stacktrace) {
        return qx.dev.StackTrace.getStackTraceFromError(this);
      }
      else if (this.__sTrace) {
        return this.__sTrace;
      }

      return [];
    },


    /**
     * Get the error message
     *
     * @return {String} The error message
     */
    toString : function() {
      return this.__comment + (this.message ? ": " + this.message : "");
    }
  }
});
