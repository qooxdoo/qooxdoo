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

#module(ui_core)

************************************************************************ */

/*!
  Some common used border styles.
*/
qx.OO.defineClass("qx.renderer.border.BorderPresets", qx.core.Object, function()
{
  this.black = new qx.renderer.border.Border(1, qx.renderer.border.Border.STYLE_SOLID, "black");
  this.white = new qx.renderer.border.Border(1, qx.renderer.border.Border.STYLE_SOLID, "white");
  this.none = new qx.renderer.border.Border(0, qx.renderer.border.Border.STYLE_NONE);

  this.inset = new qx.renderer.border.BorderObject(2, qx.renderer.border.Border.STYLE_INSET);
  this.outset = new qx.renderer.border.BorderObject(2, qx.renderer.border.Border.STYLE_OUTSET);
  this.groove = new qx.renderer.border.BorderObject(2, qx.renderer.border.Border.STYLE_GROOVE);
  this.ridge = new qx.renderer.border.BorderObject(2, qx.renderer.border.Border.STYLE_RIDGE);
  this.thinInset = new qx.renderer.border.BorderObject(1, qx.renderer.border.Border.STYLE_INSET);
  this.thinOutset = new qx.renderer.border.BorderObject(1, qx.renderer.border.Border.STYLE_OUTSET);

  this.verticalDivider = new qx.renderer.border.BorderObject(1, qx.renderer.border.Border.STYLE_INSET);
  this.verticalDivider.setLeftWidth(0);
  this.verticalDivider.setRightWidth(0);

  this.horizontalDivider = new qx.renderer.border.BorderObject(1, qx.renderer.border.Border.STYLE_INSET);
  this.horizontalDivider.setTopWidth(0);
  this.horizontalDivider.setBottomWidth(0);

  this.shadow = new qx.renderer.border.BorderObject(1, qx.renderer.border.Border.STYLE_SOLID, "threedshadow");
  this.lightShadow = new qx.renderer.border.BorderObject(1, qx.renderer.border.Border.STYLE_SOLID, "threedlightshadow");
  this.info = new qx.renderer.border.BorderObject(1, qx.renderer.border.Border.STYLE_SOLID, "infotext");
});







/*
---------------------------------------------------------------------------
  DEFER SINGLETON INSTANCE
---------------------------------------------------------------------------
*/

qx.manager.object.SingletonManager.add(qx.renderer.border.BorderPresets);
