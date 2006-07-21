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

qx.OO.defineClass("qx.theme.color.WindowsLunaBlueColorTheme", qx.renderer.theme.ColorTheme,
function() {
  qx.renderer.theme.ColorTheme.call(this, "Windows Luna Blue");
}




/*
---------------------------------------------------------------------------
  DEFINE COLORS
---------------------------------------------------------------------------
*/

qx.Proto._activeborder = [ 212,208,200 ];
qx.Proto._activecaption = [ 0,84,227 ];
qx.Proto._appworkspace = [ 128,128,128 ];
qx.Proto._background = [ 0,78,152 ];
qx.Proto._buttonface = [ 236,233,216 ];
qx.Proto._buttonhighlight = [ 255,255,255 ];
qx.Proto._buttonshadow = [ 172,168,153 ];
qx.Proto._buttontext = [ 0,0,0 ];
qx.Proto._captiontext = [ 255,255,255 ];
qx.Proto._graytext = [ 172,168,153 ];
qx.Proto._highlight = [ 49,106,197 ];
qx.Proto._highlighttext = [ 255,255,255 ];
qx.Proto._inactiveborder = [ 212,208,200 ];
qx.Proto._inactivecaption = [ 122,150,223 ];
qx.Proto._inactivecaptiontext = [ 216,228,248 ];
qx.Proto._infobackground = [ 255,255,225 ];
qx.Proto._infotext = [ 0,0,0 ];
qx.Proto._menu = [ 255,255,255 ];
qx.Proto._menutext = [ 0,0,0 ];
qx.Proto._scrollbar = [ 212,208,200 ];
qx.Proto._threeddarkshadow = [ 113,111,100 ];
qx.Proto._threedface = [ 236,233,216 ];
qx.Proto._threedhighlight = [ 255,255,255 ];
qx.Proto._threedlightshadow = [ 241,239,226 ];
qx.Proto._threedshadow = [ 172,168,153 ];
qx.Proto._window = [ 255,255,255 ];
qx.Proto._windowframe = [ 0,0,0 ];
qx.Proto._windowtext = [ 0,0,0 ]




/*
---------------------------------------------------------------------------
  SINGLETON INSTANCE
---------------------------------------------------------------------------
*/

qx.theme.color.WindowsLunaBlueColorTheme = new qx.theme.color.WindowsLunaBlueColorTheme;
