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

************************************************************************ */

qx.OO.defineClass("qx.dom.DomScrollIntoView");

// Internet Explorer has invented scrollIntoView, but does not behave the same like in Mozilla (which would be better)
// Mozilla has a native well working method scrollIntoView
// Safari does not support scrollIntoView (but it can be found in Webkit since May 2005)
// Opera does not support scrollIntoView

qx.dom.BODY_TAG_NAME = "BODY";

qx.dom.DomScrollIntoView.scrollX = function(vElement, vAlignLeft)
{
  var vParentWidth, vParentScrollLeft, vWidth, vHasScroll;

  var vParent = vElement.parentNode;
  var vOffset = vElement.offsetLeft;
  var vWidth = vElement.offsetWidth;

  while(vParent)
  {
    switch(qx.dom.DomStyle.getStyleProperty(vParent, qx.constant.Style.PROPERTY_OVERFLOW_BOTH))
    {
      case qx.constant.Style.OVERFLOW_BOTH:
      case qx.constant.Style.OVERFLOW_AUTO:
      case qx.constant.Style.OVERFLOW_MOZ_HORIZONTAL:
        vHasScroll = true;
        break;

      default:
        switch(qx.dom.DomStyle.getStyleProperty(vParent, qx.constant.Style.PROPERTY_OVERFLOW_HORIZONTAL))
        {
          case qx.constant.Style.OVERFLOW_BOTH:
          case qx.constant.Style.OVERFLOW_AUTO:
            vHasScroll = true;
            break;

          default:
            vHasScroll = false;
        }
    }

    if (vHasScroll)
    {
      vParentWidth = vParent.clientWidth;
      vParentScrollLeft = vParent.scrollLeft;

      if (vAlignLeft)
      {
        vParent.scrollLeft = vOffset;
      }
      else if (vAlignLeft == false)
      {
        vParent.scrollLeft = vOffset + vWidth - vParentWidth;
      }
      else if (vWidth > vParentWidth || vOffset < vParentScrollLeft)
      {
        vParent.scrollLeft = vOffset;
      }
      else if ((vOffset + vWidth) > (vParentScrollLeft + vParentWidth))
      {
        vParent.scrollLeft = vOffset + vWidth - vParentWidth;
      }

      vOffset = vParent.offsetLeft;
      vWidth = vParent.offsetWidth;
    }
    else
    {
      vOffset += vParent.offsetLeft;
    }

    if (vParent.tagName == qx.dom.BODY_TAG_NAME) {
      break;
    }

    vParent = vParent.parentNode;
  }

  return true;
}

qx.dom.DomScrollIntoView.scrollY = function(vElement, vAlignTop)
{
  var vParentHeight, vParentScrollTop, vHeight, vHasScroll;

  var vParent = vElement.parentNode;
  var vOffset = vElement.offsetTop;
  var vHeight = vElement.offsetHeight;

  while(vParent)
  {
    switch(qx.dom.DomStyle.getStyleProperty(vParent, qx.constant.Style.PROPERTY_OVERFLOW_BOTH))
    {
      case qx.constant.Style.OVERFLOW_BOTH:
      case qx.constant.Style.OVERFLOW_AUTO:
      case qx.constant.Style.OVERFLOW_MOZ_VERTICAL:
        vHasScroll = true;
        break;

      default:
        switch(qx.dom.DomStyle.getStyleProperty(vParent, qx.constant.Style.PROPERTY_OVERFLOW_VERTICAL))
        {
          case qx.constant.Style.OVERFLOW_BOTH:
          case qx.constant.Style.OVERFLOW_AUTO:
            vHasScroll = true;
            break;

          default:
            vHasScroll = false;
        }
    }

    if (vHasScroll)
    {
      vParentHeight = vParent.clientHeight;
      vParentScrollTop = vParent.scrollTop;

      if (vAlignTop)
      {
        vParent.scrollTop = vOffset;
      }
      else if (vAlignTop == false)
      {
        vParent.scrollTop = vOffset + vHeight - vParentHeight;
      }
      else if (vHeight > vParentHeight || vOffset < vParentScrollTop)
      {
        vParent.scrollTop = vOffset;
      }
      else if ((vOffset + vHeight) > (vParentScrollTop + vParentHeight))
      {
        vParent.scrollTop = vOffset + vHeight - vParentHeight;
      }

      vOffset = vParent.offsetTop;
      vHeight = vParent.offsetHeight;
    }
    else
    {
      vOffset += vParent.offsetTop;
    }

    if (vParent.tagName == qx.dom.BODY_TAG_NAME) {
      break;
    }

    vParent = vParent.parentNode;
  }

  return true;
}
