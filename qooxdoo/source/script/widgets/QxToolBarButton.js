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

#package(toolbar)

************************************************************************ */

qx.ui.toolbar.ToolBarButton = function(vText, vIcon, vIconWidth, vIconHeight, vFlash)
{
  qx.ui.form.Button.call(this, vText, vIcon, vIconWidth, vIconHeight, vFlash);

  // Omit focus
  this.setTabIndex(-1);
};

qx.ui.toolbar.ToolBarButton.extend(qx.ui.form.Button, "qx.ui.toolbar.ToolBarButton");

qx.ui.toolbar.ToolBarButton.changeProperty({ name : "appearance", type : QxConst.TYPEOF_STRING, defaultValue : "toolbar-button" });





/*
---------------------------------------------------------------------------
  EVENT HANDLER
---------------------------------------------------------------------------
*/

proto._onkeydown = qx.util.returns.returnTrue;
proto._onkeyup = qx.util.returns.returnTrue;
