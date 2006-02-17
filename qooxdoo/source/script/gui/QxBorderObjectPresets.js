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
#require(QxBorderObject)

************************************************************************ */

QxBorderObject.init = function()
{
  QxBorderObject.presets = {
    inset : new QxBorderObject(2, QxConst.BORDER_STYLE_INSET),
    outset : new QxBorderObject(2, QxConst.BORDER_STYLE_OUTSET),
    groove : new QxBorderObject(2, QxConst.BORDER_STYLE_GROOVE),
    ridge : new QxBorderObject(2, QxConst.BORDER_STYLE_RIDGE),
    thinInset : new QxBorderObject(1, QxConst.BORDER_STYLE_INSET),
    thinOutset : new QxBorderObject(1, QxConst.BORDER_STYLE_OUTSET),
    verticalDivider : new QxBorderObject(1, QxConst.BORDER_STYLE_INSET),
    horizontalDivider : new QxBorderObject(1, QxConst.BORDER_STYLE_INSET),

    shadow : new QxBorderObject(1, QxConst.BORDER_STYLE_SOLID, "threedshadow"),
    lightShadow : new QxBorderObject(1, QxConst.BORDER_STYLE_SOLID, "threedlightshadow"),
    info : new QxBorderObject(1, QxConst.BORDER_STYLE_SOLID, "infotext")
  };

  QxBorderObject.presets.verticalDivider.setLeftWidth(0);
  QxBorderObject.presets.verticalDivider.setRightWidth(0);

  QxBorderObject.presets.horizontalDivider.setTopWidth(0);
  QxBorderObject.presets.horizontalDivider.setBottomWidth(0);
};

QxBorderObject.init();
