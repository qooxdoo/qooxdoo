/* ************************************************************************

   Copyright:

   License:

   Authors:

************************************************************************ */

/* ************************************************************************

#asset(gui/*)

************************************************************************ */

/**
 * This is the main application class of your custom application "gui"
 */
qx.Class.define("gui.Application",
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
    main : function()
    {
      // Call super class
      this.base(arguments);

      // Enable logging in debug variant
      if (qx.core.Variant.isSet("qx.debug", "on"))
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
      var a = "Lookup";
      var b = " Key";
      function foo(){
        return "Lookup Key";
      }
      var button1 = new qx.ui.form.Button(this.tr(a+b), "gui/test.png");
      var button2 = new qx.ui.form.Button(this.tr(foo()), "gui/test.png");

      // Document is the application root
      var doc = this.getRoot();
			
      // Add button to document at fixed coordinates
      doc.add(button1, {left: 100, top: 50});
      doc.add(button2, {left: 100, top: 150});

      // Add an event listener
      button1.addListener("execute", function(e) {
        alert("Hello World!");
      });

      this.marktr("Lookup Key");
      this.trc("Lookup"+" needs comment", "Second Key");
      this.trc(a+" needs comment", "Third Key");
    }
  }
});
