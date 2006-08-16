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

#module(ui_core)
#module(theme_icon)
#require(qx.manager.object.SingletonManager)
#resource(images:icon/crystalsvg)

************************************************************************ */

qx.OO.defineClass("qx.theme.icon.CrystalSvgIconTheme", qx.renderer.theme.IconTheme,
function() {
  qx.renderer.theme.IconTheme.call(this, "Crystal SVG");
});




/*
---------------------------------------------------------------------------
  DEFAULT SETTINGS
---------------------------------------------------------------------------
*/

qx.Settings.setDefault("imageUri", qx.Settings.getValueOfClass("qx.manager.object.AliasManager", "resourceUri") + "icon/crystalsvg");




/*
---------------------------------------------------------------------------
  DEFER SINGLETON INSTANCE
---------------------------------------------------------------------------
*/

/**
 * Singleton Instance Getter
 */
qx.Class.getInstance = function() {
  return this._instance;
}

qx.manager.object.SingletonManager.getInstance().add(qx.theme.icon.CrystalSvgIconTheme);
