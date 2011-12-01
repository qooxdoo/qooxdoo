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

/* ************************************************************************

#ignore($)
#asset(testrunner/view/html/*)

************************************************************************ */

/**
 * Plain HTML TestRunner view.
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
    this.__domElements = {
      rootElement : rootElement || document.body
    }

    // "portable" TR: Run the generator job "gen-css" to replace %{Styles} with
    // the (minified) contents of testrunner.css in the generated script file
    // (build version)
    if (!qx.core.Environment.get("qx.debug") &&
      qx.core.Environment.get("testrunner.testOrigin") == "external")
    {
      qx.bom.Stylesheet.createElement('%{Styles}');
    }
    else {
      var styleSrc = qx.util.ResourceManager.getInstance().toUri("testrunner/view/html/css/testrunner.css");
      qx.bom.Stylesheet.includeFile(styleSrc);
    }

    this._attachHeader();
    this._attachMainControls();
    this._attachTestControls();
    this._attachTestList();
    this._attachResultsList();
    this._attachFooter();
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
    __domElements : null,
    __testNameToId : null,
    __filterTimer : null,
    __testModel : null,
    __testNamesList : null,
    __testResults : null,

    /**
     * Creates the header and attaches it to the root node.
     */
    _attachHeader : function()
    {
      this.__domElements.rootElement.innerHTML += "<h1>qooxdoo Test Runner</h1>";
    },


    /**
     * Creates the main controls and attaches them to the root node.
     */
    _attachMainControls : function()
    {
      var elemControls = document.createElement("div");
      elemControls.id = "controls";
      elemControls.innerHTML = '<input type="submit" title="Run selected tests (Ctrl+R)" id="run" value="Run Tests"></input>';
      elemControls.innerHTML += '<input type="submit" title="Stop the test suite (Ctrl+S)" id="stop" value="Stop Tests"></input>';

      var stackToggle = qx.bom.Input.create("checkbox", {id: "togglestack", checked: "checked"});
      elemControls.appendChild(stackToggle);
      elemControls.innerHTML += '<label for="togglestack">Show stack trace</label>';

      var passedToggle = qx.bom.Input.create("checkbox", {id: "togglepassed", checked: "checked"});
      elemControls.appendChild(passedToggle);
      elemControls.innerHTML += '<label for="togglepassed">Show successful tests</label>';

      this.__domElements.rootElement.appendChild(elemControls);

      this.__domElements.runButton = document.getElementById("run");
      qx.event.Registration.addListener(this.__domElements.runButton, "click", this.__runTests, this);

      this.__domElements.stopButton = document.getElementById("stop");
      qx.event.Registration.addListener(this.__domElements.stopButton, "click", this.__stopTests, this);

      var stackToggle = document.getElementById("togglestack");
      qx.event.Registration.addListener(stackToggle, "change", function(ev) {
        this.setShowStack(ev.getData());
      }, this);

      var passedToggle = document.getElementById("togglepassed");
      qx.event.Registration.addListener(passedToggle, "change", function(ev) {
        this.setShowPassed(ev.getData());
      }, this);
    },


    /**
     * Creates the test selection controls and attaches them to the root node.
     */
    _attachTestControls : function()
    {
      var elemTestControls = document.createElement("div");
      elemTestControls.id = "testcontrols";
      var allTestsToggle = qx.bom.Input.create("checkbox", {id: "togglealltests", checked: "checked"});
      elemTestControls.innerHTML += '<label for="testfilter">Filter tests</label>';
      elemTestControls.innerHTML += '<input type="text" id="testfilter" />';
      elemTestControls.appendChild(allTestsToggle);
      elemTestControls.innerHTML += '<label for="togglealltests">Select/deselect all listed tests</label>';

      this.__domElements.rootElement.appendChild(elemTestControls);

      this.__domElements.allTestsToggle = document.getElementById("togglealltests");
      qx.event.Registration.addListener(this.__domElements.allTestsToggle, "change", function(ev) {
        var checked = ev.getTarget().checked;
        this.toggleAllTests(checked, true);
      }, this);

      this.__filterTimer = new qx.event.Timer(500);
      this.__filterTimer.addListener("interval", function(ev) {
        var filter = this.__domElements.filterInput.value;
        this.__filterTimer.stop();
        this.filterTests(filter);
      }, this);

      this.__domElements.filterInput = document.getElementById("testfilter");
      qx.event.Registration.addListener(this.__domElements.filterInput, "input", function(ev) {
        this.__filterTimer.restart();
      }, this);

    },


    /**
     * Creates the list of available tests and attaches it to the root node.
     */
    _attachTestList : function()
    {
      var parent = document.getElementById("testscontainer");
      if (!parent) {
        parent = document.createElement("div");
        parent.id = "testscontainer";
        this.__domElements.rootElement.appendChild(parent);
      }
      var listContainer = document.createElement("div");
      listContainer.id = "tests";
      listContainer.innerHTML += '<ul id="testlist"></ul>';
      parent.appendChild(listContainer);
      this.__domElements.elemTestList = document.getElementById("testlist");
    },


    /**
     * Creates the test results list and attaches it to the root node.
     */
    _attachResultsList : function()
    {
      var parent = document.getElementById("testscontainer");
      if (!parent) {
        parent = document.createElement("div");
        parent.id = "testscontainer";
        this.__domElements.rootElement.appendChild(parent);
      }
      var elemResults = document.createElement("div");
      elemResults.id = "results";
      elemResults.innerHTML = '<ul id="resultslist"></ul>';
      parent.appendChild(elemResults);
      this.__domElements.elemResultsList = document.getElementById("resultslist");
    },


    /**
     * Creates the footer/status bar and attaches it to the root node.
     */
    _attachFooter : function()
    {
      var elemFooter = document.createElement("div");
      elemFooter.id = "footer";
      elemFooter.innerHTML = '<p id="status"></p>';

      this.__domElements.rootElement.appendChild(elemFooter);

      this.__domElements.elemStatus = document.getElementById("status");
    },


    /**
     * Empties the results display.
     *
     * @lint ignoreUndefined($)
     */
    clearResults : function()
    {
      this.__domElements.elemResultsList.innerHTML = "";
      $("#testlist li label").setAttribute("class", "")
    },

    /**
     * Empties the test list.
     */
    clearTestList : function()
    {
      this.__domElements.elemTestList.innerHTML = "";
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
     */
    __reloadAut : function()
    {
      var src = this.__domElements.iframeSourceInput.value;
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
      if (this.__domElements.elemIframe) {
        return this.__domElements.elemIframe;
      }

      var parent = document.getElementById("framelogcontainer");
      if (!parent) {
        parent = document.createElement("div");
        parent.id = "framelogcontainer";
        var controls = document.getElementById("controls");
        qx.dom.Element.insertAfter(parent, controls);
      }

      var frameContainer = document.createElement("div");
      frameContainer.id = "framecontainer";
      parent.appendChild(frameContainer);
      frameContainer.innerHTML += '<input type="text" id="iframesrc"></input>';
      frameContainer.innerHTML += '<input type="submit" title="Reload the test suite (Ctrl+Shift+R)" id="setiframesrc" value="Reload"></input>';

      var elemAut = document.createElement("div");
      elemAut.id = "aut";
      this.__domElements.elemIframe = qx.bom.Iframe.create({id : "autframe"});
      frameContainer.appendChild(this.__domElements.elemIframe);

      this.__domElements.iframeSourceInput = document.getElementById("iframesrc");
      var reloadBtn = document.getElementById("setiframesrc");
      qx.event.Registration.addListener(reloadBtn, "click", this.__reloadAut, this);

      return this.__domElements.elemIframe;
    },

    /**
     * Returns a DIV element that will be used by a
     * {@link qx.log.appender.Element} to display the AUT's log output.
     *
     * @return {Element} DIV element
     */
    getLogAppenderElement : function()
    {
      if (this.__domElements.elemLogAppender) {
        return this.__domElements.elemLogAppender;
      }

      var parent = document.getElementById("framelogcontainer");
      if (!parent) {
        parent = document.createElement("div");
        parent.id = "framelogcontainer";
        var controls = document.getElementById("controls");
        qx.dom.Element.insertAfter(parent, controls);
      }

      // Directly create DOM element to use
      var logelem = this.__domElements.elemLogAppender = document.createElement("div");
      logelem.id = "log";
      parent.appendChild(logelem);

      return this.__domElements.elemLogAppender;
    },


    /**
     * Selects or deselects all tests in the current test suite.
     *
     * @param selected {Boolean} true: select all tests; false: deselect all
     * tests
     * @param onlyVisible {Boolean} true: only modify tests if the corresponding
     * entry in the test list is visible. Default: false
     */
    toggleAllTests : function(selected, onlyVisible)
    {
      var testsToModify = [];
      var boxes = document.getElementsByTagName("input");
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
          var box = document.getElementById(checkboxId);
          box.parentNode.style.display = "block";
          if (this.__domElements.allTestsToggle.checked) {
            box.checked = true;
            testsToModify.push(matches[i]);
          }
        }
        this.__toggleTestsSelected(testsToModify, true);
      }
      qx.bom.Cookie.set("testFilter", term);
    },


    /**
     * Hides all entries in the test list.
     */
    hideAllTestListEntries : function()
    {
      var items = qx.bom.Selector.query("li", this.__domElements.elemTestList);
      for (var i=0,l=items.length; i<l; i++) {
        items[i].style.display = "none";
      }
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

      var exceptions =  testResultData.getExceptions();
      var key = this.__simplifyName(testName);

      this._markTestInList(testName, state);
      var listItem = document.getElementById(key);
      if (listItem) {
        qx.bom.element.Attribute.set(listItem, "class", state);
        qx.bom.Collection.create(listItem).children("ul").destroy();
      } else {
        var item = qx.bom.Element.create("li", {id : key, "class" : state});
        if (this.__domElements.elemResultsList.firstChild) {
          qx.dom.Element.insertBefore(item, this.__domElements.elemResultsList.firstChild);
        } else {
          this.__domElements.elemResultsList.appendChild(item);
        }
        item.innerHTML = testName;
        listItem = document.getElementById(key);
      }

      if (state == "success" && this.getShowPassed() === false) {
        qx.bom.element.Style.set(listItem, "display", "none");
      }

      if ((state == "error" || state == "failure") && exceptions &&
        exceptions.length > 0)
      {
        var errorList = document.createElement("ul");
        for (var i=0,l=exceptions.length; i<l; i++) {
          var error = exceptions[i].exception;
          var errorItem = document.createElement("li");
          errorItem.innerHTML += error;

          var trace = testResultData.getStackTrace(error);
          if (trace.length > 0) {
            var stackDiv = document.createElement("div");
            qx.bom.element.Class.add(stackDiv, "stacktrace");
            stackDiv.innerHTML = 'Stack Trace:<br/>' + trace;

            var displayVal = this.getShowStack() ? "block" : "none";
            qx.bom.element.Style.set(stackDiv, "display", displayVal);
            errorItem.appendChild(stackDiv);
          }
          errorList.appendChild(errorItem);
        }
        listItem.appendChild(errorList);
      }
    },


    /**
     * Applies a CSS class corresponding to the test's state to its entry in the
     * list
     *
     * @param testName {String} The test methods' fully qualified name
     * @param state {String} The test's current state
     *
     * @lint ignoreUndefined($)
     */
    _markTestInList : function(testName, state)
    {
      var key = this.__simplifyName(testName);
      var selector = "[for=cb_" + key + "]";
      $(selector).setAttribute("class", "");
      $(selector).addClass("t_" + state);
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
     */
    _applyStatus : function(value, old)
    {
      if (!value[0] || (value === old)) {
        return;
      }

      this.__domElements.elemStatus.innerHTML = value;
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
          $("#testfilter," +
            "#togglealltests, " +
            "#run, " +
            "#stop").setAttribute("disabled", "disabled");
          break;
        case "ready" :
          this.setStatus("Test suite ready");
          var filterFromCookie = qx.bom.Cookie.get("testFilter");
          if (filterFromCookie) {
            this.__domElements.filterInput.value = filterFromCookie;
            this.filterTests(filterFromCookie);
          }
          else {
            this._applyTestCount(this.getTestCount());
          }
          $("#testfilter," +
            "#togglealltests, " +
            "#run").setAttribute("disabled", "");
          $("#stop").setAttribute("disabled", "disabled")
          this.setFailedTestCount(0);
          this.setSuccessfulTestCount(0);
          if (this.getAutoRun()) {
            this.__runTests();
          }
          break;
        case "running" :
          this.setStatus("Running tests...");
          this.__domElements.filterInput.disabled = true;
          this.__domElements.allTestsToggle.disabled = true;
          this.__domElements.runButton.disabled = true;
          this.__domElements.stopButton.disabled = false;
          break;
        case "finished" :
          var statusText = "Test suite finished. ";
          statusText += " Passed: " + this.getSuccessfulTestCount();
          statusText += " Failed: " + this.getFailedTestCount();
          statusText += " Skipped: " + this.getSkippedTestCount();
          this.setStatus(statusText);
          this.__domElements.filterInput.disabled = false;
          this.__domElements.allTestsToggle.disabled = false;
          this.__domElements.runButton.disabled = false;
          this.__domElements.stopButton.disabled = true;
          break;
        case "aborted" :
          this.setStatus("Test run stopped");
          this.__domElements.filterInput.disabled = false;
          this.__domElements.allTestsToggle.disabled = false;
          this.__domElements.runButton.disabled = false;
          this.__domElements.stopButton.disabled = true;
          break;
        case "error" :
          this.setStatus("Invalid test file selected!");
          this.__domElements.filterInput.disabled = false;
          this.__domElements.allTestsToggle.disabled = false;
          this.__domElements.runButton.disabled = false;
          this.__domElements.stopButton.disabled = true;
          break;
      };
    },


    _applyTestModel : function(value, old)
    {
      if (value == null) {
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
      if (cookieSelection) {
        var cookieSelection = cookieSelection.split("#");
        var foundTests = [];
        for (var i=0,l=cookieSelection.length; i<l; i++) {
          var found = testrunner.runner.ModelUtil.getItemByFullName(this.__testModel, cookieSelection[i]);
          if (found) {
            foundTests.push(found.getFullName());
          }
        }

        if (foundTests.length > 0) {
          this.toggleAllTests(false);
          this.__toggleTestsSelected(foundTests, true);

          for (var i=0,l=foundTests.length; i<l; i++) {
            this._setTestChecked(foundTests[i], true);
          }
        }
      }
      else {
        var testList = testrunner.runner.ModelUtil.getItemsByProperty(this.__testModel, "type", "test");
        this.getSelectedTests().append(testList);
      }
    },


    /**
     * Sets the <code>checked</code> attribute of a checkbox corresponding to a
     * single test
     *
     * @param testName {String} The test method's fully qualified name
     * @param checked {Boolean} <code>true</code> if the test's checkbox should be checked
     */
    _setTestChecked : function(testName, checked)
    {
      var value = checked ? "checked" : "";
      var target = testName ? "#cb_" + this.__simplifyName(testName) : "input";
      qx.bom.Collection.query("#testlist " + target).setAttribute("checked", value);
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
      var template = '<li><input checked="checked" type="checkbox" id="{{id}}"><label for="{{id}}">{{name}}</label></li>';
      for (var i=0,l=testList.length; i<l; i++) {
        var testName = testList[i];
        var key = this.__simplifyName(testName);
        this.__testNameToId[key] = testName;

        var itemHtml = qx.bom.Template.toHtml(template, {
          id : "cb_" + key,
          name : testName
        });
        this.__domElements.elemTestList.innerHTML += itemHtml;
      }

      $("#testlist input:checkbox").addListener("change", this.__onToggleTest, this);
    },


    /**
     * Displays the amount of pending tests.
     *
     * @param value {Integer} Amount of pending tests
     * @param old {Integer} Old value
     */
    _applyTestCount : function(value, old)
    {
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
     */
    _applyAutUri : function(value, old)
    {
      if (!value || value == old) {
        return;
      }
      this.__domElements.iframeSourceInput.value = value;
      qx.bom.Iframe.setSource(this.__domElements.elemIframe, value);
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
      $(".success").setStyle("display", value ? "block" : "none");
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