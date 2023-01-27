/* ************************************************************************
 *
 *    qooxdoo-compiler - node.js based replacement for the Qooxdoo python
 *    toolchain
 *
 *    https://github.com/qooxdoo/qooxdoo
 *
 *    Copyright:
 *      2011-2017 Zenesis Limited, http://www.zenesis.com
 *
 *    License:
 *      MIT: https://opensource.org/licenses/MIT
 *
 *      This software is provided under the same licensing terms as Qooxdoo,
 *      please see the LICENSE file in the Qooxdoo project's top-level directory
 *      for details.
 *
 *    Authors:
 *      * John Spackman (john.spackman@zenesis.com, @johnspackman)
 *
 * *********************************************************************** */

/* eslint no-inner-declarations: 0 */

var fs = require("fs");
var path = require("path");

var xml2js = require("xml2js");
const CLDR = require("cldr");
const { promisify } = require("util");
const process = require("process");
const readFile = promisify(fs.readFile);
const readDir = promisify(fs.readdir);

var log = qx.tool.utils.LogManager.createLog("cldr");

qx.Class.define("qx.tool.compiler.app.Cldr", {
  extend: qx.core.Object,

  statics: {
    /**
     * Returns the parent locale for a given locale
     */
    getParentLocale(locale) {
      return CLDR.resolveParentLocaleId(locale.toLowerCase());
    },

    /**
     * Loads CLDR data from the Qx framework
     *
     * @param locale
     * @async
     */
    loadCLDR(locale) {
      var parser = new xml2js.Parser();

      let cldrPath = path.dirname(require.resolve("cldr"));
      const data_path = "../3rdparty/cldr/common/main";
      if (!cldrPath) {
        throw new Error("Cannot find cldr path");
      }
      log.debug("Loading CLDR " + cldrPath);

      const fullDir = path.join(cldrPath, data_path);

      return readDir(fullDir)
        .then(
          names =>
            new Promise((resolve, reject) => {
              const searchedName = locale.toLowerCase() + ".xml";
              const realName = names.find(
                name => name.toLowerCase() === searchedName
              );

              if (realName) {
                resolve(realName);
              } else {
                reject(
                  new Error(
                    'Cannot find XML file for locale "' +
                      locale +
                      '" in CLDR folder'
                  )
                );
              }
            })
        )
        .then(fileName =>
          readFile(path.join(fullDir, fileName), {
            encoding: "utf-8"
          })
        )
        .catch(err => {
          qx.tool.compiler.Console.error(err);
          process.exit(1);
        })
        .then(data =>
          qx.tool.utils.Utils.promisifyThis(parser.parseString, parser, data)
        )
        .then(src => {
          function find(arr, name, value, cb) {
            if (!arr) {
              return null;
            }
            for (var i = 0; i < arr.length; i++) {
              var row = arr[i];
              if (row["$"] && row["$"][name] == value) {
                if (typeof cb == "function") {
                  return cb(row);
                }
                return row;
              }
            }
            return null;
          }

          function get(path, node) {
            if (node === undefined) {
              node = src;
            }
            var segs = path.split(".");
            for (var i = 0; i < segs.length; i++) {
              var seg = segs[i];
              var pos = seg.indexOf("[");
              var index = null;
              if (pos > -1) {
                index = seg.substring(pos + 1, seg.length - 1);
                seg = seg.substring(0, pos);
              }
              var next = node[seg];
              if (!next) {
                return null;
              }
              if (index !== null) {
                if (!qx.lang.Type.isArray(next)) {
                  return null;
                }
                next = next[index];
                if (next === undefined) {
                  return null;
                }
              }
              node = next;
            }
            return node;
          }

          function getValue(path, node) {
            let result = get(path, node);
            if (
              result &&
              typeof result != "string" &&
              result["_"] !== undefined
            ) {
              return result["_"];
            }
            return result;
          }

          var cal = find(
            get("ldml.dates[0].calendars[0].calendar"),
            "type",
            "gregorian"
          );

          var cldr = {};
          cldr.alternateQuotationEnd = get(
            "ldml.delimiters[0].alternateQuotationEnd[0]"
          );

          cldr.alternateQuotationStart = get(
            "ldml.delimiters[0].alternateQuotationStart[0]"
          );

          cldr.quotationEnd = get("ldml.delimiters[0].quotationEnd[0]");
          cldr.quotationStart = get("ldml.delimiters[0].quotationStart[0]");

          function getText(row) {
            if (typeof row == "string") {
              return row;
            }
            if (row && row["_"] !== undefined) {
              return row["_"];
            }
            return "";
          }

          function getDateFormatPattern(row) {
            return row.dateFormat[0].pattern[0];
          }

          if (cal !== null) {
            find(
              get("dayPeriods[0].dayPeriodContext[0].dayPeriodWidth", cal),
              "type",
              "wide",
              function (row) {
                cldr.cldr_am = find(row.dayPeriod, "type", "am", getText);
                cldr.cldr_pm = find(row.dayPeriod, "type", "pm", getText); // "PM";
              }
            );

            var dateFormatLength = get("dateFormats[0].dateFormatLength", cal);
            var dateFormatItem = get(
              "dateTimeFormats[0].availableFormats[0].dateFormatItem",
              cal
            );

            cldr.cldr_date_format_full = find(
              dateFormatLength,
              "type",
              "full",
              getDateFormatPattern
            );

            // "EEEE, MMMM d, y";
            cldr.cldr_date_format_long = find(
              dateFormatLength,
              "type",
              "long",
              getDateFormatPattern
            );

            // "MMMM d, y";
            cldr.cldr_date_format_medium = find(
              dateFormatLength,
              "type",
              "medium",
              getDateFormatPattern
            );

            // "MMM d, y";
            cldr.cldr_date_format_short = find(
              dateFormatLength,
              "type",
              "short",
              getDateFormatPattern
            );

            // "M/d/yy";
            cldr.cldr_date_time_format_Ed = find(
              dateFormatItem,
              "id",
              "Ed",
              getText
            );

            // "d E";
            cldr.cldr_date_time_format_Hm = find(
              dateFormatItem,
              "id",
              "Hm",
              getText
            );

            // "HH:mm";
            cldr.cldr_date_time_format_Hms = find(
              dateFormatItem,
              "id",
              "Hms",
              getText
            );

            // "HH:mm:ss";
            cldr.cldr_date_time_format_M = find(
              dateFormatItem,
              "id",
              "M",
              getText
            );

            // "L";
            cldr.cldr_date_time_format_MEd = find(
              dateFormatItem,
              "id",
              "MEd",
              getText
            );

            // "E, M/d";
            cldr.cldr_date_time_format_MMM = find(
              dateFormatItem,
              "id",
              "MMM",
              getText
            );

            // "LLL";
            cldr.cldr_date_time_format_MMMEd = find(
              dateFormatItem,
              "id",
              "MMMEd",
              getText
            );

            // "E, MMM d";
            cldr.cldr_date_time_format_MMMd = find(
              dateFormatItem,
              "id",
              "MMMd",
              getText
            );

            // "MMM d";
            cldr.cldr_date_time_format_Md = find(
              dateFormatItem,
              "id",
              "Md",
              getText
            );

            // "M/d";
            cldr.cldr_date_time_format_d = find(
              dateFormatItem,
              "id",
              "d",
              getText
            );

            // "d";
            cldr.cldr_date_time_format_hm = find(
              dateFormatItem,
              "id",
              "hm",
              getText
            );

            // "h:mm a";
            cldr.cldr_date_time_format_hms = find(
              dateFormatItem,
              "id",
              "hms",
              getText
            );

            // "h:mm:ss a";
            cldr.cldr_date_time_format_ms = find(
              dateFormatItem,
              "id",
              "ms",
              getText
            );

            // "mm:ss";
            cldr.cldr_date_time_format_y = find(
              dateFormatItem,
              "id",
              "y",
              getText
            );

            // "y";
            cldr.cldr_date_time_format_yM = find(
              dateFormatItem,
              "id",
              "yM",
              getText
            );

            // "M/y";
            cldr.cldr_date_time_format_yMEd = find(
              dateFormatItem,
              "id",
              "yMEd",
              getText
            );

            // "E, M/d/y";
            cldr.cldr_date_time_format_yMMM = find(
              dateFormatItem,
              "id",
              "yMMM",
              getText
            );

            // "MMM y";
            cldr.cldr_date_time_format_yMMMEd = find(
              dateFormatItem,
              "id",
              "yMMMEd",
              getText
            );

            // "E, MMM d, y";
            cldr.cldr_date_time_format_yMMMd = find(
              dateFormatItem,
              "id",
              "yMMMd",
              getText
            );

            // "MMM d, y";
            cldr.cldr_date_time_format_yMd = find(
              dateFormatItem,
              "id",
              "yMd",
              getText
            );

            // "M/d/y";
            cldr.cldr_date_time_format_yQ = find(
              dateFormatItem,
              "id",
              "yQ",
              getText
            );

            // "Q y";
            cldr.cldr_date_time_format_yQQQ = find(
              dateFormatItem,
              "id",
              "yQQQ",
              getText
            );

            // "QQQ y";

            var dayContext = get("days[0].dayContext", cal);
            find(dayContext, "type", "format", function (row) {
              find(row.dayWidth, "type", "abbreviated", function (row) {
                cldr.cldr_day_format_abbreviated_fri = find(
                  row.day,
                  "type",
                  "fri",
                  getText
                );

                // "Fri";
                cldr.cldr_day_format_abbreviated_mon = find(
                  row.day,
                  "type",
                  "mon",
                  getText
                );

                // "Mon";
                cldr.cldr_day_format_abbreviated_sat = find(
                  row.day,
                  "type",
                  "sat",
                  getText
                );

                // "Sat";
                cldr.cldr_day_format_abbreviated_sun = find(
                  row.day,
                  "type",
                  "sun",
                  getText
                );

                // "Sun";
                cldr.cldr_day_format_abbreviated_thu = find(
                  row.day,
                  "type",
                  "thu",
                  getText
                );

                // "Thu";
                cldr.cldr_day_format_abbreviated_tue = find(
                  row.day,
                  "type",
                  "tue",
                  getText
                );

                // "Tue";
                cldr.cldr_day_format_abbreviated_wed = find(
                  row.day,
                  "type",
                  "wed",
                  getText
                );

                // "Wed";
              });
            });
            find(dayContext, "type", "format", function (row) {
              find(row.dayWidth, "type", "wide", function (row) {
                cldr.cldr_day_format_wide_fri = find(
                  row.day,
                  "type",
                  "fri",
                  getText
                );

                // "Friday";
                cldr.cldr_day_format_wide_mon = find(
                  row.day,
                  "type",
                  "mon",
                  getText
                );

                // "Monday";
                cldr.cldr_day_format_wide_sat = find(
                  row.day,
                  "type",
                  "sat",
                  getText
                );

                // "Saturday";
                cldr.cldr_day_format_wide_sun = find(
                  row.day,
                  "type",
                  "sun",
                  getText
                );

                // "Sunday";
                cldr.cldr_day_format_wide_thu = find(
                  row.day,
                  "type",
                  "thu",
                  getText
                );

                // "Thursday";
                cldr.cldr_day_format_wide_tue = find(
                  row.day,
                  "type",
                  "tue",
                  getText
                );

                // "Tuesday";
                cldr.cldr_day_format_wide_wed = find(
                  row.day,
                  "type",
                  "wed",
                  getText
                );

                // "Wednesday";
              });
            });
            find(dayContext, "type", "stand-alone", function (row) {
              cldr["cldr_day_stand-alone_narrow_fri"] = find(
                row.dayWidth[0].day,
                "type",
                "fri",
                getText
              );

              // "F";
              cldr["cldr_day_stand-alone_narrow_mon"] = find(
                row.dayWidth[0].day,
                "type",
                "mon",
                getText
              );

              // "M";
              cldr["cldr_day_stand-alone_narrow_sat"] = find(
                row.dayWidth[0].day,
                "type",
                "sat",
                getText
              );

              // "S";
              cldr["cldr_day_stand-alone_narrow_sun"] = find(
                row.dayWidth[0].day,
                "type",
                "sun",
                getText
              );

              // "S";
              cldr["cldr_day_stand-alone_narrow_thu"] = find(
                row.dayWidth[0].day,
                "type",
                "thu",
                getText
              );

              // "T";
              cldr["cldr_day_stand-alone_narrow_tue"] = find(
                row.dayWidth[0].day,
                "type",
                "tue",
                getText
              );

              // "T";
              cldr["cldr_day_stand-alone_narrow_wed"] = find(
                row.dayWidth[0].day,
                "type",
                "wed",
                getText
              );

              // "W";
            });

            var monthContext = get("months[0].monthContext", cal);

            const parseMonth = (months, cldrProperty) => {
              if (!months) {
                return;
              }
              months.forEach(month => {
                cldr[cldrProperty + "_" + month["$"].type] = getText(month);
              });
            };

            const parseMonthContext = sectionNameInLocaleFile => {
              find(monthContext, "type", "format", row =>
                find(row.monthWidth, "type", sectionNameInLocaleFile, row =>
                  parseMonth(
                    row.month,
                    "cldr_month_format_" + sectionNameInLocaleFile
                  )
                )
              );
            };

            parseMonthContext("abbreviated");
            parseMonthContext("wide");
            find(monthContext, "type", "stand-alone", row =>
              parseMonth(
                row.monthWidth[0].month,
                "cldr_month_stand-alone_narrow"
              )
            );

            function getTimeFormatPattern(row) {
              return row.timeFormat.pattern;
            }

            var timeFormatLength = get("timeFormats[0].timeFormatLength", cal);
            cldr.cldr_time_format_full = find(
              timeFormatLength,
              "type",
              "full",
              getTimeFormatPattern
            );

            // "h:mm:ss a zzzz";
            cldr.cldr_time_format_long = find(
              timeFormatLength,
              "type",
              "long",
              getTimeFormatPattern
            );

            // "h:mm:ss a z";
            cldr.cldr_time_format_medium = find(
              timeFormatLength,
              "type",
              "medium",
              getTimeFormatPattern
            );

            // "h:mm:ss a";
            cldr.cldr_time_format_short = find(
              timeFormatLength,
              "type",
              "short",
              getTimeFormatPattern
            );

            // "h:mm a";
          }

          var numberingSystem = getText(
            get("ldml.numbers[0].defaultNumberingSystem[0]")
          );

          if (numberingSystem) {
            find(
              get("ldml.numbers[0].symbols"),
              "numberSystem",
              numberingSystem,
              function (row) {
                cldr.cldr_number_decimal_separator = row.decimal[0];
                cldr.cldr_number_group_separator = row.group[0];
              }
            );
          } else {
            cldr.cldr_number_decimal_separator = getValue(
              "ldml.numbers[0].symbols[0].decimal[0]"
            );

            // ".";
            cldr.cldr_number_group_separator = getValue(
              "ldml.numbers[0].symbols[0].group[0]"
            );

            // ",";
          }

          cldr.cldr_number_percent_format = getValue(
            "ldml.numbers[0].percentFormats[0].percentFormatLength[0].percentFormat[0].pattern[0]"
          );

          // "#,##0%";

          function getDisplayName(row) {
            if (qx.lang.Type.isArray(row.displayName)) {
              return row.displayName.map(elem => getText(elem));
            }
            return getText(row.displayName);
          }

          var field = get("ldml.dates[0].fields[0].field");
          cldr.day = find(field, "type", "day", getDisplayName); // "Day"
          cldr.dayperiod = find(field, "type", "dayperiod", getDisplayName); // "AM/PM";
          cldr.era = find(field, "type", "era", getDisplayName); // "Era";
          cldr.hour = find(field, "type", "hour", getDisplayName); // "Hour";
          cldr.minute = find(field, "type", "minute", getDisplayName); // "Minute";
          cldr.month = find(field, "type", "month", getDisplayName); // "Month";
          cldr.second = find(field, "type", "second", getDisplayName); // "Second";
          cldr.week = find(field, "type", "week", getDisplayName); // "Week";
          cldr.weekday = find(field, "type", "weekday", getDisplayName); // "Day of the Week";
          cldr.year = find(field, "type", "year", getDisplayName); // "Year";
          cldr.zone = find(field, "type", "zone", getDisplayName); // "Time Zone";

          return cldr;
        });
    }
  }
});
