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
#require(qx.const)

************************************************************************ */

qx.lang.String = {};

qx.lang.String.toCamelCase = function(str)
{
  var vArr = str.split(QxConst.CORE_DASH), vLength = vArr.length;

  if(vLength == 1) {
    return vArr[0];
  };

  var vNew = str.indexOf(QxConst.CORE_DASH) == 0 ? vArr[0].charAt(0).toUpperCase() + vArr[0].substring(1) : vArr[0];

  for (var vPart, i=1; i<vLength; i++)
  {
    vPart = vArr[i];
    vNew += vPart.charAt(0).toUpperCase() + vPart.substring(1);
  };

  return vNew;
};

qx.lang.String.trimLeft = function(str) {
  return str.replace(/^\s+/, QxConst.CORE_EMPTY);
};

qx.lang.String.trimRight = function(str) {
  return str.replace(/\s+$/, QxConst.CORE_EMPTY);
};

qx.lang.String.trim = function(str) {
  return str.replace(/^\s+|\s+$/g, QxConst.CORE_EMPTY);
};

qx.lang.String.stripTags = function(str) {
  return str.replace(/<\/?[^>]+>/gi, QxConst.CORE_EMPTY);
};









String.prototype.startsWith = function(str) {
  return !this.indexOf(str);
};

String.prototype.endsWith = function(str) {
  return this.lastIndexOf(str) === this.length-str.length;
};

String.prototype.pad = function(length, ch)
{
  if (typeof ch === QxConst.TYPEOF_UNDEFINED) {
    ch = QxConst.CORE_ZERO;
  };

  var temp = QxConst.CORE_EMPTY;

  for (var i=length, l=this.length; l<i; l++) {
    temp += ch;
  };

  return temp + this;
};







// TODO: Most complex ones

String.prototype.toFirstUp = function() {
  return this.charAt(0).toUpperCase() + this.substr(1);
};

String.prototype.contains = function(s) {
  return this.indexOf(s) != -1;
};

String.prototype.add = function(v, sep)
{
  if (this == v)
  {
    return this;
  }
  else if (this == QxConst.CORE_EMPTY)
  {
    return v;
  }
  else
  {
    if (qx.util.Validation.isInvalid(sep)) {
      sep = QxConst.CORE_COMMA;
    };

    var a = this.split(sep);

    if (a.indexOf(v) == -1)
    {
      a.push(v);
      return a.join(sep);
    }
    else
    {
      return this;
    };
  };
};

String.prototype.remove = function(v, sep)
{
  if (this == v || this == QxConst.CORE_EMPTY)
  {
    return QxConst.CORE_EMPTY;
  }
  else
  {
    if (qx.util.Validation.isInvalid(sep)) {
      sep = QxConst.CORE_COMMA;
    };

    var a = this.split(sep);
    var p = a.indexOf(v);

    if (p==-1) {
      return this;
    };

    do { a.splice(p, 1); }
    while((p = a.indexOf(v)) != -1);

    return a.join(sep);
  };
};
