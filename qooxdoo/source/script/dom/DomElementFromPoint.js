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
#require(QxDomStyle)
#require(QxDomLocation)

************************************************************************ */

qx.dom.getElementFromPoint = function(x, y) {
  return qx.dom.getElementFromPointHandler(document.body, x, y);
};

qx.dom.getElementFromPointHandler = function(node, x, y, recursive)
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
    ret = qx.dom.getElementFromPointChecker(chc, x, y);

    if (ret)
    {
      if (typeof recursive === QxConst.TYPEOF_BOOLEAN && recursive == false)
      {
        return chc;
      }
      else
      {
        subres = qx.dom.getElementFromPointHandler(chc, x-ret[0]-qx.dom.getComputedBorderLeft(chc), y-ret[2]-qx.dom.getComputedBorderTop(chc));
        return subres ? subres : chc;
      };
    };
  }
  while(chl--);

  return null;
};

qx.dom.getElementFromPointChecker = function(chc, x, y)
{
  var xstart, ystart, xstop, ystop;

  if (chc.nodeType != 1) {
    return false;
  };

  xstart = qx.dom.getOffsetLeft(chc);
  if (x > xstart)
  {
    ystart = qx.dom.getOffsetTop(chc);
    if (y > ystart)
    {
      xstop = xstart + chc.offsetWidth;

      // qx.ui.basic.Label is something bad, mozilla seems not to be fast enough to
      // get the correct "shown" width, ugly -> use preferredwidth to fix this
      if (xstop == xstart && chc.className == "qx.ui.basic.Label") {
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

qx.dom.getElementAbsolutePointChecker = function(chc, x, y)
{
  var xstart, ystart, xstop, ystop;

  if (!chc || chc.nodeType != 1) {
    return false;
  };

  xstart = qx.dom.getComputedPageBoxLeft(chc);
  if (x > xstart)
  {
    ystart = qx.dom.getComputedPageBoxTop(chc);
    if (y > ystart)
    {
      xstop = xstart + chc.offsetWidth;

      // qx.ui.basic.Label is something bad, mozilla seems not to be fast enough to
      // get the correct "shown" width, ugly -> use preferredwidth to fix this
      if (xstop == xstart && chc.className == "qx.ui.basic.Label") {
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
