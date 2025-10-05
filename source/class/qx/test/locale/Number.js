/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Dmitrii Zolotov (goldim)

************************************************************************ */

qx.Class.define("qx.test.locale.Number", {
    extend: qx.dev.unit.TestCase,

    members: {
      setUp() {
        qx.locale.Manager.getInstance().setLocale("C");
      },

      tearDown() {
        qx.locale.Manager.getInstance().resetLocale();
      },

      testGetDecimalSeparator() {
        var entries = [
          { locale: "de_DE", expected: "," },
          { locale: "en", expected: "." }
        ];

        for (var entry of entries){
            var result = qx.locale.Number.getDecimalSeparator(entry.locale).toString();
            this.assertEquals(entry.expected, result);
        }
      },

      testGetGroupSeparator() {
        var entries = [
          { locale: "de_DE", expected: "." },
          { locale: "en", expected: "," }
        ];

        for (var entry of entries){
          var result = qx.locale.Number.getGroupSeparator(entry.locale).toString();
          this.assertEquals(entry.expected, result);
        }
      },

      testGetPercentFormat() {
        var entries = [
          { locale: "tr", expected: "%#,##0" },
          { locale: "af", expected: "#,##0%" },
          { locale: "en", expected: "#.##0%" }
        ];

        for (var entry of entries){
          var result = qx.locale.Number.getPercentFormat(entry.locale).toString();
          this.assertEquals(entry.expected, result);
        }
      }
    }
  });
  