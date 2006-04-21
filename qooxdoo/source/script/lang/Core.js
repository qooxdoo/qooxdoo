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
  ADDITIONS FOR NATIVE ERROR OBJECT
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
  ADDITIONS FOR NATIVE FUNCTION OBJECT
---------------------------------------------------------------------------
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
