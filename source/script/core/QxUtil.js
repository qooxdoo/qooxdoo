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

/*
---------------------------------------------------------------------------
  SIMPLE RETURN METHODS
---------------------------------------------------------------------------
*/

qx.util.Return.returnTrue = function() {
  return true;
};

qx.util.Return.returnFalse = function() {
  return false;
};

qx.util.Return.returnNull = function() {
  return null;
};

qx.util.Return.returnThis = function() {
  return this;
};

qx.util.Return.returnZero = function() {
  return 0;
};

qx.util.Return.returnNegativeIndex = function() {
  return -1;
};







/*
---------------------------------------------------------------------------
  OBJECT UTILITIES
---------------------------------------------------------------------------
*/

/*
  Function to check if a hash has any keys
*/
qx.lang.Object.isEmpty = function(h)
{
  for (var s in h) {
    return false;
  };

  return true;
};

qx.lang.Object.hasMinLength = function(h, j)
{
  var i=0;

  for (var s in h)
  {
    if ((++i)>=j) {
      return true;
    };
  };

  return false;
};

qx.lang.Object.getLength = function(h)
{
  var i=0;

  for (var s in h) {
    i++;
  };

  return i;
};

qx.lang.Object.getKeys = function(h)
{
  var r = [];
  for (var s in h) {
    r.push(s);
  };

  return r;
};

qx.lang.Object.getKeysAsString = function(h) {
  return qx.lang.Object.getKeys(h).join(", ");
};

qx.lang.Object.getValues = function(h)
{
  var r = [];
  for (var s in h) {
    r.push(h[s]);
  };

  return r;
};

qx.lang.Array.fromArguments = function(a)
{
  var b = [];
  for (var i=0, l=a.length; i<l; i++) {
    b.push(a[i]);
  };

  return b;
};

/*
  Utility function for padding/margin and all other shorthand handling.
*/
qx.lang.Array.fromShortHand = function(params)
{
  var l = params.length;

  if (l > 4) {
    throw new Error("Invalid number of arguments!");
  };

  var v;
  var list = [];

  for (var i=0; i<l; i++)
  {
    v = params[i];

    if (qx.util.Validation.isValidNumber(v))
    {
      list.push(v);
    }
    else if (qx.util.Validation.isInvalidString(v))
    {
      list.push(null);
    }
    else
    {
      throw new Error("Invalid shorthand value: " + v);
    };
  };

  // Fix Values (Shorthand)
  switch(l)
  {
    case 1:
      list[1] = list[2] = list[3] = list[0];
      break;

    case 2:
      list[2] = list[0];

    case 3:
      list[3] = list[1];
  };

  return list;
};

qx.lang.Object.mergeWith = function(vObjectA, vObjectB)
{
  for (var vKey in vObjectB) {
    vObjectA[vKey] = vObjectB[vKey];
  };

  return vObjectA;
};

qx.lang.Object.merge = function(vObjectA)
{
  var vLength = arguments.length;

  for (var i=1; i<vLength; i++) {
    qx.lang.Object.mergeWith(vObjectA, arguments[i]);
  };

  return vObjectA;
};

qx.lang.Object.copy = function(vObject) {
  return qx.lang.Object.mergeWith({}, vObject);
};






/*
---------------------------------------------------------------------------
  VALUE VALIDATION
---------------------------------------------------------------------------
*/

/*
  All methods use the strict comparison operators as all modern
  browsers (needs support for JavaScript 1.3) seems to support this.

  http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Operators:Comparison_Operators
*/

qx.util.Validation.isValid = function(v)
{
  switch(typeof v)
  {
    case QxConst.TYPEOF_UNDEFINED:
      return false;

    case QxConst.TYPEOF_OBJECT:
      return v !== null;

    case QxConst.TYPEOF_STRING:
      return v !== QxConst.CORE_EMPTY;

    case QxConst.TYPEOF_NUMBER:
      return !isNaN(v);

    case QxConst.TYPEOF_FUNCTION:
    case QxConst.TYPEOF_BOOLEAN:
      return true;
  };

  return false;
};

qx.util.Validation.isInvalid = function(v)
{
  switch(typeof v)
  {
    case QxConst.TYPEOF_UNDEFINED:
      return true;

    case QxConst.TYPEOF_OBJECT:
      return v === null;

    case QxConst.TYPEOF_STRING:
      return v === QxConst.CORE_EMPTY;

    case QxConst.TYPEOF_NUMBER:
      return isNaN(v);

    case QxConst.TYPEOF_FUNCTION:
    case QxConst.TYPEOF_BOOLEAN:
      return false;
  };

  return true;
};

