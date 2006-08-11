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

#module(colorthemes)
#require(qx.manager.object.SingletonManager)

************************************************************************ */

qx.OO.defineClass("qx.theme.color.SystemColorTheme", qx.renderer.theme.ColorTheme,
function() {
  qx.renderer.theme.ColorTheme.call(this, "Operating System Default");
});




/*
---------------------------------------------------------------------------
  DEFER SINGLETON INSTANCE
---------------------------------------------------------------------------
*/

qx.manager.object.SingletonManager.add(qx.theme.color.SystemColorTheme);
