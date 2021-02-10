/* ************************************************************************

   Copyright: 2020 

   License: MIT license

   Authors: 

************************************************************************ */

/**
 * This is the main application class of "testMixin"
 *
 * @asset(testMixin/*)
 */
qx.Class.define("testMixin.Application",
{
  extend : qx.application.Standalone,
  include: [
      testMixin.Mixin
  ],


  events: {
     /**
      * main event
      */
     mainEvent: "qx.event.type.Event"
  },

  properties :
  {
    /**
     * mainProperty
     */
    mainProperty : {
    }
  },

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
    /* no jsdoc comment */
    main : function()
    {
      // Call super class
      this.base(arguments);

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
      var button1 = new qx.ui.form.Button("Click me", "testMixin/test.png");

      // Document is the application root
      var doc = this.getRoot();

      // Add button to document at fixed coordinates
      doc.add(button1, {left: 100, top: 50});

      // Add an event listener
      button1.addListener("execute", function() {
        /* eslint no-alert: "off" */
        alert("Hello World!");
      });
    },
    test_1: function () {
      let test = "class:1:2";
      let [t_0, t_1] = test.split(":");
      console.log(t_0, t_1);
      let [testClass, ...testName] = test.split(":");
      console.log(testClass, testName);
    },
    test_2: function (param1 = {}) {
      console.log(param1);
    },
    test_3: function ({param1, param2} = {}) {
      console.log(param1, param2);
    },
    test_4: function ({param1 = 1, param2 = 2} = {}) {
      console.log(param1, param2);
    }
  }
});