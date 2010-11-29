/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Thomas Herchenroeder (thron7)
     * Fabian Jakobs (fjakobs)
     * Daniel Wagner (d_wagner)

************************************************************************ */

/**
 * Data class which holds all data of a test run.
 */
qx.Class.define("testrunner2.runner.TestResultData",
{
  extend : qx.core.Object,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param testName {String} The test's name
   */
  construct : function(testName)
  {
    this.base(arguments);
    this.setName(testName);
  },



  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** The test's name */    
    name : { check : "String" },

    /** The test's current state */
    state :
    {
      check : [ "start", "wait", "skip", "error", "failure", "success" ],
      init  : "start",
      event : "changeState"
    },

    /** Exceptions thrown by the test code */
    exceptions : {
      nullable : true,
      check : "Array"
    }
  },

  
  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    getMessage : qx.core.Variant.select("qx.client",
    {
      "default" : function()
      {
        if (this.getExceptions() && this.getExceptions().length > 0) {
          var exceptions = this.getExceptions();
          var message = "";
          for (var i=0,l=exceptions.length; i<l; i++) {
            message += exceptions[i].toString() + " ";
          }
          return message;          
        } else {
          return "";
        }
      },

      "opera" : function()
      {
        if (this.getExceptions() && this.getExceptions().length > 0) {
          var exceptions = this.getExceptions();
          var message = "";
          for (var i=0,l=exceptions.length; i<l; i++) {
            var msg = exceptions[i].message + "";
            if (msg.indexOf("Backtrace:") < 0) {
              message += exceptions[i].toString();
            } else {
              message += qx.lang.String.trim(msg.split("Backtrace:")[0]);
            }
          }
          return message;
        }
        else
        {
          return "";
        }
      }
    }),


    /**
     * Returns stack trace information for a given exception.
     *
     * @param ex {Error} Exception
     * @return {String} Stack trace information
     */
    getStackTrace : function(ex)
    {
      var trace = [];

      if (typeof (ex.getStackTrace) == "function") {
        trace = ex.getStackTrace();
      } else {
        trace = qx.dev.StackTrace.getStackTraceFromError(ex);
      }

      // filter Test Runner functions from the stack trace
      while (trace.length > 0)
      {
        var first = trace[0];

        if (first.indexOf("qx.dev.unit.AssertionError") == 0 || first.indexOf("qx.Class") == 0 || first.indexOf("qx.dev.unit.MAssert") == 0 || first.indexOf("script") == 0) {
          trace.shift();
        } else {
          break;
        }
      }

      return trace.join("<br>");
    }
  }
});
