/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2006 by 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL 2.1: http://www.gnu.org/licenses/lgpl.html

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

#require(qx.manager.object.SingletonManager)

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
  DEFER SINGLETON INSTANCE
---------------------------------------------------------------------------
*/

qx.manager.object.SingletonManager.add(qx.manager.object.MenuManager);
