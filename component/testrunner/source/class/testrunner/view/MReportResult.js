/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (d_wagner)

************************************************************************ */

/**
 * Sends the result of a single unit to the URI configured by the
 * "testrunner.reportServer" environment setting.
 * The data is contained in the _ScriptTransport_data
 * parameter. It begins with 'unittest=', followed by a JSON-encoded map
 * containing the following string values:
 *
 * testName : full name of the test method, e.g. qx.test.bom.Blocker:testOpacity<br/>
 * message : error message(s) of any exceptions thrown during test execution<br/>
 * autUri : URI of the unit test application<br/>
 * browserName : value of qx.core.Environment.get("browser.name")<br/>
 * browserVersion : value of qx.core.Environment.get("browser.version")<br/>
 * os : value of qx.core.Environment.get("os.name")
 */
qx.Mixin.define("testrunner.view.MReportResult", {

  construct : function()
  {
    this.__results = {};
    this.__autErrors = {};
  },
  members :
  {
    __results : null,
    __autErrors : null,


    /**
     * Returns the map of results for  the current suite. The keys are fully
     * qualified names of test methods. Values are maps with the following keys:
     * <pre>state</pre> The test's final state<br/>
     * <pre>messages</pre> Array of error messages
     *
     * @return {Map} Test results map
     */
    getTestResults : function()
    {
      return this.__results;
    },


    /**
     * Returns the map of uncaught exceptions that occurred during test suite
     * execution. The keys are fully qualified names of test methods while the
     * values are arrays of error messages
     *
     * @return {Map} Map of uncaught exceptions
     */
    getAutErrors : function()
    {
      return this.__autErrors;
    },


    /**
     * Use the AUT's global error logging to catch any uncaught exceptions
     * triggered by the unit tests
     */
    setGlobalErrorHandler : function()
    {
      var win;
      if (qx.core.Environment.get("testrunner.testOrigin") == "iframe") {
        var iframe = this.getIframe();
        if (!iframe) {
          return;
        }
        win = qx.bom.Iframe.getWindow(iframe);
      }
      else {
        win = window;
      }


      var geh = win.qx.core.Environment.get("qx.globalErrorHandling");
      if (geh) {
        win.qx.event.GlobalError.setErrorHandler(this._handleUncaughtError, this);
      }
    },

    /**
     * Callback function for qooxdoo's global error handler. Stores the caught
     * exceptions in a map.
     *
     * @param ex {Error} Caught exception
     */
    _handleUncaughtError : function(ex)
    {
      var currentTest = qx.core.Init.getApplication().runner.currentTestData.fullName;
      if (!this.__autErrors[currentTest]) {
        this.__autErrors[currentTest] = [];
      }
      var msg;
      if (qx.core.Environment.get("browser.name") == "ie" &&
              qx.core.Environment.get("browser.version") < 9)
      {
        msg = ex.toString();
      }
      else {
        msg = ex;
      }
      this.__autErrors[currentTest].push(msg);
    },


    /**
     * Adds an entry for a single test to the results map
     *
     * @param testResultData {testrunner.runner.TestItem} Test result object
     */
    saveTestResult : function(testResultData)
    {
      var testName = testResultData.getFullName();
      var state = testResultData.getState();
      var exceptions = testResultData.getExceptions();

      //Update test results map
      if (!this.__results[testName]) {
        this.__results[testName] = {};
      }
      this.__results[testName].state = state;

      var messages = [];
      if (exceptions) {
        for (var i=0,l=exceptions.length; i<l; i++) {
          var message = exceptions[i].exception.toString() + "<br/>";
          message += testResultData.getStackTrace(exceptions[i].exception);
          messages.push(message);
        }
        this.__results[testName].messages = messages;
      }
    },


    /**
     * Returns a map containing information about a single test
     *
     * @param testName {String} Fully qualified test method name
     * @return {Map} Result data
     */
    getTestResultData : function(testName)
    {
      var data = {};
      var autUri;
      if (qx.core.Environment.get("testrunner.testOrigin") == "iframe") {
        autUri = qx.bom.Iframe.queryCurrentUrl(this.getIframe());
      }
      else {
        autUri = document.location.href
      }

      if (autUri.indexOf("?") > 0) {
        autUri = autUri.substring(0, autUri.indexOf("?"));
      }

      data.testName = testName;
      data.message = this.__results[testName].messages;
      data.autUri = autUri;
      data.browserName = qx.core.Environment.get("browser.name");
      data.browserVersion = qx.core.Environment.get("browser.version");
      data.os = qx.core.Environment.get("os.name");

      return data;
    },


    /**
     * Sends a test result to the server
     *
     * @param testName {String} Fully qualified test method name
     */
    reportResult : function(testName)
    {
      if (qx.core.Environment.get("qx.debug")) {
        this.debug("Reporting result");
      }

      var jsonData = qx.lang.Json.stringify(this.getTestResultData(testName));

      var req = new qx.io.remote.Request(
        qx.core.Environment.get("testrunner.reportServer"), "GET");
      req.setData("unittest=" + jsonData);
      req.setCrossDomain(true);
      req.addListener("failed", function(ev) {
        this.error("Request failed!");
      }, this);
      req.addListener("timeout", function(ev) {
        this.error("Request timed out!");
      }, this);
      req.addListener("completed", function(ev) {
        if (qx.core.Environment.get("qx.debug")) {
          this.debug("Request completed.");
        }
      }, this);
      req.send();
    },


    /**
     * Returns the results of all tests that didn't end with the status "success"
     * @return {Map} Unsuccessful test results
     */
    getUnsuccessfulResults : function()
    {
      var failedTests = {};
      for (var testName in this.__results) {
        var result = this.__results[testName];
        if (result.state !== "success") {
          failedTests[testName] = result;
        }
      }
      return failedTests;
    },

    /**
     * Returns the results of all tests that ended with the status "error" or
     * "failure". Skipped tests are not included.
     * @return {Map} Failed test results
     */
    getFailedResults : function()
    {
      var failedTests = {};
      for (var testName in this.__results) {
        var result = this.__results[testName];
        if (result.state == "error" || result.state == "failure") {
          failedTests[testName] = result;
        }
      }
      return failedTests;
    },


    /**
     * Returns a JSON serialization of {@link #getFailedResults}
     *
     *  @return {String} Failed results map as JSON
     */
    getFailedResultsAsJson : function()
    {
      return qx.lang.Json.stringify(this.getFailedResults());
    },


    /**
     * Returns any errors caught in the AUT in a readable format containing the
     * name of the unit test that triggered the exception, its message and, if
     * available, the stack trace.
     *
     * @return {String[]} Array of error messages
     */
    getFormattedAutErrors : function()
    {
      var formattedErrors = [];
      for (var testName in this.__autErrors) {
        var testErrors = this.__autErrors[testName];
        for (var i=0, l=testErrors.length; i<l; i++) {
          var exception = testErrors[i];
          var message;
          if (qx.core.Environment.get("browser.name") == "ie" &&
              qx.core.Environment.get("browser.version") < 9)
          {
            message = exception;
          }
          else {
            message = testName + ": " + exception.toString();
            var trace = qx.dev.StackTrace.getStackTraceFromError(exception);
            if (trace.length > 0) {
              message += "<br/>Stack Trace:<br/>" + trace.join("<br/>");
            }
          }
          formattedErrors.push(message);
        }
      }
      return formattedErrors;
    }
  }
});