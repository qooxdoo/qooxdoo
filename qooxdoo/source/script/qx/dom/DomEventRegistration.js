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

#module(dom)
#require(qx.sys.Client)

************************************************************************ */

qx.OO.defineClass("qx.dom.DomEventRegistration");

if (qx.sys.Client.isMshtml())
{
  qx.dom.DomEventRegistration.addEventListener = function(vElement, vType, vFunction) {
    vElement.attachEvent(qx.constant.Core.ON + vType, vFunction);
  };

  qx.dom.DomEventRegistration.removeEventListener = function(vElement, vType, vFunction) {
    vElement.detachEvent(qx.constant.Core.ON + vType, vFunction);
  };
}
else
{
  qx.dom.DomEventRegistration.addEventListener = function(vElement, vType, vFunction) {
    vElement.addEventListener(vType, vFunction, false);
  };

  qx.dom.DomEventRegistration.removeEventListener = function(vElement, vType, vFunction) {
    vElement.removeEventListener(vType, vFunction, false);
  };
};
