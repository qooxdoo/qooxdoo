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
