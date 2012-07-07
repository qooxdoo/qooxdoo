/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Thomas Herchenroeder (thron7)
     * Fabian Jakobs (fjakobs)
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */

/**
 * Widget which displays the test results as a formatted list.
 */
qx.Class.define("testrunner.view.widget.TestResultView",
{
  extend : qx.ui.embed.Html,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);
    this.__testResults = [];

    this.setBackgroundColor("white");
    this.setOverflowY("auto");
    this.setOverflowX("auto");

    this.setCssClass("resultPane");
    this.getContainerElement().setAttribute("class", "resultPaneContainer");

    this.setHtml(this.__createHtml());
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
    __testResults : null,

    /**
     * TODOC
     *
     * @return {String} complete HTML of the list
     */
    __createHtml : function()
    {
      var html = new qx.util.StringBuilder();

      for (var i=this.__testResults.length-1; i>=0; i--)
      {
        var result = this.__testResults[i];
        html.add(this.__createResultHtml(result));
      }

      return html.get();
    },


    /**
     * TODOC
     *
     * @param testResult {var} TODOC
     * @return {String} HTML fragemnt of a single test
     */
    __createResultHtml : function(testResult)
    {
      var state = testResult.getState();
      if (state !== "wait") {

        var html = new qx.util.StringBuilder();
        html.add("<div class='testResult ", testResult.getState(), "' id='testResult", testResult.toHashCode(), "'>");
        html.add("<h3>", testResult.getFullName(), "</h3>");

        var exceptArr = testResult.getExceptions();
        for (var i=0,l=exceptArr.length; i<l; i++) {
          var error = exceptArr[i].exception;
          var errorStr = error.toString ? error.toString() :
            error.message ? error.message : "Unknown Error";

          var prefix = error.classname && error.classname == "qx.dev.unit.MeasurementResult" ? "" :
            "Error message is: <br />"

          html.add("<strong>", prefix, qx.bom.String.escape(errorStr).replace(/\n/g, "<br/>"), "</strong><br />");

          var trace = testResult.getStackTrace(exceptArr[i].exception);
          if (trace && trace.length > 0) {
            html.add("<div class='trace");
            if (!this.getShowStackTrace()) {
              html.add(" hiddenST");
            }
            html.add("'>Stack trace: <br />", trace, "</div><br />");
          }
        }

        html.add("</div>");
        return html.get();
      }
    },

    /**
     * Display or hide stack trace info for all test results.
     *
     * @param value {Boolean} Display (true) or hide (false) stack trace info.
     * @return {void}
     */
    __applyShowStackTrace : function(value)
    {
      var oldHtml = this.getHtml();
      if (this.getShowStackTrace()) {
        var newHtml = oldHtml.replace(/class='trace hiddenST'/g, "class='trace'");
      }
      else {
        var newHtml = oldHtml.replace(/class='trace'/g, "class='trace hiddenST'");
      }
      this.setHtml(newHtml);
    },


    /**
     * Adds a new entry to the test results HTML
     *
     * @param testResult {Object} A test model object
     */
    addTestResult : function(testResult)
    {

      this.__testResults.push(testResult);

      testResult.addListener("changeState", function() {
        this.__onStateChange(testResult);
      }, this);

      this.setHtml(this.__createResultHtml(testResult) + this.getHtml());
    },


    /**
     * TODOC
     *
     * @param testResult {var} TODOC
     * @return {void}
     */
    __onStateChange : function(testResult) {
      this.setHtml(this.__createHtml());
    },


    /**
     * Clear all entries of the list.
     *
     * @return {void}
     */
    clear : function()
    {
      this.__testResults = [];
      this.setHtml("");
    },

    // overridden
    renderLayout : function(left, top, width, height) {
      var changes = this.base(arguments, left, top, width, height),
          content = this.getContentElement(),
          container = this.getContainerElement(),
          contentStyles = {},
          containerStyles= {};

      if (changes.size) {
        // Allow content to grow
        contentStyles.width = "auto";
        contentStyles.height = "auto";
        contentStyles.minWidth = width;
        contentStyles.minHeight = height;
        content.setStyles(contentStyles);

        // Show scrollbar when necessary
        containerStyles.overflow = "auto";
        container.setStyles(containerStyles);
      }

      return changes;
    }

  },


  destruct : function () {
    this._testResults = null;
  }

});
