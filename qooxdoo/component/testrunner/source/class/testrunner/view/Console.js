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
qx.Class.define("testrunner.view.Console", {

  extend : testrunner.view.Abstract,


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    qx.log.appender.Native;
    qx.log.appender.Console;
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
      this.__testResults = {};
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
          this.setStatus(this.getSelectedTests().length + " tests ready. Call qx.core.Init.getApplication().runner.view.run() to start.");
          break;
        case "error" :
          this.setStatus("Couldn't load test suite!");
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


    _applyTestModel : function(value, old)
    {
      if (!value) {
        return;
      }
      var testList = testrunner.runner.ModelUtil.getItemsByProperty(value, "type", "test");
      this.setSelectedTests(new qx.data.Array(testList));
    },


    _applyTestCount : function(value, old)
    {},

    /**
     * Logs state changes in testResultData objects.
     *
     * @param testResultData {testrunner.unit.TestResultData} Test result data
     * object
     */
    _onTestChangeState : function(testResultData)
    {
      var testName = testResultData.getFullName();
      var state = testResultData.getState();
      var exceptions = testResultData.getExceptions();

      //Update test results map
      if (!this.__testResults[testName]) {
        this.__testResults[testName] = {};
      }
      this.__testResults[testName].state = state;
      if (exceptions) {
        this.__testResults[testName].exceptions = exceptions;
        var messages = [];
        for (var i=0,l=exceptions.length; i<l; i++) {
          var message = exceptions[i].exception.toString() + "\n";
          //message += testResultData.getStackTrace(exceptions[i].exception);
          messages.push(message);
        }
        this.__testResults[testName].messages = messages;

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
     * @param exceptions {Boolean} Include an array of Error objects for any
     * test with exceptions
     *
     * @return {Map} Key: The test's full name. Value: Map containing two keys:
     * state (The test's result) and (if applicable) exceptions (array of errors
     * that occured during the test's run).
     */
    getTestResults : function(exceptions)
    {
      if (exceptions) {
        return this.__testResults;
      }

      var readableResults = {};
      var res = this.__testResults;
      for (var key in res) {
        if (res.hasOwnProperty(key)) {
          readableResults[key] = { state : res[key].state };
          if (res[key].messages) {
            readableResults[key].messages = res[key].messages;
          }
        }
      }
      return readableResults;
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
      qx.bom.Iframe.setSource(this.getIframe(), value);
    }
  },

  destruct : function()
  {
    this._disposeMap("testResults");
    this.__iframe = null;
    delete this.__iframe;
  }
});