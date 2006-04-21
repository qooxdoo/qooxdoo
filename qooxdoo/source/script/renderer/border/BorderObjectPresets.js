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

#package(border)
#require(qx.renderer.border.BorderObject)

************************************************************************ */

qx.renderer.border.BorderObject.init = function()
{
  qx.renderer.border.BorderObject.presets = {
    inset : new qx.renderer.border.BorderObject(2, qx.Const.BORDER_STYLE_INSET),
    outset : new qx.renderer.border.BorderObject(2, qx.Const.BORDER_STYLE_OUTSET),
    groove : new qx.renderer.border.BorderObject(2, qx.Const.BORDER_STYLE_GROOVE),
    ridge : new qx.renderer.border.BorderObject(2, qx.Const.BORDER_STYLE_RIDGE),
    thinInset : new qx.renderer.border.BorderObject(1, qx.Const.BORDER_STYLE_INSET),
    thinOutset : new qx.renderer.border.BorderObject(1, qx.Const.BORDER_STYLE_OUTSET),
    verticalDivider : new qx.renderer.border.BorderObject(1, qx.Const.BORDER_STYLE_INSET),
    horizontalDivider : new qx.renderer.border.BorderObject(1, qx.Const.BORDER_STYLE_INSET),

    shadow : new qx.renderer.border.BorderObject(1, qx.Const.BORDER_STYLE_SOLID, "threedshadow"),
    lightShadow : new qx.renderer.border.BorderObject(1, qx.Const.BORDER_STYLE_SOLID, "threedlightshadow"),
    info : new qx.renderer.border.BorderObject(1, qx.Const.BORDER_STYLE_SOLID, "infotext")
  };

  qx.renderer.border.BorderObject.presets.verticalDivider.setLeftWidth(0);
  qx.renderer.border.BorderObject.presets.verticalDivider.setRightWidth(0);

  qx.renderer.border.BorderObject.presets.horizontalDivider.setTopWidth(0);
  qx.renderer.border.BorderObject.presets.horizontalDivider.setBottomWidth(0);
};

qx.renderer.border.BorderObject.init();
