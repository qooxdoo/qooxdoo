/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2014 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * William Oprandi (woprandi)

************************************************************************ */
qx.Class.define("qx.test.ui.form.Spinner",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    /**
     * Test if spinner use NumberFormat locale
     */
    testCorrectLocaleUsed : function()
    {
      var spinner = new qx.ui.form.Spinner();

      // "us" locale has dot as decimal separator
      var nf = new qx.util.format.NumberFormat("us");
      spinner.setNumberFormat(nf);

      spinner.setValue(1.23);
      this.assertEquals(spinner.getChildControl("textfield").getValue(), "1.23");

      // "fr" locale has comma as decimal separator
      spinner.getNumberFormat().setLocale("fr");
      spinner.setValue(2.34);
      this.assertEquals(spinner.getChildControl("textfield").getValue(), "2,34");
    }
  }
});
