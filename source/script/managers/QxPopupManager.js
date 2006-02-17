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

#package(popup)

************************************************************************ */

/*!
  This singleton is used to manager multiple instances of popups and their state.
*/
function QxPopupManager() {
  QxManager.call(this);
};

QxPopupManager.extend(QxManager, "QxPopupManager");



/*
---------------------------------------------------------------------------
  METHODS
---------------------------------------------------------------------------
*/

proto.update = function(vTarget)
{
  // be sure that target is correctly set (needed for contains() later)
  if (!(vTarget instanceof QxWidget)) {
    vTarget = null;
  };

  var vPopup, vHashCode;
  var vAll = this.getAll();

  for (vHashCode in vAll)
  {
    vPopup = vAll[vHashCode];

    if(!vPopup.getAutoHide() || vTarget == vPopup || vPopup.contains(vTarget)) {
      continue;
    };

    vPopup.hide();
  };
};






/*
---------------------------------------------------------------------------
  SINGLETON INSTANCE
---------------------------------------------------------------------------
*/

QxPopupManager = new QxPopupManager;
