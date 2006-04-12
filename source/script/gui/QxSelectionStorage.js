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

#package(selection)

************************************************************************ */

/*!
  Helper for qx.manager.selection.SelectionManager, contains data for selections
*/
qx.types.Selection = function(vManager)
{
  qx.core.Object.call(this);

  this._manager = vManager;
  this.removeAll();
};

qx.types.Selection.extend(qx.core.Object, "qx.types.Selection");





/*
---------------------------------------------------------------------------
  USER METHODS
---------------------------------------------------------------------------
*/

proto.add = function(oItem) {
  this._storage[this.getItemHashCode(oItem)] = oItem;
};

proto.remove = function(oItem) {
  delete this._storage[this.getItemHashCode(oItem)];
};

proto.removeAll = function() {
  this._storage = {};
};

proto.contains = function(oItem) {
  return this.getItemHashCode(oItem) in this._storage;
};

proto.toArray = function()
{
  var res = [];

  for (var key in this._storage) {
    res.push(this._storage[key]);
  };

  return res;
};

proto.getFirst = function()
{
  for (var key in this._storage) {
    return this._storage[key];
  };
};

proto.getChangeValue = function()
{
  var sb = [];

  for (var hc in this._storage) {
    sb.push(hc);
  };

  sb.sort();
  return sb.join(QxConst.CORE_SEMICOLON);
};

proto.getItemHashCode = function(oItem) {
  return this._manager.getItemHashCode(oItem);
};

proto.isEmpty = function() {
  return qx.lang.Object.isEmpty(this._storage);
};




/*
---------------------------------------------------------------------------
  DISPOSER
---------------------------------------------------------------------------
*/

proto.dispose = function()
{
  if (this.getDisposed()) {
    return;
  };

  this._storage = null;
  this._manager = null;

  qx.core.Object.prototype.dispose.call(this);
};