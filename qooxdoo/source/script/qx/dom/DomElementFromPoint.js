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

#module(dom)
#require(qx.dom.DomStyle)
#require(qx.dom.DomLocation)

************************************************************************ */

qx.OO.defineClass("qx.dom.DomElementFromPoint");

qx.dom.DomElementFromPoint.getElementFromPoint = function(x, y) {
  return qx.dom.DomElementFromPoint.getElementFromPointHandler(document.body, x, y);
}

qx.dom.DomElementFromPoint.getElementFromPointHandler = function(node, x, y, recursive)
{
  var ch = node.childNodes;
  var chl = ch.length-1;

  if (chl < 0) {
    return null;
  }

  var chc, subres, ret;

  do
  {
    chc = ch[chl];
    ret = qx.dom.DomElementFromPoint.getElementFromPointChecker(chc, x, y);

    if (ret)
    {
      if (typeof recursive === qx.constant.Type.BOOLEAN && recursive == false)
      {
        return chc;
      }
      else
      {
        subres = qx.dom.DomElementFromPoint.getElementFromPointHandler(chc, x-ret[0]-qx.dom.DomStyle.getBorderLeft(chc), y-ret[2]-qx.dom.DomStyle.getBorderTop(chc));
        return subres ? subres : chc;
      }
    }
  }
  while(chl--);

  return null;
}

qx.dom.DomElementFromPoint.getElementFromPointChecker = function(chc, x, y)
{
  var xstart, ystart, xstop, ystop;

  if (chc.nodeType != 1) {
    return false;
  }

  xstart = qx.dom.DomOffset.getLeft(chc);
  if (x > xstart)
  {
    ystart = qx.dom.DomOffset.getTop(chc);
    if (y > ystart)
    {
      xstop = xstart + chc.offsetWidth;

      if (x < xstop)
      {
        ystop = ystart + chc.offsetHeight;
        if (y < ystop)
        {
          return [ xstart, xstop, ystart, ystop ];
        }
      }
    }
  }

  return false;
}

qx.dom.DomElementFromPoint.getElementAbsolutePointChecker = function(chc, x, y)
{
  var xstart, ystart, xstop, ystop;

  if (!chc || chc.nodeType != 1) {
    return false;
  }

  xstart = qx.dom.DomLocation.getPageBoxLeft(chc);
  if (x > xstart)
  {
    ystart = qx.dom.DomLocation.getPageBoxTop(chc);
    if (y > ystart)
    {
      xstop = xstart + chc.offsetWidth;

      if (x < xstop)
      {
        ystop = ystart + chc.offsetHeight;
        if (y < ystop)
        {
          return [ xstart, xstop, ystart, ystop ];
        }
      }
    }
  }

  return false;
}
