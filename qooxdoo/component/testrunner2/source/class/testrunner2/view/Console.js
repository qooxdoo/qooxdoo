/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (d_wagner)

************************************************************************ */

/**
 * Simple, console-only TestRunner view. Use 
 * qx.core.Init.getApplication().runner.view.run() to run the test suite.
 */
qx.Class.define("testrunner2.view.Console", {

  extend : testrunner2.view.Abstract,
  
  
  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */
  
  construct : function()
  {
    qx.log.appender.Native;
    qx.log.appender.Console;
    this.__testResults = {};
  },
  
  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */
  members :
  {
    __testResults : null,
    __iframe : null,
    
    /**
     * Tells the TestRunner to run all configured tests.
     */
    run : function()
    {
      this.fireEvent("runTests");
    },
    
    /**
     * Tells the TestRunner to stop running any pending tests.
     */
    stop : function()
    {
      this.fireEvent("stopTests");
    },
    
    
    /**
     * Writes a status message to the browser's logging console.
     * 
     * @param value {String} New status value
     * @param old {String} Previous status value
     */
    _applyStatus : function(value, old)
    {
      if (!value[0] || (value === old)) {
        return;
      }
      
      this.info(value);
    },
    
    
    /**
     * Log the test suite's current status.
     * 
     * @param value {String} New testSuiteState
     * @param value {String} Previous testSuiteState 
     */
    _applyTestSuiteState : function(value, old)
    {
      switch(value) 
      {
        case "loading" :
          this.setStatus("Loading tests...");
          break;
        case "ready" :
          this.setStatus("Test suite ready. Call qx.core.Init.getApplication().runner.view.run() to start tests.");
          break;
        case "running" :
          this.setStatus("Running tests...");
          break;
        case "finished" :
          this.setStatus("Test suite finished. Call qx.core.Init.getApplication().runner.view.getTestResults() to get the results.");
          break;
        case "aborted" :
          this.setStatus("Test run aborted");
          break;
      };
    },
    
    
    /**
     * Logs the amount of loaded test functions.
     * 
     * @param value {Integer} Amount of tests
     * @param old {Integer} Previous value
     */
    _applyTestCount : function(value, old)
    {
      var suiteState = this.getTestSuiteState();
      switch(suiteState)
      {
        case "ready" :
          this.setStatus(value + " tests ready to run");
          break;
      };
    },
    
    
    /**
     * Logs state changes in testResultData objects. 
     * 
     * @param testResultData {testrunner2.unit.TestResultData} Test result data
     * object
     */
    _onTestChangeState : function(testResultData)
    {
      var testName = testResultData.getName();
      var state = testResultData.getState();
      var exceptions = testResultData.getExceptions();
      
      //Update test results map
      if (!this.__testResults[testName]) {
        this.__testResults[testName] = {};        
      }
      this.__testResults[testName].state = state;
      if (exceptions) {
        this.__testResults[testName].exceptions = exceptions;
      }
      
      var level;
      switch(state) {
        case "skip":
          level = "warn";
          break;
        case "error":
        case "failure":
          level = "error";
          break;
        default:
          level = "info";
      }
      
      this[level](testName + " : " + state);
      
      if (state == "error" && exceptions) {
        this.error(exceptions);
      }
    },
    
    /**
     * Returns the results of all tests that have been executed.
     * 
     * @return {Map} Key: The test's full name. Value: Map containing two keys:
     * state (The test's result) and (if applicable) exceptions (array of errors
     * that occured during the test's run).
     */
    getTestResults : function()
    {
      return this.__testResults;
    },
    
    /**
     * Returns the iframe element the AUT should be loaded in.
     * 
     * @return {DOMElement} The iframe
     */
    getIframe : function()
    {
      if (!this.__iframe) {
        this.__iframe = qx.bom.Iframe.create();
        document.body.appendChild(this.__iframe);
      }
      
      return this.__iframe;
    },
    
    /**
     * (Re)Loads the AUT in the iframe.
     * 
     * @param value {String} AUT URI
     * @param old {String} Previous value
     */
    _applyAutUri : function(value, old)
    {
      qx.bom.Iframe.setSource(this.__iframe, value);
    }
  }
});