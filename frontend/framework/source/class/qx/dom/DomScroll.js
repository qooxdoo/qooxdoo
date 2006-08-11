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
  }

  return sum;
}

qx.dom.DomScroll.getTopSum = function(el)
{
  var sum = 0;
  var p = el.parentNode;

  while (p.nodeType == 1)
  {
    sum += p.scrollTop;
    p = p.parentNode;
  }

  return sum;
}
