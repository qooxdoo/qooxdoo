/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christopher Zuendorf (czuendorf)

************************************************************************ */

qx.Class.define("qx.test.mobile.container.Drawer",
{
  extend : qx.test.mobile.MobileTestCase,

  members :
  {
    testInitComposite : function()
    {
      var parentContainer = new qx.ui.mobile.container.Composite();

      var drawer = new qx.ui.mobile.container.Drawer(parentContainer);

      var drawerCandidate = parentContainer.getChildren()[0];

      this.assertEquals(drawer, drawerCandidate, "Unexpected children of composite.");

      drawer.destroy();
    },


    testInitRoot : function()
    {
      var drawer = new qx.ui.mobile.container.Drawer();

      var drawerCandidate = this.getRoot().getChildren()[this.getRoot().getChildren().length-1];

      this.assertEquals(drawer, drawerCandidate, "Unexpected children of root.");

      drawer.destroy();
    },


    testShowHide : function()
    {
      var drawer = new qx.ui.mobile.container.Drawer();

      drawer.setTransitionDuration(0);

      // Initial hidden.
      this.assertTrue(drawer.isHidden(),"Drawer is asserted to be initially hidden.");

      // Show.
      drawer.show();

      this.assertFalse(drawer.isHidden(),"Drawer is asserted to be shown.");

      // Hide again.
      drawer.hide();

      this.assertTrue(drawer.isHidden(),"Drawer is asserted to be hidden.");

      drawer.destroy();
    },


    testToggleVisibility : function()
    {
      var drawer = new qx.ui.mobile.container.Drawer();

      drawer.setTransitionDuration(0);

      // Initial hidden.
      this.assertTrue(drawer.isHidden(),"Drawer is asserted to be initially hidden.");

      // Toggle visibility.
      var targetVisibility = drawer.toggleVisibility();

      this.assertTrue(targetVisibility,"Drawer's targetVisibility is asserted to be true.");
      this.assertFalse(drawer.isHidden(),"Drawer is asserted to be shown.");

      // Toggle visibility again.
      targetVisibility = drawer.toggleVisibility();

      this.assertFalse(targetVisibility,"Drawer's targetVisibility is asserted to be false.");
      this.assertTrue(drawer.isHidden(),"Drawer is asserted to be hidden.");

      drawer.destroy();
    }
  }

});
