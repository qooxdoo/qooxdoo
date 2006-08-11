/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2006 by 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL 2.1: http://www.gnu.org/licenses/lgpl.html

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************


************************************************************************ */

qx.OO.defineClass("qx.lang.Core");


/*
---------------------------------------------------------------------------
  ADDITIONS FOR NATIVE ERROR OBJECT
---------------------------------------------------------------------------
*/

if (!Error.prototype.toString)
{
  Error.prototype.toString = function() {
    return this.message;
  }
}






/*
---------------------------------------------------------------------------
  ADDITIONS FOR NATIVE FUNCTION OBJECT
---------------------------------------------------------------------------
*/

/**
 * function apply for browsers that do not support it natively, e.g. IE 5.0
 * <p>
 * Based on code from youngpup.net licensed under
 * Creative Commons Attribution 2.0
 * </p>
 */
if (!Function.prototype.apply)
{
  Function.prototype.apply = function(oScope, args)
  {
    var sarg = [];
    var rtrn, call;

    if (!oScope) {
      oScope = window;
    }

    if (!args) {
      args = [];
    }

    for (var i = 0; i < args.length; i++) {
      sarg[i] = "args["+i+"]";
    }

    call = "oScope._applyTemp_(" + sarg.join(qx.constant.Core.COMMA) + ");";

    oScope._applyTemp_ = this;
    rtrn = eval(call);

    delete oScope._applyTemp_;

    return rtrn;
  }
}

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
  }

  // For symmetry and clarity.
  var fun = this;

  // Make sure the object has an id and is stored in the object store.
  var objId = obj.__objId;
  if (!objId) {
    __objs[objId = obj.__objId = __objs.length] = obj;
  }

  // Make sure the function has an id and is stored in the function store.
  var funId = fun.__funId;
  if (!funId) {
    __funs[funId = fun.__funId = __funs.length] = fun;
  }

  // Init closure storage.
  if (!obj.__closures) {
    obj.__closures = [];
  }

  // See if we previously created a closure for this object/function pair.
  var closure = obj.__closures[funId];
  if (closure) {
    return closure;
  }

  // Clear references to keep them out of the closure scope.
  obj = null;
  fun = null;

  // Create the closure, store in cache and return result.
  return __objs[objId].__closures[funId] = function () {
    return __funs[funId].apply(__objs[objId], arguments);
  }
}

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
  }
}
*/





/*
---------------------------------------------------------------------------
  ADDITIONS FOR NATIVE ARRAY OBJECT
---------------------------------------------------------------------------
*/

// Add all JavaScript 1.5 Features if they are missing

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
    }

    for (var i=fromIndex; i<this.length; i++) {
      if (this[i] === obj) {
        return i;
      }
    }

    return -1;
  }
}

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
    }

    for (var i=fromIndex; i>=0; i--) {
      if (this[i] === obj) {
        return i;
      }
    }

    return -1;
  }
}

// http://developer-test.mozilla.org/docs/Core_JavaScript_1.5_Reference:Objects:Array:forEach
if (!Array.prototype.forEach)
{
  Array.prototype.forEach = function(f, obj)
  {
    // 'l' must be fixed during loop... see docs
    for (var i=0, l=this.length; i<l; i++) {
      f.call(obj, this[i], i, this);
    }
  }
}

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
      }
    }

    return res;
  }
}

// http://developer-test.mozilla.org/docs/Core_JavaScript_1.5_Reference:Objects:Array:map
if (!Array.prototype.map)
{
  Array.prototype.map = function(f, obj)
  {
    var l = this.length;  // must be fixed during loop... see docs
    var res = [];

    for (var i=0; i<l; i++) {
      res.push(f.call(obj, this[i], i, this));
    }

    return res;
  }
}

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
      }
    }

    return false;
  }
}

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
      }
    }

    return true;
  }
}
