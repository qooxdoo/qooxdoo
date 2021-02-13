/* ************************************************************************

   Copyright:

   License:

   Authors:

************************************************************************ */
/* eslint-disable no-unused-vars */
/* global JSZip require */
const process = require("process");

/**
 * This is the main application class of your custom application "myapp".
 *
 * If you have added resources to your app, remove the first '@' in the
 * following line to make use of them.
 * @asset(myapp/*)
 * @ignore(process)
 */
qx.Class.define("myapp.Application",
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
    main : function() {
      if (qx.core.Environment.get("runtime.name") == "rhino") {
        qx.log.Logger.register(qx.log.appender.RhinoConsole);
      } else if (qx.core.Environment.get("runtime.name") == "node.js") {
        qx.log.Logger.register(qx.log.appender.NodeConsole);
      }

      if (window.arguments) {
        try {
          this._argumentsToSettings(window.arguments);
        } catch (ex) {
          this.error(ex.toString());
          return;
        }
      }

      // Test zip
//      var zip = new JSZip();
//      zip.file("Hello.txt", "Hello World\n");

//      if (!com.zenesis.qx.upload.UploadButton) {
//        process.exit(1);
//      }
      if (!myapp.Window) {
        process.exit(1);
      }
      this.info("Hello World!");
    },

    /**
     * Converts the value of the "settings" command line option to qx settings.
     *
     * @param {string[]} args Rhino arguments object
     */
    _argumentsToSettings : function(args) {
      var opts;
      for (var i=0, l=args.length; i<l; i++) {
        if (args[i].indexOf("settings=") == 0) {
          opts = args[i].substr(9);
          break;
        } else if (args[i].indexOf("'settings=") == 0) {
          opts = /'settings\=(.*?)'/.exec(args[i])[1];
          break;
        }
      }
      if (opts) {
        opts = opts.replace(/\\\{/g, "{").replace(/\\\}/g, "}");
        opts = qx.lang.Json.parse(opts);
        for (var prop in opts) {
          var value = opts[prop];
          if (typeof value == "string") {
            value = value.replace(/\$$/g, " ");
          }
          try {
            qx.core.Environment.add(prop, value);
          } catch (ex) {
            this.error("Unable to define command-line setting " + prop + ": " + ex);
          }
        }
      }
    }
  }
  });
