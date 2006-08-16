/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2006 by 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL 2.1: http://www.gnu.org/licenses/lgpl.html

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

#module(ui_core)

************************************************************************ */

qx.OO.defineClass("qx.dom.DomDimension");

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
qx.dom.DomDimension.getOuterWidth  = function(el) { return qx.dom.DomDimension.getBoxWidth(el)  + qx.dom.DomStyle.getMarginLeft(el) + qx.dom.DomStyle.getMarginRight(el); }
qx.dom.DomDimension.getOuterHeight = function(el) { return qx.dom.DomDimension.getBoxHeight(el) + qx.dom.DomStyle.getMarginTop(el)  + qx.dom.DomStyle.getMarginBottom(el); }

qx.dom.DomDimension.getBoxWidthForZeroHeight = function(el)
{
  var h = el.offsetHeight;
  if (h == 0) {
    var o = el.style.height;
    el.style.height = "1px";
  }

  var v = el.offsetWidth;

  if (h == 0) {
    el.style.height = o;
  }

  return v;
}

qx.dom.DomDimension.getBoxHeightForZeroWidth = function(el)
{
  var w = el.offsetWidth;
  if (w == 0) {
    var o = el.style.width;
    el.style.width = "1px";
  }

  var v = el.offsetHeight;

  if (w == 0) {
    el.style.width = o;
  }

  return v;
}

qx.dom.DomDimension.getBoxWidth = function(el) {
  return el.offsetWidth;
}

qx.dom.DomDimension.getBoxHeight = function(el) {
  return el.offsetHeight;
}

if (qx.sys.Client.getInstance().isGecko())
{
  qx.dom.DomDimension.getAreaWidth = function(el)
  {
    // 0 in clientWidth could mean both: That it is really 0 or
    // that the element is not rendered by the browser and
    // therefore it is 0, too

    // In Gecko based browsers there is sometimes another
    // behaviour: The clientHeight is equal to the border
    // sum. This is normally not correct and so we
    // fix this value with a more complex calculation.

    // (Mozilla/5.0 (Windows; U; Windows NT 5.1; de-DE; rv:1.7.6) Gecko/20050223 Firefox/1.0.1)

    if (el.clientWidth != 0 && el.clientWidth != (qx.dom.DomStyle.getBorderLeft(el) + qx.dom.DomStyle.getBorderRight(el)))
    {
      return el.clientWidth;
    }
    else
    {
      return qx.dom.DomDimension.getBoxWidth(el) - qx.dom.DomDimension.getInsetLeft(el) - qx.dom.DomDimension.getInsetRight(el);
    }
  }

  qx.dom.DomDimension.getAreaHeight = function(el)
  {
    // 0 in clientHeight could mean both: That it is really 0 or
    // that the element is not rendered by the browser and
    // therefore it is 0, too

    // In Gecko based browsers there is sometimes another
    // behaviour: The clientHeight is equal to the border
    // sum. This is normally not correct and so we
    // fix this value with a more complex calculation.

    // (Mozilla/5.0 (Windows; U; Windows NT 5.1; de-DE; rv:1.7.6) Gecko/20050223 Firefox/1.0.1)

    if (el.clientHeight != 0 && el.clientHeight != (qx.dom.DomStyle.getBorderTop(el) + qx.dom.DomStyle.getBorderBottom(el)))
    {
      return el.clientHeight;
    }
    else
    {
      return qx.dom.DomDimension.getBoxHeight(el) - qx.dom.DomDimension.getInsetTop(el) - qx.dom.DomDimension.getInsetBottom(el);
    }
  }
}
else
{
  qx.dom.DomDimension.getAreaWidth = function(el)
  {
    // 0 in clientWidth could mean both: That it is really 0 or
    // that the element is not rendered by the browser and
    // therefore it is 0, too

    return el.clientWidth != 0 ? el.clientWidth : (qx.dom.DomDimension.getBoxWidth(el) - qx.dom.DomDimension.getInsetLeft(el) - qx.dom.DomDimension.getInsetRight(el));
  }

  qx.dom.DomDimension.getAreaHeight = function(el)
  {
    // 0 in clientHeight could mean both: That it is really 0 or
    // that the element is not rendered by the browser and
    // therefore it is 0, too

    return el.clientHeight != 0 ? el.clientHeight : (qx.dom.DomDimension.getBoxHeight(el) - qx.dom.DomDimension.getInsetTop(el) - qx.dom.DomDimension.getInsetBottom(el));
  }
}

qx.dom.DomDimension.getInnerWidth  = function(el) { return qx.dom.DomDimension.getAreaWidth(el) - qx.dom.DomStyle.getPaddingLeft(el) - qx.dom.DomStyle.getPaddingRight(el); }
qx.dom.DomDimension.getInnerHeight = function(el) { return qx.dom.DomDimension.getAreaHeight(el) - qx.dom.DomStyle.getPaddingTop(el)  - qx.dom.DomStyle.getPaddingBottom(el); }




// Insets
if (qx.sys.Client.getInstance().isMshtml())
{
  qx.dom.DomDimension.getInsetLeft   = function(el) { return el.clientLeft; }
  qx.dom.DomDimension.getInsetTop    = function(el) { return el.clientTop; }
  qx.dom.DomDimension.getInsetRight  = function(el) {
    if(qx.dom.DomStyle.getStyleProperty(el, "overflowY") == qx.constant.Core.HIDDEN || el.clientWidth == 0) {
      return qx.dom.DomStyle.getBorderRight(el);
    }

    return Math.max(0, el.offsetWidth - el.clientLeft - el.clientWidth);
  }

  qx.dom.DomDimension.getInsetBottom = function(el) {
    if(qx.dom.DomStyle.getStyleProperty(el, "overflowX") == qx.constant.Core.HIDDEN || el.clientHeight == 0) {
      return qx.dom.DomStyle.getBorderBottom(el);
    }

    return Math.max(0, el.offsetHeight - el.clientTop - el.clientHeight);
  }
}
else
{
  qx.dom.DomDimension.getInsetLeft   = function(el) { return qx.dom.DomStyle.getBorderLeft(el); }
  qx.dom.DomDimension.getInsetTop    = function(el) { return qx.dom.DomStyle.getBorderTop(el); }

  qx.dom.DomDimension.getInsetRight  = function(el) {
    // Alternative method if clientWidth is unavailable
    // clientWidth == 0 could mean both: unavailable or really 0
    if (el.clientWidth == 0) {
      var ov = qx.dom.DomStyle.getStyleProperty(el, qx.constant.Style.PROPERTY_OVERFLOW_BOTH);
      var sbv = ov == "scroll" || ov == "-moz-scrollbars-vertical" ? 16 : 0;
      return Math.max(0, qx.dom.DomStyle.getBorderRight(el) + sbv);
    }

    return Math.max(0, el.offsetWidth - el.clientWidth - qx.dom.DomStyle.getBorderLeft(el));
  }

  qx.dom.DomDimension.getInsetBottom = function(el) {
    // Alternative method if clientHeight is unavailable
    // clientHeight == 0 could mean both: unavailable or really 0
    if (el.clientHeight == 0) {
      var ov = qx.dom.DomStyle.getStyleProperty(el, qx.constant.Style.PROPERTY_OVERFLOW_BOTH);
      var sbv = ov == "scroll" || ov == "-moz-scrollbars-horizontal" ? 16 : 0;
      return Math.max(0, qx.dom.DomStyle.getBorderBottom(el) + sbv);
    }

    return Math.max(0, el.offsetHeight - el.clientHeight - qx.dom.DomStyle.getBorderTop(el));
  }
}


// Scrollbar
qx.dom.DomDimension.getScrollBarSizeLeft   = function(el) { return 0; }
qx.dom.DomDimension.getScrollBarSizeTop    = function(el) { return 0; }
qx.dom.DomDimension.getScrollBarSizeRight  = function(el) { return qx.dom.DomDimension.getInsetRight(el)  - qx.dom.DomStyle.getBorderRight(el); }
qx.dom.DomDimension.getScrollBarSizeBottom = function(el) { return qx.dom.DomDimension.getInsetBottom(el) - qx.dom.DomStyle.getBorderBottom(el); }

qx.dom.DomDimension.getScrollBarVisibleX   = function(el) { return qx.dom.DomDimension.getScrollBarSizeRight(el)  > 0; }
qx.dom.DomDimension.getScrollBarVisibleY   = function(el) { return qx.dom.DomDimension.getScrollBarSizeBottom(el) > 0; }
