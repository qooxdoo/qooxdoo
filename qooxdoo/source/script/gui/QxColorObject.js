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

function QxColorObject(vValue)
{
  // this.debug("Value: " + vValue);
  this.setValue(vValue);

  if(QxColorManager.has(this._value)) {
    return QxColorManager.get(this._value);
  };

  QxObject.call(this);

  // Register this color object to manager instance
  QxColorManager.add(this);

  // Here will all objects with a dependency to this
  // color stored.
  this._dependentObjects = {};
};

QxColorObject.extend(QxColor, "QxColorObject");




/*
---------------------------------------------------------------------------
  UTILITY
---------------------------------------------------------------------------
*/

QxColorObject.fromString = function(vDefString) {
  return new QxColorObject(vDefString);
};




/*
---------------------------------------------------------------------------
  PUBLIC METHODS
---------------------------------------------------------------------------
*/

/*!
  Set a new value from selected theme (only for Operating System Colors)
*/
proto._updateTheme = function(vTheme)
{
  if (!this._isThemedColor) {
    throw new Error("Could not redefine themed value of non os colors!");
  };

  this._applyThemedValue();

  for (i in this._dependentObjects) {
    this._dependentObjects[i]._updateColors(this, this._style);
  };
};

proto._applyThemedValue = function()
{
  var vTheme = QxColorManager.getThemeObject();
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

proto.setValue = function(vValue) {
  this._normalize(vValue);
};





/*
---------------------------------------------------------------------------
  OBJECT MANAGMENT
---------------------------------------------------------------------------
*/

proto.add = function(vObject) {
  this._dependentObjects[vObject.toHashCode()] = vObject;
};

proto.remove = function(vObject) {
  delete this._dependentObjects[vObject.toHashCode()];
};






/*
---------------------------------------------------------------------------
  DISPOSER
---------------------------------------------------------------------------
*/

proto.dispose = function()
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

  return QxColor.prototype.dispose.call(this);
};
