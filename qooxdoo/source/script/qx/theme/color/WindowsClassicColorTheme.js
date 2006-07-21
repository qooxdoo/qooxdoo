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

#module(colorthemes)

************************************************************************ */


qx.OO.defineClass("qx.theme.color.WindowsClassicColorTheme", qx.renderer.theme.ColorTheme,
function() {
  qx.renderer.theme.ColorTheme.call(this, "Windows Classic");
}




/*
---------------------------------------------------------------------------
  DEFINE COLORS
---------------------------------------------------------------------------
*/

qx.Proto._activeborder = [ 212,208,200 ];
qx.Proto._activecaption = [ 10,36,106 ];
qx.Proto._appworkspace = [ 128,128,128 ];
qx.Proto._background = [ 58,110,165 ];
qx.Proto._buttonface = [ 212,208,200 ];
qx.Proto._buttonhighlight = [ 255,255,255 ];
qx.Proto._buttonshadow = [ 128,128,128 ];
qx.Proto._buttontext = [ 0,0,0 ];
qx.Proto._captiontext = [ 255,255,255 ];
qx.Proto._graytext = [ 128,128,128 ];
qx.Proto._highlight = [ 10,36,106 ];
qx.Proto._highlighttext = [ 255,255,255 ];
qx.Proto._inactiveborder = [ 212,208,200 ];
qx.Proto._inactivecaption = [ 128,128,128 ];
qx.Proto._inactivecaptiontext = [ 212,208,200 ];
qx.Proto._infobackground = [ 255,255,225 ];
qx.Proto._infotext = [ 0,0,0 ];
qx.Proto._menu = [ 212,208,200 ];
qx.Proto._menutext = [ 0,0,0 ];
qx.Proto._scrollbar = [ 212,208,200 ];
qx.Proto._threeddarkshadow = [ 64,64,64 ];
qx.Proto._threedface = [ 212,208,200 ];
qx.Proto._threedhighlight = [ 255,255,255 ];
qx.Proto._threedlightshadow = [ 212,208,200 ];
qx.Proto._threedshadow = [ 128,128,128 ];
qx.Proto._window = [ 255,255,255 ];
qx.Proto._windowframe = [ 0,0,0 ];
qx.Proto._windowtext = [ 0,0,0 ]





/*
---------------------------------------------------------------------------
  SINGLETON INSTANCE
---------------------------------------------------------------------------
*/

qx.theme.color.WindowsClassicColorTheme = new qx.theme.color.WindowsClassicColorTheme;
