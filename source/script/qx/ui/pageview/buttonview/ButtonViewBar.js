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

#module(barview)

************************************************************************ */

qx.OO.defineClass("qx.ui.pageview.buttonview.ButtonViewBar", qx.ui.pageview.AbstractPageViewBar, 
function() {
  qx.ui.pageview.AbstractPageViewBar.call(this);
});

qx.OO.changeProperty({ name : "appearance", type : qx.constant.Type.STRING, defaultValue : "bar-view-bar" });




/*
---------------------------------------------------------------------------
  EVENTS
---------------------------------------------------------------------------
*/

qx.Proto.getWheelDelta = function(e)
{
  var vWheelDelta = e.getWheelDelta();

  switch(this.getParent().getBarPosition())
  {
    case qx.constant.Layout.ALIGN_LEFT:
    case qx.constant.Layout.ALIGN_RIGHT:
      vWheelDelta *= -1;
  };

  return vWheelDelta;
};
