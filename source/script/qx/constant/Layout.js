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

#module(core)
#require(qx.OO)

************************************************************************ */

qx.OO.defineClass("qx.constant.Layout",
{
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
  ALIGN_BOTTOM_REVERSED : "bottom-reversed"
});
