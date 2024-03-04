/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("qx.test.locale.Date", {
  extend: qx.dev.unit.TestCase,

  members: {
    setUp() {
      qx.locale.Manager.getInstance().setLocale("C");
    },

    tearDown() {
      qx.locale.Manager.getInstance().resetLocale();
    },

    testGetAmMarker() {
      var Date = qx.locale.Date;
      var items = [
        { locale: "ko", expected: "오전" },
        { locale: "fr", expected: "AM" },
        { locale: "af", expected: "vm." }
      ];

      items.forEach(item => {
        var result = Date.getAmMarker(item.locale);
        this.assertEquals(item.expected, result);
      });
    },

    testGetPMMarker() {
      var Date = qx.locale.Date;
      var items = [
        { locale: "ko", expected: "오후" },
        { locale: "fr", expected: "PM" },
        { locale: "af", expected: "nm." }
      ];

      items.forEach(item => {
        var result = Date.getPmMarker(item.locale);
        this.assertEquals(item.expected, result);
      });
    },

    testGetDateFormat_GermanLocale(){
      var items = [
        { size: "short", expected: "dd.MM.yy" },
        { size: "medium", expected: "dd.MM.y" },
        { size: "long", expected: "d. MMMM y" },
        { size: "full", expected: "EEEE, d. MMMM y" }
      ];

      items.forEach(item => {
        var result = Date.getDateFormat(item.size, "de_DE");
        this.assertEquals(item.expected, result);
      });
    },

    testGetTimeFormat_GermanLocale(){
      var items = [
        { size: "short", expected: "hh:mm" },
        { size: "medium", expected: "hh:mm:ss" },
        { size: "long", expected: "hh:mm:ss z" },
        { size: "full", expected: "hh:mm:ss zzzz" }
      ];

      items.forEach(item => {
        var result = Date.getTimeFormat(item.size, "de_DE");
        this.assertEquals(item.expected, result);
      });
    },

    testGetDateTimeFormat_GermanLocale(){
      var casesTable = {
        d: "d",
        y: "y",
        M: "L",
        MMM: "LLL",
        MMMd: "d. MMM",
        yMMM: "MMM y",
        hm: "h:mm a",
        Hm: "HH:mm",
        ms: "mm:ss",
        hms: "h:mm:ss a",
        Hms: "HH:mm:ss",
        Ed: "E, d.",
        Md: "d.M.",
        yM: "M/y",
        yMEd: "E, d.M.y",
        yMMMEd: "E, d. MMM y",
        yMMMd: "d. MMM y",
        yMd: "d.M.y",
        MEd: "E, d.M.",
        MMMEd: "E, d. MMM",
        yQ: "yQ",
        yQQQ: "QQQ y"
      };

      for (var canonical in casesTable){
        var result = qx.locale.Date.getDateTimeFormat(canonical, "", useLocale);

        var expected = casesTable[canonical];
        this.assertEquals(expected, result);
      }
    },

    testDayNames() {
      var Date = qx.locale.Date;
      var useLocale = "C";

      var abbrDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      this.assertJsonEquals(
        abbrDays,
        Date.getDayNames("abbreviated").map(function (v) {
          return v + "";
        })
      );

      for (var i = 0; i < 7; i++) {
        this.assertEquals(abbrDays[i], Date.getDayName("abbreviated", i));
      }

      var narrowDays = ["S", "M", "T", "W", "T", "F", "S"];
      this.assertJsonEquals(
        narrowDays,
        Date.getDayNames("narrow", useLocale, "stand-alone").map(function (v) {
          return v + "";
        })
      );

      for (var i = 0; i < 7; i++) {
        this.assertEquals(
          narrowDays[i],
          Date.getDayName("narrow", i, useLocale, "stand-alone")
        );
      }

      var wideDays = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
      ];

      this.assertJsonEquals(
        wideDays,
        Date.getDayNames("wide").map(function (v) {
          return v + "";
        })
      );

      for (var i = 0; i < 7; i++) {
        this.assertEquals(wideDays[i], Date.getDayName("wide", i));
      }

      // german
      useLocale = "de_DE";

      qx.locale.Manager.getInstance().setLocale(useLocale);

      var abbrDays = ["So.", "Mo.", "Di.", "Mi.", "Do.", "Fr.", "Sa."];
      this.assertJsonEquals(
        abbrDays,
        Date.getDayNames("abbreviated").map(function (v) {
          return v + "";
        })
      );

      for (var i = 0; i < 7; i++) {
        this.assertEquals(abbrDays[i], Date.getDayName("abbreviated", i));
      }

      var narrowDays = ["S", "M", "D", "M", "D", "F", "S"];
      this.assertJsonEquals(
        narrowDays,
        Date.getDayNames("narrow", useLocale, "stand-alone").map(function (v) {
          return v + "";
        })
      );

      for (var i = 0; i < 7; i++) {
        this.assertEquals(
          narrowDays[i],
          Date.getDayName("narrow", i, useLocale, "stand-alone")
        );
      }

      var wideDays = [
        "Sonntag",
        "Montag",
        "Dienstag",
        "Mittwoch",
        "Donnerstag",
        "Freitag",
        "Samstag"
      ];

      this.assertJsonEquals(
        wideDays,
        Date.getDayNames("wide").map(function (v) {
          return v + "";
        })
      );

      for (var i = 0; i < 7; i++) {
        this.assertEquals(wideDays[i], Date.getDayName("wide", i));
      }

      if (this.isDebugOn()) {
        this.assertException(function () {
          Date.getDayNames("verylong");
        }, Error);

        this.assertException(function () {
          Date.getDayName("wide", -1);
        }, Error);

        this.assertException(function () {
          Date.getDayName("wide", 8);
        }, Error);
      }
    },

    testDateFormat() {
      var Date = qx.locale.Date;

      this.assertEquals("AM", Date.getAmMarker("C"));
      this.assertEquals("PM", Date.getPmMarker("C"));
    }
  }
});
