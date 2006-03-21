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

#package(font)

************************************************************************ */

function QxFontObject(vSize, vName)
{
  this._dependentObjects = {};

  QxFont.call(this, vSize, vName);
};

QxFontObject.extend(QxFont, "QxFontObject");




/*
---------------------------------------------------------------------------
  WIDGET CONNECTION
---------------------------------------------------------------------------
*/

proto.addListenerWidget = function(o) {
  this._dependentObjects[o.toHashCode()] = o;
};

proto.removeListenerWidget = function(o) {
  delete this._dependentObjects[o.toHashCode()];
};

proto._sync = function(vEdge)
{
  var vAll = this._dependentObjects;
  var vCurrent;

  for (vKey in vAll)
  {
    vCurrent = vAll[vKey];

    if (vCurrent.isCreated()) {
      vCurrent._updateFont(vEdge);
    };
  };
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

  if (typeof this._dependentObjects === QxConst.TYPEOF_OBJECT)
  {
    for (vKey in this._dependentObjects) {
      delete this._dependentObjects[vKey];
    };

    delete this._dependentObjects;
  };

  return QxFont.prototype.dispose.call(this);
};
