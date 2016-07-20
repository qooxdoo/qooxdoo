/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2014 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * William Oprandi (woprandi)
     * Tobias Oberrauch (toberrauch)

************************************************************************ */
qx.Class.define("qx.test.ui.form.Spinner", {
  extend: qx.dev.unit.TestCase,

  members: {
    /**
     * Test if spinner use NumberFormat locale
     */
    testCorrectLocaleUsed: function () {
      var spinner = new qx.ui.form.Spinner();

      // "de" locale has comma as decimal separator
      var nf = new qx.util.format.NumberFormat("de");
      spinner.setNumberFormat(nf);

      spinner.setValue(1.23);
      this.assertEquals("1,23", spinner.getChildControl("textfield").getValue());
      
      spinner.destroy();
      nf.dispose();
    },

    /**
     * Test if postfix is always set after textfield of the spinner has been edited
     */
    testPostfixIsAlwaysSet : function() {
      var spinner = new qx.ui.form.Spinner();
      spinner.set({
        maximum: 120,
        minimum: 1
      });
      var numberFormat = new qx.util.format.NumberFormat();
      numberFormat.setPostfix("min");
      spinner.setNumberFormat(numberFormat);
      var tf = spinner.getChildControl("textfield");

      // Basic tests
      tf.setValue("113");
      this.assertEquals("113min", tf.getValue());
      tf.setValue("121");
      this.assertEquals("120min", tf.getValue());

      // Check if postfix is added even if the spinner value won't change (value set to maximum)
      tf.setValue("122");
      this.assertEquals("120min", tf.getValue());

      // Same for here (value set to minimum)
      tf.setValue("-67");
      this.assertEquals("1min", tf.getValue());
      tf.setValue("-99");
      this.assertEquals("1min", tf.getValue());

      // And same here with a valid number
      tf.setValue("50");
      this.assertEquals("50min", tf.getValue());
      tf.setValue("50");
      this.assertEquals("50min", tf.getValue());
      
      spinner.destroy();
      numberFormat.dispose();
    }
  }
});
