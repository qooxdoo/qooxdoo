/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2011 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

************************************************************************ */

/**
 * Creates and runs a suite of integration tests using QxSelenium.
 */

qx.Class.define("simulator.TestRunner", {

  extend : qx.core.Object,

  construct : function()
  {
    this.base(arguments);

    this._initLogFile();
    this.qxSelenium = simulator.QxSelenium.getInstance();
    this.simulation = simulator.Simulation.getInstance();
    var testNameSpace = qx.core.Environment.get("simulator.nameSpace");
    var loader = new simulator.unit.TestLoader(testNameSpace);
    this.suite = loader.getSuite();
  },

  members :
  {
    simulation : null,
    suite : null,
    _currentTest : null,


    /**
     * Creates a log file using {@link qx.log.appender.RhinoFile}
     */
    _initLogFile : function()
    {
      var filename = null;
      filename = qx.core.Environment.get("simulator.logFile");
      if (!filename) {
        return;
      }

      if (qx.log.appender.RhinoFile.FILENAME !== filename) {
        qx.log.appender.RhinoFile.FILENAME = filename;
        qx.log.Logger.register(qx.log.appender.RhinoFile);
      }
    },

    /**
     * Runs all tests in the current suite.
     */
    runTests : function()
    {
      this.simulation.startSession();
      this.simulation.logEnvironment();
      this.simulation.logUserAgent();

      var testResult = this._initTestResult();
      this.suite.run(testResult);

      this.simulation.logRunTime();
      this.qxSelenium.stop();
    },

    /**
     * Creates a TestResult object and attaches listeners to its events
     *
     * @return {simulator.unit.TestResult}
     */
    _initTestResult : function()
    {
      var testResult = new simulator.unit.TestResult();

      testResult.addListener("startTest", this._testStarted, this);
      testResult.addListener("error", this._testError, this);
      testResult.addListener("failure", this._testFailed, this);
      testResult.addListener("endTest", this._testEnded, this);

      return testResult;
    },

    /**
     * Called every time a test is started.
     *
     * @param ev {qx.event.type.Data} the "data" property holds a reference to
     * the test function
     */
    _testStarted : function(ev)
    {
      this._currentTest = ev.getData();
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
      this.error("ERROR " + this._currentTest.getFullName() + ": " + exception);
    },

    /**
     * Called if an assertion failed
     *
     * @param ev {qx.event.type.Data} the "data" property holds a reference to
     * the exception
     */
    _testFailed : function(ev)
    {
      var exception = ev.getData();
      this._addExceptionToTest(exception);
      this.error("FAIL  " + this._currentTest.getFullName() + ": " + exception);
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
     * Stores a test exception by adding it to an "exceptions" array attached to
     * the test object itself.
     *
     * @param exception {Error} Error object to store
     */
    _addExceptionToTest : function(exception)
    {
      if (!this._currentTest.exceptions) {
        this._currentTest.exceptions = [];
      }
      this._currentTest.exceptions.push(exception);
    }
  }

});