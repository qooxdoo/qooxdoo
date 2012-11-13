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
     * Daniel Wagner (danielwagner)

************************************************************************ */

/* ************************************************************************
#require(qx.module.Manipulating)
#require(qx.module.Css)
#require(qx.module.Attribute)
#require(qx.module.Traversing)
************************************************************************ */

/**
 * Widget which displays the test results as a formatted list.
 */
qx.Class.define("testrunner.view.widget.TestResultView",
{
  extend : qx.ui.core.Widget,
  include : [qx.ui.core.MNativeOverflow],

  construct : function()
  {
    this.base(arguments);
    this.set({
      overflowX : "auto",
      overflowY : "auto"
    });
  },

  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** Controls the display of stack trace information for exceptions */
    showStackTrace : {
      check : "Boolean",
      init : true,
      apply : "__applyShowStackTrace"
    }
  },


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __results : null,


    /**
     * Adds a new entry to the test results HTML
     *
     * @param testResult {Object} A test model object
     */
    addTestResult : function(testResult)
    {
      //this.__results.push(testResult);
      testResult.addListener("changeState", function() {
        this.__onStateChange(testResult);
      }, this);
    },


    /**
     * Removes all entries from the list.
     *
     * @return {void}
     */
    clear : function()
    {
      this.getContentElement().getDomElement().innerHTML = "";
      this.__results = {};
    },


    /**
     * Reacts to test state changes by creating a new list entry and/or
     * updating an existing one.
     *
     * @param testResult {testrunner.runner.TestItem} Test data object
     */
    __onStateChange : function(testResult)
    {
      if (testResult.getState() === testResult.getPreviousState()) {
        return;
      }

      if (!this.__results) {
        this.__results = {};
      }

      var testName = testResult.getFullName();

      if (!this.__results[testName]) {
        var resultElement = this._getResultElement(testName);
        this.__results[testName] = resultElement;
        var contEl = this.getContentElement().getDomElement();
        contEl.appendChild(resultElement[0]);
      }

      this._updateResultElement(testResult);
    },


    /**
     * Creates a list item element for a single test result
     * @param fullName {String} The test's fully qualified name
     * @return {q} Collection containing the list item
     */
    _getResultElement : function(fullName) {
      var coll = q.create("<li></li>").addClass("testResult")
      .append(q.create("<h3>" + fullName + "</h3>"));
      return coll;
    },


    /**
     * Updates an existing list entry corresponding to a given test result
     * @param testResult {testrunner.runner.TestItem} Test data object
     */
    _updateResultElement : function(testResult)
    {
      var fullName = testResult.getFullName();
      var state = testResult.getState();
      var coll = this.__results[fullName];
      coll.removeAttribute("class").addClasses(["testResult", state]);

      //remove old error info
      coll.getChildren(".errorDetail").remove();
      var errorDetail = this._getErrorDetailElement(testResult);
      if (errorDetail) {
        coll.append(errorDetail);
      }
    },


    // overridden
    _createContentElement : function()
    {
      return new qx.html.Element("ul", {}, {
        "class": "resultPane"
      });
    },


    /**
     * Returns a DOM tree containing details about the exception(s) that
     * occurred during a test function's runtime
     * @param testResult {testrunner.runner.TestItem} Test data object
     * @return {q} Collection containing the error detail element
     */
    _getErrorDetailElement : function(testResult)
    {
      var exceptArr = testResult.getExceptions();
      if (exceptArr.length == 0) {
        return null;
      }

      var coll = q.create("<div class='errorDetail'></div>");
      for (var i=0,l=exceptArr.length; i<l; i++) {
        var error = exceptArr[i].exception;
        var errorStr = error.toString ? error.toString() :
          error.message ? error.message : "Unknown Error";

        var prefix = error.classname && error.classname == "qx.dev.unit.MeasurementResult" ? "" :
          "Error message is: <br />";

        coll.append(q.create("<strong>" + prefix + qx.bom.String.escape(errorStr).replace(/\n/g, "<br/>") + "</strong>"));

        var trace = testResult.getStackTrace(exceptArr[i].exception);
        if (trace && trace.length > 0) {
          var traceEl = q.create('<div class="trace">Stack trace: <br/>' + trace + '</div>');
          if (!this.getShowStackTrace()) {
            traceEl.hide();
          }
          coll.append(traceEl);
        }
      }
      return coll;
    },


    /**
     * Display or hide stack trace info for all test results.
     *
     * @param value {Boolean} Display (true) or hide (false) stack trace info.
     * @return {void}
     */
    __applyShowStackTrace : function(value)
    {
      var coll = q(".resultPane .trace");
      value ? coll.show() : coll.hide();
    }
  },

  destruct : function()
  {
    this.__results = null;
  }
});
