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

      qx.util.format.DateFormat.getDateTimeInstance().format(new Date())

      /*
      -------------------------------------------------------------------------
        Below is your actual application code...
      -------------------------------------------------------------------------
      */

      this.self(arguments).myStaticDemo();

      console.log("qxt.customEnvironment=" + qx.core.Environment.get("qxt.customEnvironment"));
      console.log("qxt.applicationName=" + qx.core.Environment.get("qxt.applicationName"));

      console.log(this.tr("Translation One"));
      console.log(this.trn("Translation Singular", "Translation Plural", 1, 2));
      console.log(this.trc("Comment about Translation Three", "Translation Three"));
      console.log(this.trnc("Comment about Translation Four", "Translation Four Singular", "Translation Four Plural", 1, 2));
      console.log(this.tr("Last month"));

      console.log(qx.locale.Manager.tr("Translation One"));
      console.log(qx.locale.Manager.trn("Translation Singular", "Translation Plural", 1, 2));
      console.log(qx.locale.Manager.trc("Comment about Translation Three", "Translation Three"));
      console.log(qx.locale.Manager.trnc("Comment about Translation Four", "Translation Four Singular", "Translation Four Plural", 1, 2));
      console.log(qx.locale.Manager.tr("Last month"));

      // Document is the application root
      var doc = this.getRoot();

      // Create a button
      var button1 = new qx.ui.form.Button(this.tr("First Button"), "qxt/test.png");

      // Add button to document at fixed coordinates
   	  doc.add(button1, {left: 100, top: 50});
   	  
      // Add an event listener
      //button1.addListener("execute", () => alert("Hello World!"));

      doc.add(new qx.ui.form.TextField(), { left: 100, top: 150 });

      var btn = new com.zenesis.qx.upload.UploadButton(this.tr("Add File(s)"), "qxt/test.png");
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
