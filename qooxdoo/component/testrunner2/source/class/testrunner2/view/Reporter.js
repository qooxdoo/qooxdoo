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
    this.__reportServerUrl = qx.core.Environment.get("testrunner2.reportServer");
  },
  
  members :
  {
    __packages : null,
    __currentPackage : null,
    __loadAttempts : null,
    __reportServerUrl : null,
    
    _applyTestSuiteState : function(value, old)
    {
      switch(value) 
      {
        case "loading":
          if (this.__currentPackage) {
            this.info("Loading package " + this.__currentPackage);
          }
          else {
            this.info("Loading test suite");
          }
          break;
        case "ready" :
          this.__loadAttempts = 0;
          if (!this.__packages) {
            this.__packages = this.getTestPackages();
            //this.__packages = this.getTestClasses();
            if (qx.core.Variant.isSet("qx.debug", "on")) {
              this.debug(this.__packages.length + " test packages in this suite");
            }
            this.loadPackage();
          }
          else {
            this.run();
          }
          break;
        case "error":
          if (this.__currentPackage) {
            this.error("Package " + this.__currentPackage + " not loaded after 3 attempts, quitting!");
          }
          else {
            this.error("Couldn't load test suite.");
          }
          break;
        case "running":
          this.info("Running tests");
          break;
        case "finished":
          this.info("Package finished, " + this.__packages.length + " to go");
          this.loadPackage();
          break;
        case "aborted":
          break;
      }
    },
    
    
    /**
     * Uses the "testclass" paramater of the AUT iframe URL to load a subset of
     * tests from the current suite.
     * 
     * @param packageName {String?} Name of a test package or class. Default: 
     * The next entry from the current list of packages
     */
    loadPackage : function(packageName)
    {
      var testPackage = packageName || this.__packages.shift();
      if (testPackage) {
        this.__currentPackage = testPackage;
        var newAutUri = this.getAutUri().replace(/(.*?testclass=)(.*)/, "$1" + testPackage);
        this.setAutUri(newAutUri);
      }
    },
    
    
    /**
     * Compiles a list of test packages by looking at the full list of tests for
     * the current suite.
     * 
     * @return {String[]} List of test package names
     */
    getTestPackages : function()
    {
      var packageList = [];
      var testNameSpace = qx.core.Init.getApplication().runner._testNameSpace;
      var fullList = this.getInitialTestList();
      for (var i=0,l=fullList.length; i<l; i++) {
        var test = fullList[i];
        var testClass = test.substring(test.indexOf(testNameSpace) + testNameSpace.length + 1, test.indexOf(":"));
        var testPackage;
        if (testClass.substr(0,1) === testClass.substr(0,1).toUpperCase()) {
          testPackage = testClass;
        } else {
          var match = /^(.*?)\./.exec(testClass);
          if (match[1]) {
            testPackage = match[1];
          }
        }
        var fullPackageName = testNameSpace + "." + testPackage;
        if (testPackage && (!qx.lang.Array.contains(packageList, fullPackageName))) {
          packageList.push(fullPackageName);
        }
      }
      return packageList;
    },
    
    
    /**
     * Returns a list of all classes in the current test suite.
     * 
     * @return {String[]} List of test class names
     */
    getTestClasses : function()
    {
      var classList = [];
      var fullList = this.getInitialTestList();
      for (var i=0,l=fullList.length; i<l; i++) {
        var testName = fullList[i];
        var match = /(.*?)\:/.exec(testName);
        if (match[1]) {
          if (!qx.lang.Array.contains(classList, match[1])) {
            classList.push(match[1]);
          }
        }
      }
      return classList;
    },
    
    
    /**
     * Reports any tests that change state to "failure" or "error"
     * 
     * @param testResultData {testrunner2.unit.TestResultData} Result data 
     * object
     */
    _onTestChangeState : function(testResultData)
    {
      this.base(arguments, testResultData);
      var state = testResultData.getState();
      
      if (state == "failure" || state == "error") {
        var testName = testResultData.getFullName();
        var exceptions = testResultData.getExceptions();
        
        var autUri = qx.bom.Iframe.queryCurrentUrl(this.getIframe());
        if (autUri.indexOf("?") > 0) {
          autUri = autUri.substring(0, autUri.indexOf("?"));
        }
        
        var message = "";
        if (exceptions) {
          for (var i=0,l=exceptions.length; i<l; i++) {
            if (exceptions[i].exception.message) {
              message += exceptions[i].exception.message + "\n";
            }
            else {
              message += exceptions[i].exception.toString() + "\n";
            }
          }
        }
        
        if (this.__reportServerUrl) {
          var data = {
            testName : testName,
            message : message,
            autUri : autUri
          };
          
          this.reportResult(data);
        }
      }
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