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

qx.Class.define("qx.test.mobile.basic.Label",
{
  extend : qx.test.mobile.MobileTestCase,

  members :
  {
    testValue : function()
    {
      var label = new qx.ui.mobile.basic.Label("affe");
      this.getRoot().add(label);

      this.assertString(label.getValue());
      this.assertEquals(label.getValue(), "affe");
      this.assertEquals(label.getValue(), label.getContentElement().innerHTML);

      this.assertEventFired(label, "changeValue", function() {
        label.setValue("");
      });

      this.assertEquals(label.getValue(), "");
      this.assertEquals(label.getValue(), label.getContentElement().innerHTML);

      label.destroy();
    }
  }

});
