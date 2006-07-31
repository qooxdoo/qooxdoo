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

#module(core)

************************************************************************ */

/*!
  This singleton manage the instantiation of singletons
*/
qx.OO.defineClass("qx.manager.object.SingletonManager", qx.core.Target,
function() {
  qx.core.Target.call(this);

  this._objects = [];
});





/*
---------------------------------------------------------------------------
  METHODS
---------------------------------------------------------------------------
*/

qx.Proto.add = function(vNameSpace, vBaseName) {
  this._objects.push({ nameSpace : vNameSpace, baseName : vBaseName });
}

qx.Proto.flush = function()
{
  var vEntry;

  for (var i=0, a=this._objects, l=a.length; i<l; i++)
  {
    vEntry = this._objects[i];
    vEntry.nameSpace[vEntry.baseName] = new vEntry.nameSpace[vEntry.baseName];
  }

  this._objects = [];
}





/*
---------------------------------------------------------------------------
  DISPOSER
---------------------------------------------------------------------------
*/

qx.Proto.dispose = function()
{
  if (this.getDisposed()) {
    return;
  }

  this._objects = null;

  return qx.core.Target.prototype.dispose.call(this);
}




/*
---------------------------------------------------------------------------
  SINGLETON INSTANCE
---------------------------------------------------------------------------
*/

qx.manager.object.SingletonManager = new qx.manager.object.SingletonManager;
