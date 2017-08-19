/* ************************************************************************
 *
 *    qxcompiler - node.js based replacement for the Qooxdoo python
 *    toolchain
 *
 *    https://github.com/qooxdoo/qxcompiler
 *
 *    Copyright:
 *      2011-2017 Zenesis Limited, http://www.zenesis.com
 *
 *    License:
 *      MIT: https://opensource.org/licenses/MIT
 *
 *      This software is provided under the same licensing terms as Qooxdoo,
 *      please see the LICENSE file in the Qooxdoo project's top-level directory
 *      for details.
 *
 *    Authors:
 *      * John Spackman (john.spackman@zenesis.com, @johnspackman)
 *
 * ************************************************************************/


/**
 * @asset(abc/def/myicon.gif)
 */
/**
 * Application used for unit testing.  Note that this app may not always run, intentionally,
 * because the unit tests will enable and disable features to test the compiler output. 
 * 
 * @asset(testapp/*)
 */
qx.Class.define("testapp.Application", {
  extend: qx.application.Standalone,

  members: {
    /**
     * This method contains the initial application code and gets called during
     * startup of the application
     * 
     * @lint ignoreDeprecated(alert)
     */
    main: function() {
      // Call super class
      this.base(arguments);

      // Enable logging in debug variant
      if (qx.core.Environment.get("qx.debug")) {
        // support native logging capabilities, e.g. Firebug for Firefox
        qx.log.appender.Native;
        // support additional cross-browser console. Press F7 to toggle
        // visibility
        qx.log.appender.Console;
      }

      /*
       * -------------------------------------------------------------------------
       * Below is your actual application code...
       * -------------------------------------------------------------------------
       */

      // Create a button
      var button1 = new qx.ui.form.Button("First Button", "testapp/test.png");

      // Document is the application root
      var doc = this.getRoot();

      // Add button to document at fixed coordinates
      doc.add(button1, {
        left: 100,
        top: 50
      });

      // Add an event listener
      button1.addListener("execute", function(e) {
        alert("Hello World!");
      });
    },
    
    undocumentedMethod: function() {
      return 1;
    },
    
    /**
     * Does important stuff
     * 
     * @param abc {String} a string goes here
     * @param def {Integer | Date ? 42} it's complicated
     * @param ghi {String[]} lots
     * @param jkl {String?} maybe baby
     * @return {MyClass} an important object
     */
    fullyDocumentedMethod: function(abc, def, ghi, jkl) {
      return new testapp.MyClass();
    }
  }
});
