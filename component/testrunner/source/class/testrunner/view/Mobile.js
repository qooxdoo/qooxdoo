qx.Class.define("testrunner.view.Mobile", {

  extend : testrunner.view.Abstract,

  construct : function()
  {
    this._initPage();
  },

  members :
  {
    __mainPage : null,
    __iframe : null,
    __testList : null,

    /**
     * Tells the TestRunner to run all configured tests.
     */
    run : function()
    {
      this.__suiteResults = {
        startedAt : new Date().getTime(),
        finishedAt : null,
        tests : {}
      };

      this.fireEvent("runTests");
    },

    /**
     * Tells the TestRunner to stop running any pending tests.
     */
    stop : function()
    {
      this.fireEvent("stopTests");
    },

    _initPage : function()
    {
      this.__testItems = {};
      var mainPage = this.__mainPage = new qx.ui.mobile.page.NavigationPage();
      mainPage.setTitle("qooxdoo Test Runner");
      mainPage.addListener("initialize", function()
      {
        var runButton = new qx.ui.mobile.form.Button("Run Tests");
        runButton.addListener("tap", this.run, this);
        var stopButton = new qx.ui.mobile.form.Button("Stop Tests");
        stopButton.addListener("tap", this.stop, this);
        var buttonContainer = new qx.ui.mobile.container.Composite(new qx.ui.mobile.layout.HBox());
        buttonContainer.add(runButton);
        buttonContainer.add(stopButton);

        var buttonGroup = new qx.ui.mobile.form.Group([buttonContainer]);
        buttonGroup.setShowBorder(false);
        mainPage.addAfterNavigationBar(buttonGroup);

        var self = this;
        var list = this.__testList = new qx.ui.mobile.list.List({
          configureItem : function(item, data, row)
          {
            // This doesn't work since property changes on the item don't trigger
            // re-rendering of the list
            //data.bind("state", item, "subtitle");
            item.setSubtitle(data.getState());
            item.setTitle(data.getFullName());
            /*
            item.setImage("qx/icon/Tango/22/apps/internet-mail.png");
            item.setSelectable(row<4);
            item.setShowArrow(row<4);
            */
          }
        });
        mainPage.getContent().add(list);
        /*
        var button = new qx.ui.mobile.form.Button("Next Page");
        mainPage.getContent().add(button);

        button.addListener("tap", function() {
          page2.show();
        }, this);
         */
      }, this);

      // Add the pages to the page manager.
      var manager = new qx.ui.mobile.page.Manager(false);
      manager.addDetail([
        mainPage
      ]);

      // mainPage will be shown at start
      mainPage.show();
    },

    getIframe : function()
    {
      if (!this.__iframe) {
        this.__iframe = qx.bom.Iframe.create({
          onload: "qx.event.handler.Iframe.onevent(this)",
          id: "autframe",
          width: "0px",
          height: "0px"
        });

        this.__mainPage.getContentElement().appendChild(this.__iframe);
      }

      return this.__iframe;
    },

    /**
     * (Re)Loads the AUT in the iframe.
     *
     * @param value {String} AUT URI
     * @param old {String} Previous value
     * @lint ignoreUndefined($)
     */
    _applyAutUri : function(value, old)
    {
      if (!value || value == old) {
        return;
      }

      var frame =this.getIframe();
      qx.bom.Iframe.setSource(frame, value);
    },

    /**
     * Writes a status message to the browser's logging console.
     *
     * @param value {String} New status value
     * @param old {String} Previous status value
     */
    _applyStatus : function(value, old)
    {
      if (!value[0] || (value === old)) {
        return;
      }

      this.info(value);
    },


    /**
     * Log the test suite's current status.
     *
     * @param value {String} New testSuiteState
     * @param value {String} Previous testSuiteState
     */
    _applyTestSuiteState : function(value, old)
    {
      switch(value)
      {
        case "init":
          this.setStatus("Waiting for tests");
          break;
        case "loading" :
          this.setStatus("Loading tests...");
          break;
        case "ready" :
          this.setStatus(this.getSelectedTests().length + " tests ready. Call qx.core.Init.getApplication().runner.view.run() to start.");
          break;
        case "error" :
          this.setStatus("Couldn't load test suite!");
          break;
        case "running" :
          this.setStatus("Running tests...");
          break;
        case "finished" :
          this.__suiteResults.finishedAt = new Date().getTime();
          this.setStatus("Test suite finished. Call qx.core.Init.getApplication().runner.view.getTestResults() to get the results.");
          break;
        case "aborted" :
          this.setStatus("Test run aborted");
          break;
      }
    },

    _applyTestModel : function(value, old)
    {
      if (!value) {
        return;
      }
      var testList = testrunner.runner.ModelUtil.getItemsByProperty(value, "type", "test");
      testList = new qx.data.Array(testList);
      testList.addListener("changeBubble", function() {
        console.log("MODELCHANGE");
      });
      this.__testList.setModel(testList);
      this.setSelectedTests(testList);
    },


    _applyTestCount : function(value, old)
    {},

    /**
     * Logs state changes in testResultData objects.
     *
     * @param testResultData {testrunner.unit.TestResultData} Test result data
     * object
     */
    _onTestChangeState : function(testResultData)
    {
      var testName = testResultData.getFullName();
      var state = testResultData.getState();

      var exceptions = testResultData.getExceptions();

      //Update test results map
      if (!this.__suiteResults.tests[testName]) {
        this.__suiteResults.tests[testName] = {};
      }
      this.__suiteResults.tests[testName].state = state;

      if (exceptions) {
        this.__suiteResults.tests[testName].exceptions = [];
        for (var i=0,l=exceptions.length; i<l; i++) {
          var ex = exceptions[i].exception;
          var type = ex.classname || ex.type || "Error";

          var message = ex.toString ? ex.toString() :
            ex.message ? ex.message : "Unknown Error";

          var stacktrace;
          if (!(ex.classname && ex.classname == "qx.dev.unit.MeasurementResult")) {
            stacktrace = testResultData.getStackTrace(ex);
          }

          var serializedEx = {
            type : type,
            message : message
          };

          if (stacktrace) {
            serializedEx.stacktrace = stacktrace;
          }

          this.__suiteResults.tests[testName].exceptions.push(serializedEx);
        }
      }

      var level;
      switch(state) {
        case "skip":
          level = "warn";
          break;
        case "error":
        case "failure":
          level = "error";
          break;
        default:
          level = "info";
      }

      this[level](testName + " : " + state);

      if (state == "error" && exceptions) {
        this.error(exceptions);
      }
    }
  }
});