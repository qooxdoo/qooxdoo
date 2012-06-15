/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2011-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tino Butz (tbtz)

************************************************************************ */

qx.Class.define("qx.test.mobile.form.SelectBox",
{
  extend : qx.test.mobile.MobileTestCase,

  members :
  {

    testValue : function()
    {
      var dd = new qx.data.Array(["Item 1", "Item 2", "Item 3"]);
      var selectBox = new qx.ui.mobile.form.SelectBox();

      selectBox.setModel(dd);
      this.assertEquals("Item 1",selectBox.getValue());

      selectBox.setValue("Item 3");
      this.assertEquals(2, selectBox.getSelection());
      this.assertEquals("Item 3",selectBox.getValue());

      // Nothing is change because unknown value.
      selectBox.setValue("Item 4");
      this.assertEquals("Item 3",selectBox.getValue());

      selectBox.destroy();
      dd.dispose();
      dd = null;
    },

    testSelection : function()
    {
      var model = new qx.data.Array(["Item 1", "Item 2", "Item 3"]);
      var selectBox = new qx.ui.mobile.form.SelectBox();
      selectBox.setModel(model);

      // Default value of selectedIndex after setting model is 0.
      this.assertEquals(0, selectBox.getSelection());

      // Set selection success
      selectBox.setSelection(2);
      this.assertEquals(2, selectBox.getSelection());
      this.assertEquals("Item 3", selectBox.getValue());

      // Set selection failure
      // Nothing is changed because, invalid selectedIndex value.
      selectBox.setSelection(4);
      this.assertEquals(2, selectBox.getSelection());
      this.assertEquals("Item 3", selectBox.getValue());

      // Negative values are not allowed. Nothing is changed.
      selectBox.setSelection(-1);
      this.assertEquals(2, selectBox.getSelection());
      this.assertEquals("Item 3", selectBox.getValue());

      // After
      selectBox.destroy();
      model.dispose();
      model = null;
    }

  }
});
