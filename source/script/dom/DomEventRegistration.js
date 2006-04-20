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

#package(dom)
#require(qx.sys.Client)

************************************************************************ */

qx.dom.DomEventRegistration = {};

if (qx.sys.Client.isMshtml())
{
  qx.dom.DomEventRegistration.addEventListener = function(vElement, vType, vFunction) {
    vElement.attachEvent(qx.Const.CORE_ON + vType, vFunction);
  };

  qx.dom.DomEventRegistration.removeEventListener = function(vElement, vType, vFunction) {
    vElement.detachEvent(qx.Const.CORE_ON + vType, vFunction);
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
