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

#package(core)
#require(qx.OO)

************************************************************************ */

qx.OO.defineClass("qx.constant.Event",
{
  MOUSEOVER : "mouseover",
  MOUSEMOVE : "mousemove",
  MOUSEOUT : "mouseout",
  MOUSEDOWN : "mousedown",
  MOUSEUP : "mouseup",
  MOUSEWHEEL : "mousewheel",
  CLICK : "click",
  DBLCLICK : "dblclick",
  CONTEXTMENU : "contextmenu",
  KEYDOWN : "keydown",
  KEYPRESS : "keypress",
  KEYUP : "keyup",

  BLUR : "blur",
  FOCUS : "focus",
  FOCUSIN : "focusin",
  FOCUSOUT : "focusout",
  SELECT : "select",
  SCROLL : "scroll",
  INPUT : "input",
  CHANGE : "change",

  ERROR : "error",
  RESIZE : "resize",
  INTERVAL : "interval",
  EXECUTE : "execute",
  CREATE : "create",

  BEFOREAPPEAR : "beforeAppear",
  APPEAR : "appear",
  BEFOREDISAPPEAR : "beforeDisappear",
  DISAPPEAR : "disappear",
  BEFOREINSERTDOM : "beforeInsertDom",
  INSERTDOM : "insertDom",
  BEFOREREMOVEDOM : "beforeRemoveDom",
  REMOVEDOM : "removeDom"
});
