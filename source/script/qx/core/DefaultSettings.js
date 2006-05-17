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

#package(core)
#require(qx.OO)

************************************************************************ */

qx.OO.defineClass("qx.core.DefaultSettings",
{
  version : "0.6-alpha2",

  enableWidgetDebug : false,
  enableDisposerDebug : false,
  enableTransportDebug : false,

  enableApplicationLayout : true,
  enableUserInterface : true,

  enablePrototypes : false,
  enableGenerics : true,

  imageCorePath : "../../images",
  imageLocalPath : "./",
  imageIconPath : "../../themes/icons",
  imageWidgetPath : "../../themes/widgets"
});
