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

#module(widgetthemes)
#require(qx.manager.object.SingletonManager)
#resource(images:widget/windows)

************************************************************************ */

qx.OO.defineClass("qx.theme.widget.WindowsWidgetTheme", qx.renderer.theme.WidgetTheme,
function() {
  qx.renderer.theme.WidgetTheme.call(this, "Windows");
});




/*
---------------------------------------------------------------------------
  DEFAULT SETTINGS
---------------------------------------------------------------------------
*/

qx.Settings.setDefault("imageUri", "../../resources/widget/windows");




/*
---------------------------------------------------------------------------
  SINGLETON INSTANCE
---------------------------------------------------------------------------
*/

qx.manager.object.SingletonManager.add(qx.theme.widget, "WindowsWidgetTheme");
