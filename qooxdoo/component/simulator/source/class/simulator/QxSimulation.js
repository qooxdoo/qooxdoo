/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2010 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (d_wagner)

************************************************************************ */

/**
 * Automated GUI test of a qooxdoo application using QxSelenium. Provides access
 * to the AUT's log messages and any exceptions caught by qooxdoo's global error
 * handling. Also supports event testing.
 */

qx.Class.define("simulator.QxSimulation", {

  extend : qx.core.Object,

  /**
   * @param qxSelenium {QxSelenium} Configured QxSelenium instance
   * @param host {String} Host name of the AUT including protocol, e.g. 
   * "http://demo.qooxdoo.org"
   * @param path {String} URI path of the AUT, e.g. "/current/feedreader"
   * @param options {Map} Configuration settings 
   */
  construct : function(qxSelenium, host, path, options)
  {
    this.qxSelenium = qxSelenium;
    this.__autHost = host;
    this.__autPath = path;
    this._options = options || {};
    this.startDate = new Date();
  },
  
  statics :
  {
    AUTWINDOW : 'selenium.qxStoredVars["autWindow"]',
    QXAPPLICATION : 'qx.core.Init.getApplication()'
  },

  members :
  {
    
    __autHost : null,
    __autPath : null,

    /**
     * Starts the QxSelenium session, opens the AUT in the browser and waits 
     * until the qooxdoo application is ready. Also makes the necessary 
     * preparations to enable global error logging and/or application log 
     * extraction if these options are configured.
     */
    startSession : function()
    {
      this.qxSelenium.start();
      var autUri = this.__autHost + "" + this.__autPath;
      this.qxOpen(autUri);
      var qxAppReady = 'var qxReady = false; try { if (' + 
                  simulator.QxSimulation.AUTWINDOW + '.' + 
                  simulator.QxSimulation.QXAPPLICATION + 
                  ') { qxReady = true; } } catch(e) {} qxReady;';
                            
      this.qxSelenium.waitForCondition(qxAppReady, 30000);
      
      if (this._options.globalErrorLogging || this._options.testEvents) {
        qx.Class.include(simulator.QxSimulation, simulator.MGlobalErrorHandling);
        this.addGlobalErrorHandler();
        this.addGlobalErrorGetter();
      }
      
      if (this._options.applicationLog || this._options.disposerDebug) {
        qx.Class.include(simulator.QxSimulation, simulator.MApplicationLogging);
        this.addRingBuffer();
        this.addRingBufferGetter();
      }
      
      if (this._options.testEvents) {
        qx.Class.include(simulator.QxSimulation, simulator.MEventSupport);
        this._addListenerSupport();
        this.qxSelenium.getEval('selenium.qxStoredVars["eventStore"] = [];');
      }

    },
    
    /**
     * Adds a map to the global selenium object in the AUT that is used to store
     * testing-related data. Also stores a reference to the AUT's window object
     * that is used to avoid calling 
     * <code>selenium.browserbot.getCurrentWindow()</code> repeatedly.
     * This method must called be whenever a qooxdoo application is (re)loaded.
     */
    _setupEnvironment : function()
    {
      /* 
       * Store the AUT window object to avoid calling 
       * selenium.browserbot.getCurrentWindow() repeatedly.
       */
      this.qxSelenium.getEval('selenium.qxStoredVars = {}');    
      this.storeEval('selenium.browserbot.getCurrentWindow()', 'autWindow');
      
      this._prepareNameSpace();
    },

    /**
     * Attaches a "Simulation" namespace object to the specified window's qx 
     * object. This will be used to store custom methods added by the testing
     * framework using {@see #addOwnFunction}. If no window is specified, the 
     * AUT's window is used.
     * 
     * @param win {String?} JavaScript snippet that evaluates as a Window object 
     * accessible from the current Selenium instance. Default: The AUT's window.
     */
    _prepareNameSpace : function(win)
    {
      var targetWin = win || 'selenium.qxStoredVars["autWindow"]';
      var ns = String(this.qxSelenium.getEval(targetWin + '.qx.Simulation'));
      if (ns == "null" || ns == "undefined") {
        this.qxSelenium.getEval(targetWin + '.qx.Simulation = {};');
      }
    },

    /**
     * Evaluates a JavaScript snippet and stores the result in the 
     * "qxStoredVars" map attached to the AUT's global selenium object.
     * Stored values can be retrieved through Selenium.getEval:
     * <code>getEval('selenium.qxStoredVars["keyName"]')</code> 
     *
     * @param code {String} JavaScript snippet to be evaluated
     * @param keyName {String} The name for the key the eval result will be 
     * stored under.
     */
    storeEval : function(code, keyName)
    {
      if (!code) {
        throw new Error("No code specified for storeEval()");
      }
      
      if (!keyName) {
        throw new Error("No key name specified for storeEval()");
      }

      this.qxSelenium.getEval('selenium.qxStoredVars["' + keyName + '"] = ' + String(code));
    },

    /**
     * Adds a user-defined function to the "qx.Simulation" namespace of the 
     * application under test. This function can then be called using 
     * <code>selenium.getEval("selenium.browserbot.getCurrentWindow().qx.Simulation.funcName();")</code>
     * 
     * @param funcName {String} name of the function to be added
     * @param func {Function|String} the function to be added
     */
    addOwnFunction : function(funcName, func)
    {
      if (!funcName) {
        throw new Error("Please choose a name for the function to be added.");
      }
      
      if (!func) {
        throw new Error("No function specified.");
      }
      
      if (typeof func != "string") {
        func = func.toString();    
      }

      func = func.replace(/\n/,'');
      func = func.replace(/\r/,'');
      
      this.qxSelenium.getEval('selenium.browserbot.getCurrentWindow().qx.Simulation.' + funcName + ' = ' + func);
    },
    
    
    /**
     * Logs the Simulation's start date, URL of the AUT and the operating system
     * platform.
     * 
     * @lint ignoreUndefined(environment)
     */
    logEnvironment : function()
    {
      this.info("Simulator run on " + this.startDate.toUTCString());
      this.info("Application under test: " 
                + this.__autHost 
                + unescape(this.__autPath));
      this.info("Platform: " + environment["os.name"]);
    },
    
    /**
     * Logs the test browser's user agent string.
     */
    logUserAgent : function(){
      var agent = this.qxSelenium.getEval('navigator.userAgent');
      this.info("User agent: " + agent);
    },


    /**
     * Logs disposer debug messages, exceptions caught by qooxdoo's global error
     * handling and/or the AUT's log messages, depending on the test 
     * configuration used.
     * Note: Disposer debug logging will shut down the qx application so this 
     * should be the last action of the test case.
     */
    logResults : function()
    {
      if (this._options.disposerDebug) {
        var getDisposerDebugLevel = simulator.QxSimulation.AUTWINDOW 
          + ".qx.core.Setting.get('qx.disposerDebugLevel')";
        var disposerDebugLevel = this.qxSelenium.getEval(getDisposerDebugLevel);
        
        if (parseInt(disposerDebugLevel, 10) > 0 ) {
          this.qxShutdown();
        } 
        else { 
          this.warn("Dispose logging is active but the application's disposer debug level is 0!"); 
        }
      }
      
      if (this._options.globalErrorLogging) {
        this.logGlobalErrors();
      }
      
      if (this._options.applicationLog || this._options.disposerDebug) {
        this.logRingBufferEntries();
      }      
    },

    /**
     * Retrieves all messages from the AUT-side logger created by 
     * {@link simulator.MApplicationLogging#addRingBuffer} and writes them to 
     * the simulation log.
     */
    logRingBufferEntries : function()
    {
      var debugLog = this.qxSelenium.getEval(simulator.QxSimulation.AUTWINDOW 
        + ".qx.Simulation.getRingBufferEntries()");
      debugLog = String(debugLog);
      var debugLogArray = debugLog.split("|");
      
      for (var i=0,l=debugLogArray.length; i<l; i++) {
        this.info(debugLogArray[i]);
      }
    },

    /**
     * Retrieves all exceptions caught by the AUT's global error handling and 
     * logs them.
     */
    logGlobalErrors : function()
    {
      var globalErrors = this.getGlobalErrors();
      
      for (var i=0,l=globalErrors.length; i<l; i++) {
        if (globalErrors[i].length > 0) {
          this.error(globalErrors[i]);
        }
      }
    },
    
    /**
     * Pauses test execution for a given amount of time.
     * 
     * @param interval {Integer} Time (in milliseconds) to wait.
     */
    wait : function(interval)
    {
      Packages.java.lang.Thread.sleep(interval);
    },
    
    
    /**
     * Shuts down the AUT's qooxdoo application.
     */
    qxShutdown : function()
    {
      this.qxSelenium.getEval(simulator.QxSimulation.AUTWINDOW 
                              + '.qx.core.ObjectRegistry.shutdown()', 
                              "Shutting down qooxdoo application");
    },
    
    /**
     * Loads a qooxdoo application in the test browser and prepares 
     * it for testing. If no URI is given, the current AUT is reloaded.
     * 
     * @param uri {String?} Optional URI of the qooxdoo application to be loaded.
     */
    qxOpen : function(uri)
    {
      var openUri = uri || this.__autHost + "" + this.__autPath;
      this.qxSelenium.open(openUri);
      this._setupEnvironment();
    }

  }  

});
