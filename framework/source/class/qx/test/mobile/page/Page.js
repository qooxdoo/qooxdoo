/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
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


    testInitialize : function()
    {
      var page = new qx.ui.mobile.page.Page();
      this.getRoot().add(page);

      var initializedEvent = false;

      page.addListener("initialize", function() {
        initializedEvent = true;
      }, this);
      page.initialize();

      this.assertTrue(initializedEvent, "Initialize event is not fired!");

      page.destroy();
    },


    testStart : function()
    {
      var page = new qx.ui.mobile.page.Page();
      this.getRoot().add(page);

      var eventFiredOnApplication = false;
      var eventFiredOnPage = false;

      var application = qx.core.Init.getApplication();
      var id = application.addListener("start", function() {
        eventFiredOnApplication = true;
      }, this);

      page.addListener("start", function() {
        eventFiredOnPage = true;
      }, this);
      page.start();

      this.assertTrue(eventFiredOnApplication, "Start event on application is not fired!");
      this.assertTrue(eventFiredOnPage, "Start event on page is not fired!");

      application.removeListenerById(id);
      page.destroy();
    },


    testStop : function()
    {
      var page = new qx.ui.mobile.page.Page();
      this.getRoot().add(page);

      var eventFiredOnApplication = false;
      var eventFiredOnPage = false;

      var application = qx.core.Init.getApplication();
      var id = application.addListener("stop", function() {
        eventFiredOnApplication = true;
      }, this);

      page.addListener("stop", function() {
        eventFiredOnPage = true;
      }, this);
      page.initialize();
      page.stop();

      this.assertTrue(eventFiredOnApplication, "Stop event on application is not fired!");
      this.assertTrue(eventFiredOnPage, "Stop event on page is not fired!");

      application.removeListenerById(id);
      page.destroy();
    },


    testPause : function()
    {
      var page = new qx.ui.mobile.page.Page();
      this.getRoot().add(page);

      var pausedEvent = false;

      page.addListener("pause", function() {
        pausedEvent = true;
      }, this);
      page.pause();

      this.assertTrue(pausedEvent, "Pause event is not fired!");

      page.destroy();
    },


    testResume : function()
    {
      var page = new qx.ui.mobile.page.Page();
      this.getRoot().add(page);

      var resumeEvent = false;

      page.addListener("resume", function() {
        resumeEvent = true;
      }, this);
      page.resume();

      this.assertTrue(resumeEvent, "Resume event is not fired!");

      page.destroy();
    },


    testWait : function()
    {
      var page = new qx.ui.mobile.page.Page();
      this.getRoot().add(page);

      var waitEvent = false;

      page.addListener("wait", function() {
        waitEvent = true;
      }, this);
      page.wait();

      this.assertTrue(waitEvent, "Wait event is not fired!");

      page.destroy();
    },


    testBack : function()
    {
      var page = new qx.ui.mobile.page.Page();
      this.getRoot().add(page);

      var eventFiredOnApplication = false;
      var eventFiredOnPage = false;

      var application = qx.core.Init.getApplication();
      var id = application.addListener("back", function() {
        eventFiredOnApplication = true;
      }, this);

      page.addListener("back", function() {
        eventFiredOnPage = true;
      }, this);
      page.back();

      this.assertTrue(eventFiredOnApplication, "Back event on application is not fired!");
      this.assertTrue(eventFiredOnPage, "Back event on page is not fired!");

      application.removeListenerById(id);
      page.destroy();
    },


    testMenu: function()
    {
      var page = new qx.ui.mobile.page.Page();
      this.getRoot().add(page);

      var eventFired = false;

      page.addListener("menu", function() {
        eventFired = true;
      }, this);
      page.menu();

      this.assertTrue(eventFired);

      page.destroy();
    }
  }
});
