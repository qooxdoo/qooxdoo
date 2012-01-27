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
                        ".runner.view.getSuiteResults())"
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
    
    
    _getSuiteResults : function()
    {
      var getSuiteResults = this.self(arguments).GET_SUITE_RESULTS;
      var resultsString = String(simulator.QxSelenium.getInstance().getEval(getSuiteResults));
      eval("var results=" + resultsString);
      
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
      
      for (var testName in results) {
        this.info("");
        var result = results[testName];
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
        
        for (var i=0, l=result.messages.length; i<l; i++) {
          this[logLevel]("  " + result.messages[i].split("\n").join("\n  "));
        }
        
      }
      
      this.info("");
      this.info("END UNIT TEST RESULTS");
      this.info("");
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