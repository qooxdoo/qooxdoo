/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2011 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

************************************************************************ */

/**
 * Simulator main application class.
 */
qx.Class.define("simulator.Application", {

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
      if (window.arguments) {
        this._argumentsToSettings(window.arguments);
      }
      
      qx.log.Logger.register(qx.log.appender.RhinoConsole);
      
      var qxSelenium = this.getQxSelenium();
      this.simulation = this.getSimulation(qxSelenium);
      
      this.runner = new simulator.TestRunner();
      this.runner.runTests();
    },
    
    /**
     * Converts the value of the "settings" command line option to qx settings.
     * 
     * @param args {String[]} Rhino arguments object
     */
    _argumentsToSettings : function(args)
    {
      var opts;
      for (var i=0, l=args.length; i<l; i++) {
        if (args[i].indexOf("settings=") == 0) {
          opts = args[i].substr(9);
          break;
        }
      }
      if (opts) {
        opts = qx.lang.Json.parse(opts);
        for (var prop in opts) {
          try {
            qx.core.Setting.define(prop, opts[prop]);
          } catch(ex) {
            this.error("Unable to define command-line setting " + prop + ": " + ex);
          }
        }
      }
    },
    
    /**
     * Returns a map containing QxSimulation options.
     * 
     * @return {Map} Settings map
     */
    _getOptionalSettings : function()
    {
      var settings = {};
      var names = simulator.Application.SETTING_NAMES;
      for (var i=0,l=names.length; i<l; i++) {
        try {
          settings[names[i]] = qx.core.Setting.get("simulator." + names[i]);
        } catch(ex) {
          settings[names[i]] = null;
        }
      }
      return settings;
    },
    
    /**
     * Configures and returns a QxSelenium instance.
     * 
     * @return {simulator.QxSelenium}
     */
    getQxSelenium : function()
    {
      var qxSelenium = simulator.QxSelenium.create(
        qx.core.Setting.get("simulator.selServer"),
        qx.core.Setting.get("simulator.selPort"),
        qx.core.Setting.get("simulator.testBrowser"),
        qx.core.Setting.get("simulator.autHost"));
      qxSelenium.setSpeed("1000");
      
      return qxSelenium;
    },
    
    /**
     * Configures and returns a QxSimulation instance.
     * 
     * @param qxSelenium {simulator.QxSelenium} QxSelenium instance to be used
     * by this QxSimulation
     * @return {simulator.QxSimulation}
     */
    getSimulation : function(qxSelenium)
    {
      var simulation = new simulator.QxSimulation(qxSelenium, 
        qx.core.Setting.get("simulator.autHost"),
        qx.core.Setting.get("simulator.autPath"),
        this._getOptionalSettings());
      
      return simulation;
    }
  }
  
});