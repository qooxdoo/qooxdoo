/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Fabian Jakobs (fjakobs)
     * Dmitrii Zolotov (goldim)

************************************************************************ */

/**
 * Static class that provides localized date information (like names of week
 * days, AM/PM markers, start of week, etc.).
 *
 * @todo h and hh diff, dt formats
 * @ignore(Intl.DateTimeFormat)
 */
qx.Class.define("qx.locale.Date", {
  statics: {
    /**
     * Reference to the locale manager.
     *
     * @internal
     */
    __mgr: qx.locale.Manager.getInstance(),

    /**
     * Get AM marker for time definitions
     *
     * @param locale {String} optional locale to be used
     * @return {String} translated AM marker.
     */
    getAmMarker(locale) {
      return this.__getMarker("am", 1, locale);
    },

    /**
     * Get PM marker for time definitions
     *
     * @param locale {String} optional locale to be used
     * @return {String} translated PM marker.
     */
    getPmMarker(locale) {
      return this.__getMarker("pm", 12, locale);
    },

    __getMarker(id, monthNumber, locale) {
      locale = this.__transformLocale(locale);
      const date = new Date();
      date.setHours(monthNumber);
      const timeOptions = {
        hour: "numeric",
        minute: "numeric",
        hour12: true
      };
      const timeParts = Intl.DateTimeFormat(locale, timeOptions).formatToParts(
        date
      );
      const found = timeParts.find(part => part.type === "dayPeriod");
      let value;
      if (found) {
        value = found.value;
      }
      return new qx.locale.LocalizedString(value, "cldr_" + id, [], true);
    },

    /**
     * Return localized names of day names
     *
     * @param length {String} format of the day names.
     *       Possible values: "abbreviated", "narrow", "wide"
     * @param locale {String} optional locale to be used
     * @param context {String} (default: "format") intended context.
     *       Possible values: "format", "stand-alone"
     * @param withFallback {Boolean?} if true, the previous parameter's other value is tried
     * in order to find a localized name for the day
     * @return {String[]} array of localized day names starting with sunday.
     */
    getDayNames(length, locale, context, withFallback) {
      locale = this.__transformLocale(locale);
      var context = context ? context : "format";

      if (qx.core.Environment.get("qx.debug")) {
        qx.core.Assert.assertInArray(length, ["abbreviated", "narrow", "wide"]);
        qx.core.Assert.assertInArray(context, ["format", "stand-alone"]);
      }

      var weekFormat;
      if (length === "abbreviated") {
        weekFormat = "short";
      } else if (length === "narrow") {
        weekFormat = "narrow";
      } else if (length === "wide") {
        weekFormat = "long";
      }

      var options = { weekday: weekFormat };
      if (context === "format") {
        options.day = "numeric";
      }

      var days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
      return [...Array(7).keys()].map(day =>
        this.__parseWeekday(
          day,
          "cldr_day_" + context + "_" + length + "_" + days[day],
          locale,
          options
        )
      );
    },

    __parseWeekday(weekdayNumber, id, locale, options) {
      var parts = new Intl.DateTimeFormat(locale, options).formatToParts(
        new Date(Date.UTC(2021, 10, weekdayNumber))
      );
      var value = parts.find(part => part.type === "weekday")?.value;
      return new qx.locale.LocalizedString(value, id, [], true);
    },

    /**
     * Return localized name of a week day name
     *
     * @param length {String} format of the day name.
     *       Possible values: "abbreviated", "narrow", "wide"
     * @param day {Integer} day number. 0=sunday, 1=monday, ...
     * @param locale {String} optional locale to be used
     * @param context {String} (default: "format") intended context.
     *       Possible values: "format", "stand-alone"
     * @param withFallback {Boolean?} if true, the previous parameter's other value is tried
     * in order to find a localized name for the day
     * @return {String} localized day name
     */
    getDayName(length, day, locale, context, withFallback) {
      var context = context ? context : "format";

      if (qx.core.Environment.get("qx.debug")) {
        qx.core.Assert.assertInArray(length, ["abbreviated", "narrow", "wide"]);
        qx.core.Assert.assertInteger(day);
        qx.core.Assert.assertInRange(day, 0, 6);
        qx.core.Assert.assertInArray(context, ["format", "stand-alone"]);
      }

      return qx.locale.Date.getDayNames(length, locale, context, withFallback)[
        day
      ];
    },

    /**
     * Return localized names of month names
     *
     * @param length {String} format of the month names.
     *       Possible values: "abbreviated", "narrow", "wide"
     * @param locale {String} optional locale to be used
     * @param context {String} (default: "format") intended context.
     *       Possible values: "format", "stand-alone"
     * @param withFallback {Boolean?} if true, the previous parameter's other value is tried
     * in order to find a localized name for the month
     * @return {String[]} array of localized month names starting with january.
     */
    getMonthNames(length, locale, context, withFallback) {
      var context = context ? context : "format";

      if (qx.core.Environment.get("qx.debug")) {
        qx.core.Assert.assertInArray(length, ["abbreviated", "narrow", "wide"]);
        qx.core.Assert.assertInArray(context, ["format", "stand-alone"]);
      }

      locale = this.__transformLocale(locale);

      var monthFormat;
      if (length === "abbreviated") {
        monthFormat = "short";
      } else if (length === "narrow") {
        monthFormat = "narrow";
      } else if (length === "wide") {
        monthFormat = "long";
      }

      var options = { month: monthFormat };
      if (context === "format") {
        options.day = "numeric";
      }

      var months = [];
      for (var i = 0; i < 12; i++) {
        var id = "cldr_month_" + context + "_" + length + "_" + (i + 1);
        var localizedMonth = this.__parseMonth(i, id, locale, options);
        months.push(localizedMonth);
      }
      return months;
    },

    __parseMonth(monthNumber, id, locale, options) {
      var parts = new Intl.DateTimeFormat(locale, options).formatToParts(
        new Date(2000, monthNumber, 1)
      );
      var value = parts.find(part => part.type === "month")?.value;
      return new qx.locale.LocalizedString(value, id, [], true);
    },

    /**
     * Return localized name of a month
     *
     * @param length {String} format of the month names.
     *       Possible values: "abbreviated", "narrow", "wide"
     * @param month {Integer} index of the month. 0=january, 1=february, ...
     * @param locale {String} optional locale to be used
     * @param context {String} (default: "format") intended context.
     *       Possible values: "format", "stand-alone"
     * @param withFallback {Boolean?} if true, the previous parameter's other value is tried
     * in order to find a localized name for the month
     * @return {String} localized month name
     */
    getMonthName(length, month, locale, context, withFallback) {
      var context = context ? context : "format";

      if (qx.core.Environment.get("qx.debug")) {
        qx.core.Assert.assertInArray(length, ["abbreviated", "narrow", "wide"]);
        qx.core.Assert.assertInArray(context, ["format", "stand-alone"]);
      }

      return this.getMonthNames(length, locale, context, withFallback)[month];
    },

    /**
     * Return localized date format string to be used with {@link qx.util.format.DateFormat}.
     *
     * @param size {String} format of the date format.
     *      Possible values: "short", "medium", "long", "full"
     * @param locale {String?} optional locale to be used
     * @return {String} localized date format string
     */
    getDateFormat(size, locale) {
      if (qx.core.Environment.get("qx.debug")) {
        qx.core.Assert.assertInArray(size, ["short", "medium", "long", "full"]);
      }
      locale = this.__transformLocale(locale);
      var id = "cldr_date_format_" + size;
      return this.__parseDate(id, locale, { dateStyle: size });
    },

    __parseDate(id, locale, options) {
      const parts = new Intl.DateTimeFormat(locale, options).formatToParts(
        new Date(2000, 1, 1)
      );
      var result = [];

      for (let part of parts) {
        let value = part.value;
        let lexem = "";
        if (part.type === "year") {
          if (value.length === 4) {
            lexem = "y";
          } else if (value.length === 2) {
            lexem = "yy";
          }
        } else if (part.type === "month") {
          let monthShort = new Intl.DateTimeFormat(locale, {
            month: "short"
          }).format(new Date(2000, 1, 1));

          if (monthShort === value) {
            lexem = "MMM";
          } else {
            let monthLong = new Intl.DateTimeFormat(locale, {
              month: "long"
            }).format(new Date(2000, 1, 1));
            if (monthLong === value) {
              lexem = "MMMM";
            } else {
              let monthNarrow = new Intl.DateTimeFormat(locale, {
                month: "narrow"
              }).format(new Date(2000, 1, 1));
              if (monthNarrow === value) {
                lexem = "M";
              } else {
                if (value.length === 2) {
                  lexem = "MM";
                } else if (value.length === 1) {
                  lexem = "M";
                }
              }
            }
          }
        } else if (part.type === "literal") {
          lexem = value;
        } else if (part.type === "day") {
          if (value.length === 1) {
            lexem = "d";
          } else if (value.length === 2) {
            lexem = "dd";
          }
        } else if (part.type === "weekday") {
          if (value.length > 2) {
            lexem = "EEEE";
          }
        }
        result.push(lexem);
      }
      return new qx.locale.LocalizedString(result.join(""), id, [], true);
    },

    /**
     * Try to localize a date/time format string. For format string possibilities see
     * <a href="http://cldr.unicode.org/translation/date-time">Date/Time Symbol reference</a>
     * at CLDR - Unicode Common Locale Data Repository.
     *
     * If no localization is available take the fallback format string.
     *
     * @param canonical {String} format string containing only field information, and in a canonical order.
     *       Examples are "yyyyMMMM" for year + full month, or "MMMd" for abbreviated month + day.
     * @param fallback {String} fallback format string if no localized version is found
     * @param locale {String} optional locale to be used
     * @return {String} best matching format string
     */
    getDateTimeFormat(canonical, fallback, locale) {
      locale = this.__transformLocale(locale);

      var key = "cldr_date_time_format_" + canonical;
      if (canonical === "d") {
        return this.__parseDate(key, locale, { day: "2-digit" });
      }

      if (canonical === "y") {
        return this.__parseDate(key, locale, { year: "numeric" });
      }

      if (canonical === "M") {
        return this.__parseDate(key, locale, {
          month: "narrow"
        });
      }

      if (canonical === "MMMd") {
        return this.__parseDate(key, locale, {
          day: "numeric",
          month: "short"
        });
      }

      if (canonical === "yMMM") {
        return this.__parseDate(key, locale, {
          year: "numeric",
          month: "short"
        });
      }

      if (canonical === "hm") {
        return this.__parseTime(key, locale, {
          hour: "numeric",
          minute: "numeric",
          hour12: true
        });
      }

      if (canonical === "Hm") {
        return this.__parseTime(key, locale, {
          hour: "2-digit",
          minute: "2-digit"
        });
      }

      if (canonical === "ms") {
        return this.__parseTime(key, locale, {
          minute: "2-digit",
          second: "2-digit"
        });
      }

      if (canonical === "hms") {
        return this.__parseTime(key, locale, {
          hour: "numeric",
          minute: "2-digit",
          second: "2-digit",
          hour12: true
        });
      }

      if (canonical === "Hms") {
        return this.__parseTime(key, locale, {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit"
        });
      }

      if (canonical === "yQ") {
        return this.__getQuarterAndYear(key, locale);
      }

      //@TODO
      var table = {
        MMMd: "", // done
        Md: "",
        Hm: "", // done
        Hms: "", // done
        ms: "", // done
        hm: "", // done
        hms: "", //done
        yM: "",
        yMEd: "",
        yMMM: "", // done
        yMMMEd: "",
        yMMMd: "",
        yMd: "",
        MEd: "",
        MMM: "",
        MMMEd: "",
        Ed: "",
        M: "L",
        d: "d", // done
        y: "y", //done
        yQ: "", // done
        yQQQ: "QQQ y"
      };

      var localizedFormat = this.__mgr.localize(key, [], locale);

      if (localizedFormat == key) {
        localizedFormat = fallback;
      }

      return localizedFormat;
    },

    __getQuarterAndYear(id, locale) {
      var result = "yQ";
      if (locale === "cy" || locale === "cy-GB") {
        return "Q y";
      }
      return new qx.locale.LocalizedString(result, id, [], true);
    },

    /**
     * Return localized time format string to be used with {@link qx.util.format.DateFormat}.
     *
     * @param size {String} format of the time pattern.
     *      Possible values: "short", "medium", "long", "full"
     * @param locale {String} optional locale to be used
     * @return {String} localized time format string
     */
    getTimeFormat(size, locale) {
      locale = this.__transformLocale(locale);
      if (qx.core.Environment.get("qx.debug")) {
        qx.core.Assert.assertInArray(size, ["short", "medium", "long", "full"]);
      }

      return this.__parseTime("cldr_time_format_" + size, locale, {
        timeStyle: size
      });
    },

    __parseTime(id, locale, options) {
      const parts = new Intl.DateTimeFormat(locale, options).formatToParts(
        new Date(2000, 1, 1, 1, 1, 1)
      );
      let result = [];
      parts.forEach(part => {
        if (part.type === "literal") {
          result.push(part.value);
        } else if (part.type === "dayPeriod") {
          result.push("a");
        } else if (part.type === "hour") {
          if (part.value.length === 1) {
            result.push("h");
          } else if (part.value.length === 2) {
            result.push("HH");
          }
        } else if (part.type === "minute") {
          if (part.value.length === 2) {
            result.push("mm");
          }
          if (part.value.length === 1) {
            result.push("m");
          }
        } else if (part.type === "second") {
          if (part.value.length === 2) {
            result.push("ss");
          }
          if (part.value.length === 1) {
            result.push("s");
          }
        } else if (part.type === "timeZoneName") {
          let short = new Intl.DateTimeFormat("ak", { timeZoneName: "short" })
            .formatToParts(new Date(2000, 1, 1, 1, 1, 1))
            .find(part => part.type === "timeZoneName")?.value;
          if (short === part.value) {
            result.push("z");
          } else {
            result.push("zzzz");
          }
        }
      });

      return new qx.locale.LocalizedString(result.join(""), id, [], true);
    },

    /**
     * Return the day the week starts with
     *
     * Reference: Common Locale Data Repository (cldr) supplementalData.xml
     *
     * @param locale {String} optional locale to be used
     * @return {Integer} index of the first day of the week. 0=sunday, 1=monday, ...
     */
    getWeekStart(locale) {
      locale = this.__transformLocale(locale);
      const info = new Intl.Locale(locale).weekInfo;
      return info.firstDay !== 7 ? info.firstDay : 0;
    },

    /**
     * Return the day the weekend starts with
     *
     * Reference: Common Locale Data Repository (cldr) supplementalData.xml
     *
     * @param locale {String} optional locale to be used
     * @return {Integer} index of the first day of the weekend. 0=sunday, 1=monday, ...
     */
    getWeekendStart(locale) {
      locale = this.__transformLocale(locale);
      const info = new Intl.Locale(locale).weekInfo;
      return info.weekend[0] !== 7 ? info.weekend[0] : 0;
    },

    /**
     * Return the day the weekend ends with
     *
     * Reference: Common Locale Data Repository (cldr) supplementalData.xml
     *
     * @param locale {String} optional locale to be used
     * @return {Integer} index of the last day of the weekend. 0=sunday, 1=monday, ...
     */
    getWeekendEnd(locale) {
      locale = this.__transformLocale(locale);
      const info = new Intl.Locale(locale).weekInfo;
      const end = info.weekend[info.weekend.length - 1];
      return end !== 7 ? end : 0;
    },

    /**
     * Returns whether a certain day of week belongs to the week end.
     *
     * @param day {Integer} index of the day. 0=sunday, 1=monday, ...
     * @param locale {String} optional locale to be used
     * @return {Boolean} whether the given day is a weekend day
     */
    isWeekend(day, locale) {
      locale = this.__transformLocale(locale);
      const info = new Intl.Locale(locale).weekInfo;
      return info.weekend.includes(day !== 0 ? day : 7);
    },

    /**
     * Extract the territory part from a locale
     *
     * @param locale {String} the locale
     * @return {String} territory
     */
    _getTerritory(locale) {
      if (locale) {
        var territory = locale.split("_")[1] || locale;
      } else {
        territory = this.__mgr.getTerritory() || this.__mgr.getLanguage();
      }

      return territory.toUpperCase();
    },

    /**
     * Provide localization (CLDR) data with fallback between "format" and "stand-alone" contexts.
     * It is used in {@link #getDayName} and {@link #getMonthName} methods.
     *
     * @param context {String} intended context.
     *       Possible values: "format", "stand-alone".
     * @param fallbackContext {String} the context used in case no localization is found for the key.
     * @param key {String} message id (may contain format strings)
     * @param locale {String} the locale
     * @return {String} localized name for the key
     *
     */
    __localizeWithFallback(context, fallbackContext, key, locale) {
      var localizedString = this.__mgr.localize(key, [], locale);
      if (localizedString == key) {
        var newKey = key.replace(
          "_" + context + "_",
          "_" + fallbackContext + "_"
        );

        return this.__mgr.localize(newKey, [], locale);
      } else {
        return localizedString;
      }
    },

    __transformLocale(locale) {
      if (!locale) {
        locale = this.__mgr.getLocale();
      }
      if (locale === "C") {
        return "en";
      }
      return locale.replace("_", "-");
    }
  }
});
