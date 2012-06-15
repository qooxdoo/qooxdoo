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
 * "testrunner.reportServer" envrironment setting.
 *
 */
qx.Class.define("testrunner.view.Reporter", {

  extend : testrunner.view.Console,

  include : [testrunner.view.MReportResult],

  construct : function()
  {
    this.base(arguments);
    var info = document.createElement("div");
    info.id = "info";
    document.body.appendChild(info);
    this.__infoElem = document.getElementById("info");
  },

  members :
  {
    __testPackages : null,
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
      this.saveTestResult(testResultData);
      var testName = testResultData.getFullName();
      var state = this.getTestResults()[testName].state;

      this.__infoElem.innerHTML = testName + ": " + state;

      if ((state == "failure" || state == "error") &&
        qx.core.Environment.get("testrunner.reportServer"))
      {
        this.reportResult(testName);
      }
    }
  }
});