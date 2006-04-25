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
#post(qx.Const)

************************************************************************ */

qx.OO.defineClass("qx.lang.String");

qx.lang.String.toCamelCase = function(str)
{
  var vArr = str.split(qx.Const.CORE_DASH), vLength = vArr.length;

  if(vLength == 1) {
    return vArr[0];
  };

  var vNew = str.indexOf(qx.Const.CORE_DASH) == 0 ? vArr[0].charAt(0).toUpperCase() + vArr[0].substring(1) : vArr[0];

  for (var vPart, i=1; i<vLength; i++)
  {
    vPart = vArr[i];
    vNew += vPart.charAt(0).toUpperCase() + vPart.substring(1);
  };

  return vNew;
};

qx.lang.String.trimLeft = function(str) {
  return str.replace(/^\s+/, qx.Const.CORE_EMPTY);
};

qx.lang.String.trimRight = function(str) {
  return str.replace(/\s+$/, qx.Const.CORE_EMPTY);
};

qx.lang.String.trim = function(str) {
  return str.replace(/^\s+|\s+$/g, qx.Const.CORE_EMPTY);
};

qx.lang.String.stripTags = function(str) {
  return str.replace(/<\/?[^>]+>/gi, qx.Const.CORE_EMPTY);
};

qx.lang.String.startsWith = function(fullstr, substr) {
  return !fullstr.indexOf(substr);
};

qx.lang.String.endsWith = function(fullstr, substr) {
  return fullstr.lastIndexOf(substr) === fullstr.length-substr.length;
};

qx.lang.String.pad = function(str, length, ch)
{
  if (typeof ch === qx.Const.TYPEOF_UNDEFINED) {
    ch = qx.Const.CORE_ZERO;
  };

  var temp = qx.Const.CORE_EMPTY;

  for (var i=length, l=str.length; l<i; l++) {
    temp += ch;
  };

  return temp + str;
};

qx.lang.String.toFirstUp = function(str) {
  return str.charAt(0).toUpperCase() + str.substr(1);
};

qx.lang.String.add = function(str, v, sep)
{
  if (str == v)
  {
    return str;
  }
  else if (str == qx.Const.CORE_EMPTY)
  {
    return v;
  }
  else
  {
    if (qx.util.Validation.isInvalid(sep)) {
      sep = qx.Const.CORE_COMMA;
    };

    var a = str.split(sep);

    if (a.indexOf(v) == -1)
    {
      a.push(v);
      return a.join(sep);
    }
    else
    {
      return str;
    };
  };
};

qx.lang.String.remove = function(str, v, sep)
{
  if (str == v || str == qx.Const.CORE_EMPTY)
  {
    return qx.Const.CORE_EMPTY;
  }
  else
  {
    if (qx.util.Validation.isInvalid(sep)) {
      sep = qx.Const.CORE_COMMA;
    };

    var a = str.split(sep);
    var p = a.indexOf(v);

    if (p === -1) {
      return str;
    };

    do { a.splice(p, 1); }
    while((p = a.indexOf(v)) != -1);

    return a.join(sep);
  };
};

qx.lang.String.contains = function(str, s) {
  return str.indexOf(s) != -1;
};
