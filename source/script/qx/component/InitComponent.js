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

#module(init)
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

qx.Proto._onunload = function(e) {
  this.terminate();
}
