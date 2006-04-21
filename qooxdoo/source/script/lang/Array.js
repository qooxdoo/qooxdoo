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

qx.lang.Array = {};

qx.lang.Array.fromArguments = function(a)
{
  var b = [];
  for (var i=0, l=a.length; i<l; i++) {
    b.push(a[i]);
  };

  return b;
};

/*!
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

qx.lang.Array.copy = function(arr) {
  return arr.concat();
};

qx.lang.Array.clone = function(arr) {
  return arr.concat();
};

qx.lang.Array.getLast = function(arr) {
  return arr[arr.length-1];
};

qx.lang.Array.getFirst = function(arr) {
  return arr[0];
};

qx.lang.Array.insertAt = function(arr, obj, i)
{
  arr.splice(i, 0, obj);

  return arr;
};

qx.lang.Array.insertBefore = function(arr, obj, obj2)
{
  var i = arr.indexOf(obj2);

  if (i == -1)
  {
    arr.push(obj);
  }
  else
  {
    arr.splice(i, 0, obj);
  };

  return arr;
};

qx.lang.Array.insertAfter = function(arr, o, o2)
{
  var i = arr.indexOf(o2);

  if (i == -1 || i == (arr.length-1))
  {
    arr.push(o);
  }
  else
  {
    arr.splice(i+1, 0, o);
  };

  return arr;
};

qx.lang.Array.removeAt = function(arr, i) {
  return arr.splice(i, 1);
};

qx.lang.Array.removeAll = function(arr) {
  return arr.splice(0, arr.length);
};

qx.lang.Array.append = function(arr, a) {
  Array.prototype.push.apply(arr, a);
};





// TODO: Most complex ones

Array.prototype.contains = function(obj) {
  return this.indexOf(obj) != -1;
};

Array.prototype.remove = function(obj)
{
  var i = this.indexOf(obj);

  if (i != -1) {
    return this.splice(i, 1);
  };
};
