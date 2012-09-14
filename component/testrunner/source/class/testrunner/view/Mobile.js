/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (d_wagner)

************************************************************************ */

/* ************************************************************************
#asset(qx/icon/Tango/22/actions/media-playback-start.png)
#asset(qx/icon/Tango/22/actions/media-playback-stop.png)
************************************************************************ */

/**
 * Test Runner mobile view
 */
qx.Class.define("testrunner.view.Mobile", {

  extend : testrunner.view.Abstract,

  construct : function()
  {
    this._initPage();
  },

  members :
  {
    __mainPage : null,
    __detailPage : null,
    __runButton : null,
    __iframe : null,
    __testList : null,
    __testListWidget : null,
    __testRows : null,
    __statusLabel : null,
    __suiteResults : null,

    /**
     * Tells the TestRunner to run all configured tests.
     */
    _onRunButtonTap : function()
    {
      var suiteState = this.getTestSuiteState();
      if (suiteState == "ready") {
        this.__suiteResults = {
          startedAt : new Date().getTime(),
          finishedAt : null,
          tests : {}
        };
        this.fireEvent("runTests");
      }
      else if (suiteState == "finished") {
        this.fireEvent("stopTests");
      }
    },

    _initPage : function()
    {
      this.__testRows = {};
      var mainPage = this.__mainPage = new qx.ui.mobile.page.NavigationPage();
      mainPage.setTitle("qooxdoo Test Runner");
      mainPage.addListener("initialize", function()
      {
        var buttonGroup = this._getButtonGroup();
        mainPage.addAfterNavigationBar(buttonGroup);

        this.__testRows = {};
        var list = this.__testListWidget = new qx.ui.mobile.list.List({
          configureItem : this._configureListItem.bind(this)
        });
        list.addListener("changeSelection", this._onListChangeSelection, this);
        mainPage.getContent().add(list);

        var statusBar = this._getStatusBar();
        mainPage.add(statusBar);
      }, this);

      var detailPage = this.__detailPage = new qx.ui.mobile.page.NavigationPage();
      detailPage.setShowBackButton(true);
      detailPage.setBackButtonText("Back");
      detailPage.setTitle("Result Details");
      detailPage.addListener("back", function() {
        mainPage.show({animation:"slide", reverse:true});
      },this);

      // Add the pages to the page manager.
      var manager = new qx.ui.mobile.page.Manager(false);
      manager.addDetail([mainPage, detailPage]);

      // mainPage will be shown at start
      mainPage.show();
    },

    _configureListItem : function(item, data, row)
    {
      if (!data) {
        return;
      }
      this.__testRows[data.getFullName()] = row;
      // This doesn't work since property changes on the item don't trigger
      // re-rendering of the list
      //data.bind("state", item, "subtitle");

      var el = item.getContentElement();
      qx.bom.element.Class.removeClasses(el, ["start", "success", "failure", "skip"]);
      var testState = data.getState();

      var cssClass, selectable;
      var subtitle = testState;
      switch(testState) {
        case "start":
          cssClass = "start";
          selectable = false;
          break;
        case "success":
          cssClass = "success";
          selectable = false;
          break;
        case "skip":
          cssClass = "skip";
          selectable = true;
          break;
        case "error":
        case "failure":
          cssClass = "failure";
          selectable = true;
          break;
        default:
          selectable = false;
      }

      if (cssClass) {
        qx.bom.element.Class.add(el, cssClass);
      }
      item.setSelectable(selectable);
      item.setShowArrow(selectable);
      item.setSubtitle(subtitle);

      item.setTitle(data.getFullName());
      var self = this;
      data.addListener("changeState", function(ev) {
        var idx = self.__testRows[this.getFullName()];
        // Force the list to update
        self.__testListWidget.getModel().setItem(idx, null);
        self.__testListWidget.getModel().setItem(idx, data);
      });
    },

    _getButtonGroup : function()
    {
      var runButton = this.__runButton = new qx.ui.mobile.form.Button();
      runButton.addListener("tap", this._onRunButtonTap, this);
      var buttonContainer = new qx.ui.mobile.container.Composite(new qx.ui.mobile.layout.HBox());
      buttonContainer.add(runButton);
      //buttonContainer.add(new qx.ui.mobile.toolbar.Separator(), {flex: 1});

      var buttonGroup = new qx.ui.mobile.form.Group([buttonContainer]);
      buttonGroup.setShowBorder(false);
      return buttonGroup;
    },

    _getStatusBar : function()
    {
      var statusBar = new qx.ui.mobile.container.Composite(new qx.ui.mobile.layout.HBox());
      var statusGroup = new qx.ui.mobile.form.Group([statusBar]);
      this.__statusLabel = new qx.ui.mobile.basic.Label("Loading...");
      statusBar.add(this.__statusLabel);
      return statusGroup;
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
     * Writes a message to the status bar
     *
     * @param value {String} New status value
     * @param old {String} Previous status value
     */
    _applyStatus : function(value, old)
    {
      if (!value[0] || (value === old)) {
        return;
      }

      this.__statusLabel.getContentElement().innerHTML = value;
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
          this.__runButton.setEnabled(false);
          break;
        case "ready" :
          this.setStatus(this.getSelectedTests().length + " tests ready to run.");
          this.__runButton.setEnabled(true);
          this.__runButton.setValue("Run Tests");
          break;
        case "error" :
          this.setStatus("Couldn't load test suite!");
          this.__runButton.setEnabled(false);
          break;
        case "running" :
          this.setStatus("Running tests...");
          this.__runButton.setValue("Stop Tests");
          break;
        case "finished" :
          this.__suiteResults.finishedAt = new Date().getTime();
          this.setStatus("Test suite finished. " + this._getSummary());
          //re-apply selection so the same suite can be executed again
          this.setSelectedTests(new qx.data.Array());
          this.setSelectedTests(this.__testList);
          this.__runButton.setValue("Run Tests");
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
      this.__testList = testrunner.runner.ModelUtil.getItemsByProperty(value, "type", "test");
      this.__testList = new qx.data.Array(this.__testList);
      this.__testListWidget.setModel(this.__testList.concat());
      this.setSelectedTests(this.__testList);
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
    },

    _getSummary : function()
    {
      var pass = 0;
      var fail = 0;
      var skip = 0;
      for (var test in this.__suiteResults.tests) {
        switch (this.__suiteResults.tests[test].state) {
          case "success":
            pass++;
            break;
          case "error":
          case "failure":
            fail++;
            break;
          case "skip":
            skip++;
        }
      }

      return "<span class='failure'>" + fail + "</span>" + " failed, " +
             "<span class='success'>" + pass + "</span>" + " passed, " +
             "<span class='skip'>" + skip + "</span>" + " skipped.";
    },

    _onListChangeSelection : function(ev)
    {
      var testName = qx.lang.Object.getKeyFromValue(this.__testRows, ev.getData());
      for (var i=0,l=this.__testList.length; i<l; i++) {
        if (this.__testList.getItem(i).getFullName() == testName) {
          var exceptions = this.__testList.getItem(i).getExceptions();
          for (var x=0,y=exceptions.length; x<y; x++) {
            var ex = exceptions[x].exception;
            var msg = ex.toString ? ex.toString() : ex.message;
            var stack = ex.getStackTrace ? ex.getStackTrace() : qx.dev.StackTrace.getStackTraceFromError(ex);
            var msgLabel = new qx.ui.mobile.basic.Label(msg);
            msgLabel.setWrap(true);
            var stackLabel = new qx.ui.mobile.basic.Label(stack.join("<br/>"));
            stackLabel.setWrap(true);
            this.__detailPage.removeAll();
            var detailContainer = new qx.ui.mobile.container.Composite(new qx.ui.mobile.layout.VBox());
            detailContainer.add(msgLabel);
            detailContainer.add(stackLabel);
            var detailGroup = new qx.ui.mobile.form.Group([detailContainer]);
            this.__detailPage.add(detailGroup);
            this.__detailPage.show();
          }

          break;
        }
      }
    }
  }
});