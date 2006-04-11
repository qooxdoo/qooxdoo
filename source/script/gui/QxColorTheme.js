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
#require(QxUtil)
#require(QxColorManager)
#post(QxColor)

************************************************************************ */

qx.renderer.theme.QxColorTheme = function(vId, vTitle, vColors)
{
  qx.core.Object.call(this);

  if (qx.util.validator.isInvalidString(vId)) {
    throw new Error("Each instance of qx.renderer.theme.QxColorTheme need an unique ID!");
  };

  this._definedColors = vColors;
  this._compiledColors = {};

  this.setId(vId);
  this.setTitle(qx.util.validator.isValidString(vTitle) ? vTitle : vId);

  try {
    QxColorManager.registerTheme(this);
  } catch(ex) {
    throw new Error("Could not register Theme: " + ex);
  };
};

qx.renderer.theme.QxColorTheme.extend(qx.core.Object, "qx.renderer.theme.QxColorTheme");





/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

qx.renderer.theme.QxColorTheme.addProperty({ name : "id", type : QxConst.TYPEOF_STRING, allowNull : false });
qx.renderer.theme.QxColorTheme.addProperty({ name : "title", type : QxConst.TYPEOF_STRING, allowNull : false, defaultValue : QxConst.CORE_EMPTY });





/*
---------------------------------------------------------------------------
  DATA
---------------------------------------------------------------------------
*/

proto._needsCompilation = true;






/*
---------------------------------------------------------------------------
  PUBLIC METHODS
---------------------------------------------------------------------------
*/

proto.getValueByName = function(vName) {
  return this._definedColors[vName] || QxConst.CORE_EMPTY;
};

proto.getStyleByName = function(vName) {
  return this._compiledColors[vName] || QxConst.CORE_EMPTY;
};






/*
---------------------------------------------------------------------------
  PRIVATE METHODS
---------------------------------------------------------------------------
*/

proto.compile = function()
{
  if (!this._needsCompilation) {
    return;
  };

  for (var vName in QxColor.themedNames) {
    this._compileValue(vName);
  };

  this._needsCompilation = false;
};

proto._compileValue = function(vName)
{
  var v = this._definedColors[vName];
  this._compiledColors[vName] = v ? QxColor.rgb2style.apply(this, this._definedColors[vName]) : vName;
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

  delete this._definedColors;
  delete this._compiledColors;

  qx.core.Object.prototype.dispose.call(this);
};
