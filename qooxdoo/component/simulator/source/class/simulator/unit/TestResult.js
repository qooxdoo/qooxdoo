/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2010 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (d_wagner)

************************************************************************ */

/**
 * The test result class runs test functions and fires events as the test's
 * state changes.
 */

qx.Class.define("simulator.unit.TestResult", {

  extend : qx.core.Object,

  events :
  {
    /**
     * Fired before the test function is called
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
     * Fired if an error was thrown during test execution
     *
     * Event data: The test {@link qx.dev.unit.TestFunction}
     */
    error     : "qx.event.type.Data",

    /**
     * Fired if the test raised an {@link qx.core.AssertionError}
     *
     * Event data: The test {@link qx.dev.unit.TestFunction}
     */
    failure   : "qx.event.type.Data"
  },

  members :
  {

    /**
     * Run the test
     *
     * @param test {TestSuite|TestFunction} The test
     * @param testFunction {Function} The test function
     * @param self {Object} The context in which to run the test function
     */
    run : function(test, testFunction, self)
    {
      this.fireDataEvent("startTest", test);

      try {
        test.setUp();
      } catch(ex) {
        try {
          test.tearDown();
        } catch(except) {}
        this.fireDataEvent("error", ex);
        this.fireDataEvent("endTest", test);
        return;
      }

      try {
        testFunction.call(self);
      }
      catch(ex)
      {
        if (ex.classname == "qx.core.AssertionError") {
          this.fireDataEvent("failure", ex);
        }
        else {
          this.fireDataEvent("error", ex);
        }
      }

      try {
        test.tearDown();
      }
      catch(ex) {
        this.fireDataEvent("error", ex);
      }

      this.fireDataEvent("endTest", test);
    }
  }

});