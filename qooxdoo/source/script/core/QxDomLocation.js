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
#require(QxDomCore)
#require(QxDomStyle)
#require(QxDomScroll)
#require(QxDomDimension)

************************************************************************ */

qx.dom.getComputedPageOuterLeft     = function(el) { return qx.dom.getComputedPageBoxLeft(el)     - qx.dom.getComputedMarginLeft(el); };
qx.dom.getComputedPageOuterTop      = function(el) { return qx.dom.getComputedPageBoxTop(el)      - qx.dom.getComputedMarginTop(el); };
qx.dom.getComputedPageOuterRight    = function(el) { return qx.dom.getComputedPageBoxRight(el)    + qx.dom.getComputedMarginRight(el); };
qx.dom.getComputedPageOuterBottom   = function(el) { return qx.dom.getComputedPageBoxBottom(el)   + qx.dom.getComputedMarginBottom(el); };

qx.dom.getComputedClientOuterLeft   = function(el) { return qx.dom.getComputedClientBoxLeft(el)   - qx.dom.getComputedMarginLeft(el); };
qx.dom.getComputedClientOuterTop    = function(el) { return qx.dom.getComputedClientBoxTop(el)    - qx.dom.getComputedMarginTop(el); };
qx.dom.getComputedClientOuterRight  = function(el) { return qx.dom.getComputedClientBoxRight(el)  + qx.dom.getComputedMarginRight(el); };
qx.dom.getComputedClientOuterBottom = function(el) { return qx.dom.getComputedClientBoxBottom(el) + qx.dom.getComputedMarginBottom(el); };


