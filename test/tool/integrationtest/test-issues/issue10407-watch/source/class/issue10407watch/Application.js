/* ************************************************************************

   Copyright: 2024 Test

   License: MIT license

   Authors: Test

************************************************************************ */

/**
 * This is the main application class of "issue10407watch"
 *
 * This is a clean test application for watch mode tests.
 * It starts WITHOUT any errors. Tests will dynamically add code with
 * unresolved symbols to verify that watch mode detects them.
 *
 * @asset(issue10407watch/*)
 */
qx.Class.define("issue10407watch.Application",
{
  extend : qx.application.Standalone,

  members :
  {
    /**
     * This method contains the initial application code and gets called
     * during startup of the application
     *
     * @lint ignoreDeprecated(alert)
     */
    main : function()
    {
      // Call super class
      this.base(arguments);

      // This application starts clean without errors.
      // Tests will add code here to verify watch mode detection.

      // Enable logging in debug variant
      if (qx.core.Environment.get("qx.debug"))
      {
        // support native logging capabilities, e.g. Firebug for Firefox
        qx.log.appender.Native;
        // support additional cross-browser console. Press F7 to toggle visibility
        qx.log.appender.Console;
      }

      // Create a button with valid class (this should work)
      var button1 = new qx.ui.form.Button("Click me");

      // Document is the application root
      var doc = this.getRoot();

      // Add button to document at fixed coordinates
      doc.add(button1, {left: 100, top: 50});

      // Add an event listener
      button1.addListener("execute", function() {
        /* eslint no-alert: "off" */
        alert("Hello World!");
      });
    }
  }
});
