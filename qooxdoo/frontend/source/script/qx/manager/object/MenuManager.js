/* ************************************************************************

   qooxdoo - the new era of web development

   Copyright:
     2004-2006 by 1&1 Internet AG, Germany
     http://www.1und1.de | http://www.1and1.com
     All rights reserved

   License:
     LGPL 2.1: http://creativecommons.org/licenses/LGPL/2.1/

   Internet:
     * http://qooxdoo.org

   Authors:
     * Sebastian Werner (wpbasti)
       <sebastian dot werner at 1und1 dot de>
     * Andreas Ecker (ecker)
       <andreas dot ecker at 1und1 dot de>

************************************************************************ */

/* ************************************************************************

#module(menu)

************************************************************************ */

/*!
  This singleton manages multiple instances of qx.ui.menu.Menu and their state.
*/
qx.OO.defineClass("qx.manager.object.MenuManager", qx.manager.object.ObjectManager, 
function(){
  qx.manager.object.ObjectManager.call(this);
});





/*
---------------------------------------------------------------------------
  METHODS
---------------------------------------------------------------------------
*/

qx.Proto.update = function(vTarget)
{
  var vMenu, vHashCode;
  var vAll = this.getAll();

  for (vHashCode in vAll)
  {
    vMenu = vAll[vHashCode];

    if(!vMenu.getAutoHide()) {
      continue;
    }

    if (!vTarget || vMenu.getOpener() != vTarget) {
      vMenu.hide();
    }
  }
}







/*
---------------------------------------------------------------------------
  SINGLETON INSTANCE
---------------------------------------------------------------------------
*/

qx.manager.object.MenuManager = new qx.manager.object.MenuManager;
