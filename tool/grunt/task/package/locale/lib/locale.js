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

'use strict';

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
var Cldr = require('cldrjs');

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
    Cldr.load(require('../data/cldr/main/'+locale+'/delimiters.json'));
    Cldr.load(require('../data/cldr/main/'+locale+'/numbers.json'));
    Cldr.load(require('../data/cldr/main/'+locale+'/ca-gregorian.json'));
    var cldr = new Cldr(locale);

    var delimiters = cldr.main('delimiters');
    var dateFormats = cldr.main('dates/calendars/gregorian/dateFormats');
    var dateTimeFormats = cldr.main('dates/calendars/gregorian/dateTimeFormats/availableFormats');
    var timeFormats = cldr.main('dates/calendars/gregorian/timeFormats');
    var dayPeriods = cldr.main('dates/calendars/gregorian/dayPeriods');
    var dayNames = cldr.main('dates/calendars/gregorian/days');
    var monthNames = cldr.main('dates/calendars/gregorian/months');
    var numberSymbols = cldr.main('numbers/symbols-numberSystem-latn');
    var numberFormatsPercent = cldr.main('numbers/percentFormats-numberSystem-latn/standard');

    // tailored data for loader usage
    var specificDayNames = {};
    var specificMonthNames = {};
    var specificNumberSymbols = {};
    var specificNumberFormats = {};
    var specificDayPeriods = {};

    dateFormats = util.appendPrefixToProperties(dateFormats, 'cldr_date_format_');
    dateTimeFormats = util.appendPrefixToProperties(dateTimeFormats, 'cldr_date_time_format_');
    timeFormats = util.appendPrefixToProperties(timeFormats, 'cldr_time_format_');

    var dfa = util.appendPrefixToProperties(dayNames.format.abbreviated, 'cldr_day_format_abbreviated_');
    var dfn = util.appendPrefixToProperties(dayNames.format.narrow, 'cldr_day_format_narrow_');
    var dfw = util.appendPrefixToProperties(dayNames.format.wide, 'cldr_day_format_wide_');
    var dfs = util.appendPrefixToProperties(dayNames.format.short, 'cldr_day_format_short_');
    var dsa = util.appendPrefixToProperties(dayNames['stand-alone'].abbreviated, 'cldr_day_stand-alone_abbreviated_');
    var dsn = util.appendPrefixToProperties(dayNames['stand-alone'].narrow, 'cldr_day_stand-alone_narrow_');
    var dss = util.appendPrefixToProperties(dayNames['stand-alone'].short, 'cldr_day_stand-alone_short_');
    var dsw = util.appendPrefixToProperties(dayNames['stand-alone'].wide, 'cldr_day_stand-alone_wide_');
    specificDayNames = util.mergeObject(dfa, dfn, dfw, dfs, dsa, dsn, dss, dsw);

    var mfa = util.appendPrefixToProperties(monthNames.format.abbreviated, 'cldr_month_format_abbreviated_');
    var mfn = util.appendPrefixToProperties(monthNames.format.narrow, 'cldr_month_format_narrow_');
    var mfw = util.appendPrefixToProperties(monthNames.format.wide, 'cldr_month_format_wide_');
    var msa = util.appendPrefixToProperties(monthNames['stand-alone'].abbreviated, 'cldr_month_stand-alone_abbreviated_');
    var msn = util.appendPrefixToProperties(monthNames['stand-alone'].narrow, 'cldr_month_stand-alone_narrow_');
    var msw = util.appendPrefixToProperties(monthNames['stand-alone'].wide, 'cldr_month_stand-alone_wide_');
    specificMonthNames = util.mergeObject(mfa, mfn, mfw, msa, msn, msw);

    specificNumberSymbols.cldr_number_decimal_separator = numberSymbols.decimal;
    specificNumberSymbols.cldr_number_group_separator = numberSymbols.group;

    specificNumberFormats.cldr_number_percent_format = numberFormatsPercent;

    specificDayPeriods.cldr_pm = dayPeriods.format.abbreviated.pm;
    specificDayPeriods.cldr_am = dayPeriods.format.abbreviated.am;

    return util.mergeObject(delimiters, timeFormats, dateFormats, dateTimeFormats,
                            specificDayNames, specificMonthNames,
                            specificNumberSymbols, specificNumberFormats,
                            specificDayPeriods);
  }
};
