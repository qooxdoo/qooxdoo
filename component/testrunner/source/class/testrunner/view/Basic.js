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
 * Testrunner view intended for browserless environments, e.g. node.js, Rhino
 */
qx.Class.define("testrunner.view.Basic", {

  extend : testrunner.view.Abstract,

  members :
  {
    __testResults : null,


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
     * Returns the test result counts by type. Failed tests and tests with
     * unexpected errors are both listed as "failed".
     *
     * @return {String} Results summary
     */
    getSummary : function()
    {
      var count = {
        pass : 0,
        fail : 0,
        skip :0
      };
      for (var test in this.__testResults) {
        var state = this.__testResults[test].state;
        switch(state) {
          case "success":
            count.pass += 1;
            break;
          case "skip":
            count.skip += 1;
            break;
          default:
            count.fail += 1;
        }
      }

      return count.pass + " passed, " + count.fail + " failed, " + count.skip
      + " skipped.";
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
        case "init":
          this.setStatus("Waiting for tests");
          break;
        case "loading" :
          this.setStatus("Loading tests...");
          break;
        case "ready" :
          this.setStatus(this.getSelectedTests().length + " tests ready");
          break;
        case "error" :
          this.setStatus("Error loading test suite or no tests in suite!");
          break;
        case "running" :
          this.setStatus("Running tests...");
          break;
        case "finished" :
          this.setStatus("Test suite finished.");
          this.info(this.getSummary());
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
      var msg;
      switch(state) {
        case "start":
          level = "debug";
          msg = "RESUME";
          break;
        case "skip":
          level = "warn";
          msg = "SKIP  ";
          break;
        case "error":
          level = "error";
          msg = "ERROR ";
          break;
        case "failure":
          level = "error";
          msg = "FAIL  ";
          break;
        case "success":
          level = "info";
          msg = "PASS  ";
          break;
        case "wait":
          level = "debug";
          msg = "WAIT  ";
          break;
        default:
          level = "error";
          msg = "UNKNOWN STATE " + state;
      }

      this[level](msg + " " + testName);

      if (this.__testResults[testName].messages) {
        this.error(this.__testResults[testName].messages.join("\n"));
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
    }
  }
});