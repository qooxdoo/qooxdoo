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

qx.Class.define("qx.test.mobile.dialog.Popup",
{
  extend : qx.test.mobile.MobileTestCase,

  members :
  {

    testShow : function()
    {
      var label = new qx.ui.mobile.basic.Label("test");
      var popup = new qx.ui.mobile.dialog.Popup(label);
      this.assertFalse(popup.isVisible());
      popup.show();
      this.assertTrue(popup.isVisible());
    }

  }

});
