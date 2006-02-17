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
#require(QxDomScroll)
#require(QxDomDimension)

************************************************************************ */

QxDom.getComputedPageOuterLeft     = function(el) { return QxDom.getComputedPageBoxLeft(el)     - QxDom.getComputedMarginLeft(el); };
QxDom.getComputedPageOuterTop      = function(el) { return QxDom.getComputedPageBoxTop(el)      - QxDom.getComputedMarginTop(el); };
QxDom.getComputedPageOuterRight    = function(el) { return QxDom.getComputedPageBoxRight(el)    + QxDom.getComputedMarginRight(el); };
QxDom.getComputedPageOuterBottom   = function(el) { return QxDom.getComputedPageBoxBottom(el)   + QxDom.getComputedMarginBottom(el); };

QxDom.getComputedClientOuterLeft   = function(el) { return QxDom.getComputedClientBoxLeft(el)   - QxDom.getComputedMarginLeft(el); };
QxDom.getComputedClientOuterTop    = function(el) { return QxDom.getComputedClientBoxTop(el)    - QxDom.getComputedMarginTop(el); };
QxDom.getComputedClientOuterRight  = function(el) { return QxDom.getComputedClientBoxRight(el)  + QxDom.getComputedMarginRight(el); };
QxDom.getComputedClientOuterBottom = function(el) { return QxDom.getComputedClientBoxBottom(el) + QxDom.getComputedMarginBottom(el); };


if (QxClient.isMshtml())
{
  QxDom.getComputedClientBoxLeft   = function(el) { return el.getBoundingClientRect().left; };
  QxDom.getComputedClientBoxTop    = function(el) { return el.getBoundingClientRect().top; };

  QxDom.getComputedPageBoxLeft     = function(el) { return QxDom.getComputedClientBoxLeft(el)  + QxDom.getScrollLeftSum(el); };
  QxDom.getComputedPageBoxTop      = function(el) { return QxDom.getComputedClientBoxTop(el)   + QxDom.getScrollTopSum(el); };
}
else if (QxClient.isGecko())
{
  QxDom.getComputedClientBoxLeft   = function(el) { return QxDom.getComputedClientAreaLeft(el) - QxDom.getComputedBorderLeft(el); };
  QxDom.getComputedClientBoxTop    = function(el) { return QxDom.getComputedClientAreaTop(el)  - QxDom.getComputedBorderTop(el); };

  QxDom.getComputedPageBoxLeft     = function(el) { return QxDom.getComputedPageAreaLeft(el)   - QxDom.getComputedBorderLeft(el); };
  QxDom.getComputedPageBoxTop      = function(el) { return QxDom.getComputedPageAreaTop(el)    - QxDom.getComputedBorderTop(el); };
}
else
{
  QxDom.getComputedPageBoxLeft = function(el)
  {
    var sum = el.offsetLeft;
    while (el.tagName != "BODY")
    {
      el = el.offsetParent;
      sum += el.offsetLeft;
    };

    return sum;
  };

  QxDom.getComputedPageBoxTop = function(el)
  {
    var sum = el.offsetTop;
    while (el.tagName != "BODY")
    {
      el = el.offsetParent;
      sum += el.offsetTop;
    };

    return sum;
  };

  QxDom.getComputedClientBoxLeft = function(el)
  {
    var sum = el.offsetLeft;
    while (el.tagName != "BODY")
    {
      el = el.offsetParent;
      sum += el.offsetLeft - el.scrollLeft;
    };

    return sum;
  };

  QxDom.getComputedClientBoxTop = function(el)
  {
    var sum = el.offsetTop;
    while (el.tagName != "BODY")
    {
      el = el.offsetParent;
      sum += el.offsetTop - el.scrollTop;
    };

    return sum;
  };
};

if (QxClient.isMshtml())
{
  QxDom.getComputedClientBoxRight  = function(el) { return el.getBoundingClientRect().right; };
  QxDom.getComputedClientBoxBottom = function(el) { return el.getBoundingClientRect().bottom; };

  QxDom.getComputedPageBoxRight    = function(el) { return QxDom.getComputedClientBoxRight(el)  + QxDom.getScrollLeftSum(el); };
  QxDom.getComputedPageBoxBottom   = function(el) { return QxDom.getComputedClientBoxBottom(el) + QxDom.getScrollTopSum(el);  };
}
else
{
  QxDom.getComputedClientBoxRight  = function(el) { return QxDom.getComputedClientBoxLeft(el) + QxDom.getComputedBoxWidth(el); };
  QxDom.getComputedClientBoxBottom = function(el) { return QxDom.getComputedClientBoxTop(el)  + QxDom.getComputedBoxHeight(el); };

  QxDom.getComputedPageBoxRight    = function(el) { return QxDom.getComputedPageBoxLeft(el)   + QxDom.getComputedBoxWidth(el); };
  QxDom.getComputedPageBoxBottom   = function(el) { return QxDom.getComputedPageBoxTop(el)    + QxDom.getComputedBoxHeight(el); };
};

if (QxClient.isGecko())
{
  QxDom.getComputedPageAreaLeft = function(el) {
    return el.ownerDocument.getBoxObjectFor(el).x;
  };

  QxDom.getComputedPageAreaTop = function(el) {
    return el.ownerDocument.getBoxObjectFor(el).y;
  };

  // We need to subtract the scroll position of all parent containers (bug #186229).
  QxDom.getComputedClientAreaLeft = function(el) {
    return QxDom.getComputedPageAreaLeft(el) - QxDom.getScrollLeftSum(el);
  };

  // We need to subtract the scroll position of all parent containers (bug #186229).
  QxDom.getComputedClientAreaTop = function(el) {
    return QxDom.getComputedPageAreaTop(el) - QxDom.getScrollTopSum(el);
  };
}
else
{
  QxDom.getComputedClientAreaLeft = function(el) { return QxDom.getComputedClientBoxLeft(el) + QxDom.getComputedBorderLeft(el); };
  QxDom.getComputedClientAreaTop  = function(el) { return QxDom.getComputedClientBoxTop(el)  + QxDom.getComputedBorderTop(el); };

  QxDom.getComputedPageAreaLeft = function(el) { return QxDom.getComputedPageBoxLeft(el) + QxDom.getComputedBorderLeft(el); };
  QxDom.getComputedPageAreaTop  = function(el) { return QxDom.getComputedPageBoxTop(el)  + QxDom.getComputedBorderTop(el); };
};



QxDom.getComputedClientAreaRight   = function(el) { return QxDom.getComputedClientAreaLeft(el)  + QxDom.getComputedAreaWidth(el);  };
QxDom.getComputedClientAreaBottom  = function(el) { return QxDom.getComputedClientAreaTop(el)   + QxDom.getComputedAreaHeight(el); };

QxDom.getComputedPageAreaRight     = function(el) { return QxDom.getComputedPageAreaLeft(el)    + QxDom.getComputedAreaWidth(el);  };
QxDom.getComputedPageAreaBottom    = function(el) { return QxDom.getComputedPageAreaTop(el)     + QxDom.getComputedAreaHeight(el); };




QxDom.getComputedClientInnerLeft   = function(el) { return QxDom.getComputedClientAreaLeft(el)  + QxDom.getComputedPaddingLeft(el); };
QxDom.getComputedClientInnerTop    = function(el) { return QxDom.getComputedClientAreaTop(el)   + QxDom.getComputedPaddingTop(el);  };
QxDom.getComputedClientInnerRight  = function(el) { return QxDom.getComputedClientInnerLeft(el) + QxDom.getComputedInnerWidth(el);  };
QxDom.getComputedClientInnerBottom = function(el) { return QxDom.getComputedClientInnerTop(el)  + QxDom.getComputedInnerHeight(el); };

QxDom.getComputedPageInnerLeft     = function(el) { return QxDom.getComputedPageAreaLeft(el)    + QxDom.getComputedPaddingLeft(el); };
QxDom.getComputedPageInnerTop      = function(el) { return QxDom.getComputedPageAreaTop(el)     + QxDom.getComputedPaddingTop(el);  };
QxDom.getComputedPageInnerRight    = function(el) { return QxDom.getComputedPageInnerLeft(el)   + QxDom.getComputedInnerWidth(el);  };
QxDom.getComputedPageInnerBottom   = function(el) { return QxDom.getComputedPageInnerTop(el)    + QxDom.getComputedInnerHeight(el); };


// Screen
if (QxClient.isGecko())
{
  /*
    screenX and screenY seem to return the distance to the box
    and not to the area. Confusing, especially as the x and y properties
    of the BoxObject return the distance to the area.
  */

  QxDom.getComputedScreenBoxLeft = function(el)
  {
    // We need to subtract the scroll position of all
    // parent containers (bug #186229).
    var sum = 0;
    var p = el.parentNode;
    while (p.nodeType == 1) {
      sum += p.scrollLeft;
      p = p.parentNode;
    };

    return el.ownerDocument.getBoxObjectFor(el).screenX - sum;
  };

  QxDom.getComputedScreenBoxTop = function(el)
  {
    // We need to subtract the scroll position of all
    // parent containers (bug #186229).
    var sum = 0;
    var p = el.parentNode;
    while (p.nodeType == 1) {
      sum += p.scrollTop;
      p = p.parentNode;
    };

    return el.ownerDocument.getBoxObjectFor(el).screenY - sum;
  };
}
else
{
  // Hope this works in khtml, too (opera 7.6p3 seems to be ok)
  QxDom.getComputedScreenBoxLeft = function(el) { return QxDom.getComputedScreenDocumentLeft(el) + QxDom.getComputedPageBoxLeft(el); };
  QxDom.getComputedScreenBoxTop  = function(el) { return QxDom.getComputedScreenDocumentTop(el) + QxDom.getComputedPageBoxTop(el); };
};

QxDom.getComputedScreenBoxRight    = function(el) { return QxDom.getComputedScreenBoxLeft(el)    + QxDom.getComputedBoxWidth(el); };
QxDom.getComputedScreenBoxBottom   = function(el) { return QxDom.getComputedScreenBoxTop(el)     + QxDom.getComputedBoxHeight(el); };

QxDom.getComputedScreenOuterLeft   = function(el) { return QxDom.getComputedScreenBoxLeft(el)    - QxDom.getComputedMarginLeft(el); };
QxDom.getComputedScreenOuterTop    = function(el) { return QxDom.getComputedScreenBoxTop(el)     - QxDom.getComputedMarginTop(el); };
QxDom.getComputedScreenOuterRight  = function(el) { return QxDom.getComputedScreenBoxRight(el)   + QxDom.getComputedMarginRight(el); };
QxDom.getComputedScreenOuterBottom = function(el) { return QxDom.getComputedScreenBoxBottom(el)  + QxDom.getComputedMarginBottom(el); };

QxDom.getComputedScreenAreaLeft    = function(el) { return QxDom.getComputedScreenBoxLeft(el)    + QxDom.getComputedInsetLeft(el); };
QxDom.getComputedScreenAreaTop     = function(el) { return QxDom.getComputedScreenBoxTop(el)     + QxDom.getComputedInsetTop(el); };
QxDom.getComputedScreenAreaRight   = function(el) { return QxDom.getComputedScreenBoxRight(el)   - QxDom.getComputedInsetRight(el); };
QxDom.getComputedScreenAreaBottom  = function(el) { return QxDom.getComputedScreenBoxBottom(el)  - QxDom.getComputedInsetBottom(el); };

QxDom.getComputedScreenInnerLeft   = function(el) { return QxDom.getComputedScreenAreaLeft(el)   + QxDom.getComputedPaddingLeft(el); };
QxDom.getComputedScreenInnerTop    = function(el) { return QxDom.getComputedScreenAreaTop(el)    + QxDom.getComputedPaddingTop(el); };
QxDom.getComputedScreenInnerRight  = function(el) { return QxDom.getComputedScreenAreaRight(el)  - QxDom.getComputedPaddingRight(el); };
QxDom.getComputedScreenInnerBottom = function(el) { return QxDom.getComputedScreenAreaBottom(el) - QxDom.getComputedPaddingBottom(el); };


if (QxClient.isGecko())
{
  /*
    Notice:
      This doesn't work like the mshtml method:
      el.ownerDocument.defaultView.screenX;
  */

  // Tested in Gecko 1.7.5
  QxDom.getComputedScreenDocumentLeft = function(el) { return QxDom.getComputedScreenOuterLeft(el.ownerDocument.body); };
  QxDom.getComputedScreenDocumentTop = function(el) { return QxDom.getComputedScreenOuterTop(el.ownerDocument.body); };
  QxDom.getComputedScreenDocumentRight = function(el) { return QxDom.getComputedScreenOuterRight(el.ownerDocument.body); };
  QxDom.getComputedScreenDocumentBottom = function(el) { return QxDom.getComputedScreenOuterBottom(el.ownerDocument.body); };
}
else
{
  // Tested in Opera 7.6b3 and Mshtml 6.0 (XP-SP2)
  // What's up with khtml (Safari/Konq)?
  QxDom.getComputedScreenDocumentLeft = function(el) { return el.document.parentWindow.screenLeft; };
  QxDom.getComputedScreenDocumentTop = function(el) { return el.document.parentWindow.screenTop; };
  QxDom.getComputedScreenDocumentRight = function(el) {};
  QxDom.getComputedScreenDocumentBottom = function(el) {};
};
