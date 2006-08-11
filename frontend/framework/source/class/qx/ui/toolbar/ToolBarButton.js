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
