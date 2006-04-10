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
#require(QxDomCore)

************************************************************************ */

if (qx.sys.Client.isMshtml())
{
  qx.dom.addEventListener = function(vElement, vType, vFunction) {
    vElement.attachEvent(qx.dom.STR_ON + vType, vFunction);
  };

  qx.dom.removeEventListener = function(vElement, vType, vFunction) {
    vElement.detachEvent(qx.dom.STR_ON + vType, vFunction);
  };
}
else
{
  qx.dom.addEventListener = function(vElement, vType, vFunction) {
    vElement.addEventListener(vType, vFunction, false);
  };

  qx.dom.removeEventListener = function(vElement, vType, vFunction) {
    vElement.removeEventListener(vType, vFunction, false);
  };
};
