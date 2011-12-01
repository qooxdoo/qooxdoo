/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tino Butz (tbtz)

************************************************************************ */

/* ************************************************************************
 * If you have added resources to your app remove the leading '*' in the
 * following line to make use of them.

#asset(mobileshowcase/*)
#asset(qx/mobile/icon/common/*)
#asset(qx/mobile/icon/android/*)
#asset(qx/mobile/icon/ios/*)

************************************************************************ */

/**
 * This is the main application class for the mobile showcase app.
 */
qx.Class.define("mobileshowcase.Application",
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
      -------------------------------------------------------------------------
      */

      // Create the pages
      var overview = new mobileshowcase.page.Overview();
      var events = new mobileshowcase.page.Event();
      var list = new mobileshowcase.page.List();
      var tab = new mobileshowcase.page.Tab();
      var toolbar = new mobileshowcase.page.Toolbar();
      var form = new mobileshowcase.page.Form();
      var animation = new mobileshowcase.page.Animation();
      var animationLanding = new mobileshowcase.page.AnimationLanding();
      var atoms = new mobileshowcase.page.Atom();


      // Navigation
      var nm = qx.ui.mobile.navigation.Manager.getInstance();
      nm.onGet("/", function(data) {
        overview.show(data.customData);
      },this);

      nm.onGet("/event", function(data)
      {
        events.show();
      },this);

      nm.onGet("/tab", function(data)
      {
        tab.show();
      },this);

      nm.onGet("/toolbar", function(data)
      {
        toolbar.show();
      },this);

      nm.onGet("/list", function(data)
      {
        list.show();
      },this);

      nm.onGet("/form", function(data)
      {
        form.show();
      },this);

      nm.onGet("/atom", function(data)
      {
        atoms.show();
      },this);

      nm.onGet("/animation", function(data) {
        animation.show(data.customData);
      },this);

      nm.onGet("/animation/:animation", function(data) {
        var animation = data.params.animation;
        animationLanding.setAnimation(animation);
        animationLanding.show({animation:animation});
      },this);

    }
  }
});
