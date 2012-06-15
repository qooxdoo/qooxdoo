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

qx.Class.define("qx.test.mobile.form.NumberField",
{
  extend : qx.test.mobile.MobileTestCase,

  members :
  {
    testValue : function()
    {
      var numberField = new qx.ui.mobile.form.NumberField();
      this.getRoot().add(numberField);

      this.assertEquals('',numberField.getValue());
      this.assertEquals(null, qx.bom.element.Attribute.get(numberField.getContainerElement(),'value'));
      this.assertEventFired(numberField, "changeValue", function() {
        numberField.setValue(15);
      });

      this.assertEquals(15,numberField.getValue());
      this.assertEquals(15,qx.bom.element.Attribute.get(numberField.getContainerElement(),'value'));

      numberField.destroy();
    },


    testMinimum : function()
    {
      var numberField = new qx.ui.mobile.form.NumberField();
      this.getRoot().add(numberField);

      this.assertEquals('',numberField.getMinimum());

      numberField.setMinimum(42);

     this.assertEquals(42,numberField.getMinimum());

      numberField.destroy();

    },


    testMaximum : function()
    {
      var numberField = new qx.ui.mobile.form.NumberField();
      this.getRoot().add(numberField);

      this.assertEquals('',numberField.getMaximum());

      numberField.setMaximum(42);

      this.assertEquals(42,numberField.getMaximum());

      numberField.destroy();
    },


    testStep : function()
    {
      var numberField = new qx.ui.mobile.form.NumberField();
      this.getRoot().add(numberField);

      this.assertEquals('',numberField.getStep());

      numberField.setStep(42);

      this.assertEquals(42,numberField.getStep());

      numberField.destroy();
    },


    testEnabled : function()
    {
      var numberField = new qx.ui.mobile.form.NumberField();
      this.getRoot().add(numberField);
      this.assertEquals(true,numberField.getEnabled());
      this.assertFalse(qx.bom.element.Class.has(numberField.getContainerElement(),'disabled'));

      numberField.setEnabled(false);
      this.assertEquals(false,numberField.getEnabled());
      this.assertEquals(true,qx.bom.element.Class.has(numberField.getContainerElement(),'disabled'));

      numberField.destroy();
    }

  }
});
