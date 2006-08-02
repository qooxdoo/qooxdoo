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

#module(toolbar)

************************************************************************ */

qx.OO.defineClass("qx.ui.toolbar.ToolBarPartHandle", qx.ui.layout.CanvasLayout, 
function()
{
  qx.ui.layout.CanvasLayout.call(this);

  var l = new qx.ui.basic.Terminator;
  l.setAppearance("toolbar-part-handle-line");
  this.add(l);
});

qx.OO.changeProperty({ name : "appearance", type : qx.constant.Type.STRING, defaultValue : "toolbar-part-handle" });
