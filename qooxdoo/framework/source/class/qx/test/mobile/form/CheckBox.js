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

qx.Class.define("qx.test.mobile.form.CheckBox",
{
  extend : qx.test.mobile.MobileTestCase,

  members :
  {
    testValue : function()
    {
      var checkBox = new qx.ui.mobile.form.CheckBox("1");
      this.getRoot().add(checkBox);

      this.assertEquals("1",checkBox.getValue());
      this.assertEquals("1",qx.bom.element.Attribute.get(checkBox.getContainerElement(),'value'));

      checkBox.destroy();
    },
    testEnable : function()
    {
      var checkBox = new qx.ui.mobile.form.CheckBox(1);
      this.getRoot().add(checkBox);
      checkBox.setEnable(false);
      this.assertEquals(false,checkBox.getEnable());

      checkBox.destroy();
    },
    testCheck : function()
    {
      var checkBox = new qx.ui.mobile.form.CheckBox(1);
      this.getRoot().add(checkBox);
      checkBox.setChecked(false);
      this.assertEquals(false,qx.bom.element.Attribute.get(checkBox.getContainerElement(),'checked'));
      checkBox.setChecked(true);
      this.assertEquals(true,qx.bom.element.Attribute.get(checkBox.getContainerElement(),'checked'));
      this.assertEquals(true,checkBox.getChecked());
      
      checkBox.destroy();
    }
  }
});
