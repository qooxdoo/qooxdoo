/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

************************************************************************ */

/**
 * This view automatically runs all unit tests in the current suite and reports
 * failed tests by sending a HTTP request to the URL defined by the
 * "testrunner.reportServer" envrironment setting.
 *
 */
qx.Class.define("testrunner.view.Reporter", {

  extend : testrunner.view.Console,

  include : [testrunner.view.MReportResult],

  construct : function()
  {
    this.base(arguments);

    this.__ignoredPackages = this._getIgnoredPackages();
    if (this.__ignoredPackages.length > 0) {
      var ignored = document.createElement("p");
      ignored.style.color = "red";
      ignored.innerHTML = "Skipping packages: " + this.__ignoredPackages.join(", ");
      document.body.appendChild(ignored);
    }

    var statusContainer = document.createElement("p");
    statusContainer.innerHTML = "<strong>Test Suite Status:</strong> ";
    this.__statusElement = document.createElement("span");
    statusContainer.appendChild(this.__statusElement);
    document.body.appendChild(statusContainer);

    var infoContainer = document.createElement("p");
    infoContainer.innerHTML = "<strong>Current Test:</strong> ";
    this.__infoElem = document.createElement("span");
    infoContainer.appendChild(this.__infoElem);
    document.body.appendChild(infoContainer);
  },

  members :
  {
    __testPackages : null,
    __infoElem : null,
    __ignoredPackages : null,
    __statusElement : null,

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
     * Runs the next package from the list of test namespaces.
     */
    autoRun : function()
    {
      if (this.__testPackages.length > 0) {
        var nextPackageName = this.__testPackages.shift();
        var nextPackage = testrunner.runner.ModelUtil.getItemByFullName(this.getTestModel(), nextPackageName);
        this._runPackage(nextPackage);
      }
    },

    /**
     * Runs a given subset of tests
     * @param pkg {testrunner.runner.TestItem} Tests to run
     */
    _runPackage : function(pkg)
    {
      if (pkg) {
        this.getSelectedTests().removeAll();
        this.getSelectedTests().push(pkg);
        if (pkg.fullName.indexOf("qx.test.io") !== 0) {
          this.setGlobalErrorHandler();
        }
        this.setStatus("Running package " + pkg.fullName);
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
          var pkg = packages.getItem(i);
          var packageName = pkg.fullName;
          if (this.__ignoredPackages.includes(packageName)) {
            continue;
          }
          if (packageName == "qx.test.ui") {
            for (var j=0,m=pkg.getChildren().length; j<m; j++) {
              packageName = pkg.getChildren().getItem(j).getFullName();
              if (!this.__ignoredPackages.includes(packageName)) {
                this.__testPackages.push(packageName);
              }
            }
          }
          else {
            this.__testPackages.push(packageName);
          }
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
      this.saveTestResult(testResultData);
      var testName = testResultData.getFullName();
      var state = this.getTestResults()[testName].state;

      this.__infoElem.innerHTML = testName + ": " + state;

      if ((state == "failure" || state == "error") &&
        qx.core.Environment.get("testrunner.reportServer"))
      {
        this.reportResult(testName);
      }
    },


    /**
     * Get a list of packages to skip from the <code>ignore</code> URI parameter
     * @return {String[]} List of package names to ignore
     */
    _getIgnoredPackages : function()
    {
      var parsedUri = qx.util.Uri.parseUri(location.href);
      if (parsedUri.queryKey && parsedUri.queryKey.ignorePackages) {
        return parsedUri.queryKey.ignorePackages.split(",");
      }
      return [];
    },


    // overridden
    _applyStatus : function(value)
    {
      this.__statusElement.innerHTML = value;
    }

  }
});
