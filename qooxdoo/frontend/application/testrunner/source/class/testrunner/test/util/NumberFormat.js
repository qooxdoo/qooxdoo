/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/*
#require qx.locale.data.de_DE
*/

qx.Class.define("testrunner.test.util.NumberFormat",
{
  extend : testrunner.TestCase,

  members :
  {
    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    testNumberFormat : function()
    {
      this.assertNotUndefined(qx.util.format.NumberFormat);

      qx.locale.Manager.getInstance().setLocale("de_DE");

      var nf = qx.util.format.NumberFormat.getInstance();

      // this failed due to a rounding error
      this.assertEquals("1.000.000", nf.format(1000000));

      this.assertEquals("-1.000.000", nf.format(-1000000));
      this.assertEquals("-1.000.000", nf.format(-1000000));

      this.assertEquals("0", nf.format(0));
      this.assertEquals("0", nf.format(-0));

      this.assertEquals("12,12", nf.format(12.12));

      var ninfinity = -1 / 0;
      this.assertEquals("-Infinity", nf.format(ninfinity));

      var infinity = 1 / 0;
      this.assertEquals("Infinity", nf.format(infinity));

      var nan = Math.sqrt(-1);
      this.assertEquals("NaN", nf.format(nan));
    },

    testNumberParse : function()
    {
      // german number parsing
      qx.locale.Manager.getInstance().setLocale("de_DE");

      var nf = qx.util.format.NumberFormat.getInstance();

      var goodNumbers = {
        "1000" : 1000,
        "-1.000.000" : -1000000,
        "+1.000,12" : 1000.12
      }
      for (var number in goodNumbers) {
        this.assertEquals(nf.parse(number), goodNumbers[number]);
      }

      var badNumberStrings = [
        "2hastalavista",
        "2.3.4.5.6",
        "12.10,10",
        "10,1,12"
      ];

      for (var i=0; i<badNumberStrings.length; i++)
      {
        badNumberStr = badNumberStrings[i];

        this.assertException(
          function() {
            nf.format(nf.parse(badNumberStr));
          },
          Error,
          "does not match the number format",
          "testing if parsing fails on string '" + badNumberStr + "'"
        );
      }

    }

  }
});
