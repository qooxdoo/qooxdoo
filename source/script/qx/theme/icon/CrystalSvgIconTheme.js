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

#module(iconthemes)
#resource(images:source/resources/icon/crystalsvg)

************************************************************************ */

qx.OO.defineClass("qx.theme.icon.CrystalSvgIconTheme", qx.renderer.theme.IconTheme,
function() {
  qx.renderer.theme.IconTheme.call(this, "Crystal SVG Icon Theme");
});




/*
---------------------------------------------------------------------------
  DEFAULT SETTINGS
---------------------------------------------------------------------------
*/

qx.Settings.setDefaultSetting("imagePath", "../../resources/icon/crystalsvg");




/*
---------------------------------------------------------------------------
  SINGLETON INSTANCE
---------------------------------------------------------------------------
*/

qx.theme.icon.CrystalSvgIconTheme = new qx.theme.icon.CrystalSvgIconTheme;
