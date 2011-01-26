/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2011 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

************************************************************************ */

/**
 * Creates and runs a suite of integration tests using QxSelenium.
 */

qx.Class.define("simulator.TestRunner", {

  extend : qx.core.Object,
  
  statics :
  {
    /**
     * {Array} Names of optional configuration settings for the 
     * {@link simulator.QxSimulation} instance to be used for this test. 
     * Options are defined as settings in the "simulation" job.  
     */
    SETTING_NAMES : ["globalTimeout", "stepSpeed", "windowMaximize", 
                    "globalErrorLogging", "testEvents", "disposerDebug", 
                    "applicationLog"]
  },
  
  construct : function()
  {
    this.base(arguments);
    
    var testNameSpace = qx.core.Setting.get("simulator.nameSpace");
    var loader = new simulator.unit.TestLoader(testNameSpace);
    this.suite = loader.getSuite();
          
    var qxSelenium = this.getQxSelenium();
    this.simulation = this.getSimulation(qxSelenium);
  },
  
  members :
  {
    simulation : null,
    suite : null,
    __currentTest : null,
    
    /**
     * Runs all tests in the current suite.
     */
    runTests : function()
    {
      this.simulation.startSession();
      this.simulation.logEnvironment();
      this.simulation.logUserAgent();
      
      var testResult = this._initTestResult();
      this.suite.run(testResult);
      
      this.simulation.logRunTime();
      this.simulation.qxSelenium.stop();
    },
    
    /**
     * Creates a TestResult object and attaches listeners to its events
     * 
     * @return {simulator.unit.TestResult}
     */
    _initTestResult : function()
    {
      var testResult = new simulator.unit.TestResult();
      
      testResult.addListener("startTest", this._testStarted, this);
      testResult.addListener("error", this._testError, this);
      testResult.addListener("failure", this._testFailed, this);
      testResult.addListener("endTest", this._testEnded, this);
      
      return testResult;
    },
    
    /**
     * Called every time a test is started.
     * 
     * @param ev {qx.event.type.Data} the "data" property holds a reference to
     * the test function
     */
    _testStarted : function(ev)
    {
      this.__currentTest = ev.getData();
    },
    
    /**
     * Called if an exception was thrown during test execution.
     * 
     * @param ev {qx.event.type.Data} the "data" property holds a reference to
     * the exception
     */
    _testError : function(ev)
    {
      var exception = ev.getData();
      this._addExceptionToTest(exception);
      this.error("ERROR " + this.__currentTest.getFullName() + ": " + exception);
    },
    
    /**
     * Called if an assertion failed
     * 
     * @param ev {qx.event.type.Data} the "data" property holds a reference to
     * the exception
     */
    _testFailed : function(ev)
    {
      var exception = ev.getData();
      this._addExceptionToTest(exception);
      this.error("FAIL  " + this.__currentTest.getFullName() + ": " + exception);
    },
    
    /**
     * Called every time a test is finished.
     * 
     * @param ev {qx.event.type.Data} the "data" property holds a reference to
     * the test function
     */
    _testEnded : function(ev)
    {
      if (!this.__currentTest.exceptions) {
        this.info("PASS  " + this.__currentTest.getFullName());
      }
    },
    
    /**
     * Stores a test exception by adding it to an "exceptions" array attached to
     * the test object itself.
     * 
     * @param exception {Error} Error object to store
     */
    _addExceptionToTest : function(exception)
    {
      if (!this.__currentTest.exceptions) {
        this.__currentTest.exceptions = [];
      }
      this.__currentTest.exceptions.push(exception);
    },
    
    /**
     * Returns a map containing QxSimulation options.
     * 
     * @return {Map} Settings map
     */
    _getOptionalSettings : function()
    {
      var settings = {};
      var names = simulator.TestRunner.SETTING_NAMES;
      for (var i=0,l=names.length; i<l; i++) {
        try {
          settings[names[i]] = qx.core.Setting.get("simulator." + names[i]);
        } catch(ex) {
          settings[names[i]] = null;
        }
      }
      return settings;
    },
    
    /**
     * Configures and returns a QxSelenium instance.
     * 
     * @return {simulator.QxSelenium}
     */
    getQxSelenium : function()
    {
      var qxSelenium = simulator.QxSelenium.create(
        qx.core.Setting.get("simulator.selServer"),
        qx.core.Setting.get("simulator.selPort"),
        qx.core.Setting.get("simulator.testBrowser"),
        qx.core.Setting.get("simulator.autHost"));
      qxSelenium.setSpeed("1000");
      
      return qxSelenium;
    },
    
    /**
     * Configures and returns a QxSimulation instance.
     * 
     * @param qxSelenium {simulator.QxSelenium} QxSelenium instance to be used
     * by this QxSimulation
     * @return {simulator.QxSimulation}
     */
    getSimulation : function(qxSelenium)
    {
      var simulation = new simulator.QxSimulation(qxSelenium, 
        qx.core.Setting.get("simulator.autHost"),
        qx.core.Setting.get("simulator.autPath"),
        this._getOptionalSettings());
      
      return simulation;
    }
  }
  
});