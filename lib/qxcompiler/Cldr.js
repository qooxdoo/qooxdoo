/* ************************************************************************
 *
 *    qxcompiler - node.js based replacement for the Qooxdoo python
 *    toolchain
 *
 *    https://github.com/johnspackman/qxcompiler
 *
 *    Copyright:
 *      2011-2016 Zenesis Limited, http://www.zenesis.com
 *
 *    License:
 *      LGPL: http://www.gnu.org/licenses/lgpl.html
 *      EPL: http://www.eclipse.org/org/documents/epl-v10.php
 *
 *      This software is provided under the same licensing terms as Qooxdoo,
 *      please see the LICENSE file in the Qooxdoo project's top-level directory
 *      for details.
 *
 *    Authors:
 *      * John Spackman (john.spackman@zenesis.com)
 *
 * ************************************************************************/

var fs = require("fs");
var path = require("path");
var qx = require("qooxdoo");
var xml2js = require('xml2js');
var util = require("../util");

var log = util.createLog("cldr");

qx.Class.define("qxcompiler.Cldr", {
  extend: qx.core.Object,

  statics: {
    /**
     * Loads CLDR data from the Qx framework
     *
     * @param locale
     * @param done
     */
    loadCLDR: function (qooxdooPath, locale, done) {
      var parser = new xml2js.Parser();
      if (!qooxdooPath)
        return done && done(new Error("Cannot find Qooxdoo path"));
      log.debug("Loading CLDR, qx=" + qooxdooPath);
      fs.readFile(path.join(qooxdooPath, "../tool/data/cldr/main", locale + ".xml"), {encoding: "utf-8"}, function (err, data) {
        if (err)
          return done(err);
        parser.parseString(data, function (err, src) {
          if (err)
            return done(err);

          function find(arr, name, value, cb) {
            for (var i = 0; i < arr.length; i++) {
              var row = arr[i];
              if (row["$"] && row["$"][name] == value) {
                if (typeof cb == "function")
                  return cb(row);
                return row;
              }
            }
            return null;
          }

          var cal = find(src.ldml.dates[0].calendars[0].calendar, "type", "gregorian");

          var cldr = {};
          cldr.alternateQuotationEnd = src.ldml.delimiters[0].alternateQuotationEnd[0];
          cldr.alternateQuotationStart = src.ldml.delimiters[0].alternateQuotationStart[0];
          cldr.quotationEnd = src.ldml.delimiters[0].quotationEnd[0];// "���";
          cldr.quotationStart = src.ldml.delimiters[0].quotationStart[0];// "���";

          function getText(row) {
            return row["_"];
          }

          function getDateFormatPattern(row) {
            return row.dateFormat[0].pattern[0];
          }

          find(cal.dayPeriods[0].dayPeriodContext[0].dayPeriodWidth, "type", "wide", function (row) {
            cldr.cldr_am = find(row.dayPeriod, "type", "am", getText);
            cldr.cldr_pm = find(row.dayPeriod, "type", "pm", getText);// "PM";
          });

          cldr.cldr_date_format_full = find(cal.dateFormats[0].dateFormatLength, "type", "full",
              getDateFormatPattern);// "EEEE, MMMM d, y";
          cldr.cldr_date_format_long = find(cal.dateFormats[0].dateFormatLength, "type", "long",
              getDateFormatPattern);// "MMMM d, y";
          cldr.cldr_date_format_medium = find(cal.dateFormats[0].dateFormatLength, "type", "medium",
              getDateFormatPattern);// "MMM d, y";
          cldr.cldr_date_format_short = find(cal.dateFormats[0].dateFormatLength, "type", "short",
              getDateFormatPattern);// "M/d/yy";
          cldr.cldr_date_time_format_Ed = find(cal.dateTimeFormats[0].availableFormats[0].dateFormatItem, "id", "Ed",
              getText);// "d E";
          cldr.cldr_date_time_format_Hm = find(cal.dateTimeFormats[0].availableFormats[0].dateFormatItem, "id", "Hm",
              getText);// "HH:mm";
          cldr.cldr_date_time_format_Hms = find(cal.dateTimeFormats[0].availableFormats[0].dateFormatItem, "id", "Hms",
              getText);// "HH:mm:ss";
          cldr.cldr_date_time_format_M = find(cal.dateTimeFormats[0].availableFormats[0].dateFormatItem, "id", "M",
              getText);// "L";
          cldr.cldr_date_time_format_MEd = find(cal.dateTimeFormats[0].availableFormats[0].dateFormatItem, "id", "MEd",
              getText);// "E, M/d";
          cldr.cldr_date_time_format_MMM = find(cal.dateTimeFormats[0].availableFormats[0].dateFormatItem, "id", "MMM",
              getText);// "LLL";
          cldr.cldr_date_time_format_MMMEd = find(cal.dateTimeFormats[0].availableFormats[0].dateFormatItem, "id",
              "MMMEd", getText);// "E, MMM d";
          cldr.cldr_date_time_format_MMMd = find(cal.dateTimeFormats[0].availableFormats[0].dateFormatItem, "id",
              "MMMd", getText);// "MMM d";
          cldr.cldr_date_time_format_Md = find(cal.dateTimeFormats[0].availableFormats[0].dateFormatItem, "id", "Md",
              getText);// "M/d";
          cldr.cldr_date_time_format_d = find(cal.dateTimeFormats[0].availableFormats[0].dateFormatItem, "id", "d",
              getText);// "d";
          cldr.cldr_date_time_format_hm = find(cal.dateTimeFormats[0].availableFormats[0].dateFormatItem, "id", "hm",
              getText);// "h:mm a";
          cldr.cldr_date_time_format_hms = find(cal.dateTimeFormats[0].availableFormats[0].dateFormatItem, "id", "hms",
              getText);// "h:mm:ss a";
          cldr.cldr_date_time_format_ms = find(cal.dateTimeFormats[0].availableFormats[0].dateFormatItem, "id", "ms",
              getText);// "mm:ss";
          cldr.cldr_date_time_format_y = find(cal.dateTimeFormats[0].availableFormats[0].dateFormatItem, "id", "y",
              getText);// "y";
          cldr.cldr_date_time_format_yM = find(cal.dateTimeFormats[0].availableFormats[0].dateFormatItem, "id", "yM",
              getText);// "M/y";
          cldr.cldr_date_time_format_yMEd = find(cal.dateTimeFormats[0].availableFormats[0].dateFormatItem, "id",
              "yMEd", getText);// "E, M/d/y";
          cldr.cldr_date_time_format_yMMM = find(cal.dateTimeFormats[0].availableFormats[0].dateFormatItem, "id",
              "yMMM", getText);// "MMM y";
          cldr.cldr_date_time_format_yMMMEd = find(cal.dateTimeFormats[0].availableFormats[0].dateFormatItem, "id",
              "yMMMEd", getText);// "E, MMM d, y";
          cldr.cldr_date_time_format_yMMMd = find(cal.dateTimeFormats[0].availableFormats[0].dateFormatItem, "id",
              "yMMMd", getText);// "MMM d, y";
          cldr.cldr_date_time_format_yMd = find(cal.dateTimeFormats[0].availableFormats[0].dateFormatItem, "id", "yMd",
              getText);// "M/d/y";
          cldr.cldr_date_time_format_yQ = find(cal.dateTimeFormats[0].availableFormats[0].dateFormatItem, "id", "yQ",
              getText);// "Q y";
          cldr.cldr_date_time_format_yQQQ = find(cal.dateTimeFormats[0].availableFormats[0].dateFormatItem, "id",
              "yQQQ", getText);// "QQQ y";
          find(cal.days[0].dayContext, "type", "format", function (row) {
            find(row.dayWidth, "type", "abbreviated", function (row) {
              cldr.cldr_day_format_abbreviated_fri = find(row.day, "type", "fri", getText);// "Fri";
              cldr.cldr_day_format_abbreviated_mon = find(row.day, "type", "mon", getText);// "Mon";
              cldr.cldr_day_format_abbreviated_sat = find(row.day, "type", "sat", getText);// "Sat";
              cldr.cldr_day_format_abbreviated_sun = find(row.day, "type", "sun", getText);// "Sun";
              cldr.cldr_day_format_abbreviated_thu = find(row.day, "type", "thu", getText);// "Thu";
              cldr.cldr_day_format_abbreviated_tue = find(row.day, "type", "tue", getText);// "Tue";
              cldr.cldr_day_format_abbreviated_wed = find(row.day, "type", "wed", getText);// "Wed";
            });
          });
          find(cal.days[0].dayContext, "type", "format", function (row) {
            find(row.dayWidth, "type", "wide", function (row) {
              cldr.cldr_day_format_wide_fri = find(row.day, "type", "fri", getText);// "Friday";
              cldr.cldr_day_format_wide_mon = find(row.day, "type", "mon", getText);// "Monday";
              cldr.cldr_day_format_wide_sat = find(row.day, "type", "sat", getText);// "Saturday";
              cldr.cldr_day_format_wide_sun = find(row.day, "type", "sun", getText);// "Sunday";
              cldr.cldr_day_format_wide_thu = find(row.day, "type", "thu", getText);// "Thursday";
              cldr.cldr_day_format_wide_tue = find(row.day, "type", "tue", getText);// "Tuesday";
              cldr.cldr_day_format_wide_wed = find(row.day, "type", "wed", getText);// "Wednesday";
            });
          });
          find(cal.days[0].dayContext, "type", "stand-alone", function (row) {
            cldr["cldr_day_stand-alone_narrow_fri"] = find(row.dayWidth[0].day, "type", "fri", getText);// "F";
            cldr["cldr_day_stand-alone_narrow_mon"] = find(row.dayWidth[0].day, "type", "mon", getText);// "M";
            cldr["cldr_day_stand-alone_narrow_sat"] = find(row.dayWidth[0].day, "type", "sat", getText);// "S";
            cldr["cldr_day_stand-alone_narrow_sun"] = find(row.dayWidth[0].day, "type", "sun", getText);// "S";
            cldr["cldr_day_stand-alone_narrow_thu"] = find(row.dayWidth[0].day, "type", "thu", getText);// "T";
            cldr["cldr_day_stand-alone_narrow_tue"] = find(row.dayWidth[0].day, "type", "tue", getText);// "T";
            cldr["cldr_day_stand-alone_narrow_wed"] = find(row.dayWidth[0].day, "type", "wed", getText);// "W";
          });
          find(cal.months[0].monthContext, "type", "format", function (row) {
            find(row.monthWidth, "type", "abbreviated", function (row) {
              for (var i = 0; i < row.month.length; i++) {
                var m = row.month[i];
                cldr["cldr_month_format_abbreviated_" + m["$"].type] = getText(m);
              }
            });
          });
          find(cal.months[0].monthContext, "type", "format", function (row) {
            find(row.monthWidth, "type", "wide", function (row) {
              for (var i = 0; i < row.month.length; i++) {
                var m = row.month[i];
                cldr["cldr_month_format_wide_" + m["$"].type] = getText(m);
              }
            });
          });
          find(cal.months[0].monthContext, "type", "stand-alone", function (row) {
            for (var i = 0; i < row.monthWidth[0].month.length; i++) {
              var m = row.monthWidth[0].month[i];
              cldr["cldr_month_stand-alone_narrow_" + m["$"].type] = getText(m);
            }
          });

          cldr.cldr_number_decimal_separator = src.ldml.numbers[0].symbols[0].decimal[0];// ".";
          cldr.cldr_number_group_separator = src.ldml.numbers[0].symbols[0].group[0];// ",";
          cldr.cldr_number_percent_format = src.ldml.numbers[0].percentFormats[0].percentFormatLength[0].percentFormat[0].pattern[0];// "#,##0%";

          function getTimeFormatPattern(row) {
            return row.timeFormat.pattern;
          }

          cldr.cldr_time_format_full = find(cal.timeFormats[0].timeFormatLength, "type", "full",
              getTimeFormatPattern);// "h:mm:ss a zzzz";
          cldr.cldr_time_format_long = find(cal.timeFormats[0].timeFormatLength, "type", "long",
              getTimeFormatPattern);// "h:mm:ss a z";
          cldr.cldr_time_format_medium = find(cal.timeFormats[0].timeFormatLength, "type", "medium",
              getTimeFormatPattern);// "h:mm:ss a";
          cldr.cldr_time_format_short = find(cal.timeFormats[0].timeFormatLength, "type", "short",
              getTimeFormatPattern);// "h:mm a";

          function getDisplayName(row) {
            return row.displayName;
          }

          cldr.day = find(src.ldml.dates[0].fields[0].field, "type", "day", getDisplayName);// "Day"
          cldr.dayperiod = find(src.ldml.dates[0].fields[0].field, "type", "dayperiod", getDisplayName);// "AM/PM";
          cldr.era = find(src.ldml.dates[0].fields[0].field, "type", "era", getDisplayName);// "Era";
          cldr.hour = find(src.ldml.dates[0].fields[0].field, "type", "hour", getDisplayName);// "Hour";
          cldr.minute = find(src.ldml.dates[0].fields[0].field, "type", "minute", getDisplayName);// "Minute";
          cldr.month = find(src.ldml.dates[0].fields[0].field, "type", "month", getDisplayName);// "Month";
          cldr.second = find(src.ldml.dates[0].fields[0].field, "type", "second", getDisplayName);// "Second";
          cldr.week = find(src.ldml.dates[0].fields[0].field, "type", "week", getDisplayName);// "Week";
          cldr.weekday = find(src.ldml.dates[0].fields[0].field, "type", "weekday", getDisplayName);// "Day
          // of
          // the
          // Week";
          cldr.year = find(src.ldml.dates[0].fields[0].field, "type", "year", getDisplayName);// "Year";
          cldr.zone = find(src.ldml.dates[0].fields[0].field, "type", "zone", getDisplayName);// "Time
          // Zone";

          done(null, cldr);
        });
      });
    }


  }
});
