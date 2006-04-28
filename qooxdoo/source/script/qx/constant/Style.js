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

qx.OO.defineClass("qx.constant.Style",
{
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
