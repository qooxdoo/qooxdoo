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

#package(window)
#post(QxPopupManager)

************************************************************************ */

/*!
  This singleton manages QxWindows
*/
function QxWindowManager() {
  QxManager.call(this);
};

QxWindowManager.extend(QxManager, "QxWindowManager");

QxWindowManager.addProperty({ name : "activeWindow", type : QxConst.TYPEOF_OBJECT });






/*
---------------------------------------------------------------------------
  MODIFIER
---------------------------------------------------------------------------
*/

proto._modifyActiveWindow = function(propValue, propOldValue, propData)
{
  QxPopupManager.update();

  if (propOldValue) {
    propOldValue.setActive(false);
  };

  if (propValue) {
    propValue.setActive(true);
  };

  if (propOldValue && propOldValue.getModal()) {
    propOldValue.getTopLevelWidget().release(propOldValue);
  };

  if (propValue && propValue.getModal()) {
    propValue.getTopLevelWidget().block(propValue);
  };

  return true;
};






/*
---------------------------------------------------------------------------
  UTILITIES
---------------------------------------------------------------------------
*/

proto.update = function(oTarget)
{
  var vWindow, vHashCode;
  var vAll = this.getAll();

  for (var vHashCode in vAll)
  {
    vWindow = vAll[vHashCode];

    if(!vWindow.getAutoHide()) {
      continue;
    };

    vWindow.hide();
  };
};





/*
---------------------------------------------------------------------------
  MANAGER INTERFACE
---------------------------------------------------------------------------
*/

proto.compareWindows = function(w1, w2)
{
  switch(w1.getWindowManager().getActiveWindow())
  {
    case w1:
      return 1;

    case w2:
      return -1;
  };

  return w1.getZIndex() - w2.getZIndex();
};

proto.add = function(vWindow)
{
  QxManager.prototype.add.call(this, vWindow);

  // this.debug("Add: " + vWindow);
  this.setActiveWindow(vWindow);
};

proto.remove = function(vWindow)
{
  QxManager.prototype.remove.call(this, vWindow);

  // this.debug("Remove: " + vWindow);

  if (this.getActiveWindow() == vWindow)
  {
    var a = [];
    for (var i in this._objects) {
      a.push(this._objects[i]);
    };

    var l = a.length;

    if (l==0)
    {
      this.setActiveWindow(null);
    }
    else if (l==1)
    {
      this.setActiveWindow(a[0]);
    }
    else if (l>1)
    {
      a.sort(this.compareWindows);
      this.setActiveWindow(a[l-1]);
    };
  };
};
