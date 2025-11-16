/* ************************************************************************

   Copyright: 2024 Test

   License: MIT license

   Authors: Test

************************************************************************ */

/**
 * This is the main application class of "issue10407"
 *
 * This application tests various scenarios where nonexistent classes are referenced.
 * The compiler should detect and warn about these references.
 *
 * @asset(issue10407/*)
 */
qx.Class.define("issue10407.Application",
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

      // Test Case 1: Nonexistent class without parent namespace
      // This should trigger a warning because qx.dddd doesn't exist
      var obj1 = new qx.dddd.eeekeje();

      // Test Case 2: Nonexistent class with existing parent namespace
      // This should also trigger a warning - qx.ui exists, but qx.ui.NonExistentWidget doesn't
      var obj2 = new qx.ui.NonExistentWidget();

      // Test Case 3: Another nonexistent class in a different context
      var obj3 = new qx.core.ThisClassDoesNotExist();

      // Test Case 4: Using nonexistent class in a static method call
      var result = qx.util.NonExistentUtil.someMethod();

      // Test Case 5: Simple nonexistent class qx.ddde.eee
      var x = new qx.ddde.eee();

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
