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

#package(init)
#use(qx.core.Init)

************************************************************************ */

qx.OO.defineClass("qx.component.InitComponent", qx.component.AbstractComponent,
function() {
  qx.component.AbstractComponent.call(this);
});





/*
---------------------------------------------------------------------------
  EVENT HANDLER
---------------------------------------------------------------------------
*/

qx.Proto._onload = function(e)
{
  this.initialize();
  this.main();
  this.finalize();
}

qx.Proto._onbeforeunload = function(e) {
  this.close();
}

qx.Proto._onunload = function(e)
{
  this.terminate();
  qx.core.Object.dispose();
}
