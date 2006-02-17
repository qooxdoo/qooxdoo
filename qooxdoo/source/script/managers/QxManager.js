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
  This is the core of all Qx*Manager objects. Allowes basic managment of assigned objects.
*/
function QxManager()
{
  QxTarget.call(this);

  this._objects = {};
};

QxManager.extend(QxTarget, "QxManager");





/*
---------------------------------------------------------------------------
  USER API
---------------------------------------------------------------------------
*/

proto.add = function(vObject)
{
  if (this.getDisposed()) {
    return;
  };

  this._objects[vObject.toHashCode()] = vObject;
  return true;
};

proto.remove = function(vObject)
{
  if (this.getDisposed()) {
    return;
  };

  delete this._objects[vObject.toHashCode()];
  return true;
};

proto.has = function(vObject) {
  return this._objects[vObject.toHashCode()] != null;
};

proto.get = function(vObject) {
  return this._objects[vObject.toHashCode()];
};

proto.getAll = function() {
  return this._objects;
};





/*
---------------------------------------------------------------------------
  DISPOSER
---------------------------------------------------------------------------
*/

proto.dispose = function()
{
  if(this.getDisposed()) {
    return;
  };

  if (this._objects)
  {
    for (var i in this._objects) {
      delete this._objects[i];
    };

    delete this._objects;
  };

  return QxTarget.prototype.dispose.call(this);
};
