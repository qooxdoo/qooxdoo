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

#asset(testrunner2/view/html/*)

************************************************************************ */

/**
 * Plain HTML TestRunner view.
 */
qx.Class.define("testrunner2.view.Html", {

  extend : testrunner2.view.Abstract,
  
  
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
    var root = this.__rootElement = rootElement || document.body;
    var styleSrc = qx.util.ResourceManager.getInstance().toUri("testrunner2/view/html/css/testrunner2.css");
    qx.bom.Stylesheet.includeFile(styleSrc);
    root.innerHTML += "<h1>qooxdoo Test Runner</h1>";
    var elemControls = document.createElement("div");
    elemControls.id = "qxtestrunner_controls";
    elemControls.innerHTML = '<input type="submit" id="qxtestrunner_run" value="Run Tests"></input>';
    elemControls.innerHTML += '<input type="submit" id="qxtestrunner_stop" value="Stop Tests"></input>';
    
    var stackToggle = qx.bom.Input.create("checkbox", {id: "qxtestrunner_togglestack", checked: "checked"});
    elemControls.appendChild(stackToggle);
    elemControls.innerHTML += '<label for="qxtestrunner_togglestack">Show stack trace</label>';
    
    var passedToggle = qx.bom.Input.create("checkbox", {id: "qxtestrunner_togglepassed", checked: "checked"});
    elemControls.appendChild(passedToggle);
    elemControls.innerHTML += '<label for="qxtestrunner_togglepassed">Show successful tests</label>';
    
    root.appendChild(elemControls);
    
    var elemTestList = document.createElement("div");
    elemTestList.id = "qxtestrunner_tests";
    elemTestList.innerHTML = '<ul id="qxtestrunner_testlist"></ul>';
    root.appendChild(elemTestList);
    
    var elemResults = document.createElement("div");
    elemResults.id = "qxtestrunner_results";
    elemResults.innerHTML = '<ul id="qxtestrunner_resultslist"></ul>';
    root.appendChild(elemResults);
    
    var elemFooter = document.createElement("div");
    elemFooter.id = "qxtestrunner_footer";
    elemFooter.innerHTML = '<p id="qxtestrunner_status"></p>';
    root.appendChild(elemFooter);
    
    this.__runButton = document.getElementById("qxtestrunner_run");
    qx.event.Registration.addListener(this.__runButton, "click", function(ev) {
      this.fireEvent("runTests");
    }, this);
    
    this.__stopButton = document.getElementById("qxtestrunner_stop");
    qx.event.Registration.addListener(this.__stopButton, "click", function(ev) {
      this.fireEvent("stopTests");
    }, this);
    
    // Why is this necessary?
    stackToggle = document.getElementById("qxtestrunner_togglestack");
    qx.event.Registration.addListener(stackToggle, "change", function(ev) {
      this.setShowStack(ev.getData());
    }, this);
    
    passedToggle = document.getElementById("qxtestrunner_togglepassed");
    qx.event.Registration.addListener(passedToggle, "change", function(ev) {
      this.setShowPassed(ev.getData());
    }, this);
    
    this.__elemStatus = document.getElementById("qxtestrunner_status");
    this.__elemTestList = document.getElementById("qxtestrunner_testlist");
    this.__elemResultsList = document.getElementById("qxtestrunner_resultslist");
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
    __elemStatus : null,
    __elemResultsList : null,
    __elemTestList : null,
    __elemIframe : null,
    __rootElement : null,
    __runButton : null,
    __stopButton : null,
    
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
            
      this.__elemStatus.innerHTML = value;
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
        case "loading" :
          this.setStatus("Loading tests...");
          this.__runButton.disabled = true;
          this.__stopButton.disabled = true;
          break;
        case "ready" :
          this.setStatus("Test suite ready");
          this.__runButton.disabled = false;
          this.__stopButton.disabled = true;
          this.setFailedTestCount(0);
          this.setSuccessfulTestCount(0);
          break;
        case "running" :
          this.setStatus("Running tests...");
          this.__runButton.disabled = true;
          this.__stopButton.disabled = false;
          break;
        case "finished" :
          var statusText = "Test suite finished. ";
          statusText += " Passed: " + this.getSuccessfulTestCount();
          statusText += " Failed: " + this.getFailedTestCount();
          statusText += " Skipped: " + this.getSkippedTestCount();
          this.setStatus(statusText);
          this.__runButton.disabled = true;
          this.__stopButton.disabled = true;
          break;
        case "aborted" :
          this.setStatus("Test run stopped");
          this.__runButton.disabled = false;
          this.__stopButton.disabled = true;
          break;
      };
    },
    
    
    /**
     * Displays the amount of pending tests.
     * 
     * @param value {Integer} Amount of pending tests
     * @param old {Integer} Old value
     */
    _applyTestCount : function(value, old)
    {
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
     * Empties the results display.
     */
    clearResults : function()
    {
      this.__elemResultsList.innerHTML = "";
    },
    
    /**
     * Empties the test list
     */
    clearTestList : function()
    {
      this.__elemTestList.innerHTML = "";
    },
    
    
    /**
     * Visualizes the status of a single test result as it changes during test
     * execution.
     * 
     * @param testResultData {testrunner2.unit.TestResultData} test result data 
     * object
     */
    _onTestChangeState : function(testResultData) {
      var testName = testResultData.getName();
      var state = testResultData.getState();
      
      switch (state) {
        case "skip":
          this.setSkippedTestCount(this.getSkippedTestCount() + 1);
          break;
        case "error":
        case "failure":
          this.setFailedTestCount(this.getFailedTestCount() + 1);
          break;
        case "success":
          this.setSuccessfulTestCount(this.getSuccessfulTestCount() + 1);
      }
      
      var exception =  testResultData.getException();
      
      var id = this.__testNameToId(testName);
      var listItem = document.getElementById(id);
      if (listItem) {
        qx.bom.element.Attribute.set(listItem, "class", state);
      } else {
        var item = qx.bom.Element.create("li", {id : id, "class" : state});
        if (this.__elemResultsList.firstChild) {
          qx.dom.Element.insertBefore(item, this.__elemResultsList.firstChild);
        } else {
          this.__elemResultsList.appendChild(item);
        }
        item.innerHTML = testName;
        listItem = document.getElementById(id);
      }
      
      if (state == "success" && this.getShowPassed() === false) {
        qx.bom.element.Style.set(listItem, "display", "none");
      }
      
      if (exception) {
        listItem.innerHTML += '<br/>' + exception;

        var trace = testResultData.getStackTrace();
        if (trace.length > 0) {
          var stackDiv = document.createElement("div");
          qx.bom.element.Class.add(stackDiv, "stacktrace");
          stackDiv.innerHTML = 'Stack Trace:<br/>' + trace;
          
          var displayVal = this.getShowStack() ? "block" : "none";
          qx.bom.element.Style.set(stackDiv, "display", displayVal);
          listItem.appendChild(stackDiv);
        }
        
      }
    },
          
    
    /**
     * Simplifies a test function's fully qualified name so it can be used as an
     * HTML ID.
     * 
     * @param testName {String} The test's full name
     * @return {String} The ID string
     */
    __testNameToId : function(testName)
    {
      var id = testName.replace(/\./g, "");
      id = id.replace(/\:/g, "");
      return id;
    },
    
    
    /**
     * Return the iframe element the AUT should be loaded in.
     * @return {DOMElement} The iframe
     */
    getIframe : function()
    {
      if (this.__elemIframe) {
        return this.__elemIframe;
      }
      
      var controls = document.getElementById("qxtestrunner_controls");
      var frameContainer = document.createElement("div");
      qx.dom.Element.insertAfter(frameContainer, controls);
      frameContainer.innerHTML += '<input type="text" id="qxtestrunner_iframesrc"></input>';
      frameContainer.innerHTML += '<input type="submit" id="qxtestrunner_setiframesrc" value="Reload"></input>';
      
      var elemAut = document.createElement("div");
      elemAut.id = "qxtestrunner_aut";
      this.__elemIframe = qx.bom.Iframe.create({id : "qxtestrunner_autframe"});
      frameContainer.appendChild(this.__elemIframe);
      
      var reloadBtn = document.getElementById("qxtestrunner_setiframesrc");
      qx.event.Registration.addListener(reloadBtn, "click", function(ev) {
        var src = document.getElementById("qxtestrunner_iframesrc").value;
        this.resetAutUri();
        this.setAutUri(src);
      }, this);
      
      return this.__elemIframe;
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
      
      this.__setDisplayForClass(".stacktrace", value);
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
      this.__setDisplayForClass(".success", value);
    },
    
    
    /**
     * Sets the CSS "display" attribute of all nodes with the given CSS class.
     * 
     * @param cssClass {String} CSS class name
     * @param display {Boolean} Display value: true for "block", false for "none"
     */
    __setDisplayForClass : function(cssClass, display)
    {
      var displayVal = display ? "block" : "none";
      var elems = qx.bom.Selector.query(cssClass, this.__rootElement);
      for (var i=0,l=elems.length; i<l; i++) {
        qx.bom.element.Style.set(elems[i], "display", displayVal);
      }
    },
    
    
    /**
     * Creates a list item with a checkbox and label for each test in the 
     * current suite. Only tests with ticked checkboxes will be run.
     * 
     * @param value {Array} Full list of tests
     * @param old {Array} Previous value
     */
    _applyInitialTestList : function(value, old)
    {
      this.setSelectedTests(value);
      
      this.clearTestList();
      this.clearResults();
      
      for (var i=0,l=value.length; i<l; i++) {
        var listItem = document.createElement("li");
        var testName = value[i];
        var checkBoxId = "cb_" + this.__testNameToId(testName);
        var cb = qx.bom.Input.create("checkbox", {id: checkBoxId, name: testName, checked: "checked"});
        listItem.appendChild(cb);
        listItem.innerHTML += '<label for="' + checkBoxId + '">' + testName + '</label>';
        this.__elemTestList.appendChild(listItem);
                
        cb = document.getElementById(checkBoxId);
        qx.event.Registration.addListener(cb, "change", this.__toggleTestSelected, this);
      }
    },
    
    
    /**
     * Adds or removes a test from the list of selected tests.
     * 
     * @param ev {qx.event.type.Event} The change event from the checkbox 
     * associated with the test
     */
    __toggleTestSelected : function(ev)
    {
      var testName = ev.getTarget().name;      
      var selectedTests = qx.lang.Array.clone(this.getSelectedTests());
      
      if (ev.getTarget().checked && !qx.lang.Array.contains(selectedTests, testName)) {
        selectedTests.push(testName);
      }
      else if (!ev.getTarget().checked && qx.lang.Array.contains(selectedTests, testName)) {
        qx.lang.Array.remove(selectedTests, testName);
      }
      
      selectedTests.sort();
      this.setSelectedTests(selectedTests);
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
      document.getElementById("qxtestrunner_iframesrc").value = value;
      qx.bom.Iframe.setSource(this.__elemIframe, value);
    }
    
  }
  
});