/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christopher Zuendorf (czuendorf)

************************************************************************ */

qx.Class.define("qx.test.mobile.dialog.Picker",
{
  extend : qx.test.mobile.MobileTestCase,

  members :
  {
    testInit : function()
    {
      // SMOKE TEST for Picker widget.
      var pickerSlot1 = new qx.data.Array(["qx.Desktop", "qx.Mobile", "qx.Website","qx.Server"]);
      var pickerSlot2 = new qx.data.Array(["1.8", "2.0", "2.0.1", "2.0.2", "2.1","2.2"]);

      var picker = new qx.ui.mobile.dialog.Picker();
      picker.setTitle("Picker");

      this.assertTrue(picker.getSlotCount()==0, 'Unexpected picker slot count.');

      picker.addSlot(pickerSlot1);
      picker.addSlot(pickerSlot2);

      this.assertTrue(picker.getSlotCount()==2, 'Unexpected picker slot count.');

      picker.removeSlot(0);

      this.assertTrue(picker.getSlotCount()==1, 'Unexpected picker slot count.');
    }
  }

});
