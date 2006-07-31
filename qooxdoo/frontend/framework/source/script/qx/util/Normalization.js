/* ************************************************************************

   qooxdoo - the new era of web development

   Copyright:
     2004-2006 by 1&1 Internet AG, Germany
     http://www.1und1.de | http://www.1and1.com
     All rights reserved

   License:
     LGPL 2.1: http://creativecommons.org/licenses/LGPL/2.1/

   Internet:
     * http://qooxdoo.org

   Authors:
     * Sebastian Werner (wpbasti)
       <sebastian dot werner at 1und1 dot de>
     * Andreas Ecker (ecker)
       <andreas dot ecker at 1und1 dot de>

************************************************************************ */

/* ************************************************************************

#module(core)

************************************************************************ */

qx.OO.defineClass("qx.util.Normalization");





/*
---------------------------------------------------------------------------
  HANDLING OF UMLAUTS
---------------------------------------------------------------------------
*/

qx.util.Normalization._umlautsRegExp = /[\xE4\xF6\xFC\xDF\xC4\xD6\xDC]/g;

qx.util.Normalization._umlautsShortData = { "\xC4": "A", "\xD6": "O", "\xDC": "U", "\xE4": "a", "\xF6": "o", "\xFC": "u", "\xDF": "s" }

qx.util.Normalization._umlautsShort = function(vChar) {
  return qx.util.Normalization._umlautsShortData[vChar];
}

qx.util.Normalization.umlautsShort = function(vString) {
  return vString.replace(qx.util.Normalization._umlautsRegExp, qx.util.Normalization._umlautsShort);
}

qx.util.Normalization._umlautsLongData = { "\xC4": "Ae", "\xD6": "Oe", "\xDC": "Ue", "\xE4": "ae", "\xF6": "oe", "\xFC": "ue", "\xDF": "ss" }

qx.util.Normalization._umlautsLong = function(vChar) {
  return qx.util.Normalization._umlautsLongData[vChar];
}

qx.util.Normalization.umlautsLong = function(vString) {
  return vString.replace(qx.util.Normalization._umlautsRegExp, qx.util.Normalization._umlautsLong);
}
