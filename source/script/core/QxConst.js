/* ************************************************************************

   qooxdoo - the new era of web interface development

   Version:
     $Id$

   Copyright:
     (C) 2004-2005 by Schlund + Partner AG, Germany
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

************************************************************************ */

/* ********************************************************************
   Precreate most used strings
******************************************************************** */

var QxConst =
{
  CORE_EMPTY : "",
  CORE_SPACE : " ",
  CORE_SLASH : "/",
  CORE_DOT : ".",
  CORE_ZERO : "0",
  CORE_AUTO : "auto",
  CORE_FLEX : "1*",
  CORE_PIXEL : "px",
  CORE_MILLISECONDS : "ms",
  CORE_PERCENT : "%",
  CORE_QUOTE : "\"",
  CORE_NEWLINE : "\n",
  CORE_SINGLEQUOTE : "'",
  CORE_HUNDREDPERCENT : "100%",
  CORE_STAR : "*",
  CORE_PLUS : "+",
  CORE_MINUS : "-",
  CORE_COMMA : ",",
  CORE_DASH : "-",
  CORE_UNDERLINE : "_",
  CORE_SEMICOLON : ";",
  CORE_COLON : ":",
  CORE_EQUAL : "=",
  CORE_AMPERSAND : "&",
  CORE_HASH : "#",
  CORE_SMALLER : "<",
  CORE_BIGGER : ">",
  CORE_DEFAULT : "default",
  CORE_NONE : "none",
  CORE_HIDDEN : "hidden",
  CORE_0PIXEL : "0px",
  CORE_ABSOLUTE : "absolute",
  CORE_RELATIVE : "relative",
  CORE_STATIC : "static",
  CORE_FIXED : "fixed",
  CORE_DIV : "div",
  CORE_DISABLED : "disabled",
  CORE_EVENTPREFIX : "evt",
  CORE_YES : "yes",
  CORE_NO : "no",

  HTML_AMPERSAND : "&amp;",
  HTML_SMALLER : "&lt;",
  HTML_BIGGER : "&gt;",
  HTML_QUOTE : "&quot;",
  HTML_SPACE : "&nbsp;",

  PROTOCOL_HTTP : "http",
  PROTOCOL_HTTPS : "https",
  PROTOCOL_FTP : "ftp",
  PROTOCOL_FILE : "file",

  URI_HTTP : "http:/" + "/",
  URI_HTTPS : "https:/" + "/",
  URI_FTP : "ftp:/" + "/",
  URI_FILE : "file:/" + "/",

  METHOD_GET : "GET",
  METHOD_POST : "POST",
  METHOD_PUT : "PUT",
  METHOD_HEAD : "HEAD",
  METHOD_DELETE : "DELETE",

  TYPEOF_UNDEFINED : "undefined",
  TYPEOF_NUMBER : "number",
  TYPEOF_STRING : "string",
  TYPEOF_BOOLEAN : "boolean",
  TYPEOF_FUNCTION : "function",
  TYPEOF_OBJECT : "object",

  INTERNAL_SET : "set",
  INTERNAL_GET : "get",
  INTERNAL_APPLY : "apply",
  INTERNAL_RESET : "reset",
  INTERNAL_FORCE : "force",
  INTERNAL_TOGGLE : "toggle",
  INTERNAL_CHANGE : "change",
  INTERNAL_STORE : "store",
  INTERNAL_RETRIEVE : "retrieve",
  INTERNAL_PRIVATECHANGE : "_change",
  INTERNAL_INVALIDATE : "_invalidate",
  INTERNAL_INVALIDATED : "_invalidated",
  INTERNAL_RECOMPUTE : "_recompute",
  INTERNAL_CACHED : "_cached",
  INTERNAL_COMPUTE : "_compute",
  INTERNAL_COMPUTED : "_computed",
  INTERNAL_UNITDETECTION : "_unitDetection",

  INTERNAL_GLOBALPROPERTYREF : "PROPERTY_",

  INTERNAL_UNIT_VALUE : "Value",
  INTERNAL_UNIT_PARSED : "Parsed",
  INTERNAL_UNIT_TYPE : "Type",
  INTERNAL_UNIT_TYPE_NULL : "TypeNull",
  INTERNAL_UNIT_TYPE_PIXEL : "TypePixel",
  INTERNAL_UNIT_TYPE_PERCENT : "TypePercent",
  INTERNAL_UNIT_TYPE_AUTO : "TypeAuto",
  INTERNAL_UNIT_TYPE_FLEX : "TypeFlex",

  INTERNAL_GETDEFAULT : "getDefault",
  INTERNAL_SETDEFAULT : "setDefault",
  INTERNAL_RETRIEVEDEFAULT : "retrieveDefault",
  INTERNAL_STOREDEFAULT : "storeDefault",

  INTERNAL_VALUE : "_value",
  INTERNAL_NULL : "_null",
  INTERNAL_EVAL : "_eval",
  INTERNAL_CHECK : "_check",
  INTERNAL_MODIFY : "_modify",

  INTERNAL_BACKCOMPAT : "BackCompat",

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

  JOB_INITIAL : "initial",
  JOB_VISIBLE : "visible",
  JOB_LOCATION : "location",
  JOB_LOCATIONX : "locationX",
  JOB_LOCATIONY : "locationY",
  JOB_ADDCHILD : "addChild",
  JOB_REMOVECHILD : "removeChild",
  JOB_FRAMEWIDTH : "frameWidth",
  JOB_FRAMEHEIGHT : "frameHeight",
  JOB_PREFERREDINNERWIDTH : "preferredInnerWidth",
  JOB_PREFERREDINNERHEIGHT : "preferredInnerHeight",

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

  BORDER_STYLE_GROOVE : "groove",
  BORDER_STYLE_RIDGE : "ridge",
  BORDER_STYLE_INSET : "inset",
  BORDER_STYLE_OUTSET : "outset",
  BORDER_STYLE_SOLID : "solid",
  BORDER_STYLE_DOTTED : "dotted",
  BORDER_STYLE_DASHED : "dashed",
  BORDER_STYLE_DOUBLE : "double",
  BORDER_STYLE_NONE : "none",

  FONT_STYLE_BOLD : "bold",
  FONT_STYLE_NORMAL : "normal",
  FONT_STYLE_ITALIC : "italic",
  FONT_STYLE_UNDERLINE : "underline",
  FONT_STYLE_STRIKEOUT : "strikeout",

  FOCUS_OUTLINE : "1px dotted invert",

  DISPLAY_BLOCK : "block",
  DISPLAY_NONE : "none",

  CURSOR_WAIT : "wait",
  CURSOR_PROGRESS : "progress",
  CURSOR_DEFAULT : "default",

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
  EVENT_TYPE_LOAD : "load",
  EVENT_TYPE_UNLOAD : "unload",
  EVENT_TYPE_BEFOREUNLOAD : "beforeunload",

  EVENT_TYPE_PROPERTYCHANGE : "propertychange",
  EVENT_TYPE_LOSECAPTURE : "losecapture",

  EVENT_TYPE_OVERFLOW : "overflow",
  EVENT_TYPE_OVERFLOWCHANGED : "overflowchanged",
  EVENT_TYPE_UNDERFLOW : "underflow",

  EVENT_TYPE_DOMMOUSESCROLL : "DOMMouseScroll",
  EVENT_TYPE_DOMFOCUSIN : "DOMFocusIn",
  EVENT_TYPE_DOMFOCUSOUT : "DOMFocusOut",
  EVENT_TYPE_DOMACTIVATE : "DOMActivate",
  EVENT_TYPE_MOUSEENTER : "mouseenter",
  EVENT_TYPE_MOUSELEAVE : "mouseleave",

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

  REQUEST_STATE_CREATED : "created",
  REQUEST_STATE_CONFIGURED : "configured",
  REQUEST_STATE_QUEUED : "queued",
  REQUEST_STATE_SENDING : "sending",
  REQUEST_STATE_RECEIVING : "receiving",
  REQUEST_STATE_COMPLETED : "completed",

  BUTTON_LEFT : "left",
  BUTTON_MIDDLE : "middle",
  BUTTON_RIGHT : "right",
  BUTTON_NONE : "none",

  KEY_CTRL : "ctrl",
  KEY_SHIFT : "shift",
  KEY_ALT : "alt",
  KEY_CONTROL : "control",

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

  SORT_ASCENDING : "ascending",
  SORT_DESCENDING : "descending",

  IMAGE_BLANK : "core/blank.gif"
};
