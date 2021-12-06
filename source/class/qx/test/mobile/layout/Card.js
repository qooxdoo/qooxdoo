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

qx.Class.define("qx.test.mobile.layout.Card",
{
  extend : qx.test.mobile.MobileTestCase,

  members :
  {
    testAdd : function()
    {
      var composite = new qx.ui.mobile.container.Composite(new qx.ui.mobile.layout.Card());
      this.getRoot().add(composite);

      this.assertTrue(composite.hasCssClass("layout-card"));

      var widget1 = new qx.ui.mobile.core.Widget();
      composite.add(widget1);
      this.assertTrue(widget1.hasCssClass("layout-card-item"));

      var widget2 = new qx.ui.mobile.core.Widget();
      composite.add(widget2);
      this.assertTrue(widget2.hasCssClass("layout-card-item"));

      widget1.destroy();
      widget2.destroy();
      composite.destroy();
    },


    testRemove : function() {
      var composite = new qx.ui.mobile.container.Composite(new qx.ui.mobile.layout.Card());
      this.getRoot().add(composite);

      var widget1 = new qx.ui.mobile.core.Widget();
      composite.add(widget1);
      composite.remove(widget1);
      this.assertFalse(widget1.hasCssClass("layout-card-item"));

      var widget2 = new qx.ui.mobile.core.Widget();
      composite.add(widget2);
      composite.remove(widget2);
      this.assertFalse(widget2.hasCssClass("layout-card-item"));


      this.getRoot().remove(composite);
      this.assertTrue(composite.hasCssClass("layout-card"));

      widget1.destroy();
      widget2.destroy();
      composite.destroy();
    },


    testReset : function() {
      var composite = new qx.ui.mobile.container.Composite(new qx.ui.mobile.layout.Card());
      this.getRoot().add(composite);

      composite.setLayout(null);
      this.assertFalse(composite.hasCssClass("layout-card"));

      composite.destroy();
    },


    testShow : function() {
      var composite = new qx.ui.mobile.container.Composite(new qx.ui.mobile.layout.Card());
      this.getRoot().add(composite);

      var widget1 = new qx.ui.mobile.core.Widget();
      composite.add(widget1);

      var widget2 = new qx.ui.mobile.core.Widget();
      composite.add(widget2);

      widget1.show();
      widget2.show();

      widget1.destroy();
      widget2.destroy();
      composite.destroy();
    }
  }

});
