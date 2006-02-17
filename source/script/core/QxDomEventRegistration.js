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
#require(QxClient)
#require(QxDomCore)

************************************************************************ */

if (QxClient.isMshtml())
{
  QxDom.addEventListener = function(vElement, vType, vFunction) {
    vElement.attachEvent(QxDom.STR_ON + vType, vFunction);
  };

  QxDom.removeEventListener = function(vElement, vType, vFunction) {
    vElement.detachEvent(QxDom.STR_ON + vType, vFunction);
  };
}
else
{
  QxDom.addEventListener = function(vElement, vType, vFunction) {
    vElement.addEventListener(vType, vFunction, false);
  };

  QxDom.removeEventListener = function(vElement, vType, vFunction) {
    vElement.removeEventListener(vType, vFunction, false);
  };
};
