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

#package(guicore)

************************************************************************ */

/*!
  qx.ui.core.ClientDocumentBlocker blocks the inputs from the user.
  This will be used internally to allow better modal dialogs for example.
*/
qx.OO.defineClass("qx.ui.core.ClientDocumentBlocker", qx.ui.basic.Terminator, 
function()
{
  qx.ui.basic.Terminator.call(this);

  this.setEdge(0);
  this.setDisplay(false);
});

qx.OO.changeProperty({ name : "appearance", type : qx.constant.Type.STRING, defaultValue : "blocker" });
