/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2010 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (d_wagner)

************************************************************************ */

/**
 * Creates and runs a suite of integration tests using QxSelenium.
 */

qx.Class.define("simulator.unit.TestLoader", {

  extend : qx.application.Native,

  statics :
  {
    /**
     * {Array} Names of optional configuration settings for the 
     * {@link simulator.QxSimulation} instance to be used for this test. 
     * Options are defined as settings in the "simulation" job.  
     */
    SETTING_NAMES : ["globalTimeout", "stepSpeed", "windowMaximize", 
                    "globalErrorLogging", "testEvents", "disposerDebug", 
                    "applicationLog"]
  },
  
  members :
  {
    
    main : function()
    {
      qx.log.Logger.register(qx.log.appender.RhinoConsole);
      var nameSpace = qx.core.Setting.get("simulator.nameSpace");
      
      var qxSelenium = simulator.QxSelenium.create(
        qx.core.Setting.get("simulator.selServer"),
        qx.core.Setting.get("simulator.selPort"),
        qx.core.Setting.get("simulator.testBrowser"),
        qx.core.Setting.get("simulator.autHost"));
      
      var simulation = this.simulation = new simulator.QxSimulation(qxSelenium, 
        qx.core.Setting.get("simulator.autHost"),
        qx.core.Setting.get("simulator.autPath"),
        this._getOptionalSettings());
      
      simulation.startSession();
      simulation.logEnvironment();
      simulation.logUserAgent();
      simulation.qxSelenium.setSpeed("1000");
      
      var suite = new qx.dev.unit.TestSuite(nameSpace);
      var testResult = new simulator.unit.TestResult();
      suite.run(testResult);
      
      simulation.qxSelenium.stop();
    },
    
    
    /**
     * Returns a map containing QxSimulation options.
     * 
     * @return {Map} Settings map
     */
    _getOptionalSettings : function()
    {
      var settings = {};
      var names = simulator.unit.TestLoader.SETTING_NAMES;
      for (var i=0,l=names.length; i<l; i++) {
        try {
          settings[names[i]] = qx.core.Setting.get("simulator." + names[i]);
        } catch(ex) {
          settings[names[i]] = null;
        }
      }
      return settings;
    }
  }
});

