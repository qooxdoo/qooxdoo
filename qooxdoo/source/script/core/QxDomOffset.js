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
#require(QxDomStyle)

************************************************************************ */

/*
Mozilla seems to be a little buggy here.
Mozilla/5.0 (Windows; U; Windows NT 5.1; de-DE; rv:1.7.5) Gecko/20041108 Firefox/1.0

It calculates some borders and/or paddings to the offsetProperties.
*/
if (QxClient.isGecko())
{
  QxDom.getOffsetLeft = function(el)
  {
    var val = el.offsetLeft;
    var pa = el.parentNode;

    var pose = QxDom.getComputedStyleProperty(el, "position");
    var posp = QxDom.getComputedStyleProperty(pa, "position");

    // If element is positioned non-static: Substract the border of the element
    if (pose != QxDom.STR_ABSOLUTE && pose != QxDom.STR_FIXED) {
      val -= QxDom.getComputedBorderLeft(pa);
    };

    // If parent is positioned static: Substract the border of the first
    // parent element which is ab positioned non-static.
    if (posp != QxDom.STR_ABSOLUTE && posp != QxDom.STR_FIXED)
    {
      while(pa)
      {
        pa = pa.parentNode;

        if (!pa || QxUtil.isInvalidString(pa.tagName)) {
          break;
        };

        var posi = QxDom.getComputedStyleProperty(pa, "position");

        if (posi == QxDom.STR_ABSOLUTE || posi == QxDom.STR_FIXED) {
          val -= QxDom.getComputedBorderLeft(pa) + QxDom.getComputedPaddingLeft(pa);
          break;
        };
      };
    };

    return val;
  };

  QxDom.getOffsetTop = function(el)
  {
    var val = el.offsetTop;
    var pa = el.parentNode;

    var pose = QxDom.getComputedStyleProperty(el, "position");
    var posp = QxDom.getComputedStyleProperty(pa, "position");

    // If element is positioned non-static: Substract the border of the element
    if (pose != QxDom.STR_ABSOLUTE && pose != QxDom.STR_FIXED) {
      val -= QxDom.getComputedBorderTop(pa);
    };

    // If parent is positioned static: Substract the border of the first
    // parent element which is ab positioned non-static.
    if (posp != QxDom.STR_ABSOLUTE && posp != QxDom.STR_FIXED)
    {
      while(pa)
      {
        pa = pa.parentNode;

        if (!pa || QxUtil.isInvalidString(pa.tagName)) {
          break;
        };

        var posi = QxDom.getComputedStyleProperty(pa, "position");

        if (posi == QxDom.STR_ABSOLUTE || posi == QxDom.STR_FIXED) {
          val -= QxDom.getComputedBorderTop(pa) + QxDom.getComputedPaddingTop(pa);
          break;
        };
      };
    };

    return val;
  };
}
else
{
  QxDom.getOffsetLeft = function(el) {
    return el.offsetLeft;
  };

  QxDom.getOffsetTop = function(el) {
    return el.offsetTop;
  };
};
