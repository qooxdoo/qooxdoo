/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

#module(dev)
#embed(qx.icontheme/16/actions/dialog-ok.png)

************************************************************************ */

qx.Class.define("qx.dev.TimeTracker",
{
  extend : qx.core.Object,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    this._functions = qx.lang.Array.fromArguments(arguments);

    this.buttonSets();
  },




  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /**
     * Internal comparison method
     *
     * @type static
     * @param a {Number} first number
     * @param b {Number} second number
     * @return {Number} Returns the result of a-b
     */
    _compare : function(a, b) {
      return a - b;
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /*
    ---------------------------------------------------------------------------
      METHODS
    ---------------------------------------------------------------------------
    */

    /**
     * Generate the basic button set layout
     *
     * @type member
     * @return {void}
     */
    buttonSets : function()
    {
      var btnLayout = new qx.ui.layout.HorizontalBoxLayout;

      btnLayout.setLocation(20, 48);
      btnLayout.setSpacing(5);

      var loopLabel = new qx.ui.basic.Atom("Method Loops: ");
      loopLabel.setAllowStretchY(false);
      loopLabel.setVerticalAlign("middle");

      var loopInput = new qx.ui.form.TextField("100");
      loopInput.setAllowStretchY(false);
      loopInput.setWidth(50);
      loopInput.setVerticalAlign("middle");

      var repeatLabel = new qx.ui.basic.Atom("Repeat Number: ");
      repeatLabel.setAllowStretchY(false);
      repeatLabel.setVerticalAlign("middle");
      repeatLabel.setMarginLeft(30);

      var btnStart1 = new qx.ui.form.Button("Start 3x", "icon/16/actions/dialog-ok.png");
      var btnStart2 = new qx.ui.form.Button("Start 7x", "icon/16/actions/dialog-ok.png");
      var btnStart3 = new qx.ui.form.Button("Start 15x", "icon/16/actions/dialog-ok.png");
      var btnStart4 = new qx.ui.form.Button("Start 25x", "icon/16/actions/dialog-ok.png");

      btnStart1.addEventListener("execute", function() {
        this.start(3, parseInt(loopInput.getValue()));
      }, this);

      btnStart2.addEventListener("execute", function() {
        this.start(7, parseInt(loopInput.getValue()));
      }, this);

      btnStart3.addEventListener("execute", function() {
        this.start(15, parseInt(loopInput.getValue()));
      }, this);

      btnStart4.addEventListener("execute", function() {
        this.start(25, parseInt(loopInput.getValue()));
      }, this);

      var htmlOutput = this._output = new qx.ui.embed.HtmlEmbed();

      htmlOutput.setHtml("");
      htmlOutput.setLocation(20, 78);
      htmlOutput.setRight(335);
      htmlOutput.setBottom(48);
      htmlOutput.setBorder("black");
      htmlOutput.setBackgroundColor("white");
      htmlOutput.setPadding(10);
      htmlOutput.setOverflow("auto");
      htmlOutput.addToDocument();

      btnLayout.add(loopLabel, loopInput, repeatLabel, btnStart1, btnStart2, btnStart3, btnStart4);
      btnLayout.addToDocument();
    },


    /**
     * Start the measuring process
     *
     * @type member
     * @param rounds {Integer} number of rounds
     * @param loops {Integer} number of loops
     * @return {void}
     */
    start : function(rounds, loops)
    {
      var funcs = this._functions;
      var len = funcs.length;
      var start;
      var localTimes;
      var allTimes = [];
      var htmlMeasured = [];
      var htmlResults = [];
      var cellWidth = Math.round(100 / (len + 1)) + "%";

      htmlMeasured.push("<h3>Measured Values</h3>");

      htmlMeasured.push("<style type='text/css'>.output{border: 1px solid black; width:100%; margin-bottom: 20px } .output thead{ font-weight: bold; } .output td, .output th{ text-align:left; width: " + cellWidth + "; } .output td{padding:4px}</style>");

      htmlMeasured.push("<table class='output'>");

      htmlMeasured.push("<thead>");

      htmlMeasured.push("<tr><td>&#160;</td>");

      for (var j=0; j<len; j++) {
        htmlMeasured.push("<td>Method " + (j + 1) + "</td>");
      }

      htmlMeasured.push("</thead><tbody>");

      for (var i=0; i<rounds; i++)
      {
        localTimes = [];

        for (var j=0; j<len; j++)
        {
          start = (new Date).valueOf();

          funcs[j](loops);

          localTimes.push((new Date).valueOf() - start);
        }

        htmlMeasured.push("<tr><th>Round " + i + "</th>");

        for (var j=0; j<localTimes.length; j++) {
          htmlMeasured.push("<td>" + localTimes[j] + "</td>");
        }

        htmlMeasured.push("</tr>");
        allTimes.push(localTimes);
      }

      htmlMeasured.push("</tbody></table>");

      var sum, meanValue, meanAll = [], meanMin = 1e7, meanMax = 0;

      for (var j=0; j<len; j++)
      {
        sum = 0;

        for (var i=0; i<rounds; i++) {
          sum += allTimes[i][j];
        }

        meanValue = Math.round(sum / rounds);

        meanAll.push(meanValue);

        meanMin = Math.min(meanMin, meanValue);
        meanMax = Math.max(meanMax, meanValue);
      }

      var median, medianValue, medianAll = [], medianMin = 1e7, medianMax = 0;

      for (var j=0; j<len; j++)
      {
        median = [];

        for (var i=0; i<rounds; i++) {
          median.push(allTimes[i][j]);
        }

        median.sort(qx.dev.TimeTracker._compare);
        medianValue = median[Math.floor(rounds / 2)].toString();

        medianAll.push(medianValue);

        medianMin = Math.min(medianValue, medianMin);
        medianMax = Math.max(medianValue, medianMax);
      }

      htmlResults.push("<h3>Results Summary</h3>");

      htmlResults.push("<table class='output'>");

      htmlResults.push("<thead>");

      htmlResults.push("<tr><td>&#160;</td>");

      for (var j=0; j<len; j++) {
        htmlResults.push("<td>Method " + (j + 1) + "</td>");
      }

      htmlResults.push("</thead><tbody>");

      htmlResults.push("<tr>");

      htmlResults.push("<th>Median</th>");

      for (var j=0; j<len; j++) {
        htmlResults.push("<td>" + medianAll[j] + "</td>");
      }

      htmlResults.push("</tr>");

      htmlResults.push("<tr>");

      htmlResults.push("<th>Median Factor</th>");

      for (var j=0; j<len; j++)
      {
        htmlResults.push("<td>");
        htmlResults.push(medianMin > 0 ? Math.round(medianAll[j] / medianMin) : "1");
        htmlResults.push("x</td>");
      }

      htmlResults.push("</tr>");

      htmlResults.push("<tr>");

      htmlResults.push("<th>Mean</th>");

      for (var j=0; j<len; j++) {
        htmlResults.push("<td>" + meanAll[j] + "</td>");
      }

      htmlResults.push("</tr>");

      htmlResults.push("<tr>");

      htmlResults.push("<th>Mean Factor</th>");

      for (var j=0; j<len; j++)
      {
        htmlResults.push("<td>");
        htmlResults.push(meanMin > 0 ? Math.round(meanAll[j] / meanMin) : 1);
        htmlResults.push("x</td>");
      }

      htmlResults.push("</tr>");

      htmlResults.push("<tr>");

      htmlResults.push("<th>Winner</th>");

      for (var j=0; j<len; j++)
      {
        htmlResults.push("<td>");

        if (medianMin == medianAll[j] && meanMin == meanAll[j]) {
          htmlResults.push("BOTH");
        } else if (medianMin == medianAll[j]) {
          htmlResults.push("MEDIAN");
        } else if (meanMin == meanAll[j]) {
          htmlResults.push("MEAN");
        }

        htmlResults.push("</td>");
      }

      htmlResults.push("</tr>");

      htmlResults.push("</tbody></table>");

      this._output.setHtml(htmlResults.join("") + htmlMeasured.join(""));
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeFields("_functions");
  }
});
