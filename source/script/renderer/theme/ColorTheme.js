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
#post(qx.util.Validation)
#post(qx.renderer.color.Color)
#post(qx.manager.object.ColorManager)

************************************************************************ */

qx.OO.defineClass("qx.renderer.theme.ColorTheme", qx.core.Object, 
function(vId, vTitle, vColors)
{
  qx.core.Object.call(this);

  if (qx.util.Validation.isInvalidString(vId)) {
    throw new Error("Each instance of qx.renderer.theme.ColorTheme need an unique ID!");
  };

  this._definedColors = vColors;
  this._compiledColors = {};

  this.setId(vId);
  this.setTitle(qx.util.Validation.isValidString(vTitle) ? vTitle : vId);

  try {
    qx.manager.object.ColorManager.registerTheme(this);
  } catch(ex) {
    throw new Error("Could not register Theme: " + ex);
  };
});





/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

qx.renderer.theme.ColorTheme.addProperty({ name : "id", type : qx.Const.TYPEOF_STRING, allowNull : false });
qx.renderer.theme.ColorTheme.addProperty({ name : "title", type : qx.Const.TYPEOF_STRING, allowNull : false, defaultValue : qx.Const.CORE_EMPTY });





/*
---------------------------------------------------------------------------
  DATA
---------------------------------------------------------------------------
*/

qx.Proto._needsCompilation = true;






/*
---------------------------------------------------------------------------
  PUBLIC METHODS
---------------------------------------------------------------------------
*/

qx.Proto.getValueByName = function(vName) {
  return this._definedColors[vName] || qx.Const.CORE_EMPTY;
};

qx.Proto.getStyleByName = function(vName) {
  return this._compiledColors[vName] || qx.Const.CORE_EMPTY;
};






/*
---------------------------------------------------------------------------
  PRIVATE METHODS
---------------------------------------------------------------------------
*/

qx.Proto.compile = function()
{
  if (!this._needsCompilation) {
    return;
  };

  for (var vName in qx.renderer.color.Color.themedNames) {
    this._compileValue(vName);
  };

  this._needsCompilation = false;
};

qx.Proto._compileValue = function(vName)
{
  var v = this._definedColors[vName];
  this._compiledColors[vName] = v ? qx.renderer.color.Color.rgb2style.apply(this, this._definedColors[vName]) : vName;
};





/*
---------------------------------------------------------------------------
  DISPOSER
---------------------------------------------------------------------------
*/

qx.Proto.dispose = function()
{
  if (this.getDisposed()) {
    return;
  };

  delete this._definedColors;
  delete this._compiledColors;

  qx.core.Object.prototype.dispose.call(this);
};
