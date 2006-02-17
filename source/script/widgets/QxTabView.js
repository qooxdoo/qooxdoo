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

function QxTabView() {
  QxCommonView.call(this, QxTabViewBar, QxTabViewPane);
};

QxTabView.extend(QxCommonView, "QxTabView");





/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

QxTabView.changeProperty({ name : "appearance", type : QxConst.TYPEOF_STRING, defaultValue : "tab-view" });

QxTabView.addProperty({ name : "alignTabsToLeft", type : QxConst.TYPEOF_BOOLEAN, defaultValue : true });
QxTabView.addProperty({ name : "placeBarOnTop", type : QxConst.TYPEOF_BOOLEAN, defaultValue : true });






/*
---------------------------------------------------------------------------
  MODIFIER
---------------------------------------------------------------------------
*/

proto._modifyAlignTabsToLeft = function(propValue, propOldValue, propData)
{
  var vBar = this._bar;

  vBar.setHorizontalChildrenAlign(propValue ? QxConst.ALIGN_LEFT : QxConst.ALIGN_RIGHT);

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
