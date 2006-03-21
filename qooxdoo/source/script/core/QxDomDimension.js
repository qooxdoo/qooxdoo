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
+-Outer----------------------------------------+
|  Margin                                      |
|  +-Box------------------------------+        |
|  |  Border (+ Scrollbar)            |        |
|  |  +-Area--------------------+     |        |
|  |  |  Padding                |     |        |
|  |  |  +-Inner----------+     |     |        |
|  |  |  |                |     |     |        |
|  |  |  +----------------+     |     |        |
|  |  +-------------------------+     |        |
|  +----------------------------------+        |
+----------------------------------------------+
*/

// Dimensions
QxDom.getComputedOuterWidth  = function(el) { return QxDom.getComputedBoxWidth(el)  + QxDom.getComputedMarginLeft(el) + QxDom.getComputedMarginRight(el); };
QxDom.getComputedOuterHeight = function(el) { return QxDom.getComputedBoxHeight(el) + QxDom.getComputedMarginTop(el)  + QxDom.getComputedMarginBottom(el); };

QxDom.getComputedBoxWidthForZeroHeight = function(el)
{
  var h = el.offsetHeight;
  if (h == 0) {
    var o = el.style.height;
    el.style.height = "1px";
  };

  var v = el.offsetWidth;

  if (h == 0) {
    el.style.height = o;
  };

  return v;
};

QxDom.getComputedBoxHeightForZeroWidth = function(el)
{
  var w = el.offsetWidth;
  if (w == 0) {
    var o = el.style.width;
    el.style.width = "1px";
  };

  var v = el.offsetHeight;

  if (w == 0) {
    el.style.width = o;
  };

  return v;
};

QxDom.getComputedBoxWidth = function(el) {
  return el.offsetWidth;
};

QxDom.getComputedBoxHeight = function(el) {
  return el.offsetHeight;
};

if (QxClient.isGecko())
{
  QxDom.getComputedAreaWidth = function(el)
  {
    // 0 in clientWidth could mean both: That it is really 0 or
    // that the element is not rendered by the browser and
    // therefore it is 0, too

    // In Gecko based browsers there is sometimes another
    // behaviour: The clientHeight is equal to the border
    // sum. This is normally not correct and so we
    // fix this value with a more complex calculation.

    // (Mozilla/5.0 (Windows; U; Windows NT 5.1; de-DE; rv:1.7.6) Gecko/20050223 Firefox/1.0.1)

    if (el.clientWidth != 0 && el.clientWidth != (QxDom.getComputedBorderLeft(el) + QxDom.getComputedBorderRight(el)))
    {
      return el.clientWidth;
    }
    else
    {
      return QxDom.getComputedBoxWidth(el) - QxDom.getComputedInsetLeft(el) - QxDom.getComputedInsetRight(el);
    };
  };

  QxDom.getComputedAreaHeight = function(el)
  {
    // 0 in clientHeight could mean both: That it is really 0 or
    // that the element is not rendered by the browser and
    // therefore it is 0, too

    // In Gecko based browsers there is sometimes another
    // behaviour: The clientHeight is equal to the border
    // sum. This is normally not correct and so we
    // fix this value with a more complex calculation.

    // (Mozilla/5.0 (Windows; U; Windows NT 5.1; de-DE; rv:1.7.6) Gecko/20050223 Firefox/1.0.1)

    if (el.clientHeight != 0 && el.clientHeight != (QxDom.getComputedBorderTop(el) + QxDom.getComputedBorderBottom(el)))
    {
      return el.clientHeight;
    }
    else
    {
      return QxDom.getComputedBoxHeight(el) - QxDom.getComputedInsetTop(el) - QxDom.getComputedInsetBottom(el);
    };
  };
}
else
{
  QxDom.getComputedAreaWidth = function(el)
  {
    // 0 in clientWidth could mean both: That it is really 0 or
    // that the element is not rendered by the browser and
    // therefore it is 0, too

    return el.clientWidth != 0 ? el.clientWidth : (QxDom.getComputedBoxWidth(el) - QxDom.getComputedInsetLeft(el) - QxDom.getComputedInsetRight(el));
  };

  QxDom.getComputedAreaHeight = function(el)
  {
    // 0 in clientHeight could mean both: That it is really 0 or
    // that the element is not rendered by the browser and
    // therefore it is 0, too

    return el.clientHeight != 0 ? el.clientHeight : (QxDom.getComputedBoxHeight(el) - QxDom.getComputedInsetTop(el) - QxDom.getComputedInsetBottom(el));
  };
};

