/* ************************************************************************

   qooxdoo - the new era of web development

   Copyright:
     2004-2006 by 1&1 Internet AG, Germany
     http://www.1und1.de | http://www.1and1.com
     All rights reserved

   License:
     LGPL 2.1: http://creativecommons.org/licenses/LGPL/2.1/

   Internet:
     * http://qooxdoo.org

   Authors:
     * Sebastian Werner (wpbasti)
       <sebastian dot werner at 1und1 dot de>
     * Andreas Ecker (ecker)
       <andreas dot ecker at 1und1 dot de>

************************************************************************ */

/* ************************************************************************

#module(image)

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
}

qx.Proto.remove = function(vObject) {
  delete this._objects[vObject.getUri()];
}

qx.Proto.has = function(vSource) {
  return this._objects[vSource] != null;
}

qx.Proto.get = function(vSource) {
  return this._objects[vSource];
}

qx.Proto.create = function(vSource)
{
  if (this._objects[vSource]) {
    return this._objects[vSource];
  }

  return new qx.io.image.ImagePreloader(vSource);
}






/*
---------------------------------------------------------------------------
  SINGLETON INSTANCE
---------------------------------------------------------------------------
*/

qx.manager.object.ImagePreloaderManager = new qx.manager.object.ImagePreloaderManager;
