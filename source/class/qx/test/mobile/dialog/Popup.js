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

qx.Class.define("qx.test.mobile.dialog.Popup",
{
  extend : qx.test.mobile.MobileTestCase,

  members :
  {
    testShow: function() {
      var label = new qx.ui.mobile.basic.Label("test");
      var popup = new qx.ui.mobile.dialog.Popup(label);

      this.assertFalse(popup.isVisible());

      popup.show();

      this.assertTrue(popup.isVisible());

      label.destroy();
      popup.destroy();
    },


    testShowHide : function() {
      this.require(["debug"]);

      var popup = new qx.ui.mobile.dialog.Popup();

      var blocker = qx.ui.mobile.core.Blocker.getInstance();
      blocker.forceHide();

      // Modal mode false test cases, no changes expected.
      popup.setModal(false);
      popup.show();

      this.assertTrue(popup.isVisible(), 'popup should be visible.');
      this.assertFalse(blocker.isShown(), 'Modal mode is false, blocker should be still hidden.');

      popup.hide();

      this.assertFalse(popup.isVisible(), 'popup should not be visible.');
      this.assertFalse(blocker.isShown(), 'Modal mode is false, called popup.hide(), blocker should be still hidden.');

      popup.show();

      this.assertFalse(blocker.isShown(), 'Modal mode is false, called popup.show(), blocker should be still hidden.');
      this.assertTrue(popup.isVisible(), 'popup should be visible.');

      // Modal mode true test cases
      popup.setModal(true);
      popup.show();

      this.assertTrue(blocker.isShown(), 'Modal mode is true, called popup.show(), Blocker should be shown.');

      popup.hide();
      this.assertFalse(blocker.isShown(), 'Modal mode is true, called dialog.hide(), Blocker should not be shown.');
      popup.destroy();
    },


    hasDebug: function() {
      return qx.core.Environment.get("qx.debug");
    }
  }

});
