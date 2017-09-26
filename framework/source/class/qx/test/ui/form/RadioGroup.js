/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Alexander Steitz (aback)

************************************************************************ */
qx.Class.define("qx.test.ui.form.RadioGroup",
{
  extend : qx.test.ui.LayoutTestCase,

  members :
  {
    setUp : function()
    {
      this.__radioGroup = new qx.ui.form.RadioGroup;
      this.__radioGroup.setAllowEmptySelection(true);

      this.__radioButtons = [];
      var radioButton;
      for (var i=0, j=3; i<j; i++)
      {
        radioButton = new qx.ui.form.RadioButton("option " + i);
        radioButton.setModel("option" + i);

        this.__radioButtons.push(radioButton);
        this.__radioGroup.add(radioButton);
      }
    },

    tearDown : function()
    {
      this.base(arguments);
      var radioButton;
      for (var i=0, j=this.__radioButtons.length; i<j; i++)
      {
        this.__radioGroup.remove(this.__radioButtons[i]);
        radioButton = this.__radioButtons.shift();
        radioButton.dispose();
      }
      this.__radioGroup.dispose();

      this.__radioButtons = null;
    },

    testHiddenRadioButtons : function()
    {
      var composite = new qx.ui.container.Composite;
      for (var i=0, j=this.__radioButtons.length; i<j; i++) {
        composite.add(this.__radioButtons[i]);
      }

      this.getRoot().add(composite, { left : 100, top  : 50 });

      // check the 'modelSelection' with all radio buttons visible
      this.__radioGroup.setModelSelection( [this.__radioButtons[1].getModel()] );

      this.assertEquals(this.__radioButtons[1].getModel(), this.__radioGroup.getModelSelection().getItem(0), "Model selection does not work correctly!");
      this.assertTrue(this.__radioGroup.isSelected(this.__radioButtons[1]), "Wrong radio button selected!");

      // now hide the radio group and check if the selection change still works
      for (var i=0, j=this.__radioButtons.length; i<j; i++) {
        this.__radioButtons[i].exclude();
      }

      this.__radioGroup.setModelSelection( [this.__radioButtons[0].getModel()] );
      this.assertEquals(this.__radioButtons[0].getModel(), this.__radioGroup.getModelSelection().getItem(0), "Model selection does not work correctly!");
      this.assertTrue(this.__radioGroup.isSelected(this.__radioButtons[0]), "Hidden radio button not selected!");
      composite.destroy();
    },

    /**
     * @ignore(qx.test.ui.form.RadioGroupTest)
     */
    testAlteredGroupProperty : function()
    {
      qx.Class.define("qx.test.ui.form.RadioGroupTest",
      {
        extend : qx.core.Object,

        properties :
        {
          locked :
          {
            init     : false,
            check    : "Boolean",
            event    : "changeLocked",
            nullable : false
          },

          // set by the RadioGroup
          lockedGroup :
          {
            init     : null,
            check    : "qx.ui.form.RadioGroup",
            nullable : true
          }
        }
      });

      var rg;
      var testObj1, testObj2, testObj3

      rg = new qx.ui.form.RadioGroup();
      rg.set(
        {
          groupedProperty     : "locked",
          groupProperty       : "lockedGroup"
        });

      testObj1 = new qx.test.ui.form.RadioGroupTest();
      testObj2 = new qx.test.ui.form.RadioGroupTest();
      testObj3 = new qx.test.ui.form.RadioGroupTest();

      // Add the test objects to the radio group. This should automatically
      // select the first one.
      rg.add(testObj1, testObj2, testObj3);

      // Ensure it did and the other ones are off
      this.assertTrue(testObj1.getLocked());
      this.assertFalse(testObj2.getLocked());
      this.assertFalse(testObj3.getLocked());

      // Select the second one.
      rg.setSelection( [ testObj2 ] );

      // Ensure it's now on and the other ones are off
      this.assertTrue(testObj2.getLocked());
      this.assertFalse(testObj1.getLocked());
      this.assertFalse(testObj3.getLocked());

      // Also ensure that the selection is as we expect
      this.assertEquals(rg.getSelection()[0], testObj2);

      // Clean up
      testObj1.dispose();
      testObj2.dispose();
      testObj3.dispose();
      qx.Class.undefine("qx.test.ui.form.RadioGroupTest");
    }
  }
});
