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
#require(qx.renderer.border.Border)

************************************************************************ */

qx.renderer.border.Border.init = function()
{
  qx.renderer.border.Border.presets = {
    black : new qx.renderer.border.Border(1, qx.Const.BORDER_STYLE_SOLID, "black"),
    white : new qx.renderer.border.Border(1, qx.Const.BORDER_STYLE_SOLID, "white"),
    none : new qx.renderer.border.Border(0, qx.Const.BORDER_STYLE_NONE)
  };
};

qx.renderer.border.Border.init();
