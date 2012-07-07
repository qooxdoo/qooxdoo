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

#require(qx.bom.Collection)
#ignore($)
#asset(testrunner/view/html/*)
#asset(indigo/css/*)

************************************************************************ */

/**
 * Plain HTML TestRunner view.
 *
 * @lint ignoreUndefined($)
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
   * @lint ignoreUndefined($)
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
    $('<div id="main"></div>').appendTo("body");
    this._getMainControls().appendTo("#header-wrapper");
    this._bindMainControls();

    $('<div id="tests"></div>').appendTo("#main");
    this._getTestControls().appendTo("#tests");
    this._bindTestControls();
    this._getTestList().appendTo("#tests");

    $('<div id="frame_log"></div>').appendTo("#main");

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
      init : null,
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
    __testNameToId : null,
    __filterTimer : null,
    __testModel : null,
    __testNamesList : null,
    __testResults : null,
    __nativeProfiling : false,

    /**
     * Creates the header.
     * @lint ignoreUndefined($)
     */
    _getHeader : function()
    {
      var header = $('<div id="header-wrapper"></div>')
      .append('<div id="header"><h1>qooxdoo Test Runner</h1>' +
        '<div id="search"><input type="search" placeholder="Filter Tests" id="testfilter"/></div>' +
        '</div>')
      .append('<div class="decoration" />');

      return header;
    },


    /**
     * Creates the main controls.
     * @lint ignoreUndefined($)
     */
    _getMainControls : function()
    {
      var controls = $('<div id="controls"></div>')
      .append('<input type="submit" title="Run selected tests (Ctrl+R)" id="run" value="Run Tests"></input>' +
      '<input type="submit" title="Stop the test suite (Ctrl+S)" id="stop" value="Stop Tests"></input>')
      .append(qx.bom.Input.create("checkbox", {id: "togglestack", checked: "checked"}))
      .append('<label for="togglestack">Show stack traces</label>')
      .append(qx.bom.Input.create("checkbox", {id: "togglepassed", checked: "checked"}))
      .append('<label for="togglepassed">Show successful tests</label>');

      if (this.__nativeProfiling) {
        controls.append(qx.bom.Input.create("checkbox", {id: "nativeprofiling"}))
        .append('<label for="nativeprofiling">Use native console profiling feature for performance tests</label>');
      }

      return controls;
    },


    /**
     * Add listeners to the main Test Runner controls
     *
     * @lint ignoreUndefined($)
     */
    _bindMainControls : function()
    {
      var controls = $("#controls");
      qx.event.Registration.addListener(controls.children("#run")[0], "click", this.__runTests, this);
      qx.event.Registration.addListener(controls.children("#stop")[0], "click", this.__stopTests, this);

      qx.event.Registration.addListener(controls.children("#togglestack")[0], "change", function(ev) {
        this.setShowStack(ev.getData());
      }, this);

      qx.event.Registration.addListener(controls.children("#togglepassed")[0], "change", function(ev) {
        this.setShowPassed(ev.getData());
      }, this);

      if (this.__nativeProfiling) {
        qx.event.Registration.addListener(controls.children("#nativeprofiling")[0], "change", function(ev) {
          this.setNativeProfiling(ev.getData());
        }, this);
      }
    },


    /**
     * Creates the test selection controls.
     * @lint ignoreUndefined($)
     */
    _getTestControls : function()
    {
      var testControls = $('<div id="testcontrols" class="controls">' +
      '  <h2>Test Suite</h2>' +
      '  <div>' +
      '    <label for="togglealltests">Select/deselect all listed tests</label>' +
      '  </div>' +
      '</div>');
      testControls.children("div").children("label")
      .before(qx.bom.Input.create("checkbox", {id: "togglealltests", checked: "checked"}))

      return testControls;
    },


    /**
     * Add listeners to the test list controls
     *
     * @lint ignoreUndefined($)
     */
    _bindTestControls : function() {
      qx.event.Registration.addListener($("#togglealltests")[0], "change", function(ev) {
        var checked = ev.getTarget().checked;
        this.toggleAllTests(checked, true);
      }, this);

      this.__filterTimer = new qx.event.Timer(500);
      this.__filterTimer.addListener("interval", function(ev) {
        var filter = $("#testfilter")[0].value;
        this.__filterTimer.stop();
        this.filterTests(filter);
      }, this);

      qx.event.Registration.addListener($("#testfilter")[0], "input", function(ev) {
        this.__filterTimer.restart();
      }, this);
    },


    /**
     * Creates the list of available tests and attaches it to the root node.
     * @lint ignoreUndefined($)
     */
    _getTestList : function()
    {
      return $('<ul id="testlist"></ul>');
    },


    /**
     * Creates the footer/status bar.
     * @lint ignoreUndefined($)
     */
    _getFooter : function()
    {
      return $('<div id="footer"><span id="status"></span></div>');
    },


    /**
     * Empties the results display.
     *
     * @lint ignoreUndefined($)
     */
    clearResults : function()
    {
      $("#testlist ul").destroy();
      $("#testlist li label").setAttribute("class", "")
    },

    /**
     * Empties the test list.
     * @lint ignoreUndefined($)
     */
    clearTestList : function()
    {
      $("#testlist")[0].innerHTML = "";
    },

    /**
     * Run the selected tests
     */
    __runTests : function()
    {
      if (this.getTestSuiteState() == "finished" ) {
        this.reset();
      }
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
     * @lint ignoreUndefined($)
     */
    __reloadAut : function()
    {
      var src = $("#iframesrc").getValue();
      this.resetAutUri();
      this.setAutUri(src);
    },


    /**
     * Returns the iframe element the AUT should be loaded in.
     *
     * @return {DOMElement} The iframe
     * @lint ignoreUndefined($)
     */
    getIframe : function()
    {
      var autFrame = $("#autframe");
      if (autFrame.length == 1) {
        return autFrame[0];
      }

      var frameContainer = $('<div id="framecontainer">' +
        '<div id="framecontrols" class="controls">' +
          '<h2>Application Under Test</h2>' +
          '<input type="submit" title="Reload the test suite (Ctrl+Shift+R)" id="setiframesrc" value="Reload"></input>' +
          '<input type="text" id="iframesrc"></input>' +
        '</div>')
      .append(qx.bom.Iframe.create({id : "autframe"}))
      .appendTo("#frame_log");

      qx.event.Registration.addListener($("#setiframesrc")[0],
        "click", this.__reloadAut, this);

      return frameContainer.children("#autframe")[0];
    },

    /**
     * Returns a DIV element that will be used by a
     * {@link qx.log.appender.Element} to display the AUT's log output.
     *
     * @return {Element} DIV element
     * @lint ignoreUndefined($)
     */
    getLogAppenderElement : function()
    {
      var log = $("#log");
      if (log.length == 1) {
        return log[0];
      }

      var logContainer = $('<div id="logcontainer">' +
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

      return logContainer.children("#log")[0];
    },


    /**
     * Selects or deselects all tests in the current test suite.
     *
     * @param selected {Boolean} true: select all tests; false: deselect all
     * tests
     * @param onlyVisible {Boolean} true: only modify tests if the corresponding
     * entry in the test list is visible. Default: false
     * @lint ignoreUndefined($)
     */
    toggleAllTests : function(selected, onlyVisible)
    {
      var testsToModify = [];
      var boxes = $("#testlist input[type=checkbox]");
      for (var i=0,l=boxes.length; i<l; i++) {
        if (boxes[i].type == "checkbox" && boxes[i].id.indexOf("cb_") == 0) {
          if (onlyVisible && boxes[i].parentNode.style.display == "none") {
            continue;
          }
          boxes[i].checked = selected;
          var testName = this.__testNameToId[boxes[i].id.substr(3)];
          testsToModify.push(testName);
        }
      }
      this.__toggleTestsSelected(testsToModify, selected);
    },


    /**
     * Shows and selects any tests matching the search term while hiding and
     * deselecting the rest.
     * @lint ignoreUndefined($)
     *
     * @param term {String} Search term
     */
    filterTests : function(term)
    {
      var searchRegExp = new RegExp("^.*" + term + ".*", "ig");

      var matches = [];
      for (var i=0,l=this.__testNamesList.length; i<l; i++) {
        if (this.__testNamesList[i].match(searchRegExp)) {
          matches.push(this.__testNamesList[i]);
        }
      }
      this.toggleAllTests(false, false);
      this.hideAllTestListEntries();
      if (matches.length > 0) {
        var testsToModify = [];
        for (var i=0,l=matches.length; i<l; i++) {
          var key = this.__simplifyName(matches[i]);
          var checkboxId = "cb_" + key;
          var box = $("#" + checkboxId);
          box.parent().setStyle("display", "block");
          if ($("#togglealltests")[0].checked) {
            box.setAttribute("checked", "checked");
            testsToModify.push(matches[i]);
          }
        }
        this.__toggleTestsSelected(testsToModify, true);
      }
      qx.bom.Cookie.set("testFilter", term);
    },


    /**
     * Hides all entries in the test list.
     * @lint ignoreUndefined($)
     */
    hideAllTestListEntries : function()
    {
      $("#testlist").children("li").setStyle("display", "none");
    },


    /**
     * Simplifies a test function's fully qualified name so it can be used as a
     * map key.
     *
     * @param testName {String} The test's full name
     * @return {String} The simplified string
     */
    __simplifyName : function(testName)
    {
      var id = testName.replace(/[\W]/ig, "");
      return id;
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

      var selected = this.getSelectedTests();
      // trigger a "change" event on the selection to allow running it again
      if (selected.length > 0) {
        selected.push(selected.pop());
      }
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
     * @lint ignoreUndefined($)
     */
    _markTestInList : function(testResultData)
    {
      if (!this.__testExceptions) {
        this.__testExceptions = {};
      }

      var testName = testResultData.getFullName();
      var state = testResultData.getState();
      var key = this.__simplifyName(testName);

      var listItem = $("[for=cb_" + key + "]").parent()
      .setAttribute("class", "").addClass("t_" + state);
      listItem.children(".result")[0].innerHTML = state.toUpperCase();

      var exList = this._getExceptionsList(testResultData);

      this.__testExceptions[key] = exList;
      var that = this;
      window.setTimeout(function() {
        listItem.append(that.__testExceptions[key]);
      }, 150);
    },


    /**
     * Returns an ordered list element containing all exceptions from the given
     * test result object
     *
     * @param testResultData {testrunner.runner.TestItem} Test data object
     * @return {Element} HTML list element
     * @lint ignoreUndefined($)
     */
    _getExceptionsList : function(testResultData)
    {
      var exceptions =  testResultData.getExceptions();

      if (!exceptions  || exceptions.length == 0) {
        return $("");
      }

      var list = $("<ol></ol>");

      for (var i=0,l=exceptions.length; i<l; i++) {
        var error = exceptions[i].exception;

        var errorStr = error.toString ? error.toString() :
          error.message ? error.message : "Unknown Error";
        errorStr = errorStr.replace(/\n/g, "<br/>");

        var errorItem = $("<li>" + errorStr + "</li>");

        var trace = testResultData.getStackTrace(error);
        if (trace.length > 0) {
          var display = this.getShowStack() ? "block" : "none";
          var stack = $('<div class="stacktrace monotype">' + 'Stack Trace:<br/>' + trace + '</div>')
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
      var testName = this.__testNameToId[ev.getTarget().id.substr(3)];
      var selected = ev.getTarget().checked;
      this.__toggleTestsSelected([testName], selected);
    },


    /**
     * Adds or removes tests from the list of selected tests.
     *
     * @param tests {String[]} List of tests to be added or removed
     * @param selected {Boolean} Whether the given tests should be added to or
     * removed from the selection
     */
    __toggleTestsSelected : function(tests, selected)
    {
      var selectedTests = this.getSelectedTests().copy();

      for (var i=0,l=tests.length; i<l; i++) {
        var testName = tests[i];
        var testInSelection = this._listContainsTest(selectedTests, testName);
        if (selected && !testInSelection) {
          var testItem = testrunner.runner.ModelUtil.getItemsByProperty(this.__testModel, "fullName", testName)[0];
          selectedTests.push(testItem);
        }
        else if (!selected && testInSelection) {
          this._removeTestFromList(selectedTests, testName);
        }
      }

      this.setSelectedTests(selectedTests);
      this._writeCookie();
    },


    /**
     * Stores the current test selection in a cookie
     */
    _writeCookie : function()
    {
      var selected = this.getSelectedTests();
      var names = [];
      for (var i=0,l=selected.length; i<l; i++) {
        names.push(selected.getItem(i).getFullName());
      }
      qx.bom.Cookie.set("selectedTests", names.join("#"));
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
     * @lint ignoreUndefined($)
     */
    _applyStatus : function(value, old)
    {
      if (!value[0] || (value === old)) {
        return;
      }

      $("#status")[0].innerHTML = value;
    },


    /**
     * Visualizes the current state of the test suite by displaying a status
     * message and showing/hiding the "run" button.
     *
     * @param value {String} The test suite's status
     * @param value {String} The previous status
     *
     * @lint ignoreUndefined($)
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
          $("#testfilter,#togglealltests,#run,#stop").setAttribute("disabled", "disabled");
          break;
        case "ready" :
          this.setStatus("Test suite ready");
          var filterFromCookie = qx.bom.Cookie.get("testFilter");
          if (filterFromCookie) {
            $("#testfilter").setValue(filterFromCookie);
            this.filterTests(filterFromCookie);
          }
          else {
            this._applyTestCount(this.getTestCount());
          }
          $("#testfilter,#togglealltests,#run").setAttribute("disabled", "");
          $("#stop").setAttribute("disabled", "disabled")
          this.setFailedTestCount(0);
          this.setSuccessfulTestCount(0);
          if (this.getAutoRun()) {
            this.__runTests();
          }
          break;
        case "running" :
          this.setStatus("Running tests...");
          $("#testfilter,#togglealltests,#run").setAttribute("disabled", "disabled");
          $("#stop").setAttribute("disabled", "");
          break;
        case "finished" :
          var statusText = "Test suite finished. ";
          statusText += " Passed: " + this.getSuccessfulTestCount();
          statusText += " Failed: " + this.getFailedTestCount();
          statusText += " Skipped: " + this.getSkippedTestCount();
          this.setStatus(statusText);
          $("#testfilter,#togglealltests,#run").setAttribute("disabled", "");
          $("#stop").setAttribute("disabled", "disabled");
          break;
        case "aborted" :
          this.setStatus("Test run stopped");
          $("#testfilter,#togglealltests,#run").setAttribute("disabled", "");
          $("#stop").setAttribute("disabled", "disabled");
          break;
        case "error" :
          this.setStatus("Invalid test file selected!");
          $("#testfilter,#togglealltests,#run").setAttribute("disabled", "");
          $("#stop").setAttribute("disabled", "disabled");
          break;
      };
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
      this.__testNameToId = {};
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
      var cookieSelection = qx.bom.Cookie.get("selectedTests");
      var foundTests = [];
      if (cookieSelection) {
        var cookieSelection = cookieSelection.split("#");
        for (var i=0,l=cookieSelection.length; i<l; i++) {
          var found = testrunner.runner.ModelUtil.getItemByFullName(this.__testModel, cookieSelection[i]);
          if (found) {
            foundTests.push(found.getFullName());
          }
        }
      }

      if (foundTests.length > 0) {
        this.toggleAllTests(false);
        this.__toggleTestsSelected(foundTests, true);
        for (var i=0,l=foundTests.length; i<l; i++) {
          this._setTestChecked(foundTests[i], true);
        }
      }
      else {
        this.toggleAllTests(true);
      }
    },


    /**
     * Sets the <code>checked</code> attribute of a checkbox corresponding to a
     * single test
     *
     * @param testName {String} The test method's fully qualified name
     * @param checked {Boolean} <code>true</code> if the test's checkbox should be checked
     * @lint ignoreUndefined($)
     */
    _setTestChecked : function(testName, checked)
    {
      var value = checked ? "checked" : "";
      var target = testName ? "#cb_" + this.__simplifyName(testName) : "input";
      $("#testlist " + target).setAttribute("checked", value);
    },

    /**
     * Removes a single test item from a qx.data.Array of test items
     *
     * @param list {qx.data.Array} Test array
     * @param testName {String} Full name of the test to be removed
     */
    _removeTestFromList : function(list, testName)
    {
      for (var i=0,l=list.length; i<l; i++) {
        if (list.getItem(i).getFullName() === testName) {
          list.remove(list.getItem(i));
          return;
        }
      }
    },


    /**
     * Checks if a list of test items contains an entry with the given name
     *
     * @param list {qx.data.Array} The test list
     * @param testName {String} Full name of the test to look for
     * @return {Boolean} True if the test is in the list
     */
    _listContainsTest : function(list, testName)
    {
      for (var i=0,l=list.length; i<l; i++) {
        if (list.getItem(i).getFullName() === testName) {
          return true;
        }
      }
      return false;
    },


    /**
     * Creates an entry in the HTML test list for each test in the given list
     * @param testList {String[]} Array of test names
     *
     * @lint ignoreUndefined($)
     */
    _createTestList : function(testList)
    {
      var template = '<li><span class="result"></span><input type="checkbox" id="{{id}}"><label for="{{id}}">{{name}}</label></li>';
      for (var i=0,l=testList.length; i<l; i++) {
        var testName = testList[i];
        var key = this.__simplifyName(testName);
        this.__testNameToId[key] = testName;

        var itemHtml = qx.bom.Template.render(template, {
          id : "cb_" + key,
          name : testName
        });
        $("#testlist")[0].innerHTML += itemHtml;
      }

      $("#testlist input:checkbox")
      .resetAttribute("checked")
      .addListener("change", this.__onToggleTest, this);
    },


    /**
     * Displays the amount of pending tests.
     *
     * @param value {Integer} Amount of pending tests
     * @param old {Integer} Old value
     */
    _applyTestCount : function(value, old)
    {
      return;
      if (value == null) {
        return;
      }
      var suiteState = this.getTestSuiteState();
      switch(suiteState)
      {
        case "ready" :
          this.setStatus(value + " tests ready to run");
          break;
        case "running" :
          this.setStatus(value + " tests pending");
          break;
      };
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

      var iframe = this.getIframe();
      $("#iframesrc")[0].value = value;
      qx.bom.Iframe.setSource(iframe, value);
    },


    /**
     * Shows/hides all stack trace nodes in the results list.
     *
     * @param value {Boolean} Incoming property value
     * @param value {Boolean} Previous property value
     *
     * @lint ignoreUndefined($)
     */
    _applyShowStack : function(value, old)
    {
      if (value == old) {
        return;
      }

      $(".stacktrace").setStyle("display", value ? "block" : "none");
    },


    /**
     * Shows/hides all successful tests in the results list.
     *
     * @param value {Boolean} Incoming property value
     * @param value {Boolean} Previous property value
     *
     * @lint ignoreUndefined($)
     */
    _applyShowPassed : function(value, old)
    {
      if (value === null || value === old) {
        return;
      }
      $(".t_success").setStyle("display", value ? "block" : "none");
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