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
#post(QxApplication)
#post(qx.renderer.theme.AppearanceTheme)

************************************************************************ */

qx.manager.object.AppearanceManager = function()
{
  qx.manager.object.ObjectManager.call(this);

  this._themes = {};
};

qx.manager.object.AppearanceManager.extend(qx.manager.object.ObjectManager, "qx.manager.object.AppearanceManager");




qx.manager.object.AppearanceManager.addProperty({ name : "appearanceTheme", type : QxConst.TYPEOF_STRING, defaultValue : "default" });




/*
---------------------------------------------------------------------------
  MODIFIER
---------------------------------------------------------------------------
*/

proto._modifyAppearanceTheme = function(propValue, propOldValue, propData)
{
  window.application.getClientWindow().getClientDocument()._recursiveAppearanceThemeUpdate(propValue, propOldValue);
  return true;
};






/*
---------------------------------------------------------------------------
  METHODS
---------------------------------------------------------------------------
*/

proto.registerTheme = function(vThemeObject) {
  this._themes[vThemeObject.getId()] = vThemeObject;
};

proto.getAppearanceThemeObjectById = function(vThemeId) {
  return this._themes[vThemeId];
};

proto.getAppearanceThemeObject = function() {
  return this.getAppearanceThemeObjectById(this.getAppearanceTheme());
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