QxDom.getComputedInnerWidth  = function(el) { return QxDom.getComputedAreaWidth(el) - QxDom.getComputedPaddingLeft(el) - QxDom.getComputedPaddingRight(el); };
QxDom.getComputedInnerHeight = function(el) { return QxDom.getComputedAreaHeight(el) - QxDom.getComputedPaddingTop(el)  - QxDom.getComputedPaddingBottom(el); };




// Insets
if (QxClient.isMshtml())
{
  QxDom.getComputedInsetLeft   = function(el) { return el.clientLeft; };
  QxDom.getComputedInsetTop    = function(el) { return el.clientTop; };
  QxDom.getComputedInsetRight  = function(el) {
    if(QxDom.getComputedStyleProperty(el, "overflowY") == QxConst.CORE_HIDDEN || el.clientWidth == 0) {
      return QxDom.getComputedBorderRight(el);
    };

    return Math.max(0, el.offsetWidth - el.clientLeft - el.clientWidth);
  };

  QxDom.getComputedInsetBottom = function(el) {
    if(QxDom.getComputedStyleProperty(el, "overflowX") == QxConst.CORE_HIDDEN || el.clientHeight == 0) {
      return QxDom.getComputedBorderBottom(el);
    };

    return Math.max(0, el.offsetHeight - el.clientTop - el.clientHeight);
  };
}
else
{
  QxDom.getComputedInsetLeft   = function(el) { return QxDom.getComputedBorderLeft(el); };
  QxDom.getComputedInsetTop    = function(el) { return QxDom.getComputedBorderTop(el); };

  QxDom.getComputedInsetRight  = function(el) {
    // Alternative method if clientWidth is unavailable
    // clientWidth == 0 could mean both: unavailable or really 0
    if (el.clientWidth == 0) {
      var ov = QxDom.getComputedStyleProperty(el, QxConst.EVENT_TYPE_OVERFLOW);
      var sbv = ov == "scroll" || ov == "-moz-scrollbars-vertical" ? 16 : 0;
      return Math.max(0, QxDom.getComputedBorderRight(el) + sbv);
    };

    return Math.max(0, el.offsetWidth - el.clientWidth - QxDom.getComputedBorderLeft(el));
  };

  QxDom.getComputedInsetBottom = function(el) {
    // Alternative method if clientHeight is unavailable
    // clientHeight == 0 could mean both: unavailable or really 0
    if (el.clientHeight == 0) {
      var ov = QxDom.getComputedStyleProperty(el, QxConst.EVENT_TYPE_OVERFLOW);
      var sbv = ov == "scroll" || ov == "-moz-scrollbars-horizontal" ? 16 : 0;
      return Math.max(0, QxDom.getComputedBorderBottom(el) + sbv);
    };

    return Math.max(0, el.offsetHeight - el.clientHeight - QxDom.getComputedBorderTop(el));
  };
};


// Scrollbar
QxDom.getComputedScrollBarSizeLeft   = function(el) { return 0; };
QxDom.getComputedScrollBarSizeTop    = function(el) { return 0; };
QxDom.getComputedScrollBarSizeRight  = function(el) { return QxDom.getComputedInsetRight(el)  - QxDom.getComputedBorderRight(el); };
QxDom.getComputedScrollBarSizeBottom = function(el) { return QxDom.getComputedInsetBottom(el) - QxDom.getComputedBorderBottom(el); };

QxDom.getComputedScrollBarVisibleX   = function(el) { return QxDom.getComputedScrollBarSizeRight(el)  > 0; };
QxDom.getComputedScrollBarVisibleY   = function(el) { return QxDom.getComputedScrollBarSizeBottom(el) > 0; };
