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
