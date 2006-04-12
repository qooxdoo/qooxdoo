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

#package(menu)

************************************************************************ */

/*!
  This singleton manages multiple instances of QxMenu and their state.
*/
qx.manager.object.MenuManager = function(){
  qx.manager.object.ObjectManager.call(this);
};

qx.manager.object.MenuManager.extend(qx.manager.object.ObjectManager, "qx.manager.object.MenuManager");





/*
---------------------------------------------------------------------------
  METHODS
---------------------------------------------------------------------------
*/

proto.update = function(vTarget)
{
  var vMenu, vHashCode;
  var vAll = this.getAll();

  for (vHashCode in vAll)
  {
    vMenu = vAll[vHashCode];

    if(!vMenu.getAutoHide()) {
      continue;
    };

    if (!vTarget || vMenu.getOpener() != vTarget) {
      vMenu.hide();
    };
  };
};







/*
---------------------------------------------------------------------------
  SINGLETON INSTANCE
---------------------------------------------------------------------------
*/

qx.manager.object.MenuManager = new qx.manager.object.MenuManager;
