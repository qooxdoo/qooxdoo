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
#require(QxDomCore)

************************************************************************ */

QxDom.getScrollLeftSum = function(el)
{
  var sum = 0;
  var p = el.parentNode;

  while (p.nodeType == 1)
  {
    sum += p.scrollLeft;
    p = p.parentNode;
  };

  return sum;
};

QxDom.getScrollTopSum = function(el)
{
  var sum = 0;
  var p = el.parentNode;

  while (p.nodeType == 1)
  {
    sum += p.scrollTop;
    p = p.parentNode;
  };

  return sum;
};
