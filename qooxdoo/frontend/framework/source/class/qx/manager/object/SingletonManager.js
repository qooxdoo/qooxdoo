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

qx.Proto.add = function(vConstructor) {
  this._objects.push(vConstructor);
}

qx.Proto.flush = function()
{
  var vConstructor, vClassName, vSplit, vBasename, vNamespace;
  var vStart = (new Date).valueOf();

  for (var i=0, a=this._objects, il=a.length; i<il; i++)
  {
    vConstructor = this._objects[i];
    vClassName = vConstructor.classname;

    vSplit = vClassName.split(qx.constant.Core.DOT);
    vBasename = vSplit.pop();
    vNamespace = window;

    for (var j=0, jl=vSplit.length; j<jl; j++) {
      vNamespace = vNamespace[vSplit[j]];
    }

    vNamespace[vBasename] = new vConstructor;
  }

  this._objects = [];

  // Print runtime
  this.debug("Created " + il + " singletons in " + ((new Date).valueOf() - vStart) + "ms.");
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
  DIRECT SINGLETON INSTANCE
---------------------------------------------------------------------------
*/

/**
 * Singleton Instance Getter
 */
qx.Class.getInstance = function() {
  return this._instance;
}

qx.manager.object.SingletonManager._instance = new qx.manager.object.SingletonManager;
