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
#require(QxConst)

************************************************************************ */





/*
---------------------------------------------------------------------------
  ADDITIONS FOR NUMBER
---------------------------------------------------------------------------
*/

Number.prototype.limit = function(vmin, vmax)
{
  if (vmax != null && typeof vmax === QxConst.TYPEOF_NUMBER && this > vmax)
  {
    return vmax;
  }
  else if (vmin != null && typeof vmin === QxConst.TYPEOF_NUMBER && this < vmin)
  {
    return vmin;
  }
  else
  {
    // Number is needed, otherwise a object will be returned
    return Number(this);
  };
};

Number.prototype.inRange = function(vmin, vmax) {
  return this >= vmin && this <= vmax;
};

Number.prototype.betweenRange = function(vmin, vmax) {
  return this > vmin && this < vmax;
};







/*
---------------------------------------------------------------------------
  ADDITIONS FOR ARRAY
---------------------------------------------------------------------------
*/

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






/*
---------------------------------------------------------------------------
  ADDITIONS FOR STRING
---------------------------------------------------------------------------
*/

String.prototype.contains = function(s) {
  return this.indexOf(s) != -1;
};

String.prototype.toFirstUp = function() {
  return this.charAt(0).toUpperCase() + this.substr(1);
};

String.prototype.toCamelCase = function()
{
  var vArr = this.split(QxConst.CORE_DASH), vLength = vArr.length;

  if(vLength == 1) {
    return vArr[0];
  };

  var vNew = this.indexOf(QxConst.CORE_DASH) == 0 ? vArr[0].charAt(0).toUpperCase() + vArr[0].substring(1) : vArr[0];

  for (var vPart, i=1; i<vLength; i++)
  {
    vPart = vArr[i];
    vNew += vPart.charAt(0).toUpperCase() + vPart.substring(1);
  };

  return vNew;
};

String.prototype.trimLeft = function() {
  return this.replace(/^\s+/, QxConst.CORE_EMPTY);
};

String.prototype.trimRight = function() {
  return this.replace(/\s+$/, QxConst.CORE_EMPTY);
};

String.prototype.trim = function() {
  return this.replace(/^\s+|\s+$/g, QxConst.CORE_EMPTY);
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
    if (QxUtil.isInvalid(sep)) {
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
    if (QxUtil.isInvalid(sep)) {
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

String.prototype.stripTags = function() {
  return this.replace(/<\/?[^>]+>/gi, QxConst.CORE_EMPTY);
};

String.prototype.normalizeUmlautsLong = function() {
  return QxUtil.normalizeUmlautsLong(this);
};

String.prototype.normalizeUmlautsShort = function() {
  return QxUtil.normalizeUmlautsShort(this);
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






/*
---------------------------------------------------------------------------
  ADDITIONS FOR FUNCTION
---------------------------------------------------------------------------
*/

/*!
  Greatly developed by: http://laurens.vd.oever.nl/weblog/items2005/closures/
  Relicensed under LGPL for qooxdoo.
*/
Function.prototype.closure = function(obj)
{
  // Init object storage.
  if (!window.__objs)
  {
    window.__objs = [];
    window.__funs = [];
  };

  // For symmetry and clarity.
  var fun = this;

  // Make sure the object has an id and is stored in the object store.
  var objId = obj.__objId;
  if (!objId) {
    __objs[objId = obj.__objId = __objs.length] = obj;
  };

  // Make sure the function has an id and is stored in the function store.
  var funId = fun.__funId;
  if (!funId) {
    __funs[funId = fun.__funId = __funs.length] = fun;
  };

  // Init closure storage.
  if (!obj.__closures) {
    obj.__closures = [];
  };

  // See if we previously created a closure for this object/function pair.
  var closure = obj.__closures[funId];
  if (closure) {
    return closure;
  };

  // Clear references to keep them out of the closure scope.
  obj = null;
  fun = null;

  // Create the closure, store in cache and return result.
  return __objs[objId].__closures[funId] = function () {
    return __funs[funId].apply(__objs[objId], arguments);
  };
};

/*
  TODO
  Testing, by prototype.js
  Is this really leak-free?
*/
/*
Function.prototype.bind = function() {
  var __method = this, args = $A(arguments), object = args.shift();
  return function() {
    return __method.apply(object, args.concat($A(arguments)));
  };
};
*/

// impliment function apply for browsers which don't support it natively
if (!Function.prototype.apply)
{
  Function.prototype.apply = function(oScope, args)
  {
    var sarg = [];
    var rtrn, call;

    if (!oScope) {
      oScope = window;
    };

    if (!args) {
      args = [];
    };

    for (var i = 0; i < args.length; i++) {
      sarg[i] = "args["+i+"]";
    };

    call = "oScope._applyTemp_(" + sarg.join(QxConst.CORE_COMMA) + ");";

    oScope._applyTemp_ = this;
    rtrn = eval(call);

    delete oScope._applyTemp_;

    return rtrn;
  };
};






/*
---------------------------------------------------------------------------
  ADDITIONS FOR ERROR
---------------------------------------------------------------------------
*/

if (!Error.prototype.toString)
{
  Error.prototype.toString = function() {
    return this.message;
  };
};






/*
---------------------------------------------------------------------------
  JAVASCRIPT 1.6 GENERICS
---------------------------------------------------------------------------
*/

// Copyright 2006 Erik Arvidsson
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// http://erik.eae.net/archives/2006/02/28/00.39.52/

// Relicensed under LGPL for qooxdoo.

// hide from global scope
(function() {

// Make generic versions of instance methods
var makeGeneric = [
{
  object: Array,
  methods:
  [
    "join",
    "reverse",
    "sort",
    "push",
    "pop",
    "shift",
    "unshift",
    "splice",
    "concat",
    "slice",
    "indexOf",
    "lastIndexOf",
    "forEach",
    "map",
    "filter",
    "some",
    "every"
  ]
},
{
  object: String,
  methods:
  [
    "quote",
    "substring",
    "toLowerCase",
    "toUpperCase",
    "charAt",
    "charCodeAt",
    "indexOf",
    "lastIndexOf",
    "toLocaleLowerCase",
    "toLocaleUpperCase",
    "localeCompare",
    "match",
    "search",
    "replace",
    "split",
    "substr",
    "concat",
    "slice"
  ]
}];

for (var i=0, l=makeGeneric.length; i<l; i++)
{
  var constr = makeGeneric[i].object;
  var methods = makeGeneric[i].methods;

  for (var j=0; j<methods.length; j++)
  {
    var name = methods[j];

    if (!constr[name])
    {
      constr[methods[j]] = function(constr, name)
      {
        return function(s)
        {
          var args = Array.prototype.slice.call(arguments, 1);
          return constr.prototype[name].apply(s, args);
        };
      }(constr, name);
    };
  };
};

// hide from global scope
})();
