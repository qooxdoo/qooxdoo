/**
 * Create a new instance of qx.nls.Date
 */
qx.OO.defineClass("qx.nls.Date");

qx.Class.getAmMarker = function(locale) { 
	return qx.nls.Manager.getInstance().localize("cldr_am_marker", locale);
};

qx.Class.getPmMarker = function(locale) {
	return qx.nls.Manager.getInstance().localize("cldr_am_marker", locale);
};

qx.Class.getShortDayNames = function(locale) {
	
};