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

qx.Class.define("qx.test.mobile.form.TextField",
{
  extend : qx.test.mobile.MobileTestCase,

  members :
  {
    testValue : function()
    {
      var textField = new qx.ui.mobile.form.TextField();
      this.getRoot().add(textField);

      this.assertEquals('',textField.getValue());
      this.assertEquals(null,qx.bom.element.Attribute.get(textField.getContainerElement(),'value'));
      this.assertEventFired(textField, "changeValue", function() {
        textField.setValue("mytext");
      });
      this.assertEquals('mytext',textField.getValue());
      this.assertEquals('mytext',qx.bom.element.Attribute.get(textField.getContainerElement(),'value'));

      textField.destroy();

      textField = new qx.ui.mobile.form.TextField('affe');
      this.getRoot().add(textField);
      this.assertEquals('affe',textField.getValue());
      this.assertEquals('affe',qx.bom.element.Attribute.get(textField.getContainerElement(),'value'));
      textField.destroy();
    },


    testEnabled : function()
    {
      var textField = new qx.ui.mobile.form.TextField();
      this.getRoot().add(textField);
      this.assertEquals(true,textField.getEnabled());
      this.assertFalse(qx.bom.element.Class.has(textField.getContainerElement(),'disabled'));

      textField.setEnabled(false);
      this.assertEquals(false,textField.getEnabled());
      this.assertEquals(true,qx.bom.element.Class.has(textField.getContainerElement(),'disabled'));

      textField.destroy();
    }

  }
});
