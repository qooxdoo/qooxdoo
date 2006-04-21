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

#package(barview)

************************************************************************ */

qx.ui.pageview.buttonview.ButtonViewBar = function() {
  qx.ui.pageview.AbstractPageViewBar.call(this);
};

qx.ui.pageview.buttonview.ButtonViewBar.extend(qx.ui.pageview.AbstractPageViewBar, "qx.ui.pageview.buttonview.ButtonViewBar");

qx.ui.pageview.buttonview.ButtonViewBar.changeProperty({ name : "appearance", type : qx.Const.TYPEOF_STRING, defaultValue : "bar-view-bar" });




/*
---------------------------------------------------------------------------
  EVENTS
---------------------------------------------------------------------------
*/

proto.getWheelDelta = function(e)
{
  var vWheelDelta = e.getWheelDelta();

  switch(this.getParent().getBarPosition())
  {
    case qx.Const.ALIGN_LEFT:
    case qx.Const.ALIGN_RIGHT:
      vWheelDelta *= -1;
  };

  return vWheelDelta;
};
