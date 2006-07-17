/* ************************************************************************

   qooxdoo - the new era of web development

   Copyright:
     2004-2006 by 1&1 Internet AG, Germany
     http://www.1und1.de | http://www.1and1.com
     All rights reserved

   License:
     LGPL 2.1: http://creativecommons.org/licenses/LGPL/2.1/

   Internet:
     * http://qooxdoo.org

   Authors:
     * Sebastian Werner (wpbasti)
       <sebastian dot werner at 1und1 dot de>
     * Andreas Ecker (ecker)
       <andreas dot ecker at 1und1 dot de>

************************************************************************ */

/* ************************************************************************

#module(core)
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
