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

qx.Class.define("qx.test.mobile.form.TextArea",
{
  extend : qx.test.mobile.MobileTestCase,

  members :
  {
    testValue : function()
    {
      var textArea = new qx.ui.mobile.form.TextArea();
      this.getRoot().add(textArea);

      this.assertEquals('',textArea.getValue());
      this.assertEquals(null,qx.bom.element.Attribute.get(textArea.getContainerElement(),'value'));
      this.assertEventFired(textArea, "changeValue", function() {
        textArea.setValue("mytext");
      });
      this.assertEquals('mytext',textArea.getValue());
      this.assertEquals('mytext',qx.bom.element.Attribute.get(textArea.getContainerElement(),'value'));

      textArea.destroy();

      textArea = new qx.ui.mobile.form.TextArea('affe');
      this.getRoot().add(textArea);
      this.assertEquals('affe',textArea.getValue());
      this.assertEquals('affe',qx.bom.element.Attribute.get(textArea.getContainerElement(),'value'));
      textArea.destroy();
    },


    testEnabled : function()
    {
      var textArea = new qx.ui.mobile.form.TextArea();
      this.getRoot().add(textArea);
      this.assertEquals(true,textArea.getEnabled());
      this.assertFalse(qx.bom.element.Class.has(textArea.getContainerElement(),'disabled'));

      textArea.setEnabled(false);
      this.assertEquals(false,textArea.getEnabled());
      this.assertEquals(true,qx.bom.element.Class.has(textArea.getContainerElement(),'disabled'));

      textArea.destroy();
    }

  }
});
