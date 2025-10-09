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
 * @ignore(Intl.DateTimeFormat)
 * @ignore(Intl.Locale)
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
      return this.__localizeMarker("am", 1, locale);
    },

    /**
     * Get PM marker for time definitions
     *
     * @param locale {String} optional locale to be used
     * @return {String} translated PM marker.
     */
    getPmMarker(locale) {
      return this.__localizeMarker("pm", 12, locale);
    },

    /**
     * Localize day period/marker of a month
     *
     * @param {String} id LocalizedString Id
     * @param {Integer} month index of the month. 0=january, 1=february, ...
     * @param {String} locale optional locale to be used
     * @returns {qx.locale.LocalizedString} localized day marker
     */
    __localizeMarker(id, month, locale) {
      locale = this.__transformLocale(locale);
      const date = new Date();
      date.setHours(month);
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
      context = context ? context : "format";

      if (qx.core.Environment.get("qx.debug")) {
        qx.core.Assert.assertInArray(length, ["abbreviated", "narrow", "wide"]);
        qx.core.Assert.assertInArray(context, ["format", "stand-alone"]);
      }

      let days = [];
      for (let i = 0; i < 7; i++) {
        const localizedDay = this.getDayName(
          length,
          i,
          locale,
          context,
          withFallback
        );
        days.push(localizedDay);
      }
      return days;
    },

    /**
     * Returns weekday for day of month
     *
     * @param {Integer} day day of month
     * @param {String} id LocalizedString id
     * @param {String} locale locale to be used
     * @param {object} options date/time Intl API options
     * @returns {qx.locale.LocalizedString} localized weekday
     */
    __getWeekdayFromDay(day, id, locale, options) {
      const parts = new Intl.DateTimeFormat(locale, options).formatToParts(
        new Date(Date.UTC(2021, 10, day))
      );
      const value = parts.find(part => part.type === "weekday")?.value;
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
      context = context ? context : "format";

      if (qx.core.Environment.get("qx.debug")) {
        qx.core.Assert.assertInArray(length, ["abbreviated", "narrow", "wide"]);
        qx.core.Assert.assertInteger(day);
        qx.core.Assert.assertInRange(day, 0, 6);
        qx.core.Assert.assertInArray(context, ["format", "stand-alone"]);
      }

      let weekFormat = "short";
      if (length === "narrow") {
        weekFormat = "narrow";
      } else if (length === "wide") {
        weekFormat = "long";
      }

      const options = { weekday: weekFormat };
      if (context === "format") {
        options.day = "numeric";
      }

      locale = this.__transformLocale(locale);
      const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
      return this.__getWeekdayFromDay(
        day,
        "cldr_day_" + context + "_" + length + "_" + days[day],
        locale,
        options
      );
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
      context = context ? context : "format";

      if (qx.core.Environment.get("qx.debug")) {
        qx.core.Assert.assertInArray(length, ["abbreviated", "narrow", "wide"]);
        qx.core.Assert.assertInArray(context, ["format", "stand-alone"]);
      }

      const months = [];
      for (let i = 0; i < 12; i++) {
        const localizedMonth = this.getMonthName(
          length,
          i,
          locale,
          context,
          withFallback
        );
        months.push(localizedMonth);
      }
      return months;
    },

    /**
     * Localize month
     *
     * @param {Integer} month index of the month. 0=january, 1=february, ...
     * @param {String} id LocalizedString id
     * @param {String} locale locale to be used
     * @param {object} options Intl API date/time options
     * @returns {qx.locale.LocalizedString} localized string
     */
    __localizeMonth(month, id, locale, options) {
      const parts = new Intl.DateTimeFormat(locale, options).formatToParts(
        new Date(2000, month, 1)
      );
      const value = parts.find(part => part.type === "month")?.value;
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
      context = context ? context : "format";

      if (qx.core.Environment.get("qx.debug")) {
        qx.core.Assert.assertInArray(length, ["abbreviated", "narrow", "wide"]);
        qx.core.Assert.assertInArray(context, ["format", "stand-alone"]);
      }

      let monthLength = "short";
      if (length === "narrow") {
        monthLength = "narrow";
      } else if (length === "wide") {
        monthLength = "long";
      }

      const options = { month: monthLength };
      if (context === "format") {
        options.day = "numeric";
      }
      locale = this.__transformLocale(locale);
      const id = "cldr_month_" + context + "_" + length + "_" + (month + 1);
      return this.__localizeMonth(month, id, locale, options);
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
      return this.__localizeDate(id, locale, { dateStyle: size });
    },

    /**
     * Localize date via Intl API
     *
     * @param {String} id LocalizedString id
     * @param {String} locale locale to be used
     * @param {object} options date/time Intl API options
     * @returns {qx.locale.LocalizedString} localized date
     */
    __localizeDate(id, locale, options) {
      const parts = new Intl.DateTimeFormat(locale, options).formatToParts(
        new Date(2000, 1, 1)
      );
      const nonLiteralPartCount = parts.filter(
        part => part.type !== "literal"
      ).length;
      const result = [];

      for (let part of parts) {
        let value = part.value;
        let type = part.type;
        let length = value.length;
        let lexem = "";

        if (part.type === "year") {
          if (length === 4) {
            lexem = "y";
          } else if (length === 2) {
            lexem = "yy";
          } else {
            lexem = "y".repeat(length);
          }
        } else if (type === "month") {
          let letter = nonLiteralPartCount === 1 ? "L" : "M";
          const parsedValue = parseInt(value);
          if (!isNaN(parsedValue)) {
            lexem = letter.repeat(length);
          } else {
            let context = nonLiteralPartCount === 1 ? "stand-alone" : "format";
            let monthShort = this.getMonthName(
              "abbreviated",
              1,
              locale,
              context
            ).toString();
            if (monthShort === value) {
              lexem = letter.repeat(3);
            } else {
              let monthLong = this.getMonthName(
                "wide",
                1,
                locale,
                context
              ).toString();
              if (monthLong === value) {
                lexem = letter.repeat(4);
              }
            }
          }
        } else if (type === "literal") {
          lexem = value;
        } else if (type === "day") {
          lexem = "d";
        } else if (type === "weekday") {
          if (value === this.getDayName("wide", 2, locale).toString()) {
            lexem = "EEEE";
          } else {
            lexem = "E";
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
     * @return {qx.locale.LocalizedString} best matching format string
     */
    getDateTimeFormat(canonical, fallback, locale) {
      locale = this.__transformLocale(locale);

      const id = "cldr_date_time_format_" + canonical;
      const dateLocaleTable = {
        d: { day: "2-digit" },
        y: { year: "numeric" },
        M: { month: "numeric" },
        MMM: { month: "short" },
        MMMd: { day: "numeric", month: "short" },
        yMMM: { year: "numeric", month: "short" },
        Ed: { weekday: "short", day: "numeric" },
        Md: { month: "numeric", day: "numeric" },
        yM: { year: "numeric", month: "numeric" },
        yMEd: {
          year: "numeric",
          month: "numeric",
          day: "numeric",
          weekday: "narrow"
        },
        yMMMEd: {
          year: "numeric",
          month: "short",
          day: "numeric",
          weekday: "narrow"
        },
        yMMMd: { year: "numeric", month: "short", day: "numeric" },
        yMd: { year: "numeric", month: "numeric", day: "numeric" },
        MEd: { month: "numeric", day: "numeric", weekday: "narrow" },
        MMMEd: { month: "short", day: "numeric", weekday: "narrow" }
      };

      const timeLocaleTable = {
        hm: { hour: "numeric", minute: "numeric", hour12: true },
        Hm: { hour: "2-digit", minute: "2-digit" },
        ms: { minute: "2-digit", second: "2-digit" },
        hms: {
          hour: "numeric",
          minute: "2-digit",
          second: "2-digit",
          hour12: true
        },
        Hms: {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit"
        }
      };
      if (dateLocaleTable.hasOwnProperty(canonical)) {
        return this.__localizeDate(id, locale, dateLocaleTable[canonical]);
      }
      if (timeLocaleTable.hasOwnProperty(canonical)) {
        return this.__localizeTime(id, locale, timeLocaleTable[canonical]);
      }

      switch (canonical) {
        case "yQ":
          return this.__localizeYQ(id, locale);
        case "yQQQ":
          return this.__localizeYQQQ(id, locale);
      }

      let localizedFormat = this.__mgr.localize(id, [], locale);

      if (localizedFormat == id) {
        localizedFormat = fallback;
      }

      return localizedFormat;
    },

    /**
     * Localize yQ format
     *
     * @param {String} id LocalizedString id
     * @param {String} locale locale to be used
     * @returns {qx.locale.LocalizedString} localized yQ format
     */
    __localizeYQ(id, locale) {
      const result = "yQ";
      if (locale === "cy" || locale === "cy-GB") {
        return "Q y";
      }
      return new qx.locale.LocalizedString(result, id, [], true);
    },

    /**
     * Localize yQQQ format
     *
     * @param {String} id LocalizedString id
     * @param {String} locale locale to be used
     * @returns {qx.locale.LocalizedString}
     */
    __localizeYQQQ(id, locale) {
      const mostCase = [
        "az",
        "bs-Cyrl",
        "dz",
        "ckb",
        "ii",
        "kok",
        "lt",
        "gu",
        "haw",
        "ml",
        "mni",
        "my",
        "ne",
        "ps",
        "qu",
        "rw",
        "sah",
        "sd",
        "se",
        "seh",
        "si",
        "sw",
        "tk",
        "to",
        "tr",
        "ug",
        "xh",
        "yi"
      ];

      let result = "QQQ y";
      if (mostCase.includes(locale)) {
        result = "y QQQ";
      }
      switch (locale) {
        case "ja":
          result = "y/QQQ";
          break;
        case "ka":
        case "kgp":
        case "sq":
          result = "QQQ, y";
          break;
        case "kk":
          result = "y 'ж'. QQQ";
          break;
        case "ko":
          result = "y년 QQQ";
          break;
        case "ky":
          result = "y-'ж'., QQQ";
          break;
        case "lv":
          result = "y. 'g'. QQQ";
          break;
        case "mk":
        case "ru":
        case "bg":
          result = "QQQ y 'г'.";
          break;
        case "mn":
          result = "y 'оны' QQQ";
          break;
        case "mt":
          result = "QQQ - y";
          break;
        case "pt-PT":
          result = "QQQQ 'de' y";
          break;
        case "pt":
          result = "QQQ 'de' y";
          break;
        case "sr-Latn":
        case "sr":
        case "bs":
        case "hr":
          result = "QQQ y.";
          break;
        case "tt":
          result = "y 'ел', QQQ";
          break;
        case "uz-Cyrl":
        case "uz":
          result = "y, QQQ";
          break;
        case "yue-Hans":
        case "yue":
        case "zh-Hant":
          result = "y年QQQ";
          break;
        case "zh":
          result = "y年第Q季度";
          break;
        case "eu":
          result = "y('e')'ko' QQQ";
          break;
        case "fo":
          result = "QQQ 'í' y";
          break;
        case "hu":
          result = "y. QQQ";
          break;
        case "hy":
          result = "y թ. QQQ";
          break;
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

      return this.__localizeTime("cldr_time_format_" + size, locale, {
        timeStyle: size
      });
    },

    /**
     * Localize time via Intl API
     *
     * @param {String} id LocalizedString id
     * @param {String} locale locale to be used
     * @param {object} options date/time Intl API options
     * @returns {qx.locale.LocalizedString} localized time
     */
    __localizeTime(id, locale, options) {
      const parts = new Intl.DateTimeFormat(locale, options).formatToParts(
        new Date(2000, 1, 1, 1, 1, 1)
      );
      let result = [];
      parts.forEach(part => {
        let lexem = "";
        let value = part.value;
        let length = value.length;
        switch (part.type) {
          case "literal":
            lexem = value;
            break;
          case "dayPeriod":
            lexem = "a";
            break;
          case "hour":
            lexem = this.__getSmallOrBigH(locale, options).repeat(length);
            break;
          case "minute":
            lexem = "m".repeat(length);
            break;
          case "second":
            lexem = "s".repeat(length);
            break;
          case "timeZoneName":
            lexem = this.__getTimezoneFormat(locale, value);
            break;
          default:
            lexem = "";
        }
        result.push(lexem);
      });

      return new qx.locale.LocalizedString(result.join(""), id, [], true);
    },

    /**
     * Detects what hour format and returns small h if
     * 24 hour format and big H if 12 hour format
     *
     * @param {String} locale locale to be used
     * @param {object} options date/time Intl API options
     * @returns {String} h or H
     */
    __getSmallOrBigH(locale, options) {
      const hour24 = new Intl.DateTimeFormat(locale, options)
        .formatToParts(new Date(2000, 1, 1, 13, 1, 1))
        .find(subPart => subPart.type === "hour")
        .value.includes("13");
      return hour24 ? "h" : "H";
    },

    /**
     *
     * @param {String} locale locale to be used
     * @param {String} value timezone from options
     * @returns {String} timezone format
     */
    __getTimezoneFormat(locale, value) {
      let short = new Intl.DateTimeFormat(locale, {
        timeZoneName: "short"
      })
        .formatToParts(new Date(2000, 1, 1, 1, 1, 1))
        .find(part => part.type === "timeZoneName")?.value;
      return short === value ? "z" : "zzzz";
    },

    /**
     * Return the day the week starts with
     *
     * @param locale {String} optional locale to be used
     * @return {Integer} index of the first day of the week. 0=sunday, 1=monday, ...
     */
    getWeekStart(locale) {
      let intlLocale = this.__transformLocale(locale);
      if (this.__isIntlWeekInfoSupported(intlLocale)) {
        let info = new Intl.Locale(intlLocale).weekInfo;
        return info.firstDay !== 7 ? info.firstDay : 0;
      }
      // old implementation
      const weekStart = {
        // default is monday
        MV: 5, // friday
        AE: 6, // saturday
        AF: 6,
        BH: 6,
        DJ: 6,
        DZ: 6,
        EG: 6,
        ER: 6,
        ET: 6,
        IQ: 6,
        IR: 6,
        JO: 6,
        KE: 6,
        KW: 6,
        LB: 6,
        LY: 6,
        MA: 6,
        OM: 6,
        QA: 6,
        SA: 6,
        SD: 6,
        SO: 6,
        TN: 6,
        YE: 6,
        AS: 0, // sunday
        AU: 0,
        AZ: 0,
        BW: 0,
        CA: 0,
        CN: 0,
        FO: 0,
        GE: 0,
        GL: 0,
        GU: 0,
        HK: 0,
        IE: 0,
        IL: 0,
        IS: 0,
        JM: 0,
        JP: 0,
        KG: 0,
        KR: 0,
        LA: 0,
        MH: 0,
        MN: 0,
        MO: 0,
        MP: 0,
        MT: 0,
        NZ: 0,
        PH: 0,
        PK: 0,
        SG: 0,
        TH: 0,
        TT: 0,
        TW: 0,
        UM: 0,
        US: 0,
        UZ: 0,
        VI: 0,
        ZA: 0,
        ZW: 0,
        MW: 0,
        NG: 0,
        TJ: 0
      };

      const territory = qx.locale.Date._getTerritory(locale);

      // default is monday
      return weekStart[territory] != null ? weekStart[territory] : 1;
    },

    /**
     * Return the day the weekend starts with
     *
     * @param locale {String} optional locale to be used
     * @return {Integer} index of the first day of the weekend. 0=sunday, 1=monday, ...
     */
    getWeekendStart(locale) {
      let intlLocale = this.__transformLocale(locale);
      if (this.__isIntlWeekInfoSupported(intlLocale)) {
        let info = new Intl.Locale(intlLocale).weekInfo;
        return info.weekend[0] !== 7 ? info.weekend[0] : 0;
      }
      // default is monday
      const weekendStart = {
        // default is saturday
        EG: 5, // friday
        IL: 5,
        SY: 5,
        IN: 0, // sunday
        AE: 4, // thursday
        BH: 4,
        DZ: 4,
        IQ: 4,
        JO: 4,
        KW: 4,
        LB: 4,
        LY: 4,
        MA: 4,
        OM: 4,
        QA: 4,
        SA: 4,
        SD: 4,
        TN: 4,
        YE: 4
      };

      const territory = qx.locale.Date._getTerritory(locale);

      // default is saturday
      return weekendStart[territory] != null ? weekendStart[territory] : 6;
    },

    /**
     * Return the day the weekend ends with
     *
     * @param locale {String} optional locale to be used
     * @return {Integer} index of the last day of the weekend. 0=sunday, 1=monday, ...
     */
    getWeekendEnd(locale) {
      let intlLocale = this.__transformLocale(locale);
      if (this.__isIntlWeekInfoSupported(intlLocale)) {
        let info = new Intl.Locale(intlLocale).weekInfo;
        const end = info.weekend[info.weekend.length - 1];
        return end !== 7 ? end : 0;
      }
      // old implementation
      const weekendEnd = {
        // default is sunday
        AE: 5, // friday
        BH: 5,
        DZ: 5,
        IQ: 5,
        JO: 5,
        KW: 5,
        LB: 5,
        LY: 5,
        MA: 5,
        OM: 5,
        QA: 5,
        SA: 5,
        SD: 5,
        TN: 5,
        YE: 5,
        AF: 5,
        IR: 5,
        EG: 6, // saturday
        IL: 6,
        SY: 6
      };

      const territory = qx.locale.Date._getTerritory(locale);

      // default is sunday
      return weekendEnd[territory] != null ? weekendEnd[territory] : 0;
    },

    /**
     * Returns whether a certain day of week belongs to the week end.
     *
     * @param day {Integer} index of the day. 0=sunday, 1=monday, ...
     * @param locale {String} optional locale to be used
     * @return {Boolean} whether the given day is a weekend day
     */
    isWeekend(day, locale) {
      let intlLocale = this.__transformLocale(locale);
      if (this.__isIntlWeekInfoSupported(intlLocale)) {
        let info = new Intl.Locale(intlLocale).weekInfo;
        return info.weekend.includes(day !== 0 ? day : 7);
      }
      // old implementation
      const weekendStart = qx.locale.Date.getWeekendStart(locale);
      const weekendEnd = qx.locale.Date.getWeekendEnd(locale);

      if (weekendEnd > weekendStart) {
        return day >= weekendStart && day <= weekendEnd;
      } else {
        return day >= weekendStart || day <= weekendEnd;
      }
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

    __isIntlWeekInfoSupported(locale){
      return Intl.Locale && new Intl.Locale(locale).weekInfo;
    },

    /**
     * Transforms an input locale into locale supported by Intl API
     *
     * @param locale {String} optional locale to be used
     * @returns {String} transformed locale
     */
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
