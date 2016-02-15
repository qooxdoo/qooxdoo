/* ************************************************************************

   Copyright:

   License:

   Authors:

************************************************************************ */

/**
 * This is the main application class of your custom application "qxt"
 * @asset(qxt/*)
 * @asset(qx/icon/${qx.icontheme}/16/mimetypes/*)
 */
qx.Class.define("qxt.Application",
{
  extend : qx.application.Standalone,
  //implement: [ qx.util.format.IFormat ],

  construct: function() {
    this.base(arguments);
    this.self(arguments).myStaticDemo();
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

      this.self(arguments).myStaticDemo();

      console.log("qxt.customEnvironment=" + qx.core.Environment.get("qxt.customEnvironment"));

      // Document is the application root
      var doc = this.getRoot();

      // Create a button
      var button1 = new qx.ui.form.Button("First Button", "qxt/test.png");

      // Add button to document at fixed coordinates
   	  doc.add(button1, {left: 100, top: 50});
   	  
      // Add an event listener
      //button1.addListener("execute", () => alert("Hello World!"));

      doc.add(new qx.ui.form.TextField(), { left: 100, top: 150 });

      var btn = new com.zenesis.qx.upload.UploadButton("Add File(s)", "qxt/test.png");
      var uploader = new com.zenesis.qx.upload.UploadMgr(btn, "http://www.zenesis.com/demoupload"); // "http://my.grasshopperwebsites.com:8080/demoupload"
      doc.add(btn, { left: 100, top: 250 });
    }
  },

  statics: {
    myStaticDemo: function() {
      return "hello world";
    }
  }
});
