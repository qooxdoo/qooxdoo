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
