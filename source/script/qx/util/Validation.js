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
#use(qx.constant.Type)
#use(qx.constant.Core)

************************************************************************ */

qx.OO.defineClass("qx.util.Validation");

/*
  All methods use the strict comparison operators as all modern
  browsers (needs support for JavaScript 1.3) seems to support this.

  http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Operators:Comparison_Operators
*/

qx.util.Validation.isValid = function(v)
{
  switch(typeof v)
  {
    case qx.constant.Type.UNDEFINED:
      return false;

    case qx.constant.Type.OBJECT:
      return v !== null;

    case qx.constant.Type.STRING:
      return v !== qx.constant.Core.EMPTY;

    case qx.constant.Type.NUMBER:
      return !isNaN(v);

    case qx.constant.Type.FUNCTION:
    case qx.constant.Type.BOOLEAN:
      return true;
  }

  return false;
}

qx.util.Validation.isInvalid = function(v)
{
  switch(typeof v)
  {
    case qx.constant.Type.UNDEFINED:
      return true;

    case qx.constant.Type.OBJECT:
      return v === null;

    case qx.constant.Type.STRING:
      return v === qx.constant.Core.EMPTY;

    case qx.constant.Type.NUMBER:
      return isNaN(v);

    case qx.constant.Type.FUNCTION:
    case qx.constant.Type.BOOLEAN:
      return false;
  }

  return true;
}

qx.util.Validation.isValidNumber = function(v) {
  return typeof v === qx.constant.Type.NUMBER && !isNaN(v);
}

qx.util.Validation.isInvalidNumber = function(v) {
  return typeof v !== qx.constant.Type.NUMBER || isNaN(v);
}

qx.util.Validation.isValidString = function(v) {
  return typeof v === qx.constant.Type.STRING && v !== qx.constant.Core.EMPTY;
}

qx.util.Validation.isInvalidString = function(v) {
  return typeof v !== qx.constant.Type.STRING || v === qx.constant.Core.EMPTY;
}

qx.util.Validation.isValidArray = function(v) {
  return typeof v === qx.constant.Type.OBJECT && v !== null && v instanceof Array;
}

qx.util.Validation.isInvalidArray = function(v) {
  return typeof v !== qx.constant.Type.OBJECT || v === null || !(v instanceof Array);
}

qx.util.Validation.isValidObject = function(v) {
  return typeof v === qx.constant.Type.OBJECT && v !== null && !(v instanceof Array);
}

qx.util.Validation.isInvalidObject = function(v) {
  return typeof v !== qx.constant.Type.OBJECT || v === null || v instanceof Array;
}

qx.util.Validation.isValidNode = function(v) {
  return typeof v === qx.constant.Type.OBJECT && v !== null;
}

qx.util.Validation.isInvalidNode = function(v) {
  return typeof v !== qx.constant.Type.OBJECT || v === null;
}

qx.util.Validation.isValidElement = function(v) {
  return typeof v === qx.constant.Type.OBJECT && v !== null || v.nodeType !== 1;
}

qx.util.Validation.isInvalidElement = function(v) {
  return typeof v !== qx.constant.Type.OBJECT || v === null || v.nodeType !== 1;
}

qx.util.Validation.isValidFunction = function(v) {
  return typeof v === qx.constant.Type.FUNCTION;
}

qx.util.Validation.isInvalidFunction = function(v) {
  return typeof v !== qx.constant.Type.FUNCTION;
}

qx.util.Validation.isValidBoolean = function(v) {
  return typeof v === qx.constant.Type.BOOLEAN;
}

qx.util.Validation.isInvalidBoolean = function(v) {
  return typeof v !== qx.constant.Type.BOOLEAN;
}

qx.util.Validation.isValidStringOrNumber = function(v)
{
  switch(typeof v)
  {
    case qx.constant.Type.STRING:
      return v !== qx.constant.Core.EMPTY;

    case qx.constant.Type.NUMBER:
      return !isNaN(v);
  }

  return false;
}

qx.util.Validation.isInvalidStringOrNumber = function(v)
{
  switch(typeof v)
  {
    case qx.constant.Type.STRING:
      return v === qx.constant.Core.EMPTY;

    case qx.constant.Type.NUMBER:
      return isNaN(v);
  }

  return false;
}
