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
#require(qx.sys.Client)
#require(qx.dom.DomStyle)

************************************************************************ */

qx.OO.defineClass("qx.dom.DomOffset");

/*
Mozilla seems to be a little buggy here.
Mozilla/5.0 (Windows; U; Windows NT 5.1; de-DE; rv:1.7.5) Gecko/20041108 Firefox/1.0

It calculates some borders and/or paddings to the offsetProperties.
*/
if (qx.sys.Client.isGecko())
{
  qx.dom.DomOffset.getLeft = function(el)
  {
    var val = el.offsetLeft;
    var pa = el.parentNode;

    var pose = qx.dom.DomStyle.getStyleProperty(el, "position");
    var posp = qx.dom.DomStyle.getStyleProperty(pa, "position");

    // If element is positioned non-static: Substract the border of the element
    if (pose != qx.constant.Style.POSITION_ABSOLUTE && pose != qx.constant.Style.POSITION_FIXED) {
      val -= qx.dom.DomStyle.getBorderLeft(pa);
    }

    // If parent is positioned static: Substract the border of the first
    // parent element which is ab positioned non-static.
    if (posp != qx.constant.Style.POSITION_ABSOLUTE && posp != qx.constant.Style.POSITION_FIXED)
    {
      while(pa)
      {
        pa = pa.parentNode;

        if (!pa || qx.util.Validation.isInvalidString(pa.tagName)) {
          break;
        }

        var posi = qx.dom.DomStyle.getStyleProperty(pa, "position");

        if (posi == qx.constant.Style.POSITION_ABSOLUTE || posi == qx.constant.Style.POSITION_FIXED) {
          val -= qx.dom.DomStyle.getBorderLeft(pa) + qx.dom.DomStyle.getPaddingLeft(pa);
          break;
        }
      }
    }

    return val;
  }

  qx.dom.DomOffset.getTop = function(el)
  {
    var val = el.offsetTop;
    var pa = el.parentNode;

    var pose = qx.dom.DomStyle.getStyleProperty(el, "position");
    var posp = qx.dom.DomStyle.getStyleProperty(pa, "position");

    // If element is positioned non-static: Substract the border of the element
    if (pose != qx.constant.Style.POSITION_ABSOLUTE && pose != qx.constant.Style.POSITION_FIXED) {
      val -= qx.dom.DomStyle.getBorderTop(pa);
    }

    // If parent is positioned static: Substract the border of the first
    // parent element which is ab positioned non-static.
    if (posp != qx.constant.Style.POSITION_ABSOLUTE && posp != qx.constant.Style.POSITION_FIXED)
    {
      while(pa)
      {
        pa = pa.parentNode;

        if (!pa || qx.util.Validation.isInvalidString(pa.tagName)) {
          break;
        }

        var posi = qx.dom.DomStyle.getStyleProperty(pa, "position");

        if (posi == qx.constant.Style.POSITION_ABSOLUTE || posi == qx.constant.Style.POSITION_FIXED) {
          val -= qx.dom.DomStyle.getBorderTop(pa) + qx.dom.DomStyle.getPaddingTop(pa);
          break;
        }
      }
    }

    return val;
  }
}
else
{
  qx.dom.DomOffset.getLeft = function(el) {
    return el.offsetLeft;
  }

  qx.dom.DomOffset.getTop = function(el) {
    return el.offsetTop;
  }
}
