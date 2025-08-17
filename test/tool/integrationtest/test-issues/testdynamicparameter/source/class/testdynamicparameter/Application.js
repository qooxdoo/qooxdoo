/* ************************************************************************

   Copyright: 2025 

   License: MIT license

   Authors: 

************************************************************************ */

/**
 * This is the main application class of "testdynamicparameter"
 *
 * @asset(testdynamicparameter/*)
 */
qx.Class.define("testdynamicparameter.Application",
{
  extend : qx.application.Standalone,



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
     *
     * @lint ignoreDeprecated(alert)
     */
    main()
    {
      // Call super class
      super.main();

      // Enable logging in debug variant
      if (qx.core.Environment.get("qx.debug"))
      {
        // support native logging capabilities, e.g. Firebug for Firefox
        qx.log.appender.Native;
        // support additional cross-browser console. Press F7 to toggle visibility
        qx.log.appender.Console;
      }

      /*
      -------------------------------------------------------------------------
        Below is your actual application code...
      -------------------------------------------------------------------------
      */

      // Create a button
      const button1 = new qx.ui.form.Button("Click me", "testdynamicparameter/test.png");

      // Document is the application root
      const doc = this.getRoot();

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
