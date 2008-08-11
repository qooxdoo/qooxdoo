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
 * The test result class runs the test functions and fires events depending on
 * the result of the test run.
 */
qx.Class.define("qx.dev.unit.TestResult",
{
  extend : qx.core.Object,



  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events :
  {
    /** Fired before the test is started */
    startTest : "qx.event.type.Data",

    /** Fired after the test has finished */
    endTest   : "qx.event.type.Data",

    /** Fired if the test raised an {@link qx.core.AssertionError} */
    error     : "qx.event.type.Data",

    /** Fired if the test failed with a different exception */
    failure   : "qx.event.type.Data"
  },




  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /**
     * Run a test function using a given test result
     *
     * @param testResult {TestResult} The test result to use to run the test
     * @param test {TestSuite|TestFunction} The test
     * @param testFunction {var} The test function
     */
    run : function(testResult, test, testFunction) {
      testResult.run(test, testFunction);
    }
  },



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Run the test
     *
     * @param test {TestSuite|TestFunction} The test
     * @param testFunction {var} The test function
     */
    run : function(test, testFunction)
    {
      this.fireDataEvent("startTest", test);

      try {
        testFunction();
      }
      catch(e)
      {
        var error = true;

        if (e.classname == "qx.core.AssertionError") {
          this.__createError("failure", e, test);
        } else {
          this.__createError("error", e, test);
        }
      }

      if (!error) {
        this.fireDataEvent("endTest", test);
      }
    },


    /**
     * Fire an error event
     *
     * @param eventName {String} Name of the event
     * @param exception {Error} The exception, which caused the test to fail
     * @param test {TestSuite|TestFunction} The test
     * @return {void}
     */
    __createError : function(eventName, exception, test)
    {
      // WebKit and Opera
      var error =
      {
        exception : exception,
        test      : test
      };

      this.fireDataEvent(eventName, error);
      this.fireDataEvent("endTest", test);
    }
  }
});
