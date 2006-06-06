/* ************************************************************************

   qooxdoo - the new era of web development

   Copyright:
     2004-2006 by Schlund + Partner AG, Germany
     All rights reserved

   License:
     LGPL 2.1: http://creativecommons.org/licenses/LGPL/2.1/

   Internet:
     * http://qooxdoo.org

   Authors:
     * Sebastian Werner (wpbasti)
       <sw at schlund dot de>
     * Andreas Ecker (ecker)
       <ae at schlund dot de>

************************************************************************ */

/* ************************************************************************

#package(image)

************************************************************************ */

/*!
  This singleton manage all qx.io.image.ImagePreloader instances.
*/
qx.OO.defineClass("qx.manager.object.ImagePreloaderManager", qx.manager.object.ObjectManager, 
function() {
  qx.manager.object.ObjectManager.call(this);
});





/*
---------------------------------------------------------------------------
  METHODS
---------------------------------------------------------------------------
*/

qx.Proto.add = function(vObject) {
  this._objects[vObject.getUri()] = vObject;
};

qx.Proto.remove = function(vObject) {
  delete this._objects[vObject.getUri()];
};

qx.Proto.has = function(vSource) {
  return this._objects[vSource] != null;
};

qx.Proto.get = function(vSource) {
  return this._objects[vSource];
};

qx.Proto.create = function(vSource)
{
  if (this._objects[vSource]) {
    return this._objects[vSource];
  };

  return new qx.io.image.ImagePreloader(vSource);
};






/*
---------------------------------------------------------------------------
  SINGLETON INSTANCE
---------------------------------------------------------------------------
*/

qx.manager.object.ImagePreloaderManager = new qx.manager.object.ImagePreloaderManager;
