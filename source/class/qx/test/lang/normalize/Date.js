/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2016 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * George Nikolaidis (gnikolaidis)
     * Peter Schneider (ps)

************************************************************************ */

/**
 * @require(qx.lang.normalize.Date)
 */
qx.Class.define("qx.test.lang.normalize.Date",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    "test parse()" : function ()
    {
      var sixHours = 6 * 60 * 60 * 1000;
      var sixHoursThirty = sixHours + 30 * 60 * 1000;

      var february = new Date(new Date().getFullYear(), 1, 1);
      var localOffset = february.getTimezoneOffset() * 6e4; // [milliseconds]
      // qx.log.Logger.info("localOffset:" + localOffset);

      // Date part

      this.assertIdentical(Date.parse("1970-01-01"), Date.UTC(1970, 0, 1, 0, 0, 0, 0), "Unix epoch");

      this.assertIdentical(Date.parse("2001"), Date.UTC(2001, 0, 1, 0, 0, 0, 0), "2001");
      this.assertIdentical(Date.parse("2001-02"), Date.UTC(2001, 1, 1, 0, 0, 0, 0), "2001-02");
      this.assertIdentical(Date.parse("2001-02-03"), Date.UTC(2001, 1, 3, 0, 0, 0, 0), "2001-02-03");

      this.assertIdentical(Date.parse("-002001"), Date.UTC(-2001, 0, 1, 0, 0, 0, 0), "-002001");
      this.assertIdentical(Date.parse("-002001-02"), Date.UTC(-2001, 1, 1, 0, 0, 0, 0), "-002001-02");
      this.assertIdentical(Date.parse("-002001-02-03"), Date.UTC(-2001, 1, 3, 0, 0, 0, 0), "-002001-02-03");

      this.assertIdentical(Date.parse("+010000-02"), Date.UTC(10000, 1, 1, 0, 0, 0, 0), "+010000-02");
      this.assertIdentical(Date.parse("+010000-02-03"), Date.UTC(10000, 1, 3, 0, 0, 0, 0), "+010000-02-03");
      this.assertIdentical(Date.parse("-010000-02"), Date.UTC(-10000, 1, 1, 0, 0, 0, 0), "-010000-02");
      this.assertIdentical(Date.parse("-010000-02-03"), Date.UTC(-10000, 1, 3, 0, 0, 0, 0), "-010000-02-03");

      this.assertTrue(isNaN(Date.parse("asdf")), "invalid YYYY (non-digits)");
      this.assertTrue(isNaN(Date.parse("1970-as-df")), "invalid YYYY-MM-DD (non-digits)");
      this.assertTrue(isNaN(Date.parse("19700101")), "invalid YYYY-MM-DD (missing hyphens)");

      // Time part

      this.assertIdentical(Date.parse("2001-02-03T04:05"), Date.UTC(2001, 1, 3, 4, 5, 0, 0) + localOffset, "2001-02-03T04:05");
      this.assertIdentical(Date.parse("2001-02-03T04:05:06"), Date.UTC(2001, 1, 3, 4, 5, 6, 0) + localOffset, "2001-02-03T04:05:06");
      this.assertIdentical(Date.parse("2001-02-03T04:05:06.007"), Date.UTC(2001, 1, 3, 4, 5, 6, 7) + localOffset, "2001-02-03T04:05:06.007");

      this.assertIdentical(Date.parse("2001-02-03T04:05Z"), Date.UTC(2001, 1, 3, 4, 5, 0, 0), "2001-02-03T04:05Z");
      this.assertIdentical(Date.parse("2001-02-03T04:05:06Z"), Date.UTC(2001, 1, 3, 4, 5, 6, 0), "2001-02-03T04:05:06Z");
      this.assertIdentical(Date.parse("2001-02-03T04:05:06.007Z"), Date.UTC(2001, 1, 3, 4, 5, 6, 7), "2001-02-03T04:05:06.007Z");

      this.assertIdentical(Date.parse("2001-02-03T04:05-00:00"), Date.UTC(2001, 1, 3, 4, 5, 0, 0), "2001-02-03T04:05-00:00");
      this.assertIdentical(Date.parse("2001-02-03T04:05:06-00:00"), Date.UTC(2001, 1, 3, 4, 5, 6, 0), "2001-02-03T04:05:06-00:00");
      this.assertIdentical(Date.parse("2001-02-03T04:05:06.007-00:00"), Date.UTC(2001, 1, 3, 4, 5, 6, 7), "2001-02-03T04:05:06.007-00:00");

      this.assertIdentical(Date.parse("2001-02-03T04:05+00:00"), Date.UTC(2001, 1, 3, 4, 5, 0, 0), "2001-02-03T04:05+00:00");
      this.assertIdentical(Date.parse("2001-02-03T04:05:06+00:00"), Date.UTC(2001, 1, 3, 4, 5, 6, 0), "2001-02-03T04:05:06+00:00");
      this.assertIdentical(Date.parse("2001-02-03T04:05:06.007+00:00"), Date.UTC(2001, 1, 3, 4, 5, 6, 7), "2001-02-03T04:05:06.007+00:00");

      this.assertIdentical(Date.parse("2001-02-03T04:05-06:30"), Date.UTC(2001, 1, 3, 4, 5, 0, 0) + sixHoursThirty, "2001-02-03T04:05-06:30");
      this.assertIdentical(Date.parse("2001-02-03T04:05:06-06:30"), Date.UTC(2001, 1, 3, 4, 5, 6, 0) + sixHoursThirty, "2001-02-03T04:05:06-06:30");
      this.assertIdentical(Date.parse("2001-02-03T04:05:06.007-06:30"), Date.UTC(2001, 1, 3, 4, 5, 6, 7) + sixHoursThirty, "2001-02-03T04:05:06.007-06:30");

      this.assertIdentical(Date.parse("2001-02-03T04:05+06:30"), Date.UTC(2001, 1, 3, 4, 5, 0, 0) - sixHoursThirty, "2001-02-03T04:05+06:30");
      this.assertIdentical(Date.parse("2001-02-03T04:05:06+06:30"), Date.UTC(2001, 1, 3, 4, 5, 6, 0) - sixHoursThirty, "2001-02-03T04:05:06+06:30");
      this.assertIdentical(Date.parse("2001-02-03T04:05:06.007+06:30"), Date.UTC(2001, 1, 3, 4, 5, 6, 7) - sixHoursThirty, "2001-02-03T04:05:06.007+06:30");

      this.assertIdentical(Date.parse("2001T04:05:06.007"), Date.UTC(2001, 0, 1, 4, 5, 6, 7) + localOffset, "2001T04:05:06.007");
      this.assertIdentical(Date.parse("2001-02T04:05:06.007"), Date.UTC(2001, 1, 1, 4, 5, 6, 7) + localOffset, "2001-02T04:05:06.007");
      this.assertIdentical(Date.parse("2001-02-03T04:05:06.007"), Date.UTC(2001, 1, 3, 4, 5, 6, 7) + localOffset, "2001-02-03T04:05:06.007");
      this.assertIdentical(Date.parse("2001-02-03T04:05:06.007-06:30"), Date.UTC(2001, 1, 3, 4, 5, 6, 7) + sixHoursThirty, "2001-02-03T04:05:06.007-06:30");

      this.assertIdentical(Date.parse("-010000T04:05"), Date.UTC(-10000, 0, 1, 4, 5, 0, 0) + localOffset, "-010000T04:05");
      this.assertIdentical(Date.parse("-010000-02T04:05"), Date.UTC(-10000, 1, 1, 4, 5, 0, 0) + localOffset, "-010000-02T04:05");
      this.assertIdentical(Date.parse("-010000-02-03T04:05"), Date.UTC(-10000, 1, 3, 4, 5, 0, 0) + localOffset, "-010000-02-03T04:05");

      this.assertTrue(isNaN(Date.parse("1970-01-01T00:00:00,000")), "invalid date-time (comma instead of dot)");
      this.assertTrue(isNaN(Date.parse("1970-01-01T0000")), "invalid date-time (missing colon in time part)");
      this.assertTrue(isNaN(Date.parse("1970-01-01T00:00.000")), "invalid date-time (msec with missing seconds)");
    }
  }
});
