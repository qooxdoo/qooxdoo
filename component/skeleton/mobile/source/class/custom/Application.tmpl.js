/* ************************************************************************

   Copyright:

   License:

   Authors:

************************************************************************ */

/* ************************************************************************

#asset(${Namespace}/*)
#asset(qx/mobile/icon/$${qx.mobile.platform}/*)
#asset(qx/mobile/icon/common/*)

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
        Remove or edit the following code to create your application.
      -------------------------------------------------------------------------
      */

      var page1 = new qx.ui.mobile.page.NavigationPage();
      page1.setTitle("Page 1");
      page1.addListener("initialize", function()
      {
        var button = new qx.ui.mobile.form.Button("Next Page");
        page1.getContent().add(button);

        button.addListener("tap", function() {
          page2.show();
        }, this);
      },this);

      var page2 = new qx.ui.mobile.page.NavigationPage();
      page2.setTitle("Page 2");
      page2.setShowBackButton(true);
      page2.setBackButtonText("Back");
      page2.addListener("initialize", function()
      {
        var label = new qx.ui.mobile.basic.Label("Content of Page 2");
        page2.getContent().add(label);
      },this);

      page2.addListener("back", function() {
        page1.show({reverse:true});
      }, this);
      
      // Add the pages to the page manager.
      var manager = new qx.ui.mobile.page.Manager(false);
      manager.addDetail([
        page1,
        page2
      ]);
      
      // Page1 will be shown at start
      page1.show();
    }
  }
});
