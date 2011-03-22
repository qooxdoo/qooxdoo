/* ************************************************************************

   Copyright:

   License:

   Authors:

************************************************************************ */

/* ************************************************************************
 * If you have added resources to your app, remove the leading '*' in the 
 * following line to make use of them.
 
 * #asset(${Namespace}/*)

************************************************************************ */

/**
 * This is the main application class of your custom application "${Name}"
 */
qx.Class.define("${Namespace}.Application",
{
  extend : qx.application.Mobile,



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

      var page1 = new qx.ui.mobile.page.Page();
      page1.addListener("initialize", function()
      {
        var button = new qx.ui.mobile.form.Button("Next Page");
        page1.add(button);

        button.addListener("tap", function() {
          page2.show();
        }, this);
      },this);


      var page2 = new qx.ui.mobile.page.Page();
      page2.addListener("initialize", function()
      {
        var button = new qx.ui.mobile.form.Button("Previous Page");
        page2.add(button);

        button.addListener("tap", function() {
          page1.show({reverse:true});
        }, this);
      },this);

      page1.show();
    }
  }
});
