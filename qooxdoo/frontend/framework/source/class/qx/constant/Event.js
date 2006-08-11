/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2006 by 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL 2.1: http://www.gnu.org/licenses/lgpl.html

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************


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
