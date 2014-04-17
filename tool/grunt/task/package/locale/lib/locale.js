/* *****************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2014 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Richard Sternagel (rsternagel)

***************************************************************************** */

/**
 * @module locale
 *
 * @desc
 * Extracts CLDR data tailored for loader usage.
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

// third party
var cldr = require('cldr');

// local
var util = require('./util');

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

module.exports = {
  /**
   * Gets a tailored CLDR object fitting the qx CLDR object spec.
   *
   * @param {string} locale - a two char string (e.g. 'en')
   * @returns {Object}
   */
  getTailoredCldrData: function(locale) {
    // cldr
    var delimiters = cldr.extractDelimiters(locale);
    var dateFormats = cldr.extractDateFormats(locale);
    var dateTimeFormats = cldr.extractDateFormatItems(locale);
    var timeFormats = cldr.extractTimeFormats(locale);
    var dayPeriods = cldr.extractDayPeriods(locale);
    var dayNames = cldr.extractDayNames(locale);
    var monthNames = cldr.extractMonthNames(locale);
    var numberSymbols = cldr.extractNumberSymbols(locale);
    var numberFormats = cldr.extractNumberFormats(locale);

    // TODO: refactoring: extract method(s) as soon as more
    // specific data is needed (and not everything at once)

    // shorthand
    var weekDays = dayNames.format.wide;

    // temp vars
    var prefix = '';
    var format = '';
    var kind = '';

    // tailored data for loader use
    var specificDayNames = {};
    var specificMonthNames = {};
    var specificNumberSymbols = {};
    var specificNumberFormats = {};
    var specificDayPeriods = {};

    prefix = "cldr_date_format_";
    for (format in dateFormats) {
      util.renameProperty(dateFormats, format, prefix+format);
    }

    prefix = "cldr_date_time_format_";
    for (format in dateTimeFormats) {
      util.renameProperty(dateTimeFormats, format, prefix+format);
    }

    prefix = "cldr_time_format_";
    for (format in timeFormats) {
      util.renameProperty(timeFormats, format, prefix+format);
    }

    var buildPropName = function(prefix, name) {
      return (prefix+"_"+name).toLowerCase();
    };

    dayNames.format.abbreviated.forEach(function(day, i) {
      var dayShort = util.getWeekDayChars(weekDays, i, 3);
      specificDayNames[buildPropName("cldr_day_format_abbreviated", dayShort)] = day;
    });

    dayNames.format.wide.forEach(function(day, i) {
      var dayShort = util.getWeekDayChars(weekDays, i, 3);
      specificDayNames[buildPropName("cldr_day_format_wide", dayShort)] = day;
    });

    dayNames.format.short.forEach(function(day, i) {
      var dayShort = util.getWeekDayChars(weekDays, i, 3);
      specificDayNames[buildPropName("cldr_day_format_short", dayShort)] = day;
    });

    dayNames.standAlone.narrow.forEach(function(day, i) {
      var dayShort = util.getWeekDayChars(weekDays, i, 3);
      specificDayNames[buildPropName("cldr_day_stand-alone_narrow", dayShort)] = day;
    });

    monthNames.format.abbreviated.forEach(function(month, i) {
      specificMonthNames[buildPropName("cldr_month_format_abbreviated", i+1)] = month;
    });

    monthNames.format.wide.forEach(function(month, i) {
      specificMonthNames[buildPropName("cldr_month_format_wide", i+1)] = month;
    });

    monthNames.standAlone.narrow.forEach(function(month, i) {
      specificMonthNames[buildPropName("cldr_month_stand-alone_narrow", i+1)] = month;
    });

    specificNumberSymbols.cldr_number_decimal_separator = numberSymbols.decimal;
    specificNumberSymbols.cldr_number_group_separator = numberSymbols.group;

    specificNumberFormats.cldr_number_percent_format = numberFormats.percent.default;

    specificDayPeriods.cldr_pm = dayPeriods.format.abbreviated.pm;
    specificDayPeriods.cldr_am = dayPeriods.format.abbreviated.am;

    return util.mergeObject(delimiters, timeFormats, dateFormats, dateTimeFormats,
                            specificDayNames, specificMonthNames,
                            specificNumberSymbols, specificNumberFormats,
                            specificDayPeriods);
  }
};
