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
#require(QxDomStyle)
#require(QxDomLocation)

************************************************************************ */

QxDom.getElementFromPoint = function(x, y) {
  return QxDom.getElementFromPointHandler(document.body, x, y);
};

QxDom.getElementFromPointHandler = function(node, x, y, recursive)
{
  var ch = node.childNodes;
  var chl = ch.length-1;

  if (chl < 0) {
    return null;
  };

  var chc, subres, ret;

  do
  {
    chc = ch[chl];
    ret = QxDom.getElementFromPointChecker(chc, x, y);

    if (ret)
    {
      if (typeof recursive === QxConst.TYPEOF_BOOLEAN && recursive == false)
      {
        return chc;
      }
      else
      {
        subres = QxDom.getElementFromPointHandler(chc, x-ret[0]-QxDom.getComputedBorderLeft(chc), y-ret[2]-QxDom.getComputedBorderTop(chc));
        return subres ? subres : chc;
      };
    };
  }
  while(chl--);

  return null;
};

QxDom.getElementFromPointChecker = function(chc, x, y)
{
  var xstart, ystart, xstop, ystop;

  if (chc.nodeType != 1) {
    return false;
  };

  xstart = QxDom.getOffsetLeft(chc);
  if (x > xstart)
  {
    ystart = QxDom.getOffsetTop(chc);
    if (y > ystart)
    {
      xstop = xstart + chc.offsetWidth;

      // QxLabel is something bad, mozilla seems not to be fast enough to
      // get the correct "shown" width, ugly -> use preferredwidth to fix this
      if (xstop == xstart && chc.className == "QxLabel") {
        xstop = xstart + chc._QxWidget.getAnyWidth();
      };

      if (x < xstop)
      {
        ystop = ystart + chc.offsetHeight;
        if (y < ystop)
        {
          return [ xstart, xstop, ystart, ystop ];
        };
      };
    };
  };

  return false;
};

QxDom.getElementAbsolutePointChecker = function(chc, x, y)
{
  var xstart, ystart, xstop, ystop;

  if (!chc || chc.nodeType != 1) {
    return false;
  };

  xstart = QxDom.getComputedPageBoxLeft(chc);
  if (x > xstart)
  {
    ystart = QxDom.getComputedPageBoxTop(chc);
    if (y > ystart)
    {
      xstop = xstart + chc.offsetWidth;

      // QxLabel is something bad, mozilla seems not to be fast enough to
      // get the correct "shown" width, ugly -> use preferredwidth to fix this
      if (xstop == xstart && chc.className == "QxLabel") {
        xstop = xstart + chc._QxWidget.getAnyWidth();
      };

      if (x < xstop)
      {
        ystop = ystart + chc.offsetHeight;
        if (y < ystop)
        {
          return [ xstart, xstop, ystart, ystop ];
        };
      };
    };
  };

  return false;
};
