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
    setUp : function()
    {
      this.base(arguments);
      var manager = qx.ui.mobile.page.Page.getManager();
      if (manager)
      {
        qx.ui.mobile.page.Page.setManager(null);
        manager.dispose();
      }
      qx.ui.mobile.page.Page.setManager(new qx.ui.mobile.page.manager.Simple());
    },


    tearDown : function()
    {
      this.base(arguments);
      var manager = qx.ui.mobile.page.Page.getManager();
      qx.ui.mobile.page.Page.setManager(null);
      manager.dispose();
    },


    testLifecycle : function()
    {
      var initializedEvent = false;
      var startEvent = false;

      var page = new qx.ui.mobile.page.Page();

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
    }
  }
});
