/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2011 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (d_wagner)

************************************************************************ */

/**
 * Basic TestRunner main application class.
 */
qx.Class.define("testrunner.ApplicationBasic", {

  extend : qx.application.Basic,

  members :
  {

    main : function()
    {
      if (qx.core.Environment.get("runtime.name") == "rhino") {
        qx.log.Logger.register(qx.log.appender.RhinoConsole);
      } else if (qx.core.Environment.get("runtime.name") == "node.js") {
        qx.log.Logger.register(qx.log.appender.NodeConsole);
      }

      if (window.arguments) {
        try {
          this._argumentsToSettings(window.arguments);
        } catch(ex) {
          this.error(ex.toString());
          return;
        }
      }

      this.runner = new testrunner.runner.TestRunnerBasic();

      this.runner.addListener("changeTestSuiteState", function(ev) {
        var state = ev.getData();

        switch(state) {
          // async test suite loading
          case "ready":
            this.runner.view.run();
            break;
        }
      }, this);

      // sync test suite loading
      if (this.runner.getTestSuiteState() === "ready") {
        this.runner.view.run();
      }
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
          var msg = ex.toString() + "\nMake sure none of the command line"
          + " settings contain paths with spaces!";
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