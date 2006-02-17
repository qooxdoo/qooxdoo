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

************************************************************************ */

// Internet Explorer has invented scrollIntoView, but does not behave the same like in Mozilla (which would be better)
// Mozilla has a native well working method scrollIntoView
// Safari does not support scrollIntoView (but it can be found in Webkit since May 2005)
// Opera does not support scrollIntoView

QxDom.BODY_TAG_NAME = "BODY";

QxDom.scrollIntoViewX = function(vElement, vAlignLeft)
{
  var vParentWidth, vParentScrollLeft, vWidth, vHasScroll;

  var vParent = vElement.parentNode;
  var vOffset = vElement.offsetLeft;
  var vWidth = vElement.offsetWidth;

  while(vParent)
  {
    switch(QxDom.getComputedStyleProperty(vParent, QxConst.PROPERTY_OVERFLOW_BOTH))
    {
      case QxConst.OVERFLOW_VALUE_BOTH:
      case QxConst.OVERFLOW_VALUE_AUTO:
      case QxConst.OVERFLOW_VALUE_MOZ_HORIZONTAL:
        vHasScroll = true;
        break;

      default:
        switch(QxDom.getComputedStyleProperty(vParent, QxConst.PROPERTY_OVERFLOW_HORIZONTAL))
        {
          case QxConst.OVERFLOW_VALUE_BOTH:
          case QxConst.OVERFLOW_VALUE_AUTO:
            vHasScroll = true;
            break;

          default:
            vHasScroll = false;
        };
    };

    // QxDebug("QxDom", "Scroll: " + vParent + " :: " + vHasScroll + " :: " + vOffset);

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
      };

      vOffset = vParent.offsetLeft;
      vWidth = vParent.offsetWidth;
    }
    else
    {
      vOffset += vParent.offsetLeft;
    };

    if (vParent.tagName == QxDom.BODY_TAG_NAME) {
      break;
    };

    vParent = vParent.parentNode;
  };

  return true;
};

QxDom.scrollIntoViewY = function(vElement, vAlignTop)
{
  var vParentHeight, vParentScrollTop, vHeight, vHasScroll;

  var vParent = vElement.parentNode;
  var vOffset = vElement.offsetTop;
  var vHeight = vElement.offsetHeight;

  while(vParent)
  {
    switch(QxDom.getComputedStyleProperty(vParent, QxConst.PROPERTY_OVERFLOW_BOTH))
    {
      case QxConst.OVERFLOW_VALUE_BOTH:
      case QxConst.OVERFLOW_VALUE_AUTO:
      case QxConst.OVERFLOW_VALUE_MOZ_VERTICAL:
        vHasScroll = true;
        break;

      default:
        switch(QxDom.getComputedStyleProperty(vParent, QxConst.PROPERTY_OVERFLOW_VERTICAL))
        {
          case QxConst.OVERFLOW_VALUE_BOTH:
          case QxConst.OVERFLOW_VALUE_AUTO:
            vHasScroll = true;
            break;

          default:
            vHasScroll = false;
        };
    };

    // QxDebug("QxDom", "Scroll: " + vParent + " :: " + vHasScroll + " :: " + vOffset);

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
      };

      vOffset = vParent.offsetTop;
      vHeight = vParent.offsetHeight;
    }
    else
    {
      vOffset += vParent.offsetTop;
    };

    if (vParent.tagName == QxDom.BODY_TAG_NAME) {
      break;
    };

    vParent = vParent.parentNode;
  };

  return true;
};
