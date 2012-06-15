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

qx.Class.define("qx.test.mobile.layout.HBox",
{
  extend : qx.test.mobile.MobileTestCase,

  members :
  {
    testAdd : function()
    {
      var composite = new qx.ui.mobile.container.Composite(new qx.ui.mobile.layout.HBox());
      this.getRoot().add(composite);

      this.assertTrue(composite.hasCssClass("hbox"));
      var widget1 = new qx.ui.mobile.core.Widget();
      composite.add(widget1);

      var widget2 = new qx.ui.mobile.core.Widget();
      composite.add(widget2);

      widget1.destroy();
      widget2.destroy();
      composite.destroy();
    },


    testFlex : function() {
      var composite = new qx.ui.mobile.container.Composite(new qx.ui.mobile.layout.HBox());
      this.getRoot().add(composite);

      var widget1 = new qx.ui.mobile.core.Widget();
      composite.add(widget1, {flex:1});
      this.assertTrue(widget1.hasCssClass("boxFlex1"));

      var widget2 = new qx.ui.mobile.core.Widget();
      composite.add(widget2, {flex:2});
      this.assertTrue(widget2.hasCssClass("boxFlex2"));

      widget1.destroy();
      widget2.destroy();
      composite.destroy();
    },


    testRemove : function() {
      var composite = new qx.ui.mobile.container.Composite(new qx.ui.mobile.layout.HBox());
      this.getRoot().add(composite);

      var widget1 = new qx.ui.mobile.core.Widget();
      composite.add(widget1, {flex:1});
      composite.remove(widget1);
      this.assertFalse(widget1.hasCssClass("boxFlex1"));

      var widget2 = new qx.ui.mobile.core.Widget();
      composite.add(widget2, {flex:2});
      composite.remove(widget2);
      this.assertFalse(widget2.hasCssClass("boxFlex2"));

      this.getRoot().remove(composite);
      this.assertTrue(composite.hasCssClass("hbox"));

      widget1.destroy();
      widget2.destroy();
      composite.destroy();
    },


    testReset : function() {
      var composite = new qx.ui.mobile.container.Composite(new qx.ui.mobile.layout.HBox());
      this.getRoot().add(composite);

      composite.setLayout(null);
      this.assertFalse(composite.hasCssClass("hbox"));

      composite.destroy();
    }
  }

});