if (qx.sys.Client.isMshtml())
{
  qx.dom.getComputedClientBoxLeft   = function(el) { return el.getBoundingClientRect().left; };
  qx.dom.getComputedClientBoxTop    = function(el) { return el.getBoundingClientRect().top; };

  qx.dom.getComputedPageBoxLeft     = function(el) { return qx.dom.getComputedClientBoxLeft(el)  + qx.dom.getScrollLeftSum(el); };
  qx.dom.getComputedPageBoxTop      = function(el) { return qx.dom.getComputedClientBoxTop(el)   + qx.dom.getScrollTopSum(el); };
}
else if (qx.sys.Client.isGecko())
{
  qx.dom.getComputedClientBoxLeft   = function(el) { return qx.dom.getComputedClientAreaLeft(el) - qx.dom.getComputedBorderLeft(el); };
  qx.dom.getComputedClientBoxTop    = function(el) { return qx.dom.getComputedClientAreaTop(el)  - qx.dom.getComputedBorderTop(el); };

  qx.dom.getComputedPageBoxLeft     = function(el) { return qx.dom.getComputedPageAreaLeft(el)   - qx.dom.getComputedBorderLeft(el); };
  qx.dom.getComputedPageBoxTop      = function(el) { return qx.dom.getComputedPageAreaTop(el)    - qx.dom.getComputedBorderTop(el); };
}
else
{
  qx.dom.getComputedPageBoxLeft = function(el)
  {
    var sum = el.offsetLeft;
    while (el.tagName != "BODY")
    {
      el = el.offsetParent;
      sum += el.offsetLeft;
    };

    return sum;
  };

  qx.dom.getComputedPageBoxTop = function(el)
  {
    var sum = el.offsetTop;
    while (el.tagName != "BODY")
    {
      el = el.offsetParent;
      sum += el.offsetTop;
    };

    return sum;
  };

  qx.dom.getComputedClientBoxLeft = function(el)
  {
    var sum = el.offsetLeft;
    while (el.tagName != "BODY")
    {
      el = el.offsetParent;
      sum += el.offsetLeft - el.scrollLeft;
    };

    return sum;
  };

  qx.dom.getComputedClientBoxTop = function(el)
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

if (qx.sys.Client.isMshtml())
{
  qx.dom.getComputedClientBoxRight  = function(el) { return el.getBoundingClientRect().right; };
  qx.dom.getComputedClientBoxBottom = function(el) { return el.getBoundingClientRect().bottom; };

  qx.dom.getComputedPageBoxRight    = function(el) { return qx.dom.getComputedClientBoxRight(el)  + qx.dom.getScrollLeftSum(el); };
  qx.dom.getComputedPageBoxBottom   = function(el) { return qx.dom.getComputedClientBoxBottom(el) + qx.dom.getScrollTopSum(el);  };
}
else
{
  qx.dom.getComputedClientBoxRight  = function(el) { return qx.dom.getComputedClientBoxLeft(el) + qx.dom.getComputedBoxWidth(el); };
  qx.dom.getComputedClientBoxBottom = function(el) { return qx.dom.getComputedClientBoxTop(el)  + qx.dom.getComputedBoxHeight(el); };

  qx.dom.getComputedPageBoxRight    = function(el) { return qx.dom.getComputedPageBoxLeft(el)   + qx.dom.getComputedBoxWidth(el); };
  qx.dom.getComputedPageBoxBottom   = function(el) { return qx.dom.getComputedPageBoxTop(el)    + qx.dom.getComputedBoxHeight(el); };
};

if (qx.sys.Client.isGecko())
{
  qx.dom.getComputedPageAreaLeft = function(el) {
    return el.ownerDocument.getBoxObjectFor(el).x;
  };

  qx.dom.getComputedPageAreaTop = function(el) {
    return el.ownerDocument.getBoxObjectFor(el).y;
  };

  // We need to subtract the scroll position of all parent containers (bug #186229).
  qx.dom.getComputedClientAreaLeft = function(el) {
    return qx.dom.getComputedPageAreaLeft(el) - qx.dom.getScrollLeftSum(el);
  };

  // We need to subtract the scroll position of all parent containers (bug #186229).
  qx.dom.getComputedClientAreaTop = function(el) {
    return qx.dom.getComputedPageAreaTop(el) - qx.dom.getScrollTopSum(el);
  };
}
else
{
  qx.dom.getComputedClientAreaLeft = function(el) { return qx.dom.getComputedClientBoxLeft(el) + qx.dom.getComputedBorderLeft(el); };
  qx.dom.getComputedClientAreaTop  = function(el) { return qx.dom.getComputedClientBoxTop(el)  + qx.dom.getComputedBorderTop(el); };

  qx.dom.getComputedPageAreaLeft = function(el) { return qx.dom.getComputedPageBoxLeft(el) + qx.dom.getComputedBorderLeft(el); };
  qx.dom.getComputedPageAreaTop  = function(el) { return qx.dom.getComputedPageBoxTop(el)  + qx.dom.getComputedBorderTop(el); };
};



qx.dom.getComputedClientAreaRight   = function(el) { return qx.dom.getComputedClientAreaLeft(el)  + qx.dom.getComputedAreaWidth(el);  };
qx.dom.getComputedClientAreaBottom  = function(el) { return qx.dom.getComputedClientAreaTop(el)   + qx.dom.getComputedAreaHeight(el); };

qx.dom.getComputedPageAreaRight     = function(el) { return qx.dom.getComputedPageAreaLeft(el)    + qx.dom.getComputedAreaWidth(el);  };
qx.dom.getComputedPageAreaBottom    = function(el) { return qx.dom.getComputedPageAreaTop(el)     + qx.dom.getComputedAreaHeight(el); };




qx.dom.getComputedClientInnerLeft   = function(el) { return qx.dom.getComputedClientAreaLeft(el)  + qx.dom.getComputedPaddingLeft(el); };
qx.dom.getComputedClientInnerTop    = function(el) { return qx.dom.getComputedClientAreaTop(el)   + qx.dom.getComputedPaddingTop(el);  };
qx.dom.getComputedClientInnerRight  = function(el) { return qx.dom.getComputedClientInnerLeft(el) + qx.dom.getComputedInnerWidth(el);  };
qx.dom.getComputedClientInnerBottom = function(el) { return qx.dom.getComputedClientInnerTop(el)  + qx.dom.getComputedInnerHeight(el); };

qx.dom.getComputedPageInnerLeft     = function(el) { return qx.dom.getComputedPageAreaLeft(el)    + qx.dom.getComputedPaddingLeft(el); };
qx.dom.getComputedPageInnerTop      = function(el) { return qx.dom.getComputedPageAreaTop(el)     + qx.dom.getComputedPaddingTop(el);  };
qx.dom.getComputedPageInnerRight    = function(el) { return qx.dom.getComputedPageInnerLeft(el)   + qx.dom.getComputedInnerWidth(el);  };
qx.dom.getComputedPageInnerBottom   = function(el) { return qx.dom.getComputedPageInnerTop(el)    + qx.dom.getComputedInnerHeight(el); };


// Screen
if (qx.sys.Client.isGecko())
{
  /*
    screenX and screenY seem to return the distance to the box
    and not to the area. Confusing, especially as the x and y properties
    of the BoxObject return the distance to the area.
  */

  qx.dom.getComputedScreenBoxLeft = function(el)
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

  qx.dom.getComputedScreenBoxTop = function(el)
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
  qx.dom.getComputedScreenBoxLeft = function(el) { return qx.dom.getComputedScreenDocumentLeft(el) + qx.dom.getComputedPageBoxLeft(el); };
  qx.dom.getComputedScreenBoxTop  = function(el) { return qx.dom.getComputedScreenDocumentTop(el) + qx.dom.getComputedPageBoxTop(el); };
};

qx.dom.getComputedScreenBoxRight    = function(el) { return qx.dom.getComputedScreenBoxLeft(el)    + qx.dom.getComputedBoxWidth(el); };
qx.dom.getComputedScreenBoxBottom   = function(el) { return qx.dom.getComputedScreenBoxTop(el)     + qx.dom.getComputedBoxHeight(el); };

qx.dom.getComputedScreenOuterLeft   = function(el) { return qx.dom.getComputedScreenBoxLeft(el)    - qx.dom.getComputedMarginLeft(el); };
qx.dom.getComputedScreenOuterTop    = function(el) { return qx.dom.getComputedScreenBoxTop(el)     - qx.dom.getComputedMarginTop(el); };
qx.dom.getComputedScreenOuterRight  = function(el) { return qx.dom.getComputedScreenBoxRight(el)   + qx.dom.getComputedMarginRight(el); };
qx.dom.getComputedScreenOuterBottom = function(el) { return qx.dom.getComputedScreenBoxBottom(el)  + qx.dom.getComputedMarginBottom(el); };

qx.dom.getComputedScreenAreaLeft    = function(el) { return qx.dom.getComputedScreenBoxLeft(el)    + qx.dom.getComputedInsetLeft(el); };
qx.dom.getComputedScreenAreaTop     = function(el) { return qx.dom.getComputedScreenBoxTop(el)     + qx.dom.getComputedInsetTop(el); };
qx.dom.getComputedScreenAreaRight   = function(el) { return qx.dom.getComputedScreenBoxRight(el)   - qx.dom.getComputedInsetRight(el); };
qx.dom.getComputedScreenAreaBottom  = function(el) { return qx.dom.getComputedScreenBoxBottom(el)  - qx.dom.getComputedInsetBottom(el); };

qx.dom.getComputedScreenInnerLeft   = function(el) { return qx.dom.getComputedScreenAreaLeft(el)   + qx.dom.getComputedPaddingLeft(el); };
qx.dom.getComputedScreenInnerTop    = function(el) { return qx.dom.getComputedScreenAreaTop(el)    + qx.dom.getComputedPaddingTop(el); };
qx.dom.getComputedScreenInnerRight  = function(el) { return qx.dom.getComputedScreenAreaRight(el)  - qx.dom.getComputedPaddingRight(el); };
qx.dom.getComputedScreenInnerBottom = function(el) { return qx.dom.getComputedScreenAreaBottom(el) - qx.dom.getComputedPaddingBottom(el); };


if (qx.sys.Client.isGecko())
{
  /*
    Notice:
      This doesn't work like the mshtml method:
      el.ownerDocument.defaultView.screenX;
  */

  // Tested in Gecko 1.7.5
  qx.dom.getComputedScreenDocumentLeft = function(el) { return qx.dom.getComputedScreenOuterLeft(el.ownerDocument.body); };
  qx.dom.getComputedScreenDocumentTop = function(el) { return qx.dom.getComputedScreenOuterTop(el.ownerDocument.body); };
  qx.dom.getComputedScreenDocumentRight = function(el) { return qx.dom.getComputedScreenOuterRight(el.ownerDocument.body); };
  qx.dom.getComputedScreenDocumentBottom = function(el) { return qx.dom.getComputedScreenOuterBottom(el.ownerDocument.body); };
}
else
{
  // Tested in Opera 7.6b3 and Mshtml 6.0 (XP-SP2)
  // What's up with khtml (Safari/Konq)?
  qx.dom.getComputedScreenDocumentLeft = function(el) { return el.document.parentWindow.screenLeft; };
  qx.dom.getComputedScreenDocumentTop = function(el) { return el.document.parentWindow.screenTop; };
  qx.dom.getComputedScreenDocumentRight = function(el) {};
  qx.dom.getComputedScreenDocumentBottom = function(el) {};
};
