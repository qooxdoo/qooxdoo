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
 * The TestRunner is responsible for loading the test classes and keeping track
 * of the test suite's state.
 */
qx.Class.define("testrunner.runner.TestRunner", {

  extend : qx.core.Object,


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */
  construct : function()
  {
    if (qx.core.Environment.get("qx.globalErrorHandling")) {
      qx.event.GlobalError.setErrorHandler(this._handleGlobalError, this);
    }

    // Create view
    this.__testsInView = [];
    var viewSetting = qx.core.Environment.get("testrunner.view");
    var viewClass = qx.Class.getByName(viewSetting);
    this.view = new viewClass();

    // Connect view and controller
    this.view.addListener("runTests", this.__runTests, this);

    this.view.addListener("stopTests", this.__stopTests, this);
    this.bind("testSuiteState", this.view, "testSuiteState");
    this.bind("testCount", this.view, "testCount");
    this.bind("testModel", this.view, "testModel");
    qx.data.SingleValueBinding.bind(this.view, "selectedTests", this, "selectedTests");

    // Get log appender element from view
    if (this.view.getLogAppenderElement) {
      this.__logAppender = new qx.log.appender.Element();
      qx.log.Logger.unregister(this.__logAppender);
      this.__logAppender.setElement(this.view.getLogAppenderElement());
      if (qx.core.Environment.get("testrunner.testOrigin") != "iframe") {
        qx.log.Logger.register(this.__logAppender);
      }
    }

    // Test namespace set by URI parameter
    var params = location.search;
    if (params.indexOf("testclass=") > 0 ) {
      this._testNameSpace = params.substr(params.indexOf("testclass=") + 10);
    } else {
      this._testNameSpace = qx.core.Environment.get("qx.testNameSpace");
    }

    // Load unit tests
    if (qx.core.Environment.get("testrunner.testOrigin") == "iframe") {
      // Load the tests from a standalone AUT
      this.__iframe = this.view.getIframe();
      qx.event.Registration.addListener(this.__iframe, "load", this._onLoadIframe, this);
      var src = qx.core.Environment.get("qx.testPageUri");
      src += "?testclass=" + this._testNameSpace;
      this.setTestSuiteState("loading");
      this.view.setAutUri(src);
    }
    else {
      this._loadInlineTests();
    }

    // Check if any test parts are defined
    this.__testParts = [];
    //var parts = qx.core.Environment.get("testrunner.testParts");
    var parts = null;
    if (parts) {
      this.__testParts = this.__testParts.concat(parts);
    }
  },


  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** Current state of the test suite */
    testSuiteState :
    {
      init : "init",
      check : [ "init", "loading", "ready", "running", "finished", "aborted", "error" ],
      event : "changeTestSuiteState"
    },

    /** Number of tests that haven't run yet */
    testCount :
    {
      init : null,
      nullable : true,
      check : "Integer",
      event : "changeTestCount"
    },

    /** Model object representing the test namespace. */
    testModel :
    {
      init : null,
      nullable : true,
      event : "changeTestModel"
    },

    /** List of tests selected by the user */
    selectedTests :
    {
      nullable : true,
      init : null,
      apply : "_applySelectedTests"
    }
  },


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __iframe : null,
    __loadTimer : null,
    __loadAttempts : null,
    __logAppender : null,
    __testParts : null,
    __testsInView : null,
    _testNameSpace : null,


    /**
     * Loads test classes that are a part of the TestRunner application.
     *
     * @param nameSpace {String|Object} Test namespace to be loaded
     */
    _loadInlineTests : function(nameSpace)
    {
      nameSpace = nameSpace || this._testNameSpace;
      this.setTestSuiteState("loading");
      this.loader = new qx.dev.unit.TestLoaderInline();
      this.loader.setTestNamespace(nameSpace);
      this.__wrapAssertions();
      this.__getTestModel();
    },


    /**
     * Returns the loader's test representation object
     *
     * @return {Object} Test representation
     */
    __getTestRep : function()
    {
      var testRep = this.loader.getTestDescriptions();
      if (!testRep) {
        this.error("Couldn't get test descriptions from loader!");
        return null;
      }
      return qx.lang.Json.parse(testRep);
    },


    /**
     * Constructs a model of the test suite from the loader's test
     * representation data
     */
    __getTestModel : function()
    {
      if (this.currentTestData) {
        this.currentTestData = null;
        delete this.currentTestData;
      }
      var oldModel = this.getTestModel();
      if (oldModel) {
        this.getTestModel().dispose();
        this.__testsInView = [];
      }
      this.setTestModel(null);

      var testRep = this.__getTestRep();
      var modelData = testrunner.runner.ModelUtil.createModelData(testRep);
      var delegate = {
        getModelSuperClass : function(properties) {
          return testrunner.runner.TestItem;
        }
      };
      var marshal = new qx.data.marshal.Json(delegate);
      marshal.toClass(modelData.children[0], true);
      var model = marshal.toModel(modelData.children[0]);
      testrunner.runner.ModelUtil.addDataFields(model);
      this.setTestModel(model);
      this.setTestSuiteState("ready");
    },


    /**
     * Wraps all assert* methods included in qx.dev.unit.TestCase in try/catch
     * blocks. For each caught exception, a data event containing the Error
     * object will be fired on the test class. This allows the Testrunner to
     * mark the test as failed while any code following an assertion call will
     * still be executed. Aborting the test execution whenever an assertion
     * fails has caused some extremely hard to debug problems in the qooxdoo
     * framework unit tests in the past.
     *
     * Doing this in the Testrunner application is a temporary solution: It
     * really should be done in qx.dev.unit.TestCase, but that would break
     * backwards compatibility with the existing testrunner component. Once
     * testrunner has fully replaced testrunner, this code should be moved.
     *
     * @param autWindow {DOMWindow?} The test application's window. Default: The
     * Testrunner's window.
     */
    __wrapAssertions : function(autWindow)
    {
      var win = autWindow || window;
      var tCase = win.qx.dev.unit.TestCase.prototype;
      for (var prop in tCase) {
        if ((prop.indexOf("assert") == 0 || prop === "fail") &&
            typeof tCase[prop] == "function") {
          // store original assertion func
          var originalName = "__" + prop;
          tCase[originalName] = tCase[prop];
          // create wrapped assertion func
          var f = function() {
            var argumentsArray = qx.lang.Array.fromArguments(arguments);
            try {
              this[arguments.callee.originalName].apply(this, argumentsArray);
            } catch(ex) {
              this.fireDataEvent("assertionFailed", ex);
            }
          };

          if (qx.core.Environment.get("browser.name") === "ie" &&
              qx.core.Environment.get("browser.version") < 9) {
            // need to use the AUT window's Function since IE 6/7/8 can't catch
            // exceptions from other windows.
            var body = f.toString();
            body = /{(.*)}/img.exec(body.replace(/\n/gm, ""))[1];
            tCase[prop] = new win.Function(body);
          }
          else {
            tCase[prop] = f;
          }
          tCase[prop].originalName = originalName;
        }
      }
    },


    __runTests : function() {
      if (this.getTestSuiteState() === "aborted") {
        this.setTestSuiteState("ready");
      }
      if (this.__logAppender) {
        this.__logAppender.clear();
      }
      this.runTests();
    },

    __stopTests : function() {
      this.setTestSuiteState("aborted");
    },


    /**
     * Runs all tests in the list.
     */
    runTests : function()
    {
      var suiteState = this.getTestSuiteState();
      switch (suiteState) {
        case "loading":
          this.__testsInView = [];
          break;
        case "ready":
        case "finished":
          if (this.testList.length > 0) {
            this.setTestSuiteState("running");
            break;
          } else {
            return;
          }
        case "aborted":
        case "error":
          return;
      }

      if (this.testList.length == 0) {
        if (this.__testParts && this.__testParts.length > 0) {
          var nextPart = this.__testParts.shift();
          qx.io.PartLoader.require([nextPart], function()
          {
            this._loadInlineTests(nextPart);
            this.runTests();
          }, this);
          return;
        }
        else {
          var self = this;
          /*
           * Ugly hack: Since the tests are run asynchronously we can't rely on
           * the queue to determine when everything is done.
           * TODO: de-uglify this.
           */
          window.setTimeout(function() {
            self.setTestSuiteState("finished");
          }, 250);
          return;
        }
      }

      var currentTest = this.currentTestData = this.testList.shift();
      currentTest.resetState();
      this.setTestCount(this.testList.length);
      var className = currentTest.parent.fullName;
      var functionName = currentTest.getName();
      var testResult = this.__initTestResult(currentTest);

      var self = this;
      window.setTimeout(function() {
        self.loader.runTests(testResult, className, functionName);
      }, 0);
    },


    /**
     * Creates the TestResult object that will run the actual test functions.
     * @return {qx.dev.unit.TestResult} The configured TestResult object
     */
    __initTestResult : function()
    {
      if (qx.core.Environment.get("testrunner.testOrigin") == "iframe") {
        var frameWindow = qx.bom.Iframe.getWindow(this.__iframe);
        var testResult = new frameWindow.qx.dev.unit.TestResult();

      } else {
        var testResult = new qx.dev.unit.TestResult();
      }

      testResult.addListener("startTest", function(e) {
        var test = e.getData();

        if (this.currentTestData && this.currentTestData.fullName === test.getFullName()
          && this.currentTestData.getState() == "wait") {
          this.currentTestData.setState("start");
          return;
        }

        /* EXPERIMENTAL: Check if the test polluted the DOM
        if (qx.core.Environment.get("testrunner.testOrigin") == "iframe") {
          if (this.frameWindow.qx.test && this.frameWindow.qx.test.ui &&
              this.frameWindow.qx.test.ui.LayoutTestCase &&
              test.getTestClass() instanceof this.frameWindow.qx.test.ui.LayoutTestCase ) {
            test.getTestClass().getRoot();
            test.getTestClass().flush();
          }
          this.__bodyLength = this.frameWindow.document.body.innerHTML.length;
        }
        */

        if (!qx.lang.Array.contains(this.__testsInView, this.currentTestData.fullName)) {
          this.view.addTestResult(this.currentTestData);
          this.__testsInView.push(this.currentTestData.fullName);
        }
      }, this);

      testResult.addListener("wait", function(e) {
        this.currentTestData.setState("wait");
      }, this);

      testResult.addListener("failure", function(e) {
        this.currentTestData.setExceptions(e.getData());
        this.currentTestData.setState("failure");
      }, this);

      testResult.addListener("error", function(e) {
        this.currentTestData.setExceptions(e.getData());
        this.currentTestData.setState("error");
      }, this);

      testResult.addListener("skip", function(e) {
        this.currentTestData.setExceptions(e.getData());
        this.currentTestData.setState("skip");
      }, this);

      testResult.addListener("endTest", function(e) {
        if (qx.core.Environment.get("testrunner.testOrigin") == "iframe") {
          if (this.__logAppender) {
            this.__fetchIframeLog();
          }
        }

        var state = this.currentTestData.getState();
        if (state == "start") {
          this.currentTestData.setState("success");
        }

        /* EXPERIMENTAL: Check if the test polluted the DOM
        var fWin = this.frameWindow;

        if (qx.core.Environment.get("testrunner.testOrigin") == "iframe") {
          fWin.qx.ui.core.queue.Dispose.flush();
          fWin.qx.ui.core.queue.Manager.flush();

          if (fWin.qx.bom && fWin.qx.bom.Label) {
            if (fWin.qx.bom.Label._htmlElement) {
              fWin.document.body.removeChild(fWin.qx.bom.Label._htmlElement);
            }
            if (fWin.qx.bom.Label._textElement) {
              fWin.document.body.removeChild(fWin.qx.bom.Label._textElement);
            }
          }

          if (this.__bodyLength != fWin.document.body.innerHTML.length) {
            var error = new Error("Incomplete tearDown: The DOM was not reverted to its initial state!");
            this.currentTestData.setExceptions([error]);
            this.currentTestData.setState("error");
          }
        }
        */

        qx.event.Timer.once(this.runTests, this, 0);
      }, this);

      return testResult;
    },


    /**
     * Waits until the test application in the iframe has finished loading, then
     * retrieves its TestLoader.
     * @param ev {qx.event.type.Event} Iframe's "load" event
     */
    _onLoadIframe : function(ev)
    {
      if (ev && ev.getType() == "load") {
        this.setTestSuiteState("loading");
      }

      if (!this.__loadAttempts) {
        this.__loadAttempts = 0;
      }
      this.__loadAttempts++;

      this.frameWindow = qx.bom.Iframe.getWindow(this.__iframe);

      if (this.__loadTimer)
      {
        this.__loadTimer.stop();
        this.__loadTimer = null;
      }

      if (this.__loadAttempts <= 300) {

        // Detect failure to access frame after some period of time
        if (!this.frameWindow.body) {
          if (this.__loadAttempts >= 20 && window.location.protocol == "file:") {
            alert("Failed to load application from the file system.\n\n" +
                  "The security settings of your browser may prohibit to access " +
                  "frames loaded using the file protocol. Please try the http " +
                  "protocol instead.");

            // Quit
            return;
          }
        }

        // Repeat until testrunner in iframe is loaded
        if (!this.frameWindow.testrunner) {
          this.__loadTimer = qx.event.Timer.once(this._onLoadIframe, this, 100);
          return;
        }

        this.loader = this.frameWindow.testrunner.TestLoader.getInstance();
        // Avoid errors in slow browsers

        if (!this.loader) {
          this.__loadTimer = qx.event.Timer.once(this._onLoadIframe, this, 100);
          return;
        }

        if (!this.loader.getSuite()) {
          this.__loadTimer = qx.event.Timer.once(this._onLoadIframe, this, 100);
          return;
        }
      }
      else {
        this.setTestSuiteState("error");
        this.__loadAttempts = 0;
        return;
      }

      this.__loadAttempts = 0;

      var frameParts = this.frameWindow.qx.core.Environment.get("testrunner.testParts");
      if (frameParts instanceof this.frameWindow.Boolean) {
        frameParts = frameParts.valueOf();
      }
      if (frameParts) {
        for (var i = 0; i < frameParts.length; i++) {
          this.__testParts.push(frameParts[i]);
        }
      }

      this.__wrapAssertions(this.frameWindow);
      this.__getTestModel();
    },


    /**
     * Sets the list of pending tests to those selected by the user.
     *
     * @param value {String[]} Selected tests
     * @param old {String[]} Previous value
     */
    _applySelectedTests : function(value, old)
    {
      if (!value) {
        return;
      }
      if (old) {
        old.removeListener("change", this._onChangeTestSelection, this);
      }
      value.addListener("change", this._onChangeTestSelection, this);
      this._onChangeTestSelection();
    },


    /**
     * Sets the pending test list and count according to the selection
     */
    _onChangeTestSelection : function() {
      this.testList = this._getFlatTestList();
      // Make sure the value is applied even if it didn't change so the view is
      // updated
      if (this.testList.length == this.getTestCount()) {
        this.resetTestCount();
      }
      this.setTestCount(this.testList.length);
    },


    /**
     * Returns an array containing all "test" children of the current test
     * selection
     *
     * @return {Object[]} Test array
     */
    _getFlatTestList : function()
    {
      var selection = this.getSelectedTests();
      if (selection.length == 0) {
        return new qx.data.Array();
      }

      var testList = [];
      for (var i=0,l=selection.length; i<l; i++) {
        var item = selection.getItem(i);
        var testsFromItem = testrunner.runner.ModelUtil.getItemsByProperty(item, "type", "test");
        testList = testList.concat(testsFromItem);
      }
      return testList;
    },


    /**
     * Logs any errors caught by qooxdoo's global error handling.
     *
     * @param ex{Error} Caught exception
     */
    _handleGlobalError : function(ex)
    {
      this.error(ex);
    },

    /**
     * Retrieves the AUT's log messages and writes them to the current appender.
     */
    __fetchIframeLog : function()
    {
      var w = qx.bom.Iframe.getWindow(this.__iframe);

      var logger;
      if (w.qx && w.qx.log && w.qx.log.Logger)
      {
        logger = w.qx.log.Logger;
        if (this.view.getLogLevel) {
          logger.setLevel(this.view.getLogLevel());
        }
        // Register to flush the log queue into the appender.
        logger.register(this.__logAppender);
        logger.clear();
        logger.unregister(this.__logAppender);
      }
    }

  },

  destruct : function()
  {
    this.view.removeListener("runTests", this.__runTests, this);
    this.view.removeListener("stopTests", this.__stopTests, this);
    this.removeAllBindings();
    testrunner.runner.ModelUtil.disposeModel(this.getTestModel());
    this._disposeArray("testsInView");
    this._disposeArray("testList");
    this._disposeArray("__testParts");
    this._disposeArray("testPackageList");
    this._disposeObjects("view", "__logAppender", "currentTestData", "loader",
    "__loadTimer");
    this.__iframe = null;
    delete this.__iframe;
    this.frameWindow = null;
    delete this.frameWindow;
  }

});