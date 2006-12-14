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
 * @param length {string} format of the day names.
 *     Possible values: "abbreviated", "narrow", "wide"
 * @param locale {string} optional locale to be used
 * @return {qx.locale.manager.LocalizedString[]} array of localized day names starting with sunday.
 */
qx.Class.getDayNames = function(length, locale) {
	if (
	  length != "abbreviated" &&
	  length != "narrow" && 
	  length != "wide"
	) {
	  throw new Error('format must be one of "abbreviated", "narrow", "wide"');
	}
	var days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  var names = [];
	for (var i=0; i<days.length; i++) {
	  var key = "cldr_day_" + length + "_" + days[i];
	  names.push(new qx.locale.manager.LocalizedString(key, [], locale));
	}
	return names;
};


/**
 * Return localized names of month names
 * 
 * @param length {string} format of the month names.
 *     Possible values: "abbreviated", "narrow", "wide"
 * @param locale {string} optional locale to be used
 * @return {qx.locale.manager.LocalizedString[]} array of localized month names starting with january.
 */
qx.Class.getMonthNames = function(length, locale) {
	if (
	  length != "abbreviated" &&
	  length != "narrow" && 
	  length != "wide"
	) {
	  throw new Error('format must be one of "abbreviated", "narrow", "wide"');
	}
  var names = [];
	for (var i=0; i<12; i++) {
	  var key = "cldr_month_" + length + "_" + (i+1);
	  names.push(new qx.locale.manager.LocalizedString(key, [], locale));
	}
	return names;
};


/**
 * Return localized date format string to be used with @see(qx.util.format.DateFormat).
 * 
 * @param size {string} format of the month names.
 *    Possible values: "short", "medium", "long", "full"
 * @param locale {string} optional locale to be used
 * @return {qx.locale.manager.LocalizedString} localized date format string
 */
qx.Class.getDateFormat = function(size, locale) {
	if (
	  size != "short" &&
	  size != "medium" && 
	  size != "long" &&
	  size != "full"
	) {
	  throw new Error('format must be one of "short", "medium", "long", "full"');
	}
  var key = "cldr_date_format_" + size;
	return new qx.locale.manager.LocalizedString(key, [], locale)
};


/**
 * Return the day the week starts with
 * 
 * Reference: Common Locale Data Repository (cldr) supplementalData.xml
 *  
 * @param locale {string} optional locale to be used
 * @return {integer} index of the first day of the week. 0..6 represends monday..sunday
 */
qx.Class.getWeekStart = function(locale) {
  var weekStart = {
    // default is monday
    
    "MV": 4, // friday
    
    "AE": 5, // saturday
    "AF": 5,
    "BH": 5,
    "DJ": 5,
    "DZ": 5,
    "EG": 5,
    "ER": 5,
    "ET": 5,
    "IQ": 5,
    "IR": 5,
    "JO": 5,
    "KE": 5,
    "KW": 5,
    "LB": 5,
    "LY": 5,
    "MA": 5,
    "OM": 5,
    "QA": 5,
    "SA": 5,
    "SD": 5,
    "SO": 5,
    "TN": 5,
    "YE": 5,
    
    "AS": 6, // sunday
    "AU": 6,
    "AZ": 6,
    "BW": 6,
    "CA": 6,
    "CN": 6,
    "FO": 6,
    "GE": 6,
    "GL": 6,
    "GU": 6,
    "HK": 6,
    "IE": 6,
    "IL": 6,
    "IS": 6,
    "JM": 6,
    "JP": 6,
    "KG": 6,
    "KR": 6,
    "LA": 6,
    "MH": 6,
    "MN": 6,
    "MO": 6,
    "MP": 6,
    "MT": 6,
    "NZ": 6,
    "PH": 6,
    "PK": 6,
    "SG": 6,
    "TH": 6,
    "TT": 6,
    "TW": 6,
    "UM": 6,
    "US": 6,
    "UZ": 6,
    "VI": 6,
    "ZA": 6,
    "ZW": 6,
    
    "ET": 6,
    "MW": 6,
    "NG": 6,
    "TJ": 6
  };

  var territory = qx.locale.Date._getTerritory(locale);
  // default is monday
  return weekStart[territory] || 0;
};


/**
 * Return the day the weekend starts with
 * 
 * Reference: Common Locale Data Repository (cldr) supplementalData.xml
 *  
 * @param locale {string} optional locale to be used
 * @return {integer} index of the first day of the weekend. 0..6 represends monday..sunday
 */
qx.Class.getWeekendStart = function(locale) {
  var weekendStart = {
    // default is saturday
    
    "EG": 4, // friday
    "IL": 4,
    "SY": 4,
    
    "IN": 6, // sunday
    
    "AE": 3, // thursday
    "BH": 3,
    "DZ": 3,
    "IQ": 3,
    "JO": 3,
    "KW": 3,
    "LB": 3,
    "LY": 3,
    "MA": 3,
    "OM": 3,
    "QA": 3,
    "SA": 3,
    "SD": 3,
    "TN": 3,
    "YE": 3
  };
  var territory = qx.locale.Date._getTerritory(locale);
  // default is saturday
  return weekendStart[territory] || 5;
};   


/**
 * Return the day the weekend ends with
 * 
 * Reference: Common Locale Data Repository (cldr) supplementalData.xml
 *  
 * @param locale {string} optional locale to be used
 * @return {integer} index of the last day of the weekend. 0..6 represends monday..sunday
 */
qx.Class.getWeekendEnd = function(locale) {
  var weekendEnd = {
    // default is sunday
    
    "AE": 4, // friday
    "BH": 4,
    "DZ": 4,
    "IQ": 4,
    "JO": 4,
    "KW": 4,
    "LB": 4,
    "LY": 4,
    "MA": 4,
    "OM": 4,
    "QA": 4,
    "SA": 4,
    "SD": 4,
    "TN": 4,
    "YE": 4,
    "AF": 4,
    "IR": 4,
    
    "EG": 5, // saturday
    "IL": 5,
    "SY": 5
  }
  var territory = qx.locale.Date._getTerritory(locale);
  // default is sunday
  return weekendEnd[territory] || 6;
};


/**
 * Returns whether a certain day of week belongs to the week end.
 *
 * @param day {integer} index of the day. 0..6 represends monday..sunday
 * @param locale {string} optional locale to be used
 * @return {boolean} whether the given day is a weekend day
 */
qx.Class.isWeekend = function(day, locale) {
  var weekendStart = qx.locale.Date.getWeekendStart(locale);
  var weekendEnd = qx.locale.Date.getWeekendEnd(locale);
  if (weekendEnd > weekendStart) {
    return (
      (day >= weekendStart) &&
      (day <= weekendEnd)
    );
  } else {
    return (
      (day >= weekendStart) ||
      (day <= weekendEnd)
    );    
  }
};


qx.Class._getTerritory = function(locale) {
  if (locale) {
    var territory = locale.split("_")[1] || locale;
  } else {
    territory =
      qx.locale.manager.Manager.getInstance().getTerritory() ||
      qx.locale.manager.Manager.getInstance().getLanguage();
  };
  return territory.toUpperCase();
};
          