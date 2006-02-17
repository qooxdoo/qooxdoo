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

#package(image)

************************************************************************ */

/*!
  This singleton manage all QxImagePreloader instances.
*/
function QxImagePreloaderManager() {
  QxManager.call(this);
};

QxImagePreloaderManager.extend(QxManager, "QxImagePreloaderManager");





/*
---------------------------------------------------------------------------
  METHODS
---------------------------------------------------------------------------
*/

proto.add = function(vObject) {
  this._objects[vObject.getUri()] = vObject;
};

proto.remove = function(vObject) {
  delete this._objects[vObject.getUri()];
};

proto.has = function(vSource) {
  return this._objects[vSource] != null;
};

proto.get = function(vSource) {
  return this._objects[vSource];
};

proto.create = function(vSource)
{
  if (this._objects[vSource]) {
    return this._objects[vSource];
  };

  return new QxImagePreloader(vSource);
};






/*
---------------------------------------------------------------------------
  SINGLETON INSTANCE
---------------------------------------------------------------------------
*/

QxImagePreloaderManager = new QxImagePreloaderManager;
