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

      page.show();

      this.assertTrue(initializedEvent, "Initialize event is not fired!");
      this.assertTrue(startEvent, "Start event is not fired!");
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
