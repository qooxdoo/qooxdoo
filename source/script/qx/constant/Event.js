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

#module(core)
#require(qx.OO)

************************************************************************ */

qx.OO.defineClass("qx.constant.Event",
{
  // general ui interaction
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

  // advanced ui interaction
  BLUR : "blur",
  FOCUS : "focus",
  FOCUSIN : "focusin",
  FOCUSOUT : "focusout",

  SELECT : "select",
  SCROLL : "scroll",
  INPUT : "input",
  CHANGE : "change",
  RESIZE : "resize",

  INTERVAL : "interval",
  EXECUTE : "execute",
  CREATE : "create",
  LOAD : "load",
  ERROR : "error",
  SUBMIT : "submit",
  UNLOAD : "unload",
  BEFOREUNLOAD : "beforeunload",

  TREEOPENWITHCONTENT : "treeOpenWithContent",
  TREEOPENWHILEEMPTY  : "treeOpenWhileEmpty",
  TREECLOSE           : "treeClose",

  // ui visualisation related
  BEFOREAPPEAR : "beforeAppear",
  APPEAR : "appear",
  BEFOREDISAPPEAR : "beforeDisappear",
  DISAPPEAR : "disappear",
  BEFOREINSERTDOM : "beforeInsertDom",
  INSERTDOM : "insertDom",
  BEFOREREMOVEDOM : "beforeRemoveDom",
  REMOVEDOM : "removeDom",

  // dnd related
  DRAGDROP : "dragdrop",
  DRAGOVER : "dragover",
  DRAGOUT : "dragout",
  DRAGMOVE : "dragmove",
  DRAGSTART : "dragstart",
  DRAGEND : "dragend",

  // io related
  CREATED : "created",
  CONFIGURED : "configured",
  QUEUED : "queued",
  SENDING : "sending",
  RECEIVING : "receiving",
  COMPLETED : "completed",
  ABORTED : "aborted",
  FAILED : "failed",
  TIMEOUT : "timeout",

  // dialog
  DIALOGOK : "dialogok",
  DIALOGCANCEL : "dialogcancel",
  DIALOGCLOSE : "dialogclose",
  DIALOGPREVIOUS : "dialogprevious",
  DIALOGNEXT : "dialognext",
  DIALOGFIRST : "dialogfirst",
  DIALOGLAST : "dialoglast"
});
