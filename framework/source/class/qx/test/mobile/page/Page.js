/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tino Butz (tbtz)

************************************************************************ */


qx.Class.define("qx.test.mobile.page.Page",
{
  extend : qx.test.mobile.MobileTestCase,

  members :
  {
    testShow : function()
    {
      var initializedEvent = false;
      var startEvent = false;
      var stopEvent = false;

      var page = new qx.ui.mobile.page.Page();
      this.getRoot().add(page);

      page.addListener("initialize", function() {
        this.assertFalse(startEvent, "Start event is fired before initialize event was fired!");
        initializedEvent = true;
      }, this);

      page.addListener("start", function() {
        this.assertTrue(initializedEvent, "Start event is fired before initialize event was fired!");
        startEvent = true;
      }, this);

      page.addListener("stop", function() {
        stopEvent = true;
      }, this);

      page.show();

      this.assertTrue(initializedEvent, "Initialize event is not fired!");
      this.assertTrue(startEvent, "Start event is not fired!");
      this.assertFalse(stopEvent, "Stop event is fired!");
      page.destroy();
    },


    testInitialize : function() {
      this.__testEventOnPage("initialize");
    },


    testStart : function() {
      this.__testEventOnPageAndApplication("start");
    },


    testStop : function() {
      this.__testEventOnPageAndApplication("stop", function(page) {
        page.initialize();
      });
    },


    testPause : function() {
      this.__testEventOnPage("pause");
    },


    testResume : function() {
      this.__testEventOnPage("resume");
    },


    testWait : function() {
      this.__testEventOnPage("wait");
    },


    testBack : function() {
      this.__testEventOnPageAndApplication("back");
    },


    testPreventBack : function()
    {
      var page = new qx.ui.mobile.page.Page();
      this.getRoot().add(page);

      var eventFiredOnApplication = false;
      var eventFiredOnPage = false;

      var application = qx.core.Init.getApplication();
      var id = application.addListener("back", function(evt) {
        eventFiredOnApplication = true;
        evt.preventDefault();
      }, this);

      page.addListener("back", function() {
        eventFiredOnPage = true;
      }, this);

      page.back();

      this.assertTrue(eventFiredOnApplication, "The 'back' event on application is not fired!");
      this.assertFalse(eventFiredOnPage, "The 'back' event on page is fired!");

      application.removeListenerById(id);
      page.destroy();
    },


    testMenu: function() {
      this.__testEventOnPage("menu");
    },


    __testEventOnPage : function(name)
    {
      var page = new qx.ui.mobile.page.Page();
      this.getRoot().add(page);

      var isEventFired = false;

      page.addListener(name, function() {
        isEventFired = true;
      }, this);

      page[name]();

      this.assertTrue(isEventFired, "The '" + name + "' event is not fired!");

      page.destroy();
    },


    __testEventOnPageAndApplication : function(name, beforeCallback)
    {
      var page = new qx.ui.mobile.page.Page();
      this.getRoot().add(page);

      var eventFiredOnApplication = false;
      var eventFiredOnPage = false;

      var application = qx.core.Init.getApplication();
      var id = application.addListener(name, function() {
        eventFiredOnApplication = true;
      }, this);

      page.addListener(name, function() {
        eventFiredOnPage = true;
      }, this);

      if (beforeCallback) {
        beforeCallback(page);
      }

      page[name]();

      this.assertTrue(eventFiredOnApplication, "The '" + name + "' event on application is not fired!");
      this.assertTrue(eventFiredOnPage, "The '" + name + "' event on page is not fired!");

      application.removeListenerById(id);
      page.destroy();
    }
  }
});
