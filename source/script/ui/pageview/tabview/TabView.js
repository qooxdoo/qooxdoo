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

#package(tabview)

************************************************************************ */

qx.OO.defineClass("qx.ui.pageview.tabview.TabView", qx.ui.pageview.AbstractPageView, 
function() {
  qx.ui.pageview.AbstractPageView.call(this, qx.ui.pageview.tabview.TabViewBar, qx.ui.pageview.tabview.TabViewPane);
});





/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

qx.ui.pageview.tabview.TabView.changeProperty({ name : "appearance", type : qx.Const.TYPEOF_STRING, defaultValue : "tab-view" });

qx.ui.pageview.tabview.TabView.addProperty({ name : "alignTabsToLeft", type : qx.Const.TYPEOF_BOOLEAN, defaultValue : true });
qx.ui.pageview.tabview.TabView.addProperty({ name : "placeBarOnTop", type : qx.Const.TYPEOF_BOOLEAN, defaultValue : true });






/*
---------------------------------------------------------------------------
  MODIFIER
---------------------------------------------------------------------------
*/

proto._modifyAlignTabsToLeft = function(propValue, propOldValue, propData)
{
  var vBar = this._bar;

  vBar.setHorizontalChildrenAlign(propValue ? qx.Const.ALIGN_LEFT : qx.Const.ALIGN_RIGHT);

  // force re-apply of states for all tabs
  vBar._addChildrenToStateQueue();

  return true;
};

proto._modifyPlaceBarOnTop = function(propValue, propOldValue, propData)
{
  // This does not work if we use flexible zones
  // this.setReverseChildrenOrder(!propValue);

  var vBar = this._bar;

  // move bar around
  if (propValue) {
    vBar.moveSelfToBegin();
  } else {
    vBar.moveSelfToEnd();
  };

  // force re-apply of states for all tabs
  vBar._addChildrenToStateQueue();

  return true;
};
