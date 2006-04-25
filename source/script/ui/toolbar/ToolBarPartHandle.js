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

qx.OO.defineClass("qx.ui.toolbar.ToolBarPartHandle", qx.ui.layout.CanvasLayout, 
function()
{
  qx.ui.layout.CanvasLayout.call(this);

  var l = new qx.ui.basic.Terminator;
  l.setAppearance("toolbar-part-handle-line");
  this.add(l);
});

qx.ui.toolbar.ToolBarPartHandle.changeProperty({ name : "appearance", type : qx.Const.TYPEOF_STRING, defaultValue : "toolbar-part-handle" });
