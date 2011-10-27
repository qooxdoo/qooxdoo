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

qx.Class.define("qx.test.mobile.form.RadioButton",
{
  extend : qx.test.mobile.MobileTestCase,

  members :
  {
    testValue : function()
    {
      var radio1 = new qx.ui.mobile.form.RadioButton();
      var radio2 = new qx.ui.mobile.form.RadioButton();
      var radio3 = new qx.ui.mobile.form.RadioButton();
      var group = new qx.ui.form.RadioGroup();
      group.setAllowEmptySelection(true);
      group.add(radio1);group.add(radio2);group.add(radio3);

      this.getRoot().add(radio1);this.getRoot().add(radio2);this.getRoot().add(radio3);

      this.assertEquals(false,radio1.getValue());
      this.assertEquals(false,qx.bom.element.Attribute.get(radio1.getContainerElement(),'checked'));
      radio1.setValue(true);
      this.assertEquals(true,radio1.getValue());
      this.assertEquals(true,qx.bom.element.Attribute.get(radio1.getContainerElement(),'checked'));
      this.assertEquals(false,radio2.getValue());
      radio3.setValue(true);
      this.assertEquals(true,radio3.getValue());
      this.assertEquals(false,radio1.getValue());

      radio1.destroy();
      radio2.destroy();
      radio3.destroy();
      group.dispose();
    },
    testEnabled : function()
    {
      var radio1 = new qx.ui.mobile.form.RadioButton();
      this.getRoot().add(radio1);
      radio1.setEnabled(false);
      this.assertEquals(false,radio1.getEnabled());
      this.assertEquals(true,qx.bom.element.Class.has(radio1.getContainerElement(),'disabled'));

      radio1.destroy();
    }

  }
});
