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


qx.Class.define("qx.test.mobile.page.NavigationPage",
{
  extend : qx.test.mobile.MobileTestCase,

  members :
  {
    testNavigationInterface : function()
    {
      var page = new qx.ui.mobile.page.NavigationPage();

      this.assertNotNull(page.getTitleWidget());
      this.assertNotNull(page.getLeftContainer());
      this.assertNotNull(page.getRightContainer());

      page.destroy();
    },


    testTitle : function()
    {
      var page = new qx.ui.mobile.page.NavigationPage();

      page.setTitle("Affe");
      this.assertEquals("Affe", page.getTitleWidget().getValue());

      page.destroy();
    },


    testBackButton : function()
    {
      var page = new qx.ui.mobile.page.NavigationPage();

      page.getLeftContainer();

      page.setShowBackButton(true);
      page.setBackButtonText("Affe");
      this.assertEquals("Affe", page._getBackButton().getValue());
      this.assertTrue(page._getBackButton().isVisible());
      page.setShowBackButton(false);
      this.assertFalse(page._getBackButton().isVisible());

      page.destroy();
    },


    testButton : function()
    {
      var page = new qx.ui.mobile.page.NavigationPage();

      page.getRightContainer();

      page.setShowButton(true);
      page.setButtonText("Affe");
      this.assertEquals("Affe", page._getButton().getValue());
      this.assertTrue(page._getButton().isVisible());
      page.setShowButton(false);
      this.assertFalse(page._getButton().isVisible());

      page.destroy();
    }
  }
});
