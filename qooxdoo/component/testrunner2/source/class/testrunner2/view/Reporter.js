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
qx.Class.define("testrunner2.view.Reporter", {

  extend : testrunner2.view.Console,

  construct : function()
  {
    this.base(arguments);
    this.__testResults = {};
    this.__reportServerUrl = qx.core.Environment.get("testrunner2.reportServer");
  },

  members :
  {
    __testResults : null,
    __testPackages : null,
    __reportServerUrl : null,

    _applyTestSuiteState : function(value, old)
    {
      switch(value)
      {
        case "loading":
          this.debug("Loading test suite")
          break;
        case "ready" :
          this.debug("Test suite ready")
          this.autoRun();
          break;
        case "running" :
          this.debug("Running tests")
          break;
        case "finished" :
          this.debug("Finished running tests")
          this._loadNextPackage();
          break;
        case "error":
          this.error("Couldn't load test suite!");
          break;
      }
    },

    run : function()
    {
      this.fireEvent("runTests");
    },

    autoRun : function()
    {
      var nextPackageName = this.__testPackages.shift();
      var nextPackage = testrunner2.runner.ModelUtil.getItemByFullName(this.getTestModel(), nextPackageName);
      if (nextPackage) {
        this.getSelectedTests().removeAll();
        this.getSelectedTests().push(nextPackage);
        this.setStatus("Running package " + nextPackage.fullName);
        this.run();
      }
    },

    _applyTestModel : function(value, old)
    {
      if (!value) {
        return;
      }
      this.base(arguments, value, old);
      if (!this.__testPackages) {
        this.__testPackages = [];
        var packages = value.getChildren().getItem(0).getChildren();
        for (var i=0,l=packages.length; i<l; i++) {
          this.__testPackages.push(packages.getItem(i).fullName);
        }
      }
    },

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

      var messages = [];
      if (exceptions) {
        for (var i=0,l=exceptions.length; i<l; i++) {
          var message = exceptions[i].exception.toString() + "<br/>";
          message += testResultData.getStackTrace(exceptions[i].exception);
          messages.push(message);
        }
        this.__testResults[testName].messages = messages;
      }

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

    getUnsuccessfulResults : function()
    {
      var failedTests = {};
      for (var testName in this.__testResults) {
        var result = this.__testResults[testName];
        if (result.state !== "success") {
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
      if (qx.core.Variant.isSet("qx.debug", "on")) {
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
        if (qx.core.Variant.isSet("qx.debug", "on")) {
          this.debug("Request completed.");
        }
      }, this);
      req.send();
    }
  }
});