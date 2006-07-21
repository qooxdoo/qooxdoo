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

qx.OO.defineClass("qx.theme.color.WindowsLunaSilverColorTheme", qx.renderer.theme.ColorTheme,
function() {
  qx.renderer.theme.ColorTheme.call(this, "Windows Luna Silver");
}




/*
---------------------------------------------------------------------------
  DEFINE COLORS
---------------------------------------------------------------------------
*/

qx.Proto._activeborder = [ 212,208,200 ];
qx.Proto._activecaption = [ 192,192,192 ];
qx.Proto._appworkspace = [ 128,128,128 ];
qx.Proto._background = [ 88,87,104 ];
qx.Proto._buttonface = [ 224,223,227 ];
qx.Proto._buttonhighlight = [ 255,255,255 ];
qx.Proto._buttonshadow = [ 157,157,161 ];
qx.Proto._buttontext = [ 0,0,0 ];
qx.Proto._captiontext = [ 14,16,16 ];
qx.Proto._graytext = [ 172,168,153 ];
qx.Proto._highlight = [ 178,180,191 ];
qx.Proto._highlighttext = [ 0,0,0 ];
qx.Proto._inactiveborder = [ 212,208,200 ];
qx.Proto._inactivecaption = [ 255,255,255 ];
qx.Proto._inactivecaptiontext = [ 162,161,161 ];
qx.Proto._infobackground = [ 255,255,225 ];
qx.Proto._infotext = [ 0,0,0 ];
qx.Proto._menu = [ 255,255,255 ];
qx.Proto._menutext = [ 0,0,0 ];
qx.Proto._scrollbar = [ 212,208,200 ];
qx.Proto._threeddarkshadow = [ 113,111,100 ];
qx.Proto._threedface = [ 224,223,227 ];
qx.Proto._threedhighlight = [ 255,255,255 ];
qx.Proto._threedlightshadow = [ 241,239,226 ];
qx.Proto._threedshadow = [ 157,157,161 ];
qx.Proto._window = [ 255,255,255 ];
qx.Proto._windowframe = [ 0,0,0 ];
qx.Proto._windowtext = [ 0,0,0 ]





/*
---------------------------------------------------------------------------
  SINGLETON INSTANCE
---------------------------------------------------------------------------
*/

qx.theme.color.WindowsLunaGreenColorTheme = new qx.theme.color.WindowsLunaGreenColorTheme;
