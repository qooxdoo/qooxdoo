/* ************************************************************************

   Copyright:

   License:

   Authors:

************************************************************************ */

/**
 * This class demonstrates how to define simulated interaction tests for your 
 * application. See the manual for details:
 * {@link http://manual.qooxdoo.org/1.5/pages/development/simulator.html}
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