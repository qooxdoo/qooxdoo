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
qx.dom.getComputedOuterWidth  = function(el) { return qx.dom.getComputedBoxWidth(el)  + qx.dom.getComputedMarginLeft(el) + qx.dom.getComputedMarginRight(el); };
qx.dom.getComputedOuterHeight = function(el) { return qx.dom.getComputedBoxHeight(el) + qx.dom.getComputedMarginTop(el)  + qx.dom.getComputedMarginBottom(el); };

qx.dom.getComputedBoxWidthForZeroHeight = function(el)
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

qx.dom.getComputedBoxHeightForZeroWidth = function(el)
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

qx.dom.getComputedBoxWidth = function(el) {
  return el.offsetWidth;
};

qx.dom.getComputedBoxHeight = function(el) {
  return el.offsetHeight;
};

if (qx.sys.Client.isGecko())
{
  qx.dom.getComputedAreaWidth = function(el)
  {
    // 0 in clientWidth could mean both: That it is really 0 or
    // that the element is not rendered by the browser and
    // therefore it is 0, too

    // In Gecko based browsers there is sometimes another
    // behaviour: The clientHeight is equal to the border
    // sum. This is normally not correct and so we
    // fix this value with a more complex calculation.

    // (Mozilla/5.0 (Windows; U; Windows NT 5.1; de-DE; rv:1.7.6) Gecko/20050223 Firefox/1.0.1)

    if (el.clientWidth != 0 && el.clientWidth != (qx.dom.getComputedBorderLeft(el) + qx.dom.getComputedBorderRight(el)))
    {
      return el.clientWidth;
    }
    else
    {
      return qx.dom.getComputedBoxWidth(el) - qx.dom.getComputedInsetLeft(el) - qx.dom.getComputedInsetRight(el);
    };
  };

  qx.dom.getComputedAreaHeight = function(el)
  {
    // 0 in clientHeight could mean both: That it is really 0 or
    // that the element is not rendered by the browser and
    // therefore it is 0, too

    // In Gecko based browsers there is sometimes another
    // behaviour: The clientHeight is equal to the border
    // sum. This is normally not correct and so we
    // fix this value with a more complex calculation.

    // (Mozilla/5.0 (Windows; U; Windows NT 5.1; de-DE; rv:1.7.6) Gecko/20050223 Firefox/1.0.1)

    if (el.clientHeight != 0 && el.clientHeight != (qx.dom.getComputedBorderTop(el) + qx.dom.getComputedBorderBottom(el)))
    {
      return el.clientHeight;
    }
    else
    {
      return qx.dom.getComputedBoxHeight(el) - qx.dom.getComputedInsetTop(el) - qx.dom.getComputedInsetBottom(el);
    };
  };
}
else
{
  qx.dom.getComputedAreaWidth = function(el)
  {
    // 0 in clientWidth could mean both: That it is really 0 or
    // that the element is not rendered by the browser and
    // therefore it is 0, too

    return el.clientWidth != 0 ? el.clientWidth : (qx.dom.getComputedBoxWidth(el) - qx.dom.getComputedInsetLeft(el) - qx.dom.getComputedInsetRight(el));
  };

  qx.dom.getComputedAreaHeight = function(el)
  {
    // 0 in clientHeight could mean both: That it is really 0 or
    // that the element is not rendered by the browser and
    // therefore it is 0, too

    return el.clientHeight != 0 ? el.clientHeight : (qx.dom.getComputedBoxHeight(el) - qx.dom.getComputedInsetTop(el) - qx.dom.getComputedInsetBottom(el));
  };
};

qx.dom.getComputedInnerWidth  = function(el) { return qx.dom.getComputedAreaWidth(el) - qx.dom.getComputedPaddingLeft(el) - qx.dom.getComputedPaddingRight(el); };
qx.dom.getComputedInnerHeight = function(el) { return qx.dom.getComputedAreaHeight(el) - qx.dom.getComputedPaddingTop(el)  - qx.dom.getComputedPaddingBottom(el); };




// Insets
if (qx.sys.Client.isMshtml())
{
  qx.dom.getComputedInsetLeft   = function(el) { return el.clientLeft; };
  qx.dom.getComputedInsetTop    = function(el) { return el.clientTop; };
  qx.dom.getComputedInsetRight  = function(el) {
    if(qx.dom.getComputedStyleProperty(el, "overflowY") == QxConst.CORE_HIDDEN || el.clientWidth == 0) {
      return qx.dom.getComputedBorderRight(el);
    };

    return Math.max(0, el.offsetWidth - el.clientLeft - el.clientWidth);
  };

  qx.dom.getComputedInsetBottom = function(el) {
    if(qx.dom.getComputedStyleProperty(el, "overflowX") == QxConst.CORE_HIDDEN || el.clientHeight == 0) {
      return qx.dom.getComputedBorderBottom(el);
    };

    return Math.max(0, el.offsetHeight - el.clientTop - el.clientHeight);
  };
}
else
{
  qx.dom.getComputedInsetLeft   = function(el) { return qx.dom.getComputedBorderLeft(el); };
  qx.dom.getComputedInsetTop    = function(el) { return qx.dom.getComputedBorderTop(el); };

  qx.dom.getComputedInsetRight  = function(el) {
    // Alternative method if clientWidth is unavailable
    // clientWidth == 0 could mean both: unavailable or really 0
    if (el.clientWidth == 0) {
      var ov = qx.dom.getComputedStyleProperty(el, QxConst.EVENT_TYPE_OVERFLOW);
      var sbv = ov == "scroll" || ov == "-moz-scrollbars-vertical" ? 16 : 0;
      return Math.max(0, qx.dom.getComputedBorderRight(el) + sbv);
    };

    return Math.max(0, el.offsetWidth - el.clientWidth - qx.dom.getComputedBorderLeft(el));
  };

  qx.dom.getComputedInsetBottom = function(el) {
    // Alternative method if clientHeight is unavailable
    // clientHeight == 0 could mean both: unavailable or really 0
    if (el.clientHeight == 0) {
      var ov = qx.dom.getComputedStyleProperty(el, QxConst.EVENT_TYPE_OVERFLOW);
      var sbv = ov == "scroll" || ov == "-moz-scrollbars-horizontal" ? 16 : 0;
      return Math.max(0, qx.dom.getComputedBorderBottom(el) + sbv);
    };

    return Math.max(0, el.offsetHeight - el.clientHeight - qx.dom.getComputedBorderTop(el));
  };
};


// Scrollbar
qx.dom.getComputedScrollBarSizeLeft   = function(el) { return 0; };
qx.dom.getComputedScrollBarSizeTop    = function(el) { return 0; };
qx.dom.getComputedScrollBarSizeRight  = function(el) { return qx.dom.getComputedInsetRight(el)  - qx.dom.getComputedBorderRight(el); };
qx.dom.getComputedScrollBarSizeBottom = function(el) { return qx.dom.getComputedInsetBottom(el) - qx.dom.getComputedBorderBottom(el); };

qx.dom.getComputedScrollBarVisibleX   = function(el) { return qx.dom.getComputedScrollBarSizeRight(el)  > 0; };
qx.dom.getComputedScrollBarVisibleY   = function(el) { return qx.dom.getComputedScrollBarSizeBottom(el) > 0; };
