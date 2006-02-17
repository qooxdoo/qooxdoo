/* ************************************************************************

   qooxdoo - the new era of web interface development

   Copyright:
     (C) 2004-2006 by Schlund + Partner AG, Germany
         All rights reserved

   License:
     LGPL 2.1: http://creativecommons.org/licenses/LGPL/2.1/

   Internet:
     * http://qooxdoo.oss.schlund.de

   Authors:
     * Sebastian Werner (wpbasti)
       <sebastian dot werner at 1und1 dot de>
     * Andreas Ecker (aecker)
       <andreas dot ecker at 1und1 dot de>

************************************************************************ */

/* ************************************************************************

#package(color)
#require(QxColor)

************************************************************************ */

/*
---------------------------------------------------------------------------
  CORE METHODS
---------------------------------------------------------------------------
*/

QxColor.rgb2style = function(r, g, b) {
  return QxColor.RGBCSS_START + r + QxConst.CORE_COMMA + g + QxConst.CORE_COMMA + b + QxColor.RGBCSS_STOP;
};





/*
---------------------------------------------------------------------------
  CORE DATA
---------------------------------------------------------------------------
*/

QxColor.RGBCSS_START = "rgb(";
QxColor.RGBCSS_STOP = ")";

QxColor.m_hex = [ "0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f" ];
QxColor.m_rgb = { 0:0,1:1,2:2,3:3,4:4,5:5,6:6,7:7,8:8,9:9,a:10,b:11,c:12,d:13,e:14,f:15 };

QxColor.r_hex3 = /^#([0-9a-f]{1})([0-9a-f]{1})([0-9a-f]{1})$/;
QxColor.r_hex6 = /^#([0-9a-f]{1})([0-9a-f]{1})([0-9a-f]{1})([0-9a-f]{1})([0-9a-f]{1})([0-9a-f]{1})$/;
QxColor.r_cssrgb = /^rgb\(\s*([0-9]{1,3}\.{0,1}[0-9]*)\s*,\s*([0-9]{1,3}\.{0,1}[0-9]*)\s*,\s*([0-9]{1,3}\.{0,1}[0-9]*)\s*\)$/;

QxColor.r_rgb = /^[0-9]{1,3},[0-9]{1,3},[0-9]{1,3}$/;
QxColor.r_number = /^[0-9]{1,3}\.{0,1}[0-9]*$/;
QxColor.r_percent = /^[0-9]{1,3}\.{0,1}[0-9]*%$/;

QxColor.htmlNames =
{
  maroon : [ 128,0,0 ],
  red : [ 255,0,0 ],
  orange : [ 255,165,0 ],
  yellow : [ 255,255,0 ],
  olive : [ 128,128,0 ],
  purple : [ 128,0,128 ],
  fuchsia : [ 255,0,255 ],
  white : [ 255,255,255 ],
  lime : [ 0,255,0 ],
  green : [ 0,128,0 ],
  navy : [ 0,0,128 ],
  blue : [ 0,0,255 ],
  aqua : [ 0,255,255 ],
  teal : [ 0,128,128 ],
  black : [ 0,0,0 ],
  silver : [ 192,192,192 ],
  gray : [ 128,128,128 ],
  transparent : [-1,-1,-1]
};

// TODO: Add some IE related colors (IE 4.x)
// http://msdn.microsoft.com/library/default.asp?url=/workshop/author/dhtml/reference/colors/colors.asp
/*
QxColor.cssNames =
{

};
*/

/*
  ActiveBorder: Active window border.
  ActiveCaption: Active window caption.

  AppWorkspace: Background color of multiple document interface.
  Background: Desktop background.

  ButtonFace: Face color for three-dimensional display elements.
  ButtonHighlight: Highlight color for three-dimensional display elements (for edges facing away from the light source).
  ButtonShadow: Shadow color for three-dimensional display elements.
  ButtonText: Text on push buttons.

  CaptionText: Text in caption, size box, and scrollbar arrow box.
  GrayText: Grayed (disabled) text.

  Highlight: Item(s) selected in a control.
  HighlightText: Text of item(s) selected in a control.

  InactiveBorder: Inactive window border.
  InactiveCaption: Inactive window caption.
  InactiveCaptionText: Color of text in an inactive caption.

  InfoBackground: Background color for tooltip controls.
  InfoText: Text color for tooltip controls.

  Menu: Menu background.
  MenuText: Text in menus.

  Scrollbar: Scroll bar gray area.

  ThreeDDarkShadow: Dark shadow for three-dimensional display elements.
  ThreeDFace: Face color for three-dimensional display elements.
  ThreeDHighlight: Highlight color for three-dimensional display elements.
  ThreeDLightShadow: Light color for three-dimensional display elements (for edges facing the light source).
  ThreeDShadow: Dark shadow for three-dimensional display elements.

  Window: Window background.
  WindowFrame: Window frame.
  WindowText: Text in windows.
*/

QxColor.themedNames =
{
  activeborder : 1,
  activecaption : 1,
  appworkspace : 1,
  background : 1,
  buttonface : 1,
  buttonhighlight : 1,
  buttonshadow : 1,
  buttontext : 1,
  captiontext : 1,
  graytext : 1,
  highlight : 1,
  highlighttext : 1,
  inactiveborder : 1,
  inactivecaption : 1,
  inactivecaptiontext : 1,
  infobackground : 1,
  infotext : 1,
  menu : 1,
  menutext : 1,
  scrollbar : 1,
  threeddarkshadow : 1,
  threedface : 1,
  threedhighlight : 1,
  threedlightshadow : 1,
  threedshadow : 1,
  window : 1,
  windowframe : 1,
  windowtext : 1
};
