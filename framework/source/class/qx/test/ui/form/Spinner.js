/* ************************************************************************

 qooxdoo - the new era of web development

 http://qooxdoo.org

 Copyright:
  2004-2013 1&1 Internet AG, Germany, http://www.1und1.de

 License:
  LGPL: http://www.gnu.org/licenses/lgpl.html
  EPL: http://www.eclipse.org/org/documents/epl-v10.php
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
      var numberFormat = new qx.util.format.NumberFormat("de");
      spinner.setNumberFormat(numberFormat);

      spinner.setValue(1.23);
      this.assertEquals("1,23", spinner.getChildControl("textfield").getValue());
    }
  }
});