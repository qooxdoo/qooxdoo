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
  
    SUITE_LOAD_TIMEOUT : 120000
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
    
    testFoo : function()
    {
      //var suiteState = this._getTestSuiteState();
    }
  }
});