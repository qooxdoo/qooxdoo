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

#module(widgetthemes)
#resource(images:source/resources/widget/windows)

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

qx.Settings.setDefaultSetting("imagePath", "../../resources/widget/windows");




/*
---------------------------------------------------------------------------
  SINGLETON INSTANCE
---------------------------------------------------------------------------
*/

qx.theme.widget.WindowsWidgetTheme = new qx.theme.widget.WindowsWidgetTheme;
