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
     * Daniel Wagner (d_wagner)

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
    /**
     * Fired before the test is started
     *
     * Event data: The test {@link qx.dev.unit.TestFunction}
     */
    startTest : "qx.event.type.Data",

    /** Fired after the test has finished
     *
     * Event data: The test {@link qx.dev.unit.TestFunction}
     */
    endTest   : "qx.event.type.Data",

    /**
     * Fired if the test raised an {@link qx.core.AssertionError}
     *
     * Event data: The test {@link qx.dev.unit.TestFunction}
     */
    error     : "qx.event.type.Data",

    /**
     * Fired if the test failed with a different exception
     *
     * Event data: The test {@link qx.dev.unit.TestFunction}
     */
    failure   : "qx.event.type.Data",

    /**
     * Fired if an asynchronous test sets a timeout
     *
     * Event data: The test {@link qx.dev.unit.TestFunction}
     */
    wait   : "qx.event.type.Data"
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

    __timeout : null,

    /**
     * Run the test
     *
     * @param test {TestSuite|TestFunction} The test
     * @param testFunction {Function} The test function
     * @param self {Object?} The context in which to run the test function
     */
    run : function(test, testFunction, self)
    {
      this.fireDataEvent("startTest", test);

      if(!this.__timeout) {
        this.__timeout = {};
      }
      
      if (this.__timeout[test.getFullName()])
      {
        this.__timeout[test.getFullName()].stop();
        delete this.__timeout[test.getFullName()];
      }
      else
      {
        try {
          test.setUp();
        }
        catch(ex)
        {
          try {
            test.tearDown();
          }
          catch(ex) {
            /* Any exceptions here are likely caused by setUp having failed
               previously, so we'll ignore them. */
          }
          var qxEx = new qx.type.BaseError("Error setting up test: " + ex.name, ex.message);
          this.__createError("error", qxEx, test);
          return;
        }
      }

      try {
        testFunction.call(self || window);
      }
      catch(ex)
      {
        var error = true;
        if (ex instanceof qx.dev.unit.AsyncWrapper)
        {
          if (ex.getDelay()) {
            var that = this;
            var defaultTimeoutFunction = function() {
              throw new qx.core.AssertionError(
                "Asynchronous Test Error",
                "Timeout reached before resume() was called."
              );
            }
            var timeoutFunc = (ex.getDeferredFunction() ? ex.getDeferredFunction() : defaultTimeoutFunction);
            this.__timeout[test.getFullName()] = qx.event.Timer.once(function() {
               this.run(test, timeoutFunc);
            }, that, ex.getDelay());
            this.fireDataEvent("wait", test);
          }

        } else if (ex.classname == "qx.core.AssertionError") {
          test.tearDown();
          this.__createError("failure", ex, test);
        } else {
          test.tearDown();
          this.__createError("error", ex, test);
        }
      }

      if (!error)
      {
        test.tearDown();
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
  },

  destruct : function() {
    this.__timeout = null;
  }
});
