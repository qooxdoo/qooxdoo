/* ************************************************************************

   Copyright:

   License:

   Authors:

************************************************************************ */

/**
 * This is the main application class of your custom application "${name}".
 *
 * If you have added resources to your app, remove the first '@' in the
 * following line to make use of them.
 * @@asset(${namespace_as_path}/*)
 *
 */
qx.Class.define("${namespace}.Application",
{
  extend : qx.application.Basic,



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * This method contains the initial application code and gets called
     * during startup of the application
     */
    main()
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

      this.info("Hello World!");
    },

    /**
     * Converts the value of the "settings" command line option to qx settings.
     *
     * @param args {String[]} Rhino arguments object
     */
    _argumentsToSettings(args)
    {
      let opts;
      for (let i=0, l=args.length; i<l; i++) {
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
        opts = qx.lang.Json.parse(opts);
        for (let prop in opts) {
          let value = opts[prop];
          if (typeof value == "string") {
            value = value.replace(/\$$/g, " ");
          }
          try {
            qx.core.Environment.add(prop, value);
          } catch(ex) {
            this.error("Unable to define command-line setting " + prop + ": " + ex);
          }
        }
      }
    }
  }
});
