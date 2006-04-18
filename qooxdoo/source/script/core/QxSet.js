/* ************************************************************************

   qooxdoo - the new era of web interface development
   -------------------------------------------------------------------------

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

function QxSet()
{
  QxObject.call(this);

  this._storage = {};
};

QxSet.extend(QxObject, "QxSet");




/*
---------------------------------------------------------------------------
  USER API
---------------------------------------------------------------------------
*/

proto.add = function(o) {
  this._storage[QxObject.toHashCode(o)] = o;
};

proto.remove = function(o) {
  delete this._storage[QxObject.toHashCode(o)];
};

proto.contains = function(o) {
  return QxObject.toHashCode(o) in this._storage;
};

proto.clear = function() {
  this._storage = {};
};

proto.toArray = function()
{
  var res = [];

  for (var hc in this._storage) {
    res.push(this._storage[hc]);
  };

  return res;
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

  return QxObject.prototype.dispose.call(this);
};
