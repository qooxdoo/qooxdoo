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

#module(toolbar)

************************************************************************ */

qx.OO.defineClass("qx.ui.toolbar.ToolBarButton", qx.ui.form.Button, 
function(vText, vIcon, vIconWidth, vIconHeight, vFlash)
{
  qx.ui.form.Button.call(this, vText, vIcon, vIconWidth, vIconHeight, vFlash);

  // Omit focus
  this.setTabIndex(-1);
});

qx.OO.changeProperty({ name : "appearance", type : qx.constant.Type.STRING, defaultValue : "toolbar-button" });





/*
---------------------------------------------------------------------------
  EVENT HANDLER
---------------------------------------------------------------------------
*/

qx.Proto._onkeydown = qx.util.Return.returnTrue;
qx.Proto._onkeyup = qx.util.Return.returnTrue;
