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
      var checkBox = new qx.ui.mobile.form.CheckBox(false);
      this.getRoot().add(checkBox);

      this.assertEquals(false,checkBox.getValue());
      this.assertEquals(false,qx.bom.element.Attribute.get(checkBox.getContainerElement(),'checked'));
      checkBox.setValue(true);
      this.assertEquals(true,checkBox.getValue());
      this.assertEquals(true,qx.bom.element.Attribute.get(checkBox.getContainerElement(),'checked'));

      checkBox.destroy();
    },
    testEnabled : function()
    {
      var checkBox = new qx.ui.mobile.form.CheckBox();
      this.getRoot().add(checkBox);
      checkBox.setEnabled(false);
      this.assertEquals(false,checkBox.getEnabled());
      this.assertEquals(true,qx.bom.element.Class.has(checkBox.getContainerElement(),'disabled'));

      checkBox.destroy();
    }

  }
});
