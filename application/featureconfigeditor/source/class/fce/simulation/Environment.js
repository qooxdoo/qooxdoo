/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (d_wagner)

************************************************************************ */

/**
 * This class demonstrates how to define simulated interaction tests for your
 * application. See the manual for details:
 * {@link http://manual.qooxdoo.org/${qxversion}/pages/development/simulator.html}
 *
 * @lint ignoreUndefined(simulator)
 */
qx.Class.define("fce.simulation.Environment", {

  extend : simulator.unit.TestCase,

  members :
  {
    logFileName : "environment.json",
    logFile : null,

    /*
    ---------------------------------------------------------------------------
      TESTS
    ---------------------------------------------------------------------------
    */

    testGetEnvironment : function()
    {
      var autWin = simulator.Simulation.AUTWINDOW;
      var qxApp = simulator.Simulation.QXAPPLICATION;
      var prefix = autWin + "." + qxApp;
      var environment = prefix + ".environment";
      var condition = environment + " != null";
      var environmentString = autWin + ".qx.lang.Json.stringify(" + environment + ")";
      this.getQxSelenium().waitForCondition(condition, 5000);
      var resultsString = String(this.getQxSelenium().getEval(environmentString));
      this.writeToLog(resultsString);
    },

    writeToLog : function(message)
    {
      var file = this.getLogFile();
      file.write(message);
      file.newLine();
      file.flush();
    },

    getLogFile : function()
    {
      if (!this.logFile) {
        var fstream = new java.io.FileWriter(this.logFileName, true);
        this.logFile = new java.io.BufferedWriter(fstream);
      }
      return this.logFile;
    }
  }

});