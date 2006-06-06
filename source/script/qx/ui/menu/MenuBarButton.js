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

#package(menu)

************************************************************************ */

qx.OO.defineClass("qx.ui.menu.MenuBarButton", qx.ui.toolbar.ToolBarMenuButton, 
function(vText, vMenu, vIcon, vIconWidth, vIconHeight, vFlash) {
  qx.ui.toolbar.ToolBarMenuButton.call(this, vText, vMenu, vIcon, vIconWidth, vIconHeight, vFlash);
});
