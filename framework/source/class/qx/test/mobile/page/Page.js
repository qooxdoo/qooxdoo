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
    testLifecycle : function()
    {
      var initializedEvent = false;
      var startEvent = false;

      var page = new qx.ui.mobile.page.Page();
      this.getRoot().add(page);

      page.addListener("initialize", function() {
        this.assertFalse(startEvent);
        initializedEvent = true;
      }, this);

      page.addListener("start", function() {
        this.assertTrue(initializedEvent);
        startEvent = true;
      }, this);

      page.show();

      this.assertTrue(initializedEvent);
      this.assertTrue(startEvent);
      page.destroy();
    },


    testBack : function() {
      var page = new qx.ui.mobile.page.Page();
      this.getRoot().add(page);

      var eventFired = false;

      page.addListener("back", function() {
        eventFired = true;
      }, this);
      page.back();

      this.assertTrue(eventFired);

      page.destroy();
    },


    testMenu : function() {
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
