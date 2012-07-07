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

  extend : testrunner.runner.TestRunnerBasic,


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */
  construct : function()
  {
    this.TEST_MIXINS  = [qx.dev.unit.MMock, qx.dev.unit.MRequirements];
    if (qx.core.Environment.get("testrunner.performance")) {
      this.TEST_MIXINS.push(qx.dev.unit.MMeasure);
    }

    if (qx.core.Environment.get("testrunner.reportServer")) {
      var viewClass = qx.Class.getByName(qx.core.Environment.get("testrunner.view"));
      qx.Class.include(viewClass, testrunner.view.MReportResult);
    }

    this.base(arguments);

    // Get log appender element from view
    if (this.view.getLogAppenderElement) {
      this.__logAppender = new qx.log.appender.Element();
      qx.log.Logger.unregister(this.__logAppender);
      this.__logAppender.setElement(this.view.getLogAppenderElement());
      if (qx.core.Environment.get("testrunner.testOrigin") != "iframe") {
        qx.log.Logger.register(this.__logAppender);
      }
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
    frameWindow : null,
    __loadAttempts : null,
    __loadTimer : null,
    __logAppender : null,
    _externalTestClasses : null,

    TEST_MIXINS : null,


    _getTestNameSpace : function()
    {
      // Test namespace set by URI parameter
      var params = location.search;
      if (params.indexOf("testclass=") > 0 ) {
        return params.substr(params.indexOf("testclass=") + 10);
      }
      return qx.core.Environment.get("qx.testNameSpace");
    },


    _loadTests : function()
    {
      var origin = qx.core.Environment.get("testrunner.testOrigin");
      switch(origin) {
        case "iframe":
          // Load the tests from a standalone AUT
          this.__iframe = this.view.getIframe();
          qx.event.Registration.addListener(this.__iframe, "load", this._onLoadIframe, this);
          var src = qx.core.Environment.get("qx.testPageUri");
          src += "?testclass=" + this._testNameSpace;
          this.setTestSuiteState("loading");
          this.view.setAutUri(src);
          break;
        case "inline":
          this._loadInlineTests();
          break;
        case "external":
          this._loadExternalTests();
          break;
      }
    },


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
      this._wrapAssertions();
      this._getTestModel();
    },


    // overridden
    _defineTestClass : function(testClassName, membersMap)
    {
      var qxClass = qx.Class;
      var classDef = {
        extend : qx.dev.unit.TestCase,
        members : membersMap
      };
      if (this.TEST_MIXINS) {
        classDef.include = this.TEST_MIXINS;
      }
      return qxClass.define(testClassName, classDef);
    },


    _runTests : function() {
      if (this.__logAppender) {
        this.__logAppender.clear();
      }
      this.base(arguments);
    },


    _getTestResult : function()
    {
      if (qx.core.Environment.get("testrunner.testOrigin") == "iframe") {
        var frameWindow = qx.bom.Iframe.getWindow(this.__iframe);
        var testResult = new frameWindow.qx.dev.unit.TestResult();

      } else {
        var testResult = new qx.dev.unit.TestResult();
      }
      return testResult;
    },


    _onTestEnd : function(ev) {
      if (qx.core.Environment.get("testrunner.testOrigin") == "iframe") {
        if (this.__logAppender) {
          this.__fetchIframeLog();
        }
      }

      this.base(arguments);
    },


    /**
     * Waits until the test application in the iframe has finished loading, then
     * retrieves its TestLoader.
     * @param ev {qx.event.type.Event} Iframe's "load" event
     *
     * @lint ignoreDeprecated(alert)
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
            this.setTestSuiteState("error");
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
          this._testParts.push(frameParts[i]);
        }
      }

      if (this.__logAppender) {
        this.__logAppender.clear();
      }

      this._wrapAssertions(this.frameWindow);
      this._getTestModel();
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
    this._disposeObjects("__logAppender", "__loadTimer");
    this.__iframe = null;
    delete this.__iframe;
    this.frameWindow = null;
    delete this.frameWindow;
  }

});