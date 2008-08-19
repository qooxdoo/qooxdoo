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
     * Jonathan Rass (jonathan_rass)

************************************************************************ */

/**
 * Widget which displays the test results as a formatted list.
 */
qx.Class.define("testrunner.runner.TestResultView",
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
    this._testResults = [];

    this.setBackgroundColor("white");
    this.setOverflowY("scroll");
    this.setOverflowX("auto");

    this.setCssClass("resultPane");

    this.setHtml(this.__createHtml());
  },





  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * TODOC
     *
     * @return {String} complete HTML of the list
     */
    __createHtml : function()
    {
      var html = new qx.util.StringBuilder();

      for (var i=this._testResults.length-1; i>=0; i--)
      {
        var result = this._testResults[i];
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
      var html = new qx.util.StringBuilder();
      html.add("<div class='testResult ", testResult.getState(), "' id='testResult", testResult.toHashCode(), "'>");
      html.add("<h3>", testResult.getName(), "</h3>");

      if (testResult.getState() == "failure" || testResult.getState() == "error")
      {
        html.add("Error message is: <br />", testResult.getMessage(), "<br />");

        if (testResult.getStackTrace().length > 0) {
          html.add("Stack trace: <div class='trace'>", testResult.getStackTrace(), "</div>");
        }
      }

      html.add("</div>");
      return html.get();
    },


    /**
     * TODOC
     *
     * @param testResult {var} TODOC
     * @return {void}
     */
    addTestResult : function(testResult)
    {

      this._testResults.push(testResult);

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
      for (var i=0; i<this._testResults.length; i++) {
        this._testResults[i].dispose();
      }

      this._testResults = [];
      this.setHtml("");
    }
  },


  destruct : function ()
  {
    this._disposeFields("_testResults");
  }

});
