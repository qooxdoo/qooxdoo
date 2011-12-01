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
/* ************************************************************************
#ignore(quit)
************************************************************************ */
/**
 * Simulator main application class.
 */
qx.Class.define("simulator.Application", {

  extend : qx.application.Basic,

  members :
  {

    /**
     * @lint ignoreUndefined(testrunner)
     */
    main : function()
    {
      qx.log.Logger.register(qx.log.appender.RhinoConsole);

      if (window.arguments) {
        try {
          this._argumentsToSettings(window.arguments);
        } catch(ex) {
          this.error(ex.toString());
          return;
        }
      }

      this._initLogFile();
      this.runner = new testrunner.runner.TestRunnerBasic();
      this.simulation = simulator.Simulation.getInstance();

      this.runner.addListener("changeTestSuiteState", this._onChangeTestSuiteState, this);

      // sync test suite loading
      if (this.runner.getTestSuiteState() === "ready") {
        this._runSuite();
      }
    },


    /**
     * Runs the suite once it's loaded. Also stops the Selenium session after
     * the suite is finished or if there was an error during loading.
     *
     * @lint ignoreUndefined(quit)
     * @param ev {qx.event.type.Data} The testrunner's changeTestSuiteState event
     */
    _onChangeTestSuiteState : function(ev) {
      var state = ev.getData();

      switch(state) {
        // async test suite loading
        case "ready":
          this._runSuite();
          break;
        case "finished":
          this.simulation.logRunTime();
          simulator.QxSelenium.getInstance().stop();
          quit();
          break;
        case "error":
          simulator.QxSelenium.getInstance().stop();
          quit();
          break;
      }
    },


    /**
     * Starts a QxSelenium session, logs some environment info and runs the
     * test suite.
     */
    _runSuite : function()
    {
      this.simulation.startSession();
      this.simulation.logEnvironment();
      this.simulation.logUserAgent();
      this.runner.view.run();
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
        else if (args[i].indexOf("'settings=") == 0) {
          opts = /'settings\=(.*?)'/.exec(args[i])[1];
          break;
        }
      }
      if (opts) {
        opts = opts.replace(/\\\{/g, "{").replace(/\\\}/g, "}");
        try {
          opts = qx.lang.Json.parse(opts);
        } catch(ex) {
          var msg = ex.toString() + "\nMake sure none of the settings configured"
          + " in simulation-run/environment contain paths with spaces!";
          throw new Error(msg);
        }
        for (var prop in opts) {
          var value = opts[prop];
          if (typeof value == "string") {
            value = value.replace(/\$/g, " ");
          }
          try {
            qx.core.Environment.add(prop, value);
          } catch(ex) {
            this.error("Unable to define command-line setting " + prop + ": " + ex);
          }
        }
      }
    },


    /**
     * Creates a log file using {@link qx.log.appender.RhinoFile}
     */
    _initLogFile : function()
    {
      var filename = null;
      filename = qx.core.Environment.get("simulator.logFile");
      if (!filename) {
        return;
      }

      if (qx.log.appender.RhinoFile.FILENAME !== filename) {
        qx.log.appender.RhinoFile.FILENAME = filename;
        qx.log.Logger.register(qx.log.appender.RhinoFile);
      }
    }
  },

  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this._disposeObjects("runner");
  }

});