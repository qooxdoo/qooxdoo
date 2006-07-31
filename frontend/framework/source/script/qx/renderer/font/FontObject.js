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

#module(font)

************************************************************************ */

qx.OO.defineClass("qx.renderer.font.FontObject", qx.renderer.font.Font, 
function(vSize, vName)
{
  this._dependentObjects = {}

  qx.renderer.font.Font.call(this, vSize, vName);
});




/*
---------------------------------------------------------------------------
  WIDGET CONNECTION
---------------------------------------------------------------------------
*/

qx.Proto.addListenerWidget = function(o) {
  this._dependentObjects[o.toHashCode()] = o;
}

qx.Proto.removeListenerWidget = function(o) {
  delete this._dependentObjects[o.toHashCode()];
}

qx.Proto._sync = function(vEdge)
{
  var vAll = this._dependentObjects;
  var vCurrent;

  for (vKey in vAll)
  {
    vCurrent = vAll[vKey];

    if (vCurrent.isCreated()) {
      vCurrent._updateFont(vEdge);
    }
  }
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

  if (typeof this._dependentObjects === qx.constant.Type.OBJECT)
  {
    for (vKey in this._dependentObjects) {
      delete this._dependentObjects[vKey];
    }

    delete this._dependentObjects;
  }

  return qx.renderer.font.Font.prototype.dispose.call(this);
}
