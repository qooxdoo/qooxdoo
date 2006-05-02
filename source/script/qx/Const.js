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

  EVENT_TYPE_LOAD : "load",
  EVENT_TYPE_UNLOAD : "unload",
  EVENT_TYPE_BEFOREUNLOAD : "beforeunload",
  EVENT_TYPE_SUBMIT : "submit",

  EVENT_TYPE_PROPERTYCHANGE : "propertychange",
  EVENT_TYPE_LOSECAPTURE : "losecapture",

  EVENT_TYPE_OVERFLOW : "overflow",
  EVENT_TYPE_OVERFLOWCHANGED : "overflowchanged",
  EVENT_TYPE_UNDERFLOW : "underflow",

  EVENT_TYPE_PRE : "pre",
  EVENT_TYPE_MAIN : "main",
  EVENT_TYPE_CACHE : "cache",
  EVENT_TYPE_POST : "post",

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
