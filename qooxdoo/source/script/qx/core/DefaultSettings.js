/* ************************************************************************

   qooxdoo - the new era of web development

   Copyright:
     2004-2006 by Schlund + Partner AG, Germany
     All rights reserved

   License:
     LGPL 2.1: http://creativecommons.org/licenses/LGPL/2.1/

   Internet:
     * http://qooxdoo.org

   Authors:
     * Sebastian Werner (wpbasti)
       <sw at schlund dot de>
     * Andreas Ecker (ecker)
       <ae at schlund dot de>

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
  enableJsonDebug : false,

  enableApplicationLayout : true,
  enableUserInterface : true,

  enablePrototypes : false,
  enableGenerics : true,

  imageCorePath : "../../images",
  imageLocalPath : "./",
  imageIconPath : "../../themes/icons",
  imageWidgetPath : "../../themes/widgets",

  jsonEncodeUndefined : true
});
