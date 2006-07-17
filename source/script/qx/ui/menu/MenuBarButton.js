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

qx.OO.defineClass("qx.ui.menu.MenuBarButton", qx.ui.toolbar.ToolBarMenuButton, 
function(vText, vMenu, vIcon, vIconWidth, vIconHeight, vFlash) {
  qx.ui.toolbar.ToolBarMenuButton.call(this, vText, vMenu, vIcon, vIconWidth, vIconHeight, vFlash);
});
