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

#module(core)
#require(qx.sys.Client)

************************************************************************ */

qx.OO.defineClass("qx.dom.DomEventRegistration");

if (qx.sys.Client.isMshtml())
{
  qx.dom.DomEventRegistration.addEventListener = function(vElement, vType, vFunction) {
    vElement.attachEvent(qx.constant.Core.ON + vType, vFunction);
  }

  qx.dom.DomEventRegistration.removeEventListener = function(vElement, vType, vFunction) {
    vElement.detachEvent(qx.constant.Core.ON + vType, vFunction);
  }
}
else
{
  qx.dom.DomEventRegistration.addEventListener = function(vElement, vType, vFunction) {
    vElement.addEventListener(vType, vFunction, false);
  }

  qx.dom.DomEventRegistration.removeEventListener = function(vElement, vType, vFunction) {
    vElement.removeEventListener(vType, vFunction, false);
  }
}
