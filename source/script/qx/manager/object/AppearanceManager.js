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

#module(appearance)
#use(qx.renderer.theme.AppearanceTheme)

************************************************************************ */

qx.OO.defineClass("qx.manager.object.AppearanceManager", qx.manager.object.ObjectManager,
function()
{
  qx.manager.object.ObjectManager.call(this);

  this._themes = [];
});

qx.OO.addProperty({ name : "theme", type : qx.constant.Type.OBJECT });





/*
---------------------------------------------------------------------------
  MODIFIER
---------------------------------------------------------------------------
*/

qx.Proto._modifyAppearanceTheme = function(propValue, propOldValue, propData)
{
  qx.core.Init.getComponent().getClientWindow().getClientDocument()._recursiveAppearanceThemeUpdate(propValue, propOldValue);
  return true;
}






/*
---------------------------------------------------------------------------
  METHODS
---------------------------------------------------------------------------
*/

qx.Proto.registerTheme = function(vThemeObject) {
  this._themes.push(vThemeObject);

  if (this.getTheme() === null) {
    this.setTheme(qx.theme.appearance.DefaultAppearanceTheme);
  }
}

qx.Proto.getAppearanceThemeObjectById = function(vThemeId) {
  this.debug("Execute getAppearanceThemeObjectById -> Not supported anymore");
}

qx.Proto.getAppearanceThemeObject = function() {
  this.debug("Execute getAppearanceThemeObject -> Use getTheme instead!");
  return this.getTheme();
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

  if (this._themes)
  {
    for (var i=0; i<this._themes.length; i++) {
      this._themes[i].dispose();
    }

    this._themes = null;
  }

  return qx.manager.object.ObjectManager.prototype.dispose.call(this);
}







/*
---------------------------------------------------------------------------
  SINGLETON INSTANCE
---------------------------------------------------------------------------
*/

qx.manager.object.AppearanceManager = new qx.manager.object.AppearanceManager;
