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

qx.Class.define("qx.test.mobile.form.RadioButton", {
  extend: qx.test.mobile.MobileTestCase,

  members: {
    testConstruct() {
      var radio1 = new qx.ui.mobile.form.RadioButton();
      var radio2 = new qx.ui.mobile.form.RadioButton();
      var radio3 = new qx.ui.mobile.form.RadioButton();
      var group = new qx.ui.mobile.form.RadioGroup(radio1, radio2, radio3);

      this.getRoot().add(radio1);
      this.getRoot().add(radio2);
      this.getRoot().add(radio3);

      // Verify: allow empty selection can only be false in this case,
      // so radio1 has to be true.
      this.assertEquals(
        true,
        radio1.getValue(),
        "Radio1 is expected to be true."
      );

      this.assertEquals(
        false,
        radio2.getValue(),
        "Radio2 is expected to be false."
      );

      this.assertEquals(
        false,
        radio3.getValue(),
        "Radio3 is expected to be false."
      );

      this.assertEquals(3, group.getItems().length);

      // Clean up tests
      radio1.destroy();
      radio2.destroy();
      radio3.destroy();
      group.dispose();
    },

    testValue() {
      var radio1 = new qx.ui.mobile.form.RadioButton();
      var radio2 = new qx.ui.mobile.form.RadioButton();
      var radio3 = new qx.ui.mobile.form.RadioButton();

      var group = new qx.ui.mobile.form.RadioGroup();
      group.setAllowEmptySelection(true);
      group.add(radio1, radio2, radio3);

      this.getRoot().add(radio1);
      this.getRoot().add(radio2);
      this.getRoot().add(radio3);

      // Verify: initial all radios buttons should be disabled.
      this.assertEquals(false, radio1.getValue());
      this.assertEquals(false, radio2.getValue());
      this.assertEquals(false, radio3.getValue());

      this.assertEquals(false, radio1.hasCssClass("checked"));
      this.assertEquals(false, radio2.hasCssClass("checked"));
      this.assertEquals(false, radio3.hasCssClass("checked"));

      // Radio 1 enabled
      radio1.setValue(true);

      // Verify
      this.assertEquals(true, radio1.getValue());
      this.assertEquals(true, radio1.hasCssClass("checked"));
      this.assertEquals(false, radio2.getValue());
      this.assertEquals(false, radio3.getValue());

      // Radio 3 enabled
      radio3.setValue(true);

      // Verify
      this.assertEquals(true, radio3.getValue());
      this.assertEquals(false, radio2.getValue());
      this.assertEquals(false, radio1.getValue());

      // Clean up tests
      radio1.destroy();
      radio2.destroy();
      radio3.destroy();
      group.dispose();
    },

    testEnabled() {
      var radio1 = new qx.ui.mobile.form.RadioButton();
      this.getRoot().add(radio1);

      radio1.setEnabled(false);

      this.assertEquals(false, radio1.getEnabled());
      this.assertEquals(
        true,
        qx.bom.element.Class.has(radio1.getContainerElement(), "disabled")
      );

      radio1.destroy();
    }
  }
});
