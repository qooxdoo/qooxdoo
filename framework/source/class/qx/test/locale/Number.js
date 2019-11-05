/* ************************************************************************

  qooxdoo - the new era of web development

  http://qooxdoo.org

  Copyright:
    2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

  License:
    MIT: https://opensource.org/licenses/MIT
    See the LICENSE file in the project's top-level directory for details.

  Authors:
    * Romain Julian (rommni)

************************************************************************ */

qx.Class.define("qx.test.locale.Number", {
  extend : qx.dev.unit.TestCase,

  members: {
    testNumberSeparators : function() {
      // test not designed for generator build
      if (!qx.core.Environment.get("qx.compilerVersion")) {
        return;
      }

      var Number = qx.locale.Number;
      var useLocale = "C";

      var commonGroupSeparator = ",";
      var commonDecimalSeparator = ".";

      this.assertEquals(commonGroupSeparator, Number.getGroupSeparator(useLocale));
      this.assertEquals(commonDecimalSeparator, Number.getDecimalSeparator(useLocale));

      useLocale = "fr";

      var frenchLatinGroupSeparator = "\u202F"; // narrow no-break space
      var frenchLatinDecimalSeparator = ",";

      this.assertEquals(frenchLatinGroupSeparator, Number.getGroupSeparator(useLocale));
      this.assertEquals(frenchLatinDecimalSeparator, Number.getDecimalSeparator(useLocale));
    },

    testPercentFormat : function() {
      // test not designed for generator build
      if (!qx.core.Environment.get("qx.compilerVersion")) {
        return;
      }

      var Number = qx.locale.Number;
      var useLocale = "C";

      var commonPercentFormat = "#,##0%";

      this.assertEquals(commonPercentFormat, Number.getPercentFormat(useLocale));

      useLocale = "fr";

      var frenchPercentFormat = "#,##0 %";

      this.assertEquals(frenchPercentFormat, Number.getPercentFormat(useLocale));
    }
  }
});
