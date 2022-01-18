/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tristan Koch (tristankoch)

************************************************************************ */

qx.Class.define("qx.test.ui.form.DateField", {
  extend: qx.test.ui.LayoutTestCase,

  members: {
    setUp() {
      this.__datefield = new qx.ui.form.DateField();
      this.getRoot().add(this.__datefield);
    },

    tearDown() {
      this.__datefield.destroy();
      super.tearDown();
    },

    "test: setting value sets date of chooser"() {
      var datefield = this.__datefield,
        chooser = datefield.getChildControl("list"),
        date = new Date();

      datefield.setValue(date);
      this.assertEquals(date, chooser.getValue());
    },

    "test: choosing date fills in formatted date"() {
      var datefield = this.__datefield,
        textfield = datefield.getChildControl("textfield"),
        chooser = datefield.getChildControl("list"),
        date = new Date(),
        dateStr = this.formatDate(date);

      chooser.setValue(date);

      // Fake "execute" on calendar popup
      datefield._onChangeDate();

      this.assertEquals(dateStr, textfield.getValue());
    },

    formatDate(date) {
      return this.__datefield.getDateFormat().format(date);
    },

    skip(msg) {
      throw new qx.dev.unit.RequirementError(null, msg);
    }
  }
});
