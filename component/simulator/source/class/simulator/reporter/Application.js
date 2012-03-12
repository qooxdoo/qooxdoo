/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

************************************************************************ */

/**
 * Alternative Simulator application that registers a {@link #Reporter} appender
 */
qx.Class.define("simulator.reporter.Application", {

  extend : simulator.Application,

  members :
  {
    /**
     * @lint ignoreUndefined(testrunner)
     */
    main : function()
    {
      qx.log.Logger.register(qx.log.appender.RhinoConsole);

      if (window.arguments) {
        try {
          this._argumentsToSettings(window.arguments);
        } catch(ex) {
          this.error(ex.toString());
          return;
        }
      }

      this._initLogFile();
      this.runner = new testrunner.runner.TestRunnerBasic();
      this.simulation = simulator.Simulation.getInstance();

      this.runner.addListener("changeTestSuiteState", this._onChangeTestSuiteState, this);

      var reportServer = qx.core.Environment.get("simulator.reportServer");
      simulator.reporter.Reporter.SERVER_URL = reportServer;
      qx.log.Logger.clear();
      qx.log.Logger.register(simulator.reporter.Reporter);

      // sync test suite loading
      if (this.runner.getTestSuiteState() === "ready") {
        this._runSuite();
      }

      qx.log.Logger.clear();
      qx.log.Logger.unregister(simulator.reporter.Reporter);
    }
  }
});