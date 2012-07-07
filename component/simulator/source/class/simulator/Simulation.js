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

/* ************************************************************************
 #ignore(environment)
 ************************************************************************ */

/**
 * Automated GUI test of a qooxdoo application using QxSelenium. Provides access
 * to the AUT's log messages and any exceptions caught by qooxdoo's global error
 * handling. Also supports event testing.
 */

qx.Class.define("simulator.Simulation", {

  extend : qx.core.Object,

  type : "singleton",

  /**
   * @param options {Map} Configuration settings
   */
  construct : function()
  {
    this.__options = {
      autHost : qx.core.Environment.get("simulator.autHost"),
      autPath : qx.core.Environment.get("simulator.autPath"),
      threadSafe : qx.core.Environment.get("simulator.threadSafe") || false,
      applicationLog : qx.core.Environment.get("simulator.applicationLog") || false,
      globalErrorLogging : qx.core.Environment.get("simulator.globalErrorLogging") || false,
      testEvents : qx.core.Environment.get("simulator.testEvents") || false
    };

    this.startDate = new Date();
    // for backwards compatibility:
    this.qxSelenium = simulator.QxSelenium.getInstance();
  },

  statics :
  {
    AUTWINDOW : 'selenium.qxStoredVars["autWindow"]',
    QXAPPLICATION : 'qx.core.Init.getApplication()'
  },

  members :
  {
    __options : null,

    /**
     * Starts the QxSelenium session, opens the AUT in the browser and waits
     * until the qooxdoo application is ready. Also makes the necessary
     * preparations to enable global error logging and/or application log
     * extraction if these options are configured.
     */
    startSession : function()
    {
      if (!this.__options.threadSafe) {
        // Using Selenium Grid's ThreadSafeSeleniumSessionStorage, session
        // should already be started.
        simulator.QxSelenium.getInstance().start();
      }
      var autUri = this.__options.autHost + "" + this.__options.autPath;
      this.qxOpen(autUri);
      this.waitForQxApplication();
      this._includeFeatures();
    },


    /**
     * Includes and initializes features as configured by settings
     */
    _includeFeatures : function()
    {
      if (this.__options.globalErrorLogging || this.__options.testEvents) {
        qx.Class.include(simulator.Simulation, simulator.MGlobalErrorHandling);
        this._addGlobalErrorHandler();
        this._addGlobalErrorGetter();
      }

      if (this.__options.applicationLog || this.__options.disposerDebug) {
        qx.Class.include(simulator.Simulation, simulator.MApplicationLogging);
        this._addAutLogStore();
        this._addAutLogGetter();
      }

      if (this.__options.testEvents) {
        qx.Class.include(simulator.Simulation, simulator.MEventSupport);
        this._addListenerSupport();
      }
    },


    /**
     * Waits until qx.core.Init.getApplication() in the AUT window returns
     * something.
     *
     * @param timeout {Integer} Time to wait (in milliseconds). Default: 3000
     * @param window {DOMWindow} Window the qooxdoo application is running in
     * @throws {Error} If the application isn't ready within the timeout
     */
    waitForQxApplication : function(timeout, window)
    {
      var qxWin = window || simulator.Simulation.AUTWINDOW;
      var qxAppReady = 'var qxReady = false; try { if (' +
                  qxWin + '.' +
                  simulator.Simulation.QXAPPLICATION +
                  ') { qxReady = true; } } catch(e) {} qxReady;';

      simulator.QxSelenium.getInstance().waitForCondition(qxAppReady, timeout || 30000);
    },


        /**
     * Uses the given locator to search the AUT for a qooxdoo widget. If found,
     * the return value of its toString method is returned. Otherwise, null is
     * returned.
     *
     * @param locator {String} (Qx)Selenium locator string
     * @return {String|null} String representation of the widget or null
     */
    getWidgetOrNull : function(locator)
    {
      var snippet = 'selenium.getQxWidgetByLocator("' + locator +'")';
      var widget;
      try {
        widget = String(simulator.QxSelenium.getInstance().getEval(snippet));
      } catch(ex) {
        widget = null;
      }
      return widget;
    },

    /**
     * Uses the given locator to search the AUT for a qooxdoo widget. If found,
     * the getter function for the property with the given name is called
     * and the value is returned. If no widget is found or the property does not
     * exist, null is returned.
     *
     * @param locator {String} (Qx)Selenium locator string
     * @param property {String} Name of a qooxdoo property
     * @return {String|null} Property value string or null
     */
    getWidgetPropertyValueOrNull : function(locator, property)
    {
      var propertyName = qx.lang.String.firstUp(property);
      var snippet = 'selenium.getQxObjectFunction("' + locator +'", "get' + propertyName + '")';
      var propertyValue;
      try {
        propertyValue = String(simulator.QxSelenium.getInstance().getEval(snippet));
      } catch(ex) {
        propertyValue = null;
      }
      return propertyValue;
    },

    /**
     * Repeatedly tries to find a visible widget using the given locator until
     * the timeout is reached.
     *
     * @throws an Error if no visible widget is found before the timeout is
     * reached
     * @param locator {String} (Qx)Selenium locator string
     * @param timeout {Integer?} Timeout in milliseconds. Default: 5000
     */
    waitForWidget : function(locator, timeout)
    {
      locator = locator.replace(/\"/g, '\\"');

      var snippet = '(function() {\
        try {\
          var widget = selenium.getQxWidgetByLocator("' + locator +'");\
        } catch(ex) {\
          return false;\
        }\
        return widget.isVisible();\
      })()';

      var timeout = timeout || 5000;
      try {
        simulator.QxSelenium.getInstance().waitForCondition(snippet, timeout.toString());
      }
      catch(ex) {
        if (ex.toString().match(/Timed out after/)) {
          // Use a more meaningful error message
          throw new Error("waitForWidget: No visible widget found for locator " + locator
          + " in " + timeout + "ms!");
        } else {
          //something else went wrong
          throw ex;
        }
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
      simulator.QxSelenium.getInstance().getEval('selenium.qxStoredVars = {}');
      this._storeEval('selenium.browserbot.getCurrentWindow()', 'autWindow');

      this._prepareNameSpace();
    },

    /**
     * Attaches a "Simulation" namespace object to the specified window's qx
     * object. This will be used to store custom methods added by the testing
     * framework using {@see #_addOwnFunction}. If no window is specified, the
     * AUT's window is used.
     *
     * @param win {String?} JavaScript snippet that evaluates as a Window object
     * accessible from the current Selenium instance. Default: The AUT's window.
     */
    _prepareNameSpace : function(win)
    {
      var targetWin = win || 'selenium.qxStoredVars["autWindow"]';
      var ns = String(simulator.QxSelenium.getInstance().getEval(targetWin + '.qx.Simulation'));
      if (ns == "null" || ns == "undefined") {
        simulator.QxSelenium.getInstance().getEval(targetWin + '.qx.Simulation = {};');
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
    _storeEval : function(code, keyName)
    {
      if (!code) {
        throw new Error("No code specified for _storeEval()");
      }

      if (!keyName) {
        throw new Error("No key name specified for _storeEval()");
      }

      simulator.QxSelenium.getInstance().getEval('selenium.qxStoredVars["' + keyName + '"] = ' + String(code));
    },

    /**
     * Adds a user-defined function to the "qx.Simulation" namespace of the
     * application under test. This function can then be called using
     * <code>selenium.getEval("selenium.browserbot.getCurrentWindow().qx.Simulation.funcName();")</code>
     *
     * @param funcName {String} name of the function to be added
     * @param func {Function|String} the function to be added
     */
    _addOwnFunction : function(funcName, func)
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

      simulator.QxSelenium.getInstance().getEval('selenium.browserbot.getCurrentWindow().qx.Simulation.' + funcName + ' = ' + func);
    },

    /**
     * Adds a user-defined function to the "qx.Simulation" namespace of the
     * application under test. This function can then be called using
     * <code>selenium.getEval("selenium.browserbot.getCurrentWindow().qx.Simulation[functionName]();")</code>
     *
     * In contrast to {@link _addOwnFunction}, the AUT window's Function object is
     * used to instantiate a "local" function. This is necessary e.g. in FF6+,
     * where function obejcts from other windows don't have the same properties
     * and methods, meaning e.g. they can't be used as qx event listener callbacks.
     *
     * @internal
     * @param name {String} name of the function to be added
     * @param func {Function} The function to be added
     * @param args {String[]?} Optional list of arguments for the function
     */
    addFunctionToAut : function(name, func, args)
    {
      if (qx.core.Environment.get("qx.debug")) {
        qx.core.Assert.assertString(name, "simulator.Simulation.addFunctionToAut: First argument must be a String!");
        qx.core.Assert.assertFunction(func, "simulator.Simulation.addFunctionToAut: Second argument must be a function!");
      }

      // replace newlines and double quotes
      func = func.toString().replace(/\n/g, "").replace(/\r/g, "").replace(/"/g, '\\"');
      var match = /\((.*?)\)\s*?\{(.*)\}/.exec(func);

      if (!match || !match[2]) {
        throw new Error("simulator.Simulation.addFunctionToAut: Couldn't parse function " + func);
      }

      var argStr = args ? '"' + args.join('", "') + '", ' : "";
      var body = match[2];

      var code = '(function() {var autWin = selenium.browserbot.getCurrentWindow(); autWin.qx.Simulation.'
      + name + ' = new autWin.Function(' + argStr + ' "' + body +'")})()';
      simulator.QxSelenium.getInstance().getEval(code);
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
                + this.__options.autHost
                + unescape(this.__options.autPath));
      this.info("Platform: " + environment["os.name"]);
    },

    /**
     * Logs the test browser's user agent string.
     */
    logUserAgent : function(){
      var agent = simulator.QxSelenium.getInstance().getEval('navigator.userAgent');
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
      if (this.__options.disposerDebug) {
        var getDisposerDebugLevel = simulator.Simulation.AUTWINDOW
          + ".qx.core.Environment.get('qx.debug.dispose.level')";
        var disposerDebugLevel = simulator.QxSelenium.getInstance().getEval(getDisposerDebugLevel);

        if (parseInt(disposerDebugLevel, 10) > 0 ) {
          this.qxShutdown();
        }
        else {
          this.warn("Dispose logging is active but the application's disposer debug level is 0!");
        }
      }

      if (this.__options.globalErrorLogging) {
        this.logGlobalErrors();
      }

      if (this.__options.applicationLog || this.__options.disposerDebug) {
        this.logAutLogEntries();
      }
    },

    /**
     * Logs the total duration of this simulation.
     */
    logRunTime : function()
    {
      var stopDate = new Date();
      var elapsed = stopDate.getTime() - this.startDate.getTime();
      elapsed = (elapsed / 1000);
      var min = Math.floor(elapsed / 60);
      var sec = Math.round(elapsed % 60);
      if (sec < 10) {
        sec = "0" + sec;
      }

      this.info("Simulator run finished in: " + min + " minutes " + sec + " seconds.");
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
      simulator.QxSelenium.getInstance().getEval(simulator.Simulation.AUTWINDOW
                              + '.qx.core.ObjectRegistry.shutdown()',
                              "Shutting down qooxdoo application");
    },

    /**
     * Loads a qooxdoo application in the test browser and prepares
     * it for testing. If no URI is given, the current AUT is reloaded.
     *
     * @param uri {String?} Optional URI of the qooxdoo application to be
     * loaded. Default: The AUT host/path defined in the settings.
     */
    qxOpen : function(uri)
    {
      var openUri = uri || this.__options.autHost + "" + this.__options.autPath;
      simulator.QxSelenium.getInstance().open(openUri);
      simulator.QxSelenium.getInstance().waitForCondition("selenium.browserbot.getCurrentWindow().qx", 5000);
      this._setupEnvironment();
    }

  }

});
