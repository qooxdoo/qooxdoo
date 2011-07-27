/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2011 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (d_wagner)

************************************************************************ */

/**
 * Basic "headless" test runner.
 */

qx.Class.define("testrunner.runner.TestRunnerBasic", {

  extend : qx.core.Object,

  construct : function()
  {
    this.base(arguments);

    var testNameSpace = qx.core.Environment.get("qx.testNameSpace");
    var loader = new qx.dev.unit.TestLoaderBasic(testNameSpace);
    this.suite = loader.getSuite();
  },

  members :
  {
    simulation : null,
    suite : null,
    _currentTest : null,

    /**
     * Runs all tests in the current suite.
     */
    runTests : function()
    {
      var testResult = this._initTestResult();
      this.suite.run(testResult);
    },

    /**
     * Log any exceptions attached to the current test object
     */
    logTestExceptions : function()
    {
      if (!this._currentTest.exceptions) {
        return;
      }
      
      for (var i=0, l=this._currentTest.exceptions.length; i<l; i++) {
        var exMap = this._currentTest.exceptions[i];
        if (exMap.exception) {
          var exception = exMap.exception;
          var msg = exception.toString ? exception.toString() : exception;
          this.error(msg);
        }
      }
    },

    /**
     * Creates a TestResult object and attaches listeners to its events
     *
     * @return {qx.dev.unit.TestResultBasic}
     */
    _initTestResult : function()
    {
      var testResult = new qx.dev.unit.TestResult();

      testResult.addListener("startTest", this._testStarted, this);
      testResult.addListener("wait", this._testWaiting, this);
      testResult.addListener("error", this._testError, this);
      testResult.addListener("failure", this._testFailed, this);
      testResult.addListener("skip", this._testSkipped, this);
      testResult.addListener("endTest", this._testEnded, this);

      return testResult;
    },

    /**
     * Called every time a test is started, or a waiting test is resumed.
     *
     * @param ev {qx.event.type.Data} the "data" property holds a reference to
     * the test function
     */
    _testStarted : function(ev)
    {
      var state;
      if (this._currentTest !== ev.getData()) {
        this._currentTest = ev.getData();
        state = "START";
      }
      else {
        state = "RESUME";
      }
      if (qx.core.Environment.get("qx.debug")) {
        this.info(state + " " + ev.getData().getFullName());
      }
    },

    /**
     * Called if an exception was thrown during test execution.
     *
     * @param ev {qx.event.type.Data} the "data" property holds a reference to
     * the exception
     */
    _testError : function(ev)
    {
      var exception = ev.getData();
      this._addExceptionToTest(exception);
      this.error("ERROR " + this._currentTest.getFullName());
      this.logTestExceptions();
    },

    /**
     * Called if an assertion failed
     *
     * @param ev {qx.event.type.Data} the "data" property holds a reference to
     * the exception map
     */
    _testFailed : function(ev)
    {
      var exceptionMap = ev.getData();
      this._addExceptionToTest(exceptionMap);
      this.error("FAIL  " + this._currentTest.getFullName());
      this.logTestExceptions();
    },

    /**
     * Called every time a test is finished.
     *
     * @param ev {qx.event.type.Data} the "data" property holds a reference to
     * the test function
     */
    _testEnded : function(ev)
    {
      if (!this._currentTest.exceptions) {
        this.info("PASS  " + this._currentTest.getFullName());
      }
    },
    
    /**
     * Called if an async test enters the "waiting" stage.
     * @param ev {} {qx.event.type.Data} the "data" property holds a reference to
     * the test function
     */
    _testWaiting : function(ev)
    {
      if (qx.core.Environment.get("qx.debug")) {
        this.info("WAIT " + this._currentTest.getFullName());
      }
    },
    
    /**
     * Called if a test was skipped due to unsatisfied requirements
     *
     * @param ev {qx.event.type.Data} the "data" property holds a reference to
     * the exception
     */
    _testSkipped : function(ev)
    {
      var exception = ev.getData();
      this._addExceptionToTest(exception);
      this.error("SKIP " + this._currentTest.getFullName());
      this.logTestExceptions();
    },

    /**
     * Stores a test exception map by adding it to an "exceptions" array attached to
     * the test object itself.
     *
     * @param exception {Error} Error object to store
     */
    _addExceptionToTest : function(exceptionList)
    {
      if (!this._currentTest.exceptions) {
        this._currentTest.exceptions = exceptionList;
      }
      else {
        var fullList = this._currentTest.exceptions.concat(exceptionList);
        this._currentTest.exceptions = fullList;
      }
    }
  }

});