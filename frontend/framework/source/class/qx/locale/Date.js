/**
 * Create a new instance of qx.nls.Date
 */
qx.OO.defineClass("qx.locale.Date");

qx.Class.getAmMarker = function(locale) { 
	return new qx.locale.manager.LocalizedString("cldr_am", [], locale);
};

qx.Class.getPmMarker = function(locale) {
	return new qx.locale.manager.LocalizedString("cldr_pm", [], locale);
};


/**
 * Return localized names of day names
 * 
 * @param format {string} format of the day names.
 *     Possible values: "abbreviated", "narrow", "wide"
 * @param locale {string} optional locale to be used
 * @return {qx.locale.manager.LocalizedString[]} array of localized day names starting with sunday.
 */
qx.Class.getDayNames = function(format, locale) {
	if (
	  format != "abbreviated" &&
	  format != "narrow" && 
	  format != "wide"
	) {
	  throw new Error('format must be one of "abbreviated", "narrow", "wide"');
	}
	var days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  var names = [];
	for (var i=0; i<days.length; i++) {
	  var key = "cldr_day_" + format + "_" + days[i];
	  names.push(new qx.locale.manager.LocalizedString(key, [], locale));
	}
	return names;
};


/**
 * Return localized names of month names
 * 
 * @param format {string} format of the month names.
 *     Possible values: "abbreviated", "narrow", "wide"
 * @param locale {string} optional locale to be used
 * @return {qx.locale.manager.LocalizedString[]} array of localized month names starting with january.
 */
qx.Class.getMonthNames = function(format, locale) {
	if (
	  format != "abbreviated" &&
	  format != "narrow" && 
	  format != "wide"
	) {
	  throw new Error('format must be one of "abbreviated", "narrow", "wide"');
	}
  var names = [];
	for (var i=0; i<12; i++) {
	  var key = "cldr_month_" + format + "_" + (i+1);
	  names.push(new qx.locale.manager.LocalizedString(key, [], locale));
	}
	return names;
};


/**
 * Return localized date format string to be used with @see(qx.util.format.DateFormat).
 * 
 * @param format {string} format of the month names.
 *    Possible values: "short", "medium", "long", "full"
 * @param locale {string} optional locale to be used
 * @return {qx.locale.manager.LocalizedString} localized date format string
 */
qx.Class.getDateFormat = function(format, locale) {
	if (
	  format != "short" &&
	  format != "medium" && 
	  format != "long" &&
	  format != "full"
	) {
	  throw new Error('format must be one of "short", "medium", "long", "full"');
	}
  var key = "cldr_date_format_" + format;
	return new qx.locale.manager.LocalizedString(key, [], locale)
};