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

#module(appearance)

************************************************************************ */

qx.OO.defineClass("qx.manager.object.AppearanceManager", qx.manager.object.ObjectManager,
function()
{
  qx.manager.object.ObjectManager.call(this);

  this._themes = {};
});


/*
---------------------------------------------------------------------------
  DEFAULT SETTINGS
---------------------------------------------------------------------------
*/

qx.Settings.setDefault("theme", "qx.theme.appearance.DefaultAppearanceTheme");





/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

qx.OO.addProperty({ name : "theme", type : qx.constant.Type.OBJECT, allowNull : false, instance : "qx.renderer.theme.AppearanceTheme" });





/*
---------------------------------------------------------------------------
  MODIFIER
---------------------------------------------------------------------------
*/

qx.Proto._modifyTheme = function(propValue, propOldValue, propData)
{
  var vComp = qx.core.Init.getComponent();

  if (vComp.isUiReady()) {
    vComp.getClientWindow().getClientDocument()._recursiveAppearanceThemeUpdate(propValue, propOldValue);
  }

  return true;
}






/*
---------------------------------------------------------------------------
  METHODS
---------------------------------------------------------------------------
*/

qx.Proto.registerTheme = function(vTheme)
{
  var vId = vTheme.classname;

  this._themes[vId] = vTheme;

  if (vId === this.getSetting("theme") && this.getTheme() === null) {
    this.setTheme(vTheme);
  }
}

qx.Proto.setThemeById = function(vId) {
  return this.setTheme(this._themes[vId]);
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
    for (var vTheme in this._themes)
    {
      this._themes[vTheme].dispose();
      this._themes[vTheme] = null;
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
