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

#module(menu)

************************************************************************ */

qx.OO.defineClass("qx.ui.menu.MenuBarButton", qx.ui.toolbar.ToolBarMenuButton, 
function(vText, vMenu, vIcon, vIconWidth, vIconHeight, vFlash) {
  qx.ui.toolbar.ToolBarMenuButton.call(this, vText, vMenu, vIcon, vIconWidth, vIconHeight, vFlash);
});
