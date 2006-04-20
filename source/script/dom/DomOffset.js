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
#require(QxDomStyle)

************************************************************************ */

/*
Mozilla seems to be a little buggy here.
Mozilla/5.0 (Windows; U; Windows NT 5.1; de-DE; rv:1.7.5) Gecko/20041108 Firefox/1.0

It calculates some borders and/or paddings to the offsetProperties.
*/
if (qx.sys.Client.isGecko())
{
  qx.dom.getOffsetLeft = function(el)
  {
    var val = el.offsetLeft;
    var pa = el.parentNode;

    var pose = qx.dom.getComputedStyleProperty(el, "position");
    var posp = qx.dom.getComputedStyleProperty(pa, "position");

    // If element is positioned non-static: Substract the border of the element
    if (pose != qx.Const.CORE_ABSOLUTE && pose != qx.Const.CORE_FIXED) {
      val -= qx.dom.getComputedBorderLeft(pa);
    };

    // If parent is positioned static: Substract the border of the first
    // parent element which is ab positioned non-static.
    if (posp != qx.Const.CORE_ABSOLUTE && posp != qx.Const.CORE_FIXED)
    {
      while(pa)
      {
        pa = pa.parentNode;

        if (!pa || qx.util.Validation.isInvalidString(pa.tagName)) {
          break;
        };

        var posi = qx.dom.getComputedStyleProperty(pa, "position");

        if (posi == qx.Const.CORE_ABSOLUTE || posi == qx.Const.CORE_FIXED) {
          val -= qx.dom.getComputedBorderLeft(pa) + qx.dom.getComputedPaddingLeft(pa);
          break;
        };
      };
    };

    return val;
  };

  qx.dom.getOffsetTop = function(el)
  {
    var val = el.offsetTop;
    var pa = el.parentNode;

    var pose = qx.dom.getComputedStyleProperty(el, "position");
    var posp = qx.dom.getComputedStyleProperty(pa, "position");

    // If element is positioned non-static: Substract the border of the element
    if (pose != qx.Const.CORE_ABSOLUTE && pose != qx.Const.CORE_FIXED) {
      val -= qx.dom.getComputedBorderTop(pa);
    };

    // If parent is positioned static: Substract the border of the first
    // parent element which is ab positioned non-static.
    if (posp != qx.Const.CORE_ABSOLUTE && posp != qx.Const.CORE_FIXED)
    {
      while(pa)
      {
        pa = pa.parentNode;

        if (!pa || qx.util.Validation.isInvalidString(pa.tagName)) {
          break;
        };

        var posi = qx.dom.getComputedStyleProperty(pa, "position");

        if (posi == qx.Const.CORE_ABSOLUTE || posi == qx.Const.CORE_FIXED) {
          val -= qx.dom.getComputedBorderTop(pa) + qx.dom.getComputedPaddingTop(pa);
          break;
        };
      };
    };

    return val;
  };
}
else
{
  qx.dom.getOffsetLeft = function(el) {
    return el.offsetLeft;
  };

  qx.dom.getOffsetTop = function(el) {
    return el.offsetTop;
  };
};
