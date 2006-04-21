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

/*!
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
