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

qx.dom.DomElementFromPoint = {};

qx.dom.DomElementFromPoint.getElementFromPoint = function(x, y) {
  return qx.dom.DomElementFromPoint.getElementFromPointHandler(document.body, x, y);
};

qx.dom.DomElementFromPoint.getElementFromPointHandler = function(node, x, y, recursive)
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
    ret = qx.dom.DomElementFromPoint.getElementFromPointChecker(chc, x, y);

    if (ret)
    {
      if (typeof recursive === QxConst.TYPEOF_BOOLEAN && recursive == false)
      {
        return chc;
      }
      else
      {
        subres = qx.dom.DomElementFromPoint.getElementFromPointHandler(chc, x-ret[0]-qx.dom.DomStyle.getBorderLeft(chc), y-ret[2]-qx.dom.DomStyle.getBorderTop(chc));
        return subres ? subres : chc;
      };
    };
  }
  while(chl--);

  return null;
};

qx.dom.DomElementFromPoint.getElementFromPointChecker = function(chc, x, y)
{
  var xstart, ystart, xstop, ystop;

  if (chc.nodeType != 1) {
    return false;
  };

  xstart = qx.dom.DomOffset.getLeft(chc);
  if (x > xstart)
  {
    ystart = qx.dom.DomOffset.getTop(chc);
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

qx.dom.DomElementFromPoint.getElementAbsolutePointChecker = function(chc, x, y)
{
  var xstart, ystart, xstop, ystop;

  if (!chc || chc.nodeType != 1) {
    return false;
  };

  xstart = qx.dom.DomLocation.getPageBoxLeft(chc);
  if (x > xstart)
  {
    ystart = qx.dom.DomLocation.getPageBoxTop(chc);
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
