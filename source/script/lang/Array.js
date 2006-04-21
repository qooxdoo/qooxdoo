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








// Some of them from Erik Arvidsson <http://erik.eae.net/>
// More documentation could be found here:
// http://www.webreference.com/programming/javascript/ncz/column4/
// An alternative implementation can be found here:
// http://www.nczonline.net/archive/2005/7/231

// Mozilla 1.8 has support for indexOf, lastIndexOf, forEach, filter, map, some, every
// http://developer-test.mozilla.org/docs/Core_JavaScript_1.5_Reference:Objects:Array:lastIndexOf
if (!Array.prototype.indexOf)
{
  Array.prototype.indexOf = function(obj, fromIndex)
  {
    if (fromIndex == null)
    {
      fromIndex = 0;
    }
    else if (fromIndex < 0)
    {
      fromIndex = Math.max(0, this.length + fromIndex);
    };

    for (var i=fromIndex; i<this.length; i++) {
      if (this[i] === obj) {
        return i;
      };
    };

    return -1;
  };
};

// http://developer-test.mozilla.org/docs/Core_JavaScript_1.5_Reference:Objects:Array:lastIndexOf
if (!Array.prototype.lastIndexOf)
{
  Array.prototype.lastIndexOf = function(obj, fromIndex)
  {
    if (fromIndex == null)
    {
      fromIndex = this.length-1;
    }
    else if (fromIndex < 0)
    {
      fromIndex = Math.max(0, this.length + fromIndex);
    };

    for (var i=fromIndex; i>=0; i--) {
      if (this[i] === obj) {
        return i;
      };
    };

    return -1;
  };
};

// http://developer-test.mozilla.org/docs/Core_JavaScript_1.5_Reference:Objects:Array:forEach
if (!Array.prototype.forEach)
{
  Array.prototype.forEach = function(f, obj)
  {
    // 'l' must be fixed during loop... see docs
    for (var i=0, l=this.length; i<l; i++) {
      f.call(obj, this[i], i, this);
    };
  };
};

if (!Array.prototype.forEachObject)
{
  Array.prototype.forEachObject = function(f)
  {
    for (var i=0, l=this.length; i<l; i++) {
      f.call(this[i], this, i);
    };
  };
};

// http://developer-test.mozilla.org/docs/Core_JavaScript_1.5_Reference:Objects:Array:filter
if (!Array.prototype.filter)
{
  Array.prototype.filter = function(f, obj)
  {
    // must be fixed during loop... see docs
    var l = this.length;
    var res = [];

    for (var i=0; i<l; i++)
    {
      if (f.call(obj, this[i], i, this)) {
        res.push(this[i]);
      };
    };

    return res;
  };
};

// http://developer-test.mozilla.org/docs/Core_JavaScript_1.5_Reference:Objects:Array:map
if (!Array.prototype.map)
{
  Array.prototype.map = function(f, obj)
  {
    var l = this.length;  // must be fixed during loop... see docs
    var res = [];

    for (var i=0; i<l; i++) {
      res.push(f.call(obj, this[i], i, this));
    };

    return res;
  };
};

// http://developer-test.mozilla.org/docs/Core_JavaScript_1.5_Reference:Objects:Array:some
if (!Array.prototype.some)
{
  Array.prototype.some = function(f, obj)
  {
    var l = this.length;  // must be fixed during loop... see docs

    for (var i=0; i<l; i++)
    {
      if (f.call(obj, this[i], i, this)) {
        return true;
      };
    };

    return false;
  };
};

// http://developer-test.mozilla.org/docs/Core_JavaScript_1.5_Reference:Objects:Array:every
if (!Array.prototype.every)
{
  Array.prototype.every = function (f, obj)
  {
    var l = this.length;  // must be fixed during loop... see docs
    for (var i=0; i<l; i++)
    {
      if (!f.call(obj, this[i], i, this)) {
        return false;
      };
    };

    return true;
  };
};

Array.prototype.contains = function(obj) {
  return this.indexOf(obj) != -1;
};

Array.prototype.copy = function(obj) {
  return this.concat();
};

Array.prototype.clone = function(obj) {
  return this.concat();
};

Array.prototype.append = function(a) {
  Array.prototype.push.apply(this, a);
};

Array.prototype.insertAt = function(obj, i) {
  this.splice(i, 0, obj);
};

Array.prototype.insertBefore = function(obj, obj2)
{
  var i = this.indexOf(obj2);

  if (i == -1)
  {
    this.push(obj);
  }
  else
  {
    this.splice(i, 0, obj);
  };
};

Array.prototype.insertAfter = function(o, o2)
{
  var i = this.indexOf(o2);

  if (i == -1 || i == (this.length-1))
  {
    this.push(o);
  }
  else
  {
    this.splice(i+1, 0, o);
  };
};

Array.prototype.removeAt = function(i) {
  return this.splice(i, 1);
};

Array.prototype.remove = function(obj)
{
  var i = this.indexOf(obj);

  if (i != -1) {
    return this.splice(i, 1);
  };
};

Array.prototype.removeAll = function() {
  return this.splice(0, this.length);
};

Array.prototype.getLast = function() {
  return this[this.length-1];
};

Array.prototype.getFirst = function() {
  return this[0];
};
