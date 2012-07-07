/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Author:
     * Daniel Wagner (danielwagner)

************************************************************************ */

/**
 * TODO: Write class doc
 *
 * @lint ignoreUndefined(simulator)
 * @lint ignoreUndefined(selenium)
 */
qx.Class.define("simulator.autounit.AutoUnit", {

  extend : simulator.unit.TestCase,

  statics :
  {
    GET_SUITE_STATE : simulator.Simulation.AUTWINDOW + "." +
                      simulator.Simulation.QXAPPLICATION +
                      ".runner.getTestSuiteState()",

    SUITE_LOAD_TIMEOUT : 120000,

    RUN_SUITE : simulator.Simulation.AUTWINDOW + "." +
                simulator.Simulation.QXAPPLICATION +
                ".runner.view.run()",

    ACCESS_INTERVAL : 5000,

    GET_SUITE_RESULTS : simulator.Simulation.AUTWINDOW +
                        ".qx.lang.Json.stringify(" +
                        simulator.Simulation.AUTWINDOW + "." +
                        simulator.Simulation.QXAPPLICATION +
                        ".runner.view.getSuiteResults())",

    GET_HOST_NAME : simulator.Simulation.AUTWINDOW + ".location.hostname"
  },

  members :
  {
    _getTestSuiteState : function()
    {
      var getSuiteState = this.self(arguments).GET_SUITE_STATE;
      return String(simulator.QxSelenium.getInstance().getEval(getSuiteState));
    },


    _isTestSuiteReady : function()
    {
      var condition = this.self(arguments).GET_SUITE_STATE + " !== \"loading\"";
      var timeout = this.self(arguments).SUITE_LOAD_TIMEOUT + "";
      this.info("Waiting for test suite to load, timeout is " + timeout + "ms...");
      try {
        simulator.QxSelenium.getInstance().waitForCondition(condition, timeout);
        return true;
      }
      catch(ex) {
        return false;
      }
    },


    _runTestSuite : function()
    {
      var runSuite = this.self(arguments).RUN_SUITE;
      simulator.QxSelenium.getInstance().getEval(runSuite);
    },

    /**
     * @lint ignoreDeprecated(eval)
     * @return {}
     */
    _getSuiteResults : function()
    {
      var getSuiteResults = this.self(arguments).GET_SUITE_RESULTS;
      var resultsString = String(simulator.QxSelenium.getInstance().getEval(getSuiteResults));
      var results;
      eval("results=" + resultsString);

      var getHostName = this.self(arguments).GET_HOST_NAME;
      var hostName = String(simulator.QxSelenium.getInstance().getEval(getHostName));
      results.hostname = hostName;

      return results;
    },


    setUp : function()
    {
      if (!this._isTestSuiteReady()) {
        var errMsg = "The test suite did not finish loading before the timeout was reached!";
        throw new Error(this.classname + "#setUp failed: " + errMsg);
      }

      var suiteState = this._getTestSuiteState();
      switch(suiteState) {
        case "error":
        case "aborted":
          var errMsg = "The test suite could not be loaded, run generate.py test-source and open the Test Runner in a browser to make sure the suite is valid.";
          throw new Error(errMsg);
        case "ready":
        case "running":
        case "finished":
          this.info("Test suite ready");
          break;
        default:
          this.warn("Unexpected test suite state: '" + suiteState + "'");
      }
    },


    _logResults : function()
    {
      this.info("Retrieving unit test results...");
      var results = this._getSuiteResults();
      this.assertMap(results, "Couldn't get unit test results map!");

      this.info("");
      this.info("BEGIN UNIT TEST RESULTS");

      if (!results.tests) {
        this.warn("No test results found!");
        return;
      }

      for (var testName in results.tests) {
        var result = results.tests[testName];
        var logLevel;
        switch(result.state) {
          case "success":
          case "skip":
            logLevel = "info";
            break;
          case "error":
          case "failure":
            logLevel = "error";
            break;
          default:
            logLevel = "warn";
        }

        this[logLevel](testName + " " + result.state);

        if (result.exceptions && result.exceptions.length > 0) {
          for (var i=0, l=result.exceptions.length; i<l; i++) {
            var err = result.exceptions[i];
            //this[logLevel]("  " + result.messages[i].split("\n").join("\n  "));
            this[logLevel](err.type + " " + err.message);
            this[logLevel](err.stacktrace.join("\n"));
          }
        }
      }

      this.info("");
      this.info("END UNIT TEST RESULTS");
      this.info("");

      var ju = new simulator.autounit.JunitLog(results);
      var res = ju.getResultsXmlString();

      var startedAt = new Date(results.startedAt);
      var dateFormat = new qx.util.format.DateFormat("YYYY-MM-dd_HH-mm-ss");
      var formattedDate = dateFormat.format(startedAt)
      var fileName = "unitTestResults_" + formattedDate + ".xml";
      if (qx.core.Environment.get("simulator.autounit.logpath")) {
        fileName = qx.core.Environment.get("simulator.autounit.logpath") + "/" + fileName;
      }

      this.info("Storing test suite results in file " + fileName);
      var logFile = new simulator.RhinoFile(fileName);
      logFile.writeLine(res);
      logFile.close();
    },


    testUnitTests : function()
    {
      this._runTestSuite();

      while(true) {
        simulator.Simulation.getInstance().wait(this.self(arguments).ACCESS_INTERVAL);
        var suiteState = this._getTestSuiteState();
        switch (suiteState) {
          // Anything but "running" or "finished" means something went wrong in the Test Runner
          case "ready":
          case "loading":
          case "error":
          case "aborted":
            var errMsg = "There was an unexpected error during test suite execution. Run generate.py test-source and open the Test Runner in a browser to make sure the suite is valid.";
            throw new Error(errMsg);
          case "running":
            this.debug("Waiting for test suite to finish...");
            break;
          case "finished":
            this._logResults();
            return;
          default:
            throw new Error("Unexpected test suite state '" + suiteState + "'");
        }
      }
    }
  }
});