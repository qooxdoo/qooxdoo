/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2011-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tino Butz (tbtz)
     * Christopher Zuendorf (czuendorf)

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

      // Initial value '''
      this.assertEquals('',selectBox.getValue());

      // Attempt to set value to "Item 3"
      selectBox.setValue("Item 3");
      this.assertEquals(2, selectBox.getSelection());
      this.assertEquals("Item 3",selectBox.getValue());

      // Attempt to set invalid value occurs validation error.
      this.assertException(qx.lang.Function.bind(selectBox.setValue, selectBox, "Item 4"),
        qx.core.ValidationError,
        "Validation Error: Input value is out of model range",
        "An validation error is expected, because this value does not exists in model."
      );

      this.assertEquals("Item 3",selectBox.getValue(), "Nothing should be changed by input setValue('Item 4') because input value is not in model.");

      selectBox.destroy();
      dd.dispose();
      dd = null;
    },

    testNullable : function() {
      var model = new qx.data.Array(["Item 1", "Item 2", "Item 3"]);
      var selectBox = new qx.ui.mobile.form.SelectBox();
      selectBox.setModel(model);

      // Default case: nullable is true, selection is null.
      this.assertEquals(null, selectBox.getSelection(), "Default selection of SelectBox should be null.");

      // Switch to nullable true...
      selectBox.setNullable(false);

      // Attempt to set null value occurs validation error.
      this.assertException(qx.lang.Function.bind(selectBox.setSelection, selectBox, null),
        qx.core.ValidationError,
        "Validation Error: SelectBox is not nullable",
        "Value should not be accepted when SelectBox is not nullable."
      );

      // Switch to nullable true... try to set selection to null..
      selectBox.setNullable(true);
      selectBox.setSelection(null);
      this.assertEquals(null, selectBox.getSelection(), "Value should be null.");

      // After
      selectBox.destroy();
      model.dispose();
      model = null;
    },

    testSelectionNoModel : function() {
      var selectBox = new qx.ui.mobile.form.SelectBox();
      this.assertException(qx.lang.Function.bind(selectBox.setSelection, selectBox, 4),
        qx.core.ValidationError,
        "Validation Error: Please apply model before selection",
        "A selection needs a model."
      );

      selectBox.destroy();
    },

    testResetValue : function() {
      var model = new qx.data.Array(["Item 1", "Item 2", "Item 3"]);
      var selectBox = new qx.ui.mobile.form.SelectBox();
      selectBox.setModel(model);
      selectBox.setNullable(true);
      selectBox.setValue("Item 3");

      this.assertEquals(2, selectBox.getSelection());

      selectBox.resetValue();

      this.assertEquals(null, selectBox.getSelection());

      // After
      selectBox.destroy();
      model.dispose();
      model = null;
    },

    testResetValueNotNullable : function() {
      var model = new qx.data.Array(["Item 1", "Item 2", "Item 3"]);
      var selectBox = new qx.ui.mobile.form.SelectBox();
      selectBox.setModel(model);
      selectBox.setNullable(false);
      selectBox.setValue("Item 3");

      this.assertEquals(2, selectBox.getSelection());

      selectBox.resetValue();

      this.assertEquals(0, selectBox.getSelection());

      // After
      selectBox.destroy();
      model.dispose();
      model = null;
    },

    testSelection : function()
    {
      var model = new qx.data.Array(["Item 1", "Item 2", "Item 3"]);
      var selectBox = new qx.ui.mobile.form.SelectBox();
      selectBox.setModel(model);

      // Default value of selectedIndex after setting model is 0.
      this.assertEquals(null, selectBox.getSelection());

      // Set selection success
      selectBox.setSelection(2);
      this.assertEquals(2, selectBox.getSelection());
      this.assertEquals("Item 3", selectBox.getValue());

      // Set selection failure
      // Nothing is changed because invalid selectedIndex value.
      this.assertException(qx.lang.Function.bind(selectBox.setSelection, selectBox, 4),
        qx.core.ValidationError,
        "Validation Error: Input value is out of model range",
        "Exception assertion failed."
      );

      this.assertEquals(2, selectBox.getSelection());
      this.assertEquals("Item 3", selectBox.getValue());

      // Negative values are not allowed. Nothing is changed.
      this.assertException(qx.lang.Function.bind(selectBox.setSelection, selectBox, -1),
        qx.core.ValidationError,
        "Validation Error: Input value is out of model range",
        "Exception assertion failed."
      );

      this.assertEquals(2, selectBox.getSelection());
      this.assertEquals("Item 3", selectBox.getValue());

      // Only type Number is allowed. Nothing is changed.
      this.assertException(qx.lang.Function.bind(selectBox.setSelection, selectBox, "foo"),
        qx.core.ValidationError,
        "Validation Error: Input value is not a number",
        "Exception assertion failed."
      );

      this.assertEquals(2, selectBox.getSelection());
      this.assertEquals("Item 3", selectBox.getValue());

      // After
      selectBox.destroy();
      model.dispose();
      model = null;
    }
  }
});
