/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

************************************************************************ */

/**
 * This view automatically runs all unit tests in the current suite and reports
 * failed tests by sending a HTTP request to the URL defined by the
 * REPORT_SERVER macro. The data is contained in the _ScriptTransport_data
 * parameter. It begins with 'unittest=', followed by a JSON-encoded map
 * containing the following string values:
 *
 * testName : full name of the test method, e.g. qx.test.bom.Blocker:testOpacity<br/>
 * message : error message(s) of any exceptions thrown during test execution<br/>
 * autUri : URI of the unit test application<br/>
 * browserName : value of qx.core.Environment.get("browser.name")<br/>
 * browserVersion : value of qx.core.Environment.get("browser.version")<br/>
 * os : value of qx.core.Environment.get("os.name")
 *
 */
qx.Class.define("testrunner.view.Reporter", {

  extend : testrunner.view.Console,

  construct : function()
  {
    this.base(arguments);
    this.__testResultsMap = {};
    this.__reportServerUrl = qx.core.Environment.get("testrunner.reportServer");
    this.__autErrors = {};
    var info = document.createElement("div");
    info.id = "info";
    document.body.appendChild(info);
    this.__infoElem = document.getElementById("info");
  },

  members :
  {
    __testResultsMap : null,
    __testPackages : null,
    __reportServerUrl : null,
    __autErrors : null,
    __infoElem : null,

    _applyTestSuiteState : function(value, old)
    {
      switch(value)
      {
        case "loading":
          this.debug("Loading test suite");
          break;
        case "ready" :
          this.debug("Test suite ready");
          this.autoRun();
          break;
        case "running" :
          this.debug("Running tests");
          break;
        case "finished" :
          this.debug("Finished running tests");
          this._loadNextPackage();
          break;
        case "error":
          this.error("Couldn't load test suite!");
          break;
      }
    },

    // overridden
    run : function()
    {
      this.fireEvent("runTests");
    },

    /**
     * Use the AUT's global error logging to catch any uncaught exceptions
     * triggered by the unit tests
     */
    setGlobalErrorHandler : function()
    {
      var iframe = this.getIframe();
      if (!iframe) {
        return;
      }
      var iframeWindow = qx.bom.Iframe.getWindow(iframe);
      var geh = iframeWindow.qx.core.Environment.get("qx.globalErrorHandling");
      if (geh) {
        iframeWindow.qx.event.GlobalError.setErrorHandler(this._handleIframeError, this);
      }
    },

    /**
     * Callback function for qooxdoo's global error handler. Stores the caught
     * exceptions in a map.
     *
     * @param ex {Error} Caught exception
     */
    _handleIframeError : function(ex)
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
    },

    /**
     * Runs the next package from the list of test namespaces.
     */
    autoRun : function()
    {
      var nextPackageName = this.__testPackages.shift();
      var nextPackage = testrunner.runner.ModelUtil.getItemByFullName(this.getTestModel(), nextPackageName);
      if (nextPackage) {
        this.getSelectedTests().removeAll();
        this.getSelectedTests().push(nextPackage);
        if (nextPackage.fullName.indexOf("qx.test.io") !== 0) {
          this.setGlobalErrorHandler();
        }
        this.setStatus("Running package " + nextPackage.fullName);
        this.run();
      }
    },

    // overridden
    _applyTestModel : function(value, old)
    {
      if (!value) {
        return;
      }
      this.base(arguments, value, old);
      // get a list of test namespaces
      if (!this.__testPackages) {
        this.__testPackages = [];
        var packages = value.getChildren().getItem(0).getChildren();
        for (var i=0,l=packages.length; i<l; i++) {
          this.__testPackages.push(packages.getItem(i).fullName);
        }
      }
    },

    /**
     * Reloads the AUT with the next package from the list.
     */
    _loadNextPackage : function()
    {
      if (this.__testPackages.length > 0) {
        var testPackage = this.__testPackages[0];
        var newAutUri = this.getAutUri().replace(/(.*?testclass=)(.*)/, "$1" + testPackage);
        this.setStatus("Loading package " + testPackage);
        this.setAutUri(newAutUri);
      }
      else {
        this.setStatus("finished");
      }
    },

    // overridden
    _onTestChangeState : function(testResultData)
    {
      var testName = testResultData.getFullName();
      var state = testResultData.getState();
      var exceptions = testResultData.getExceptions();

      //Update test results map
      if (!this.__testResultsMap[testName]) {
        this.__testResultsMap[testName] = {};
      }
      this.__testResultsMap[testName].state = state;

      var messages = [];
      if (exceptions) {
        for (var i=0,l=exceptions.length; i<l; i++) {
          var message = exceptions[i].exception.toString() + "<br/>";
          message += testResultData.getStackTrace(exceptions[i].exception);
          messages.push(message);
        }
        this.__testResultsMap[testName].messages = messages;
      }

      this.__infoElem.innerHTML = testName + ": " + state;

      var autUri = qx.bom.Iframe.queryCurrentUrl(this.getIframe());
      if (autUri.indexOf("?") > 0) {
        autUri = autUri.substring(0, autUri.indexOf("?"));
      }

      if (this.__reportServerUrl) {
        var data = {
          testName : testName,
          message : messages.join("<br/>"),
          autUri : autUri
        };

        this.reportResult(data);
      }

    },


    /**
     * Returns the results of all tests that didn't end with the status "success"
     * @return {Map} Unsuccessful test results
     */
    getUnsuccessfulResults : function()
    {
      var failedTests = {};
      for (var testName in this.__testResultsMap) {
        var result = this.__testResultsMap[testName];
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
      for (var testName in this.__testResultsMap) {
        var result = this.__testResultsMap[testName];
        if (result.state == "error" || result.state == "failure") {
          failedTests[testName] = result;
        }
      }
      return failedTests;
    },

    /**
     * Adds environment information to a test result map and sends it to the
     * server.
     *
     * @param data {Map} Test result data
     */
    reportResult : function(data)
    {
      if (qx.core.Environment.get("qx.debug")) {
        this.debug("Reporting result");
      }
      data["browserName"] = qx.core.Environment.get("browser.name");
      data["browserVersion"] = qx.core.Environment.get("browser.version");
      data["os"] = qx.core.Environment.get("os.name");

      var jsonData = qx.lang.Json.stringify(data);

      var req = new qx.io.remote.Request(this.__reportServerUrl, "GET");
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
    }
  }
});