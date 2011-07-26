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

  extend : testrunner.runner.TestRunnerBasic,

  construct : function()
  {
    this.base(arguments);

    this._initLogFile();
    this.qxSelenium = simulator.QxSelenium.getInstance();
    this.simulation = simulator.Simulation.getInstance();
  },

  members :
  {
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
    }
  }

});