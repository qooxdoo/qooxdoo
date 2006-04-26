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

#package(appearance)
#post(qx.core.Init)
#post(qx.renderer.theme.AppearanceTheme)

************************************************************************ */

qx.OO.defineClass("qx.manager.object.AppearanceManager", qx.manager.object.ObjectManager, 
function()
{
  qx.manager.object.ObjectManager.call(this);

  this._themes = {};
});




qx.OO.addProperty({ name : "appearanceTheme", type : qx.Const.TYPEOF_STRING, defaultValue : "default" });




/*
---------------------------------------------------------------------------
  MODIFIER
---------------------------------------------------------------------------
*/

qx.Proto._modifyAppearanceTheme = function(propValue, propOldValue, propData)
{
  window.application.getClientWindow().getClientDocument()._recursiveAppearanceThemeUpdate(propValue, propOldValue);
  return true;
};






/*
---------------------------------------------------------------------------
  METHODS
---------------------------------------------------------------------------
*/

qx.Proto.registerTheme = function(vThemeObject) {
  this._themes[vThemeObject.getId()] = vThemeObject;
};

qx.Proto.getAppearanceThemeObjectById = function(vThemeId) {
  return this._themes[vThemeId];
};

qx.Proto.getAppearanceThemeObject = function() {
  return this.getAppearanceThemeObjectById(this.getAppearanceTheme());
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

  if (this._themes)
  {
    for (vTheme in this._themes)
    {
      this._themes[vTheme].dispose();
      this._themes[vTheme] = null;
    };

    this._themes = null;
  };

  return qx.manager.object.ObjectManager.prototype.dispose.call(this);
};







/*
---------------------------------------------------------------------------
  SINGLETON INSTANCE
---------------------------------------------------------------------------
*/

qx.manager.object.AppearanceManager = new qx.manager.object.AppearanceManager;
