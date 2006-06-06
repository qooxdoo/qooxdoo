/* ************************************************************************

   qooxdoo - the new era of web development

   Copyright:
     2004-2006 by Schlund + Partner AG, Germany
     All rights reserved

   License:
     LGPL 2.1: http://creativecommons.org/licenses/LGPL/2.1/

   Internet:
     * http://qooxdoo.org

   Authors:
     * Sebastian Werner (wpbasti)
       <sw at schlund dot de>
     * Andreas Ecker (ecker)
       <ae at schlund dot de>

************************************************************************ */

/* ************************************************************************

#package(core)
#require(qx.OO)

************************************************************************ */

qx.OO.defineClass("qx.constant.Style",
{
  PROPERTY_FILTER : "filter",
  PROPERTY_ZINDEX : "zIndex",
  PROPERTY_DISPLAY : "display",
  PROPERTY_POSITION : "position",
  PROPERTY_VISIBILITY : "visibility",
  PROPERTY_DISABLED : "disabled",
  PROPERTY_LINEHEIGHT : "lineHeight",
  PROPERTY_TEXTALIGN : "textAlign",
  PROPERTY_WHITESPACE : "whiteSpace",
  PROPERTY_COLOR : "color",
  PROPERTY_BACKGROUNDCOLOR : "backgroundColor",

  PROPERTY_HEIGHT : "height",
  PROPERTY_WIDTH : "width",
  PROPERTY_TOP : "top",
  PROPERTY_BOTTOM : "bottom",
  PROPERTY_LEFT : "left",
  PROPERTY_RIGHT : "right",

  PROPERTY_PADDING : "padding",
  PROPERTY_PADDINGTOP : "paddingTop",
  PROPERTY_PADDINGRIGHT : "paddingRight",
  PROPERTY_PADDINGBOTTOM : "paddingBottom",
  PROPERTY_PADDINGLEFT : "paddingLeft",

  PROPERTY_MARGIN : "margin",
  PROPERTY_MARGINTOP : "marginTop",
  PROPERTY_MARGINRIGHT : "marginRight",
  PROPERTY_MARGINBOTTOM : "marginBottom",
  PROPERTY_MARGINLEFT : "marginLeft",

  PROPERTY_OVERFLOW_BOTH : "overflow",
  PROPERTY_OVERFLOW_TEXT : "textOverflow",
  PROPERTY_OVERFLOW_HORIZONTAL : "overflowX",
  PROPERTY_OVERFLOW_VERTICAL : "overflowY",

  POSITION_ABSOLUTE : "absolute",
  POSITION_RELATIVE : "relative",
  POSITION_STATIC : "static",
  POSITION_FIXED : "fixed",

  CURSOR_WAIT : "wait",
  CURSOR_PROGRESS : "progress",
  CURSOR_DEFAULT : "default",

  OVERFLOW_AUTO : "auto",
  OVERFLOW_HIDDEN : "hidden",
  OVERFLOW_BOTH : "scroll",
  OVERFLOW_HORIZONTAL : "scrollX",
  OVERFLOW_VERTICAL : "scrollY",
  OVERFLOW_ELLIPSIS : "ellipsis",
  OVERFLOW_MOZ_NONE : "-moz-scrollbars-none",
  OVERFLOW_MOZ_HORIZONTAL : "-moz-scrollbars-horizontal",
  OVERFLOW_MOZ_VERTICAL : "-moz-scrollbars-vertical"
});
