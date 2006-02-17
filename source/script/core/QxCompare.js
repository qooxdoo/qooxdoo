/* ************************************************************************

   qooxdoo - the new era of web interface development

   Copyright:
     (C) 2004-2006 by Schlund + Partner AG, Germany
     All rights reserved

   License:
     LGPL 2.1: http://creativecommons.org/licenses/LGPL/2.1/

   Internet:
     * http://qooxdoo.oss.schlund.de

   Authors:
     * Sebastian Werner (wpbasti)
       <sebastian dot werner at 1und1 dot de>
     * Andreas Ecker (aecker)
       <andreas dot ecker at 1und1 dot de>

************************************************************************ */

/* ************************************************************************

#package(core)

************************************************************************ */

var QxCompare = {};

QxCompare.byString = function(a, b) {
  return a==b ? 0 : a > b ? 1 : -1;
};

QxCompare.byStringCaseInsensitive = function(a, b) {
  return QxCompare.byString(a.toLowerCase(), b.toLowerCase());
};

QxCompare.byStringUmlautsShort = function(a, b) {
  return QxCompare.byString(a.normalizeUmlauts(), b.normalizeUmlautsShort());
};

QxCompare.byStringUmlautsShortCaseInsensitive = function(a, b) {
  return QxCompare.byString(a.normalizeUmlauts().toLowerCase(), b.normalizeUmlautsShort().toLowerCase());
};

QxCompare.byStringUmlautsLong = function(a, b) {
  return QxCompare.byString(a.normalizeUmlautsLong(), b.normalizeUmlautsLong());
};

QxCompare.byStringUmlautsLongCaseInsensitive = function(a, b) {
  return QxCompare.byString(a.normalizeUmlautsLong().toLowerCase(), b.normalizeUmlautsLong().toLowerCase());
};

QxCompare.byFloat = function(a, b) {
  return a - b;
};

QxCompare.byInteger = QxCompare.byNumber = QxCompare.byFloat;

QxCompare.byIntegerString = function(a, b) {
  return parseInt(a) - parseInt(b);
};

QxCompare.byFloatString = function(a, b) {
  return parseFloat(a) - parseFloat(b);
};

QxCompare.byNumberString = QxCompare.byFloatString;

QxCompare.byIPv4 = function(a, b) 
{
  var ipa = a.split(QxConst.CORE_DOT, 4);
  var ipb = b.split(QxConst.CORE_DOT, 4);

  for (var i=0; i<3; i++) 
  {
    a = parseInt(ipa[i]);
    b = parseInt(ipb[i]);

    if (a != b) { 
      return a - b;  
    };
  };

  return parseInt(ipa[3]) - parseInt(ipb[3]);
};

QxCompare.byZIndex = function(a, b) {
  return a.getZIndex() - b.getZIndex();
};
