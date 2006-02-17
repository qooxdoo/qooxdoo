/* ****************************************************************************

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

**************************************************************************** */

/* ****************************************************************************

#package(core)

**************************************************************************** */

QxUtil = {};




/* ********************************************************************
   Simple return methods
******************************************************************** */

QxUtil.returnTrue = function() {
  return true;
};

QxUtil.returnFalse = function() {
  return false;
};

QxUtil.returnNull = function() {
  return null;
};

QxUtil.returnThis = function() {
  return this;
};

QxUtil.returnZero = function() {
  return 0;
};

QxUtil.returnNegativeIndex = function() {
  return -1;
};






/* ********************************************************************
   Utility Methods
******************************************************************** */

/*
  Function to check if a hash has any keys
*/
QxUtil.isObjectEmpty = function(h)
{
  for (var s in h) {
    return false;
  };

  return true;
};

QxUtil.isObjectMinLength = function(h, j)
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

QxUtil.getObjectLength = function(h)
{
  var i=0;

  for (var s in h) {
    i++;
  };

  return i;
};

QxUtil.convertObjectToString = function(h) {
  return QxUtil.convertObjectToArray(h).join(", ");
};

QxUtil.convertObjectToArray = function(h)
{
  var r = [];
  for (var s in h) {
    r.push(s);
  };

  return r;
};

QxUtil.convertArgumentsToArray = function(a)
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
QxUtil.convertShortHandToArray = function(params)
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

    if (QxUtil.isValidNumber(v))
    {
      list.push(v);
    }
    else if (QxUtil.isInvalidString(v))
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





/* ********************************************************************
   Value validation methods
******************************************************************** */

/*
  All methods use the strict comparison operators as all modern
  browsers (needs support for JavaScript 1.3) seems to support this.

  http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Operators:Comparison_Operators
*/

QxUtil.isValid = function(v)
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

QxUtil.isInvalid = function(v)
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

QxUtil.isValidNumber = function(v) {
  return typeof v === QxConst.TYPEOF_NUMBER && !isNaN(v);
};

QxUtil.isInvalidNumber = function(v) {
  return typeof v !== QxConst.TYPEOF_NUMBER || isNaN(v);
};

QxUtil.isValidString = function(v) {
  return typeof v === QxConst.TYPEOF_STRING && v !== QxConst.CORE_EMPTY;
};

QxUtil.isInvalidString = function(v) {
  return typeof v !== QxConst.TYPEOF_STRING || v === QxConst.CORE_EMPTY;
};

QxUtil.isValidArray = function(v) {
  return typeof v === QxConst.TYPEOF_OBJECT && v !== null && v instanceof Array;
};

QxUtil.isInvalidArray = function(v) {
  return typeof v !== QxConst.TYPEOF_OBJECT || v === null || !(v instanceof Array);
};

QxUtil.isValidObject = function(v) {
  return typeof v === QxConst.TYPEOF_OBJECT && v !== null && !(v instanceof Array);
};

QxUtil.isInvalidObject = function(v) {
  return typeof v !== QxConst.TYPEOF_OBJECT || v === null || v instanceof Array;
};

QxUtil.isValidFunction = function(v) {
  return typeof v === QxConst.TYPEOF_FUNCTION;
};

QxUtil.isInvalidFunction = function(v) {
  return typeof v !== QxConst.TYPEOF_FUNCTION;
};

QxUtil.isValidBoolean = function(v) {
  return typeof v === QxConst.TYPEOF_BOOLEAN;
};

QxUtil.isInvalidBoolean = function(v) {
  return typeof v !== QxConst.TYPEOF_BOOLEAN;
};

QxUtil.isValidStringOrNumber = function(v)
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

QxUtil.isInvalidStringOrNumber = function(v)
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

/* ********************************************************************
   Component layout methods
******************************************************************** */

QxUtil.centerToBrowser = function(vComponent)
{
  var d = window.application.getClientWindow().getClientDocument();

  vComponent.setLeft((d.getClientWidth() / 2) - (vComponent.getBoxWidth() / 2));
  vComponent.setTop((d.getClientHeight() / 2) - (vComponent.getBoxHeight() / 2));
};