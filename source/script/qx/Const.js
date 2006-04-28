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

qx.OO.defineClass("qx.Const",
{
  STATE_OVER : "over",
  STATE_FOCUSED : "focused",
  STATE_DISABLED : "disabled",
  STATE_ACTIVE : "active",
  STATE_CHECKED : "checked",
  STATE_PRESSED : "pressed",
  STATE_ABANDONED : "abandoned",
  STATE_SELECTED : "selected",
  STATE_ANCHOR : "anchor",
  STATE_LEAD : "lead",
  STATE_MAXIMIZED : "maximized",

  OVERFLOW_VALUE_AUTO : "auto",
  OVERFLOW_VALUE_HIDDEN : "hidden",
  OVERFLOW_VALUE_BOTH : "scroll",
  OVERFLOW_VALUE_HORIZONTAL : "scrollX",
  OVERFLOW_VALUE_VERTICAL : "scrollY",
  OVERFLOW_VALUE_ELLIPSIS : "ellipsis",
  OVERFLOW_VALUE_MOZ_NONE : "-moz-scrollbars-none",
  OVERFLOW_VALUE_MOZ_HORIZONTAL : "-moz-scrollbars-horizontal",
  OVERFLOW_VALUE_MOZ_VERTICAL : "-moz-scrollbars-vertical",

  IMAGE_BLANK : "core/blank.gif",

  MIMETYPE_JAVASCRIPT : "text/javascript",
  MIMETYPE_JSON : "text/json",
  MIMETYPE_XML : "application/xml",
  MIMETYPE_TEXT : "text/plain",
  MIMETYPE_HTML : "text/html",

  ORIENTATION_HORIZONTAL : "horizontal",
  ORIENTATION_VERTICAL : "vertical",

  ALIGN_LEFT : "left",
  ALIGN_LEFT_REVERSED : "left-reversed",
  ALIGN_CENTER : "center",
  ALIGN_CENTER_REVERSED : "center-reversed",
  ALIGN_RIGHT : "right",
  ALIGN_RIGHT_REVERSED : "right-reversed",

  ALIGN_TOP : "top",
  ALIGN_TOP_REVERSED : "top-reversed",
  ALIGN_MIDDLE : "middle",
  ALIGN_MIDDLE_REVERSED : "middle-reversed",
  ALIGN_BOTTOM : "bottom",
  ALIGN_BOTTOM_REVERSED : "bottom-reversed",

  CURSOR_WAIT : "wait",
  CURSOR_PROGRESS : "progress",
  CURSOR_DEFAULT : "default",

  PROPERTY_CLASSNAME : "className",
  PROPERTY_FILTER : "filter",
  PROPERTY_BORDERX : "borderX",
  PROPERTY_BORDERWIDTHX : "borderWidthX",
  PROPERTY_BORDERY : "borderY",
  PROPERTY_BORDERWIDTHY : "borderWidthY",
  PROPERTY_DISPLAY : "display",
  PROPERTY_POSITION : "position",
  PROPERTY_VISIBILITY : "visibility",
  PROPERTY_DISABLED : "disabled",
  PROPERTY_LINEHEIGHT : "lineHeight",
  PROPERTY_TEXTALIGN : "textAlign",
  PROPERTY_WHITESPACE : "whiteSpace",
  PROPERTY_PADDING : "padding",
  PROPERTY_PARENT_PADDINGLEFT : "parentPaddingLeft",
  PROPERTY_PARENT_PADDINGRIGHT : "parentPaddingRight",
  PROPERTY_PARENT_PADDINGTOP : "parentPaddingTop",
  PROPERTY_PARENT_PADDINGBOTTOM : "parentPaddingBottom",
  PROPERTY_OVERFLOW_BOTH : "overflow",
  PROPERTY_OVERFLOW_TEXT : "textOverflow",
  PROPERTY_OVERFLOW_HORIZONTAL : "overflowX",
  PROPERTY_OVERFLOW_VERTICAL : "overflowY",

  EVENT_TYPE_MOUSEOVER : "mouseover",
  EVENT_TYPE_MOUSEMOVE : "mousemove",
  EVENT_TYPE_MOUSEOUT : "mouseout",
  EVENT_TYPE_MOUSEDOWN : "mousedown",
  EVENT_TYPE_MOUSEUP : "mouseup",
  EVENT_TYPE_MOUSEWHEEL : "mousewheel",
  EVENT_TYPE_CLICK : "click",
  EVENT_TYPE_DBLCLICK : "dblclick",
  EVENT_TYPE_CONTEXTMENU : "contextmenu",
  EVENT_TYPE_KEYDOWN : "keydown",
  EVENT_TYPE_KEYPRESS : "keypress",
  EVENT_TYPE_KEYUP : "keyup",

  EVENT_TYPE_DRAGDROP : "dragdrop",
  EVENT_TYPE_DRAGENTER : "dragenter",
  EVENT_TYPE_DRAGEXIT : "dragexit",
  EVENT_TYPE_DRAGGESTURE : "draggesture",
  EVENT_TYPE_DRAGOVER : "dragover",
  EVENT_TYPE_DRAGOUT : "dragout",
  EVENT_TYPE_DRAGSTART : "dragstart",
  EVENT_TYPE_DRAGEND : "dragend",
  EVENT_TYPE_DRAGMOVE : "dragmove",
  EVENT_TYPE_DRAGLEAVE : "dragleave",
  EVENT_TYPE_DRAG : "drag",

  EVENT_TYPE_BLUR : "blur",
  EVENT_TYPE_FOCUS : "focus",
  EVENT_TYPE_FOCUSIN : "focusin",
  EVENT_TYPE_FOCUSOUT : "focusout",
  EVENT_TYPE_SELECT : "select",
  EVENT_TYPE_SCROLL : "scroll",
  EVENT_TYPE_INPUT : "input",
  EVENT_TYPE_CHANGE : "change",
  EVENT_TYPE_LOAD : "load",
  EVENT_TYPE_UNLOAD : "unload",
  EVENT_TYPE_BEFOREUNLOAD : "beforeunload",
  EVENT_TYPE_SUBMIT : "submit",

  EVENT_TYPE_PROPERTYCHANGE : "propertychange",
  EVENT_TYPE_LOSECAPTURE : "losecapture",

  EVENT_TYPE_OVERFLOW : "overflow",
  EVENT_TYPE_OVERFLOWCHANGED : "overflowchanged",
  EVENT_TYPE_UNDERFLOW : "underflow",

  EVENT_TYPE_ERROR : "error",
  EVENT_TYPE_RESIZE : "resize",
  EVENT_TYPE_INTERVAL : "interval",
  EVENT_TYPE_EXECUTE : "execute",
  EVENT_TYPE_CREATE : "create",

  EVENT_TYPE_PRE : "pre",
  EVENT_TYPE_MAIN : "main",
  EVENT_TYPE_CACHE : "cache",
  EVENT_TYPE_POST : "post",

  EVENT_TYPE_BEFOREAPPEAR : "beforeAppear",
  EVENT_TYPE_APPEAR : "appear",
  EVENT_TYPE_BEFOREDISAPPEAR : "beforeDisappear",
  EVENT_TYPE_DISAPPEAR : "disappear",

  EVENT_TYPE_BEFOREINSERTDOM : "beforeInsertDom",
  EVENT_TYPE_INSERTDOM : "insertDom",
  EVENT_TYPE_BEFOREREMOVEDOM : "beforeRemoveDom",
  EVENT_TYPE_REMOVEDOM : "removeDom",

  EVENT_TYPE_CREATED : "created",
  EVENT_TYPE_CONFIGURED : "configured",
  EVENT_TYPE_QUEUED : "queued",
  EVENT_TYPE_SENDING : "sending",
  EVENT_TYPE_RECEIVING : "receiving",
  EVENT_TYPE_COMPLETED : "completed",
  EVENT_TYPE_ABORTED : "aborted",
  EVENT_TYPE_FAILED : "failed",
  EVENT_TYPE_TIMEOUT : "timeout"
});
