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

************************************************************************ */

qx.OO.defineClass("qx.dom.DomScroll");

qx.dom.DomScroll.getLeftSum = function(el)
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

qx.dom.DomScroll.getTopSum = function(el)
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
