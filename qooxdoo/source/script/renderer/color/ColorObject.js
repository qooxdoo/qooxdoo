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

#package(color)

************************************************************************ */

qx.OO.defineClass("qx.renderer.color.ColorObject", qx.renderer.color.Color, 
function(vValue)
{
  // this.debug("Value: " + vValue);
  this.setValue(vValue);

  if(qx.manager.object.ColorManager.has(this._value)) {
    return qx.manager.object.ColorManager.get(this._value);
  };

  qx.core.Object.call(this);

  // Register this color object to manager instance
  qx.manager.object.ColorManager.add(this);

  // Here will all objects with a dependency to this
  // color stored.
  this._dependentObjects = {};
});




/*
---------------------------------------------------------------------------
  UTILITY
---------------------------------------------------------------------------
*/

qx.renderer.color.ColorObject.fromString = function(vDefString) {
  return new qx.renderer.color.ColorObject(vDefString);
};




/*
---------------------------------------------------------------------------
  PUBLIC METHODS
---------------------------------------------------------------------------
*/

/*!
  Set a new value from selected theme (only for Operating System Colors)
*/
qx.Proto._updateTheme = function(vTheme)
{
  if (!this._isThemedColor) {
    throw new Error("Could not redefine themed value of non os colors!");
  };

  this._applyThemedValue();

  for (i in this._dependentObjects) {
    this._dependentObjects[i]._updateColors(this, this._style);
  };
};

qx.Proto._applyThemedValue = function()
{
  var vTheme = qx.manager.object.ColorManager.getThemeObject();
  var vRgb = vTheme.getValueByName(this._value);

  if (vRgb)
  {
    this._red = vRgb[0];
    this._green = vRgb[1];
    this._blue = vRgb[2];
  };

  this._style = vTheme.getStyleByName(this._value);
  this._hex = null;
};

qx.Proto.setValue = function(vValue) {
  this._normalize(vValue);
};





/*
---------------------------------------------------------------------------
  OBJECT MANAGMENT
---------------------------------------------------------------------------
*/

qx.Proto.add = function(vObject) {
  this._dependentObjects[vObject.toHashCode()] = vObject;
};

qx.Proto.remove = function(vObject) {
  delete this._dependentObjects[vObject.toHashCode()];
};






/*
---------------------------------------------------------------------------
  DISPOSER
---------------------------------------------------------------------------
*/

qx.Proto.dispose = function()
{
  if (this.getDisposed()) {
    return true;
  };

  if (this._dependentObjects)
  {
    for (var i in this._dependentObjects) {
      delete this._dependentObjects[i];
    };

    delete this._dependentObjects;
  };

  return qx.renderer.color.Color.prototype.dispose.call(this);
};
