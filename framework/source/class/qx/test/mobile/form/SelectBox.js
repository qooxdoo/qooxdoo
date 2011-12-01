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
      selectBox.setSelection("Item 3");
      this.assertEquals("Item 3",selectBox.getValue());
      selectBox.destroy();
      dd.dispose();
      dd = null;
    },

    testSelection : function()
    {
      var dd = new qx.data.Array(["Item 1", "Item 2", "Item 3"]);
      var selectBox = new qx.ui.mobile.form.SelectBox();
      selectBox.setModel(dd);
      this.assertEquals("Item 1",selectBox.getSelection());
      selectBox.setSelection("Item 3");
      this.assertEquals("Item 3",selectBox.getSelection());
      this.assertEquals(2, selectBox.getContainerElement().selectedIndex);
      selectBox.destroy();
      dd.dispose();
      dd = null;
    }

  }
});
