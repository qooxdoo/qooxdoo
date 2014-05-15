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
     * Tino Butz (tbtz)
     * Christopher Zuendorf (czuendorf)

************************************************************************ */

/*
 * If you have added resources to your app remove the leading '*' in the
 * following line to make use of them.


************************************************************************ */

/**
 * This is the main application class for the mobile showcase app.
 * @require(qx.log.appender.Console)
 * @asset(mobileshowcase/*)
 */
qx.Class.define("mobileshowcase.Application",
{
  extend : qx.application.Mobile,


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
      }

      /*
      -------------------------------------------------------------------------
        Below is your actual application code...
      -------------------------------------------------------------------------
      */

      // Create the pages
      var overview = new mobileshowcase.page.Overview();
      var events = new mobileshowcase.page.Event();
      var carousel = new mobileshowcase.page.Carousel();
      var drawer = new mobileshowcase.page.Drawer();
      var list = new mobileshowcase.page.List();
      var tab = new mobileshowcase.page.Tab();
      var toolbar = new mobileshowcase.page.Toolbar();
      var form = new mobileshowcase.page.Form();
      var animation = new mobileshowcase.page.Animation();
      var animationLanding = new mobileshowcase.page.AnimationLanding();
      var basic = new mobileshowcase.page.Basic();
      var dialogs = new mobileshowcase.page.Dialog();
      var dataBinding = new mobileshowcase.page.DataBinding();
      var maps = new mobileshowcase.page.Maps();
      var canvas = new mobileshowcase.page.Canvas();
      var theming = new mobileshowcase.page.Theming();

      // Add the pages to the page manager
      var manager = new qx.ui.mobile.page.Manager();
      manager.addMaster(overview);
      manager.addDetail([
        basic,
        events,
        carousel,
        drawer,
        list,
        tab,
        toolbar,
        form,
        animation,
        animationLanding,
        dialogs,
        dataBinding,
        maps,
        canvas,
        theming
      ]);

      // Initialize the navigation
      var routing = this.getRouting();

      if (qx.core.Environment.get("device.type") == "tablet" ||
       qx.core.Environment.get("device.type") == "desktop") {
        routing.onGet("/.*", this._show, overview);
        routing.onGet("/", this._show, basic);
      }

      routing.onGet("/", this._show, overview);
      routing.onGet("/basic", this._show, basic);
      routing.onGet("/dialog", this._show, dialogs);
      routing.onGet("/tab", this._show, tab);
      routing.onGet("/form", this._show, form);
      routing.onGet("/list", this._show, list);
      routing.onGet("/toolbar", this._show, toolbar);
      routing.onGet("/carousel", this._show, carousel);
      routing.onGet("/drawer", this._show, drawer);
      routing.onGet("/databinding", this._show, dataBinding);
      routing.onGet("/event", this._show, events);
      routing.onGet("/maps", this._show, maps);
      routing.onGet("/canvas", this._show, canvas);
      routing.onGet("/theming", this._show, theming);
      routing.onGet("/animation", this._show, animation);

      routing.onGet("/animation/{animation}", function(data) {
        animationLanding.setAnimation(data.params.animation);
        if (animationLanding.isVisible()) {
          animation.show({
            "animation": data.params.animation
          });
        } else {
          animationLanding.show({
            "animation": data.params.animation
          });
        }
      }, this);

      routing.init();
    },


    /**
     * Default behaviour when a route matches. Displays the corresponding page on screen.
     * @param data {Map} the animation properties
     */
    _show : function(data) {
      this.show(data.customData);
    }
  }
});