qx.util.Validation.isValidNumber = function(v) {
  return typeof v === QxConst.TYPEOF_NUMBER && !isNaN(v);
};

qx.util.Validation.isInvalidNumber = function(v) {
  return typeof v !== QxConst.TYPEOF_NUMBER || isNaN(v);
};

qx.util.Validation.isValidString = function(v) {
  return typeof v === QxConst.TYPEOF_STRING && v !== QxConst.CORE_EMPTY;
};

qx.util.Validation.isInvalidString = function(v) {
  return typeof v !== QxConst.TYPEOF_STRING || v === QxConst.CORE_EMPTY;
};

qx.util.Validation.isValidArray = function(v) {
  return typeof v === QxConst.TYPEOF_OBJECT && v !== null && v instanceof Array;
};

qx.util.Validation.isInvalidArray = function(v) {
  return typeof v !== QxConst.TYPEOF_OBJECT || v === null || !(v instanceof Array);
};

qx.util.Validation.isValidObject = function(v) {
  return typeof v === QxConst.TYPEOF_OBJECT && v !== null && !(v instanceof Array);
};

qx.util.Validation.isInvalidObject = function(v) {
  return typeof v !== QxConst.TYPEOF_OBJECT || v === null || v instanceof Array;
};

qx.util.Validation.isValidNode = function(v) {
  return typeof v === QxConst.TYPEOF_OBJECT && v !== null;
};

qx.util.Validation.isInvalidNode = function(v) {
  return typeof v !== QxConst.TYPEOF_OBJECT || v === null;
};

qx.util.Validation.isValidElement = function(v) {
  return typeof v === QxConst.TYPEOF_OBJECT && v !== null || v.nodeType !== 1;
};

qx.util.Validation.isInvalidElement = function(v) {
  return typeof v !== QxConst.TYPEOF_OBJECT || v === null || v.nodeType !== 1;
};

qx.util.Validation.isValidFunction = function(v) {
  return typeof v === QxConst.TYPEOF_FUNCTION;
};

qx.util.Validation.isInvalidFunction = function(v) {
  return typeof v !== QxConst.TYPEOF_FUNCTION;
};

qx.util.Validation.isValidBoolean = function(v) {
  return typeof v === QxConst.TYPEOF_BOOLEAN;
};

qx.util.Validation.isInvalidBoolean = function(v) {
  return typeof v !== QxConst.TYPEOF_BOOLEAN;
};

qx.util.Validation.isValidStringOrNumber = function(v)
{
  switch(typeof v)
  {
    case QxConst.TYPEOF_STRING:
      return v !== QxConst.CORE_EMPTY;

    case QxConst.TYPEOF_NUMBER:
      return !isNaN(v);
  };

  return false;
};

qx.util.Validation.isInvalidStringOrNumber = function(v)
{
  switch(typeof v)
  {
    case QxConst.TYPEOF_STRING:
      return v === QxConst.CORE_EMPTY;

    case QxConst.TYPEOF_NUMBER:
      return isNaN(v);
  };

  return false;
};







/*
---------------------------------------------------------------------------
  HANDLING OF UMLAUTS
---------------------------------------------------------------------------
*/

qx.util.Normalization._umlautsRegExp = /[\xE4\xF6\xFC\xDF\xC4\xD6\xDC]/g;

qx.util.Normalization._umlautsShortData = { "\xC4": "A", "\xD6": "O", "\xDC": "U", "\xE4": "a", "\xF6": "o", "\xFC": "u", "\xDF": "s" };

qx.util.Normalization._umlautsShort = function(vChar) {
  return qx.util.Normalization._umlautsShortData[vChar];
};

qx.util.Normalization.umlautsShort = function(vString) {
  return vString.replace(qx.util.Normalization._umlautsRegExp, qx.util.Normalization._umlautsShort);
};

qx.util.Normalization._umlautsLongData = { "\xC4": "Ae", "\xD6": "Oe", "\xDC": "Ue", "\xE4": "ae", "\xF6": "oe", "\xFC": "ue", "\xDF": "ss" };

qx.util.Normalization._umlautsLong = function(vChar) {
  return qx.util.Normalization._umlautsLongData[vChar];
};

qx.util.Normalization.umlautsLong = function(vString) {
  return vString.replace(qx.util.Normalization._umlautsRegExp, qx.util.Normalization._umlautsLong);
};
