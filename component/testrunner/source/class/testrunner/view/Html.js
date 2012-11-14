/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (d_wagner)

************************************************************************ */

/* ************************************************************************

#asset(testrunner/view/html/*)
#asset(indigo/css/*)
#require(q)
#require(qx.module.Polyfill)
#require(qx.module.Traversing)
#require(qx.module.Manipulating)
#require(qx.module.Attribute)
#require(qx.module.Event)
#require(qx.module.event.Native)
#require(qx.module.Css)
#require(qx.module.Cookie)
#require(qx.module.Template)

************************************************************************ */

/**
 * Plain HTML TestRunner view.
 *
 */
qx.Class.define("testrunner.view.Html", {

  extend : testrunner.view.Abstract,

  include : [testrunner.view.MAutoRun],


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param rootElement {DOMElement?} DOM Element in which the result view
   * should be created. Default: document.body
   */
  construct : function(rootElement)
  {
    // "portable" TR: Run the generator job "gen-css" to replace %{Styles} with
    // the (minified) contents of testrunner.css in the generated script file
    // (build version)
    if (!qx.core.Environment.get("qx.debug") &&
      qx.core.Environment.get("testrunner.testOrigin") == "external")
    {
      qx.bom.Stylesheet.createElement('%{Styles}');
    }
    else {
      var s1 = qx.util.ResourceManager.getInstance().toUri("indigo/css/reset.css");
      var s2 = qx.util.ResourceManager.getInstance().toUri("indigo/css/base.css");
      var s3 = qx.util.ResourceManager.getInstance().toUri("testrunner/view/html/css/testrunner.css");
      qx.bom.Stylesheet.includeFile(s1);
      qx.bom.Stylesheet.includeFile(s2);
      qx.bom.Stylesheet.includeFile(s3);
    }

    this.__nativeProfiling = (qx.core.Environment.get("testrunner.performance") &&
      qx.Class.hasMixin(this.constructor, testrunner.view.MPerformance) &&
      typeof console != "undefined" && console.profile);

    this._getHeader().appendTo("body");
    q.create('<div id="main"></div>').appendTo("body");
    this._getMainControls().appendTo("#header-wrapper");
    this._bindMainControls();

    q.create('<div id="tests"></div>').appendTo("#main");
    this._getTestControls().appendTo("#tests");
    this._bindTestControls();
    this._getTestList().appendTo("#tests");

    q.create('<div id="frame_log"></div>').appendTo("#main");

    this._getFooter().appendTo("body");

    this._makeCommands();

    this.__testResults = {};
  },


  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */
  properties :
  {
    /** Controls the display of stack trace information for exceptions */
    showStack :
    {
      check : "Boolean",
      init : true,
      apply : "_applyShowStack"
    },

    /** Controls whether successfully passed tests should appear in the results
     * list */
    showPassed :
    {
      check : "Boolean",
      init : true,
      nullable : true,
      apply : "_applyShowPassed"
    },

    /** Running count of failed tests */
    failedTestCount :
    {
      check : "Integer",
      init : 0
    },

    /** Running count of passed tests */
    successfulTestCount :
    {
      check : "Integer",
      init : 0
    },

    /** Running count of skipped tests */
    skippedTestCount :
    {
      check : "Integer",
      init : 0
    }
  },


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */
  members :
  {
    __filterTimer : null,
    __testModel : null,
    __testNamesList : null,
    __testResults : null,
    __nativeProfiling : false,

    /**
     * Creates the header.
     */
    _getHeader : function()
    {
      var header = q.create('<div id="header-wrapper"></div>')
      .append('<div id="header"><h1>qooxdoo Test Runner</h1>' +
        '<div id="search"><input type="search" placeholder="Filter Tests" id="testfilter"/></div>' +
        '</div>')
      .append('<div class="decoration" />');

      return header;
    },


    /**
     * Creates the main controls.
     */
    _getMainControls : function()
    {
      var controls = q.create('<div id="controls"></div>')
      .append('<input type="submit" title="Run selected tests (Ctrl+R)" id="run" value="Run Tests"></input>' +
      '<input type="submit" title="Stop the test suite (Ctrl+S)" id="stop" value="Stop Tests"></input>')
      .append(q.create('<input type="checkbox">').setAttributes({id: "togglestack", checked : "checked"}))
      .append('<label for="togglestack">Show stack traces</label>')
      .append(q.create('<input type="checkbox">').setAttributes({id: "togglepassed", checked: "checked"}))
      .append('<label for="togglepassed">Show successful tests</label>');

      if (this.__nativeProfiling) {
        controls.append(q.create('<input type="checkbox">').setAttributes({id: "nativeprofiling"}))
        .append('<label for="nativeprofiling">Use native console profiling feature for performance tests</label>');
      }

      return controls;
    },


    /**
     * Add listeners to the main Test Runner controls
     */
    _bindMainControls : function()
    {
      var controls = q("#controls");
      controls.getChildren("#run").on("click", this.__runTests, this);
      controls.getChildren("#stop").on("click", this.__stopTests, this);

      controls.getChildren("#togglestack").on("change", function(ev) {
        this.setShowStack(ev.getTarget().checked);
      }, this);

      controls.getChildren("#togglepassed").on("change", function(ev) {
        this.setShowPassed(ev.getTarget().checked);
      }, this);

      if (this.__nativeProfiling) {
        controls.getChildren("#nativeprofiling").on("change", function(ev) {
          this.setNativeProfiling(ev.getTarget().checked);
        }, this);
      }
    },


    /**
     * Creates the test selection controls.
     */
    _getTestControls : function()
    {
      var testControls = q.create('<div id="testcontrols" class="controls">' +
      '  <h2>Test Suite</h2>' +
      '  <div>' +
      '    <label for="togglealltests">Select/deselect all listed tests</label>' +
      '  </div>' +
      '</div>');
      testControls.getChildren("div").getChildren("label")
      .before(q.create('<input type="checkbox">').setAttributes({id: "togglealltests", checked: "checked"}));

      return testControls;
    },


    /**
     * Add listeners to the test list controls
     */
    _bindTestControls : function() {
      q("#togglealltests").on("change", function(ev) {
        this.toggleAllTests(ev.getTarget().checked, true);
      }, this);

      this.__filterTimer = new qx.event.Timer(500);
      this.__filterTimer.addListener("interval", function(ev) {
        var filter = q("#testfilter").getValue();
        this.__filterTimer.stop();
        this.filterTests(filter);
      }, this);

      q("#testfilter").on("keyup", function(ev) {
        this.__filterTimer.restart();
      }, this);
    },


    /**
     * Creates the list of available tests and attaches it to the root node.
     */
    _getTestList : function()
    {
      return q.create('<ul id="testlist"></ul>');
    },


    /**
     * Creates the footer/status bar.
     */
    _getFooter : function()
    {
      return q.create('<div id="footer"><span id="status"></span></div>');
    },


    /**
     * Empties the results display.
     */
    clearResults : function()
    {
      q("#testlist ul").remove();
      q("#testlist li label").setAttribute("class", "");
    },

    /**
     * Empties the test list.
     */
    clearTestList : function()
    {
      q("#testlist")[0].innerHTML = "";
    },

    /**
     * Run the selected tests
     */
    __runTests : function()
    {
      if (this.getTestSuiteState() == "finished" ) {
        this.reset();
      }

      var selection = this.getSelectedTests();
      selection.removeAll();
      var checked = [];
      q("#testlist input:checked").forEach(function(el, index, coll) {
        var testName = q("label[for=" + el.id + "]")[0].innerHTML;
        if (q(el).getParents().getClass().indexOf("hidden") == -1) {
          checked.push(testrunner.runner.ModelUtil.getItemsByProperty(this.__testModel, "fullName", testName)[0]);
        }
      }, this);
      selection.append(checked);

      this.fireEvent("runTests");
    },

    /**
     * Stop a running test suite
     */
    __stopTests : function()
    {
      this.fireEvent("stopTests");
    },

    /**
     * Reload the test suite
     */
    __reloadAut : function()
    {
      var src = q("#iframesrc").getValue();
      this.resetAutUri();
      this.setAutUri(src);
    },


    /**
     * Returns the iframe element the AUT should be loaded in.
     *
     * @return {DOMElement} The iframe
     */
    getIframe : function()
    {
      var autFrame = q("#autframe");
      if (autFrame.length == 1) {
        return autFrame[0];
      }

      var frameContainer = q.create('<div id="framecontainer">' +
        '<div id="framecontrols" class="controls">' +
          '<h2>Application Under Test</h2>' +
          '<input type="submit" title="Reload the test suite (Ctrl+Shift+R)" id="setiframesrc" value="Reload"></input>' +
          '<input type="text" id="iframesrc"></input>' +
        '</div>')
      .append(q.create('<iframe onload="qx.event.handler.Iframe.onevent(this)" id="autframe">'))
      .appendTo("#frame_log");

      q("#setiframesrc").on("click", this.__reloadAut, this);

      return frameContainer.getChildren("#autframe")[0];
    },

    /**
     * Returns a DIV element that will be used by a
     * {@link qx.log.appender.Element} to display the AUT's log output.
     *
     * @return {Element} DIV element
     */
    getLogAppenderElement : function()
    {
      var log = q("#log");
      if (log.length == 1) {
        return log[0];
      }

      var logContainer = q.create('<div id="logcontainer">' +
          '<div id="logcontrols" class="controls">' +
            '<h2>Log</h2>' +
//            '<div>' +
//              '<select id="loglevel">' +
//                '<option>Debug</option>' +
//              '</select>' +
//              '<label for="loglevel">Log level</label>' +
//            '</div>' +
          '</div>' +
          '<div id="log" class="monotype"></div>' +
        '</div>').appendTo("#frame_log");

      return logContainer.getChildren("#log")[0];
    },


    /**
     * Selects or deselects all tests visible in the list.
     *
     * @param selected {Boolean} true: select all tests; false: deselect all
     * tests
     */
    toggleAllTests : function(selected)
    {
      var boxes = q("#testlist li").filter(function(item) {
        return !q(item).hasClass("hidden");
      })
      .getChildren("input[type=checkbox]");

      if (selected) {
        boxes.setAttribute("checked", "checked");
      }
      else {
        boxes.removeAttribute("checked");
      }

      this.__storeSelectedTests();
    },


    /**
     * Shows and selects any tests matching the search term while hiding and
     * deselecting the rest.
     *
     * @param term {String} Search term
     */
    filterTests : function(term)
    {
      var searchRegExp = new RegExp("^.*" + term + ".*", "ig");

      this.__testNamesList.forEach(function(item, index, list) {
        var testIndex = list.indexOf(item);
        var id = "cb_" + testIndex;
        var listItem = q("#" + id).getParents();

        if (item.match(searchRegExp)) {
          listItem.removeClass("hidden");
        }
        else {
          listItem.addClass("hidden");
        }
      });

      q.cookie.set("testFilter", term);
    },


    /**
     * Resets the result counters, clears the results display and reapplies the
     * test selection so that the suite can be run again.
     */
    reset : function()
    {
      this.resetFailedTestCount();
      this.resetSuccessfulTestCount();
      this.resetSkippedTestCount();
      this.clearResults();
      this.__testResults = {};
    },


    /**
     * Visualizes the status of a single test result as it changes during test
     * execution.
     *
     * @param testResultData {Object} A test model object
     */
    _onTestChangeState : function(testResultData) {
      var testName = testResultData.getFullName();
      var state = testResultData.getState();

      switch (state) {
        case "skip":
          if (!this.__testResults[testName]) {
            this.__testResults[testName] = state;
            this.setSkippedTestCount(this.getSkippedTestCount() + 1);
          }
          break;
        case "error":
        case "failure":
          if (!this.__testResults[testName]) {
            this.__testResults[testName] = state;
            this.setFailedTestCount(this.getFailedTestCount() + 1);
          }
          break;
        case "success":
          if (!this.__testResults[testName]) {
            this.__testResults[testName] = state;
            this.setSuccessfulTestCount(this.getSuccessfulTestCount() + 1);
          }
      }

      this._markTestInList(testResultData);

      if (qx.core.Environment.get("testrunner.reportServer")) {
        this.saveTestResult(testResultData);
        if (state == "failure" || state == "error") {
          this.reportResult(testName);
        }
      }
    },


    __testExceptions : null,

    /**
     * Styles an entry in the results view according to the corresponding test's
     * state
     *
     * @param testResultData {testrunner.runner.TestItem} Test result object
     */
    _markTestInList : function(testResultData)
    {
      if (!this.__testExceptions) {
        this.__testExceptions = {};
      }

      var testName = testResultData.getFullName();
      var state = testResultData.getState();

      var testIndex = this.__testNamesList.indexOf(testName);
      var id = "cb_" + testIndex;
      var listItem = q("#" + id).getParents()
      .setAttribute("class", "").addClass("t_" + state);
      if (state === "success" && !this.getShowPassed()) {
        listItem.setStyle("display", "none");
      }
      listItem.getChildren(".result")[0].innerHTML = state.toUpperCase();

      // remove any previous stack info
      listItem.getChildren("ol").remove();

      var exList = this._getExceptionsList(testResultData);

      this.__testExceptions[testIndex] = exList;
      var that = this;
      window.setTimeout(function() {
        listItem.append(that.__testExceptions[testIndex]);
      }, 150);
    },


    /**
     * Returns an ordered list element containing all exceptions from the given
     * test result object
     *
     * @param testResultData {testrunner.runner.TestItem} Test data object
     * @return {Element} HTML list element
     */
    _getExceptionsList : function(testResultData)
    {
      var exceptions =  testResultData.getExceptions();

      if (!exceptions  || exceptions.length == 0) {
        return q("");
      }

      var list = q.create("<ol></ol>");

      for (var i=0,l=exceptions.length; i<l; i++) {
        var error = exceptions[i].exception;

        var errorStr = error.toString ? error.toString() :
          error.message ? error.message : "Unknown Error";
        errorStr = errorStr.replace(/\n/g, "<br/>");

        var errorItem = q.create("<li>" + errorStr + "</li>");

        var trace = testResultData.getStackTrace(error);
        if (trace.length > 0) {
          var display = this.getShowStack() ? "block" : "none";
          var stack = q.create('<div class="stacktrace monotype">' + 'Stack Trace:<br/>' + trace + '</div>')
          .setStyle("display", display);
          errorItem.append(stack);
        }
        list.append(errorItem);
      }

      return list;
    },


    /**
     * Listener for the checkbox associated with each test in the suite.
     *
     * @param ev {qx.event.type.Event} change event
     */
    __onToggleTest : function(ev)
    {
      this.__storeSelectedTests();
    },


    /**
     * Saves the currently selected tests in a cookie
     */
    __storeSelectedTests : function()
    {
      var selected = [];
      q("#testlist input:checked").forEach(function(el, index, coll) {
        var testName = q("label[for=" + el.id + "]")[0].innerHTML;
        selected.push(testName);
      });
      q.cookie.set("selectedTests", selected.join("#"));
    },


    /*
    ****************************************************************************
       APPLY METHODS
    ****************************************************************************
    */

    /**
     * Displays a status message.
     * @param value {String} The message to be displayed
     * @param old {String} The previous status
     */
    _applyStatus : function(value, old)
    {
      if (!value[0] || (value === old)) {
        return;
      }

      q("#status")[0].innerHTML = value;
    },


    /**
     * Visualizes the current state of the test suite by displaying a status
     * message and showing/hiding the "run" button.
     *
     * @param value {String} The test suite's status
     * @param value {String} The previous status
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
          q("#testfilter,#togglealltests,#run,#stop").setAttribute("disabled", "disabled");
          break;
        case "ready" :
          this.reset();
          this.setStatus("Test suite ready");
          var filterFromCookie = q.cookie.get("testFilter");
          if (filterFromCookie) {
            q("#testfilter").setValue(filterFromCookie);
            this.filterTests(filterFromCookie);
          }
          else {
            this._applyTestCount(this.getTestCount());
          }
          q("#testfilter,#togglealltests,#run").setAttribute("disabled", "");
          q("#stop").setAttribute("disabled", "disabled");
          if (this.getAutoRun()) {
            this.__runTests();
          }
          break;
        case "running" :
          this.setStatus("Running tests...");
          q("#testfilter,#togglealltests,#run").setAttribute("disabled", "disabled");
          q("#stop").setAttribute("disabled", "");
          break;
        case "finished" :
          var statusText = "Test suite finished. ";
          statusText += " Passed: " + this.getSuccessfulTestCount();
          statusText += " Failed: " + this.getFailedTestCount();
          statusText += " Skipped: " + this.getSkippedTestCount();
          this.setStatus(statusText);
          q("#testfilter,#togglealltests,#run").setAttribute("disabled", "");
          q("#stop").setAttribute("disabled", "disabled");
          break;
        case "aborted" :
          this.setStatus("Test run stopped");
          q("#testfilter,#togglealltests,#run").setAttribute("disabled", "");
          q("#stop").setAttribute("disabled", "disabled");
          break;
        case "error" :
          this.setStatus("Invalid test file selected!");
          q("#testfilter,#togglealltests,#run").setAttribute("disabled", "");
          q("#stop").setAttribute("disabled", "disabled");
          break;
      }
    },


    _applyTestModel : function(value, old)
    {
      if (value == null) {
        this.clearTestList();
        this.clearResults();
        return;
      }

      this.__testModel = value;

      var testList = testrunner.runner.ModelUtil.getItemsByProperty(value, "type", "test");
      this.setSelectedTests(new qx.data.Array());
      this.clearTestList();
      this.clearResults();

      this.__testNamesList = [];
      for (var i=0,l=testList.length; i<l; i++) {
        this.__testNamesList.push(testList[i].getFullName());
      }

      this._createTestList(this.__testNamesList);

      this._applyCookieSelection();
    },


    /**
     * Selects the tests saved in the cookie
     */
    _applyCookieSelection : function()
    {
      var cookieSelection = q.cookie.get("selectedTests");
      if (!cookieSelection) {
        this.toggleAllTests(true);
        return;
      }
      this.toggleAllTests(false);
      cookieSelection = cookieSelection.split("#");
      cookieSelection.forEach(function(testName, idx, arr) {
        var testIndex = this.__testNamesList.indexOf(testName);
        var id = "cb_" + testIndex;
        q("#" + id).setAttribute("checked", "checked");
      }.bind(this));
      this.__storeSelectedTests();
    },


    /**
     * Creates an entry in the HTML test list for each test in the given list
     * @param testList {String[]} Array of test names
     */
    _createTestList : function(testList)
    {
      var template = '<li><span class="result"></span><input type="checkbox" id="{{id}}" checked=""><label for="{{id}}">{{name}}</label></li>';
      for (var i=0,l=testList.length; i<l; i++) {
        var testName = testList[i];

        var itemHtml = q.template.render(template, {
          id : "cb_" + i,
          name : testName
        });
        q("#testlist")[0].innerHTML += itemHtml;
      }

      q("#testlist input:checkbox")
      .on("change", this.__onToggleTest, this);
    },


    _applyTestCount : function(value, old)
    {

    },


    /**
     * (Re)Loads the AUT in the iframe.
     *
     * @param value {String} AUT URI
     * @param old {String} Previous value
     */
    _applyAutUri : function(value, old)
    {
      if (!value || value == old) {
        return;
      }

      q("#iframesrc").setAttribute("value", value);
      q(this.getIframe()).setAttribute("src", value);
    },


    /**
     * Shows/hides all stack trace nodes in the results list.
     *
     * @param value {Boolean} Incoming property value
     * @param value {Boolean} Previous property value
     */
    _applyShowStack : function(value, old)
    {
      if (value == old) {
        return;
      }

      q(".stacktrace").setStyle("display", value ? "block" : "none");
    },


    /**
     * Shows/hides all successful tests in the results list.
     *
     * @param value {Boolean} Incoming property value
     * @param value {Boolean} Previous property value
     */
    _applyShowPassed : function(value, old)
    {
      if (value === null || value === old) {
        return;
      }
      q(".t_success").setStyle("display", value ? "block" : "none");
    },

    /**
     * Create keyboard shortcuts for the main controls.
     */
    _makeCommands : function()
    {
      var runTests = new qx.ui.core.Command("Ctrl+R");
      runTests.addListener("execute", this.__runTests, this);

      var stopTests = new qx.ui.core.Command("Ctrl+S");
      stopTests.addListener("execute", this.__stopTests, this);

      var reloadAut = new qx.ui.core.Command("Ctrl+Shift+R");
      reloadAut.addListener("execute", this.__reloadAut, this);
    }

  }

});
