var QxDOM = new Object;

if (Boolean(document.defaultView) && Boolean(document.defaultView.getComputedStyle))
{
  QxDOM.getComputedStyleProperty = function(el, prop) { return !el ? null : el.ownerDocument ? el.ownerDocument.defaultView.getComputedStyle(el, "")[prop] : el.style[prop]; };
}
else if ((new QxClient).isMshtml())
{
  QxDOM.getComputedStyleProperty = function(el, prop)
  {
    if (!el) {
      return null;
    };
    
    if (el.parentNode)
    {
      return el.currentStyle[prop];
    }
    else
    {
      var v1 = el.runtimeStyle[prop];

      if (v1 != null && typeof v1 != "undefined") {
        return v1;
      };

      return el.style[prop];
    };
  };
}
else
{
  QxDOM.getComputedStyleProperty = function(el, prop) { return !el ? null : el.style[prop]; };
};


QxDOM.getComputedStyleSize = function(el, prop) { return parseInt(QxDOM.getComputedStyleProperty(el, prop)) || 0; };


// Properties
QxDOM.getComputedMarginLeft    = function(el) { return QxDOM.getComputedStyleSize(el, "marginLeft"); };
QxDOM.getComputedMarginTop     = function(el) { return QxDOM.getComputedStyleSize(el, "marginTop"); };
QxDOM.getComputedMarginRight   = function(el) { return QxDOM.getComputedStyleSize(el, "marginRight"); };
QxDOM.getComputedMarginBottom  = function(el) { return QxDOM.getComputedStyleSize(el, "marginBottom"); };

QxDOM.getComputedPaddingLeft   = function(el) { return QxDOM.getComputedStyleSize(el, "paddingLeft"); };
QxDOM.getComputedPaddingTop    = function(el) { return QxDOM.getComputedStyleSize(el, "paddingTop"); };
QxDOM.getComputedPaddingRight  = function(el) { return QxDOM.getComputedStyleSize(el, "paddingRight"); };
QxDOM.getComputedPaddingBottom = function(el) { return QxDOM.getComputedStyleSize(el, "paddingBottom"); };

QxDOM.getComputedBorderLeft    = function(el) { return QxDOM.getComputedStyleProperty(el, "borderLeftStyle")   == "none" ? 0 : QxDOM.getComputedStyleSize(el, "borderLeftWidth"); };
QxDOM.getComputedBorderTop     = function(el) { return QxDOM.getComputedStyleProperty(el, "borderTopStyle")    == "none" ? 0 : QxDOM.getComputedStyleSize(el, "borderTopWidth"); };
QxDOM.getComputedBorderRight   = function(el) { return QxDOM.getComputedStyleProperty(el, "borderRightStyle")  == "none" ? 0 : QxDOM.getComputedStyleSize(el, "borderRightWidth"); };
QxDOM.getComputedBorderBottom  = function(el) { return QxDOM.getComputedStyleProperty(el, "borderBottomStyle") == "none" ? 0 : QxDOM.getComputedStyleSize(el, "borderBottomWidth"); };


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
QxDOM.getComputedOuterWidth  = function(el) { return QxDOM.getComputedBoxWidth(el)  + QxDOM.getComputedMarginLeft(el) + QxDOM.getComputedMarginRight(el); };
QxDOM.getComputedOuterHeight = function(el) { return QxDOM.getComputedBoxHeight(el) + QxDOM.getComputedMarginTop(el)  + QxDOM.getComputedMarginBottom(el); };

QxDOM.getComputedBoxWidth = function(el)
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

QxDOM.getComputedBoxHeight = function(el)
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


if ((new QxClient).isGecko())
{
  QxDOM.getComputedAreaWidth = function(el)
  {
    // 0 in clientWidth could mean both: That it is really 0 or
    // that the element is not rendered by the browser and
    // therefore it is 0, too
  
    // In Gecko based browsers there is sometimes another 
    // behaviour: The clientHeight is equal to the border
    // sum. This is normally not correct and so we
    // fix this value with a more complex calculation.
    
    // (Mozilla/5.0 (Windows; U; Windows NT 5.1; de-DE; rv:1.7.6) Gecko/20050223 Firefox/1.0.1)
    
    if (el.clientWidth != 0 && el.clientWidth != (QxDOM.getComputedBorderLeft(el) + QxDOM.getComputedBorderRight(el)))
    {
      return el.clientWidth;
    }
    else
    {
      return QxDOM.getComputedBoxWidth(el) - QxDOM.getComputedInsetLeft(el) - QxDOM.getComputedInsetRight(el);
    };
  };
  
  QxDOM.getComputedAreaHeight = function(el)
  {
    // 0 in clientHeight could mean both: That it is really 0 or
    // that the element is not rendered by the browser and
    // therefore it is 0, too
    
    // In Gecko based browsers there is sometimes another 
    // behaviour: The clientHeight is equal to the border
    // sum. This is normally not correct and so we
    // fix this value with a more complex calculation.
    
    // (Mozilla/5.0 (Windows; U; Windows NT 5.1; de-DE; rv:1.7.6) Gecko/20050223 Firefox/1.0.1)
    
    if (el.clientHeight != 0 && el.clientHeight != (QxDOM.getComputedBorderTop(el) + QxDOM.getComputedBorderBottom(el)))
    {
      return el.clientHeight;
    }
    else
    {
      return QxDOM.getComputedBoxHeight(el) - QxDOM.getComputedInsetTop(el) - QxDOM.getComputedInsetBottom(el)    
    };
  };
}
else
{
  QxDOM.getComputedAreaWidth = function(el)
  {
    // 0 in clientWidth could mean both: That it is really 0 or
    // that the element is not rendered by the browser and
    // therefore it is 0, too
  
    return el.clientWidth != 0 ? el.clientWidth : (QxDOM.getComputedBoxWidth(el) - QxDOM.getComputedInsetLeft(el) - QxDOM.getComputedInsetRight(el));
  };
  
  QxDOM.getComputedAreaHeight = function(el)
  {
    // 0 in clientHeight could mean both: That it is really 0 or
    // that the element is not rendered by the browser and
    // therefore it is 0, too
  
    return el.clientHeight != 0 ? el.clientHeight : (QxDOM.getComputedBoxHeight(el) - QxDOM.getComputedInsetTop(el) - QxDOM.getComputedInsetBottom(el));
  };
};

QxDOM.getComputedInnerWidth  = function(el) { return QxDOM.getComputedAreaWidth(el) - QxDOM.getComputedPaddingLeft(el) - QxDOM.getComputedPaddingRight(el); };
QxDOM.getComputedInnerHeight = function(el) { return QxDOM.getComputedAreaHeight(el) - QxDOM.getComputedPaddingTop(el)  - QxDOM.getComputedPaddingBottom(el); };




// Insets
if ((new QxClient).isMshtml())
{
  QxDOM.getComputedInsetLeft   = function(el) { return el.clientLeft; };
  QxDOM.getComputedInsetTop    = function(el) { return el.clientTop; };
  QxDOM.getComputedInsetRight  = function(el) {
    if(QxDOM.getComputedStyleProperty(el, "overflowY") == "hidden" || el.clientWidth == 0) {
      return QxDOM.getComputedBorderRight(el);
    };

    return Math.max(0, el.offsetWidth - el.clientLeft - el.clientWidth);
  };

  QxDOM.getComputedInsetBottom = function(el) {
    if(QxDOM.getComputedStyleProperty(el, "overflowX") == "hidden" || el.clientHeight == 0) {
      return QxDOM.getComputedBorderBottom(el);
    };

    return Math.max(0, el.offsetHeight - el.clientTop - el.clientHeight);
  };
}
else
{
  QxDOM.getComputedInsetLeft   = function(el) { return QxDOM.getComputedBorderLeft(el); };
  QxDOM.getComputedInsetTop    = function(el) { return QxDOM.getComputedBorderTop(el); };

  QxDOM.getComputedInsetRight  = function(el) {
    // Alternative method if clientWidth is unavailable
    // clientWidth == 0 could mean both: unavailable or really 0
    if (el.clientWidth == 0) {
      var ov = QxDOM.getComputedStyleProperty(el, "overflow");
      var sbv = ov == "scroll" || ov == "-moz-scrollbars-vertical" ? 16 : 0;
      return Math.max(0, QxDOM.getComputedBorderRight(el) + sbv);
    };

    return Math.max(0, el.offsetWidth - el.clientWidth - QxDOM.getComputedBorderLeft(el));
  };

  QxDOM.getComputedInsetBottom = function(el) {
    // Alternative method if clientHeight is unavailable
    // clientHeight == 0 could mean both: unavailable or really 0
    if (el.clientHeight == 0) {
      var ov = QxDOM.getComputedStyleProperty(el, "overflow");
      var sbv = ov == "scroll" || ov == "-moz-scrollbars-horizontal" ? 16 : 0;
      return Math.max(0, QxDOM.getComputedBorderBottom(el) + sbv);
    };

    return Math.max(0, el.offsetHeight - el.clientHeight - QxDOM.getComputedBorderTop(el));
  };
};


// Scrollbar
QxDOM.getComputedScrollBarSizeLeft   = function(el) { return 0; };
QxDOM.getComputedScrollBarSizeTop    = function(el) { return 0; };
QxDOM.getComputedScrollBarSizeRight  = function(el) { return QxDOM.getComputedInsetRight(el)  - QxDOM.getComputedBorderRight(el); };
QxDOM.getComputedScrollBarSizeBottom = function(el) { return QxDOM.getComputedInsetBottom(el) - QxDOM.getComputedBorderBottom(el); };

QxDOM.getComputedScrollBarVisibleX   = function(el) { return QxDOM.getComputedScrollBarSizeRight(el)  > 0; };
QxDOM.getComputedScrollBarVisibleY   = function(el) { return QxDOM.getComputedScrollBarSizeBottom(el) > 0; };



// Scroll-Sums
QxDOM.getScrollLeftSum = function(el)
{
  var sum = 0;
  var p = el.parentNode;

  while (p.nodeType == 1)
  {
    sum += p.scrollLeft;
    p = p.parentNode;
  };

  return sum;
};

QxDOM.getScrollTopSum = function(el)
{
  var sum = 0;
  var p = el.parentNode;

  while (p.nodeType == 1)
  {
    sum += p.scrollTop;
    p = p.parentNode;
  };

  return sum;
};



// Positions
QxDOM.getComputedPageOuterLeft     = function(el) { return QxDOM.getComputedPageBoxLeft(el)     - QxDOM.getComputedMarginLeft(el); };
QxDOM.getComputedPageOuterTop      = function(el) { return QxDOM.getComputedPageBoxTop(el)      - QxDOM.getComputedMarginTop(el); };
QxDOM.getComputedPageOuterRight    = function(el) { return QxDOM.getComputedPageBoxRight(el)    + QxDOM.getComputedMarginRight(el); };
QxDOM.getComputedPageOuterBottom   = function(el) { return QxDOM.getComputedPageBoxBottom(el)   + QxDOM.getComputedMarginBottom(el); };

QxDOM.getComputedClientOuterLeft   = function(el) { return QxDOM.getComputedClientBoxLeft(el)   - QxDOM.getComputedMarginLeft(el); };
QxDOM.getComputedClientOuterTop    = function(el) { return QxDOM.getComputedClientBoxTop(el)    - QxDOM.getComputedMarginTop(el); };
QxDOM.getComputedClientOuterRight  = function(el) { return QxDOM.getComputedClientBoxRight(el)  + QxDOM.getComputedMarginRight(el); };
QxDOM.getComputedClientOuterBottom = function(el) { return QxDOM.getComputedClientBoxBottom(el) + QxDOM.getComputedMarginBottom(el); };


if ((new QxClient).isMshtml())
{
  QxDOM.getComputedClientBoxLeft   = function(el) { return el.getBoundingClientRect().left; };
  QxDOM.getComputedClientBoxTop    = function(el) { return el.getBoundingClientRect().top; };

  QxDOM.getComputedPageBoxLeft     = function(el) { return QxDOM.getComputedClientBoxLeft(el)  + QxDOM.getScrollLeftSum(el); };
  QxDOM.getComputedPageBoxTop      = function(el) { return QxDOM.getComputedClientBoxTop(el)   + QxDOM.getScrollTopSum(el); };
}
else if ((new QxClient).isGecko())
{
  QxDOM.getComputedClientBoxLeft   = function(el) { return QxDOM.getComputedClientAreaLeft(el) - QxDOM.getComputedBorderLeft(el); };
  QxDOM.getComputedClientBoxTop    = function(el) { return QxDOM.getComputedClientAreaTop(el)  - QxDOM.getComputedBorderTop(el); };

  QxDOM.getComputedPageBoxLeft     = function(el) { return QxDOM.getComputedPageAreaLeft(el)   - QxDOM.getComputedBorderLeft(el); };
  QxDOM.getComputedPageBoxTop      = function(el) { return QxDOM.getComputedPageAreaTop(el)    - QxDOM.getComputedBorderTop(el); };
}
else
{
  QxDOM.getComputedPageBoxLeft = function(el)
  {
    var sum = el.offsetLeft;
    while (el.tagName != "BODY")
    {
      el = el.offsetParent;
      sum += el.offsetLeft;
    };

    return sum;
  };

  QxDOM.getComputedPageBoxTop = function(el)
  {
    var sum = el.offsetTop;
    while (el.tagName != "BODY")
    {
      el = el.offsetParent;
      sum += el.offsetTop;
    };

    return sum;
  };

  QxDOM.getComputedClientBoxLeft = function(el)
  {
    var sum = el.offsetLeft;
    while (el.tagName != "BODY")
    {
      el = el.offsetParent;
      sum += el.offsetLeft - el.scrollLeft;
    };

    return sum;
  };

  QxDOM.getComputedClientBoxTop = function(el)
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

if ((new QxClient).isMshtml())
{
  QxDOM.getComputedClientBoxRight  = function(el) { return el.getBoundingClientRect().right; };
  QxDOM.getComputedClientBoxBottom = function(el) { return el.getBoundingClientRect().bottom; };

  QxDOM.getComputedPageBoxRight    = function(el) { return QxDOM.getComputedClientBoxRight(el)  + QxDOM.getScrollLeftSum(el); };
  QxDOM.getComputedPageBoxBottom   = function(el) { return QxDOM.getComputedClientBoxBottom(el) + QxDOM.getScrollTopSum(el);  };
}
else
{
  QxDOM.getComputedClientBoxRight  = function(el) { return QxDOM.getComputedClientBoxLeft(el) + QxDOM.getComputedBoxWidth(el); };
  QxDOM.getComputedClientBoxBottom = function(el) { return QxDOM.getComputedClientBoxTop(el)  + QxDOM.getComputedBoxHeight(el); };

  QxDOM.getComputedPageBoxRight    = function(el) { return QxDOM.getComputedPageBoxLeft(el)   + QxDOM.getComputedBoxWidth(el); };
  QxDOM.getComputedPageBoxBottom   = function(el) { return QxDOM.getComputedPageBoxTop(el)    + QxDOM.getComputedBoxHeight(el); };
};

if ((new QxClient).isGecko())
{
  QxDOM.getComputedPageAreaLeft = function(el) {
    return el.ownerDocument.getBoxObjectFor(el).x;
  };

  QxDOM.getComputedPageAreaTop = function(el) {
    return el.ownerDocument.getBoxObjectFor(el).y;
  };

  // We need to subtract the scroll position of all parent containers (bug #186229).
  QxDOM.getComputedClientAreaLeft = function(el) {
    return QxDOM.getComputedPageAreaLeft(el) - QxDOM.getScrollLeftSum(el);
  };

  // We need to subtract the scroll position of all parent containers (bug #186229).
  QxDOM.getComputedClientAreaTop = function(el) {
    return QxDOM.getComputedPageAreaTop(el) - QxDOM.getScrollTopSum(el);
  };
}
else
{
  QxDOM.getComputedClientAreaLeft = function(el) { return QxDOM.getComputedClientBoxLeft(el) + QxDOM.getComputedBorderLeft(el); };
  QxDOM.getComputedClientAreaTop  = function(el) { return QxDOM.getComputedClientBoxTop(el)  + QxDOM.getComputedBorderTop(el); };

  QxDOM.getComputedPageAreaLeft = function(el) { return QxDOM.getComputedPageBoxLeft(el) + QxDOM.getComputedBorderLeft(el); };
  QxDOM.getComputedPageAreaTop  = function(el) { return QxDOM.getComputedPageBoxTop(el)  + QxDOM.getComputedBorderTop(el); };
};



QxDOM.getComputedClientAreaRight   = function(el) { return QxDOM.getComputedClientAreaLeft(el)  + QxDOM.getComputedAreaWidth(el);  };
QxDOM.getComputedClientAreaBottom  = function(el) { return QxDOM.getComputedClientAreaTop(el)   + QxDOM.getComputedAreaHeight(el); };

QxDOM.getComputedPageAreaRight     = function(el) { return QxDOM.getComputedPageAreaLeft(el)    + QxDOM.getComputedAreaWidth(el);  };
QxDOM.getComputedPageAreaBottom    = function(el) { return QxDOM.getComputedPageAreaTop(el)     + QxDOM.getComputedAreaHeight(el); };




QxDOM.getComputedClientInnerLeft   = function(el) { return QxDOM.getComputedClientAreaLeft(el)  + QxDOM.getComputedPaddingLeft(el); };
QxDOM.getComputedClientInnerTop    = function(el) { return QxDOM.getComputedClientAreaTop(el)   + QxDOM.getComputedPaddingTop(el);  };
QxDOM.getComputedClientInnerRight  = function(el) { return QxDOM.getComputedClientInnerLeft(el) + QxDOM.getComputedInnerWidth(el);  };
QxDOM.getComputedClientInnerBottom = function(el) { return QxDOM.getComputedClientInnerTop(el)  + QxDOM.getComputedInnerHeight(el); };

QxDOM.getComputedPageInnerLeft     = function(el) { return QxDOM.getComputedPageAreaLeft(el)    + QxDOM.getComputedPaddingLeft(el); };
QxDOM.getComputedPageInnerTop      = function(el) { return QxDOM.getComputedPageAreaTop(el)     + QxDOM.getComputedPaddingTop(el);  };
QxDOM.getComputedPageInnerRight    = function(el) { return QxDOM.getComputedPageInnerLeft(el)   + QxDOM.getComputedInnerWidth(el);  };
QxDOM.getComputedPageInnerBottom   = function(el) { return QxDOM.getComputedPageInnerTop(el)    + QxDOM.getComputedInnerHeight(el); };


// Screen
if ((new QxClient).isGecko())
{
  /*
    screenX and screenY seem to return the distance to the box
    and not to the area. Confusing, especially as the x and y properties
    of the BoxObject return the distance to the area.
  */

  QxDOM.getComputedScreenBoxLeft = function(el)
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

  QxDOM.getComputedScreenBoxTop = function(el)
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
  QxDOM.getComputedScreenBoxLeft = function(el) { return QxDOM.getComputedScreenDocumentLeft(el) + QxDOM.getComputedPageBoxLeft(el); };
  QxDOM.getComputedScreenBoxTop  = function(el) { return QxDOM.getComputedScreenDocumentTop(el) + QxDOM.getComputedPageBoxTop(el); };
};

QxDOM.getComputedScreenBoxRight    = function(el) { return QxDOM.getComputedScreenBoxLeft(el)    + QxDOM.getComputedBoxWidth(el); };
QxDOM.getComputedScreenBoxBottom   = function(el) { return QxDOM.getComputedScreenBoxTop(el)     + QxDOM.getComputedBoxHeight(el); };

QxDOM.getComputedScreenOuterLeft   = function(el) { return QxDOM.getComputedScreenBoxLeft(el)    - QxDOM.getComputedMarginLeft(el); };
QxDOM.getComputedScreenOuterTop    = function(el) { return QxDOM.getComputedScreenBoxTop(el)     - QxDOM.getComputedMarginTop(el); };
QxDOM.getComputedScreenOuterRight  = function(el) { return QxDOM.getComputedScreenBoxRight(el)   + QxDOM.getComputedMarginRight(el); };
QxDOM.getComputedScreenOuterBottom = function(el) { return QxDOM.getComputedScreenBoxBottom(el)  + QxDOM.getComputedMarginBottom(el); };

QxDOM.getComputedScreenAreaLeft    = function(el) { return QxDOM.getComputedScreenBoxLeft(el)    + QxDOM.getComputedInsetLeft(el); };
QxDOM.getComputedScreenAreaTop     = function(el) { return QxDOM.getComputedScreenBoxTop(el)     + QxDOM.getComputedInsetTop(el); };
QxDOM.getComputedScreenAreaRight   = function(el) { return QxDOM.getComputedScreenBoxRight(el)   - QxDOM.getComputedInsetRight(el); };
QxDOM.getComputedScreenAreaBottom  = function(el) { return QxDOM.getComputedScreenBoxBottom(el)  - QxDOM.getComputedInsetBottom(el); };

QxDOM.getComputedScreenInnerLeft   = function(el) { return QxDOM.getComputedScreenAreaLeft(el)   + QxDOM.getComputedPaddingLeft(el); };
QxDOM.getComputedScreenInnerTop    = function(el) { return QxDOM.getComputedScreenAreaTop(el)    + QxDOM.getComputedPaddingTop(el); };
QxDOM.getComputedScreenInnerRight  = function(el) { return QxDOM.getComputedScreenAreaRight(el)  - QxDOM.getComputedPaddingRight(el); };
QxDOM.getComputedScreenInnerBottom = function(el) { return QxDOM.getComputedScreenAreaBottom(el) - QxDOM.getComputedPaddingBottom(el); };


if ((new QxClient).isGecko())
{
  /*
    Notice:
      This doesn't work like the mshtml method:
      el.ownerDocument.defaultView.screenX;
  */

  // Tested in Gecko 1.7.5
  QxDOM.getComputedScreenDocumentLeft = function(el) { return QxDOM.getComputedScreenOuterLeft(el.ownerDocument.body); };
  QxDOM.getComputedScreenDocumentTop = function(el) { return QxDOM.getComputedScreenOuterTop(el.ownerDocument.body); };
  QxDOM.getComputedScreenDocumentRight = function(el) { return QxDOM.getComputedScreenOuterRight(el.ownerDocument.body); };
  QxDOM.getComputedScreenDocumentBottom = function(el) { return QxDOM.getComputedScreenOuterBottom(el.ownerDocument.body); };
}
else
{
  // Tested in Opera 7.6b3 and Mshtml 6.0 (XP-SP2)
  // What's up with khtml (Safari/Konq)?
  QxDOM.getComputedScreenDocumentLeft = function(el) { return el.document.parentWindow.screenLeft; };
  QxDOM.getComputedScreenDocumentTop = function(el) { return el.document.parentWindow.screenTop; };
  QxDOM.getComputedScreenDocumentRight = function(el) {};
  QxDOM.getComputedScreenDocumentBottom = function(el) {};
};


// Preferred Size
// Doesn't work perfectly in Opera 7.54 and 8.0 Beta 1 (mainly QxAtoms)
QxDOM.getComputedPreferredSize = function(el)
{
  if (isInvalid(el)) {
    throw new Error("QxDOM.getComputedPreferredSize: No element given!");
  };

  var elst = el.style;
  var pa = el.parentNode;

  if (isInvalid(pa)) {
    throw new Error("QxDOM.getComputedPreferredSize: Element has no parent!");
  };
  
  var past = pa.style;
  
  // Store old values
  var _el_w = isValid(elst.width) ? elst.width : "";
  var _el_h = isValid(elst.height) ? elst.height : "";
  var _el_p = isValid(elst.position) ? elst.position : "";
  var _el_d = isValid(elst.display) ? elst.display : "";

  var _pa_w = isValid(past.width) ? past.width : "";
  var _pa_h = isValid(past.height) ? past.height : "";

  if (_el_d == "none") {
    elst.display = "";
  };  

  elst.width = elst.height = "auto";
  if (pa.tagName != "BODY") {
    past.width = past.height = "100000px";
  };
  
  // Get new size
  // scrollWidth or scrollHeight doesn't include the border!
  var result = { width : el.offsetWidth, height : el.offsetHeight };

  // Restore old values
  try
  {
    elst.width = _el_w;
    elst.height = _el_h;
    elst.position = _el_p;
    elst.display = _el_p;
  }
  catch(ex)
  {
    QxDebug("QxDOM", "Failed to recover element dimensions: '" + _el_w + "', '" + _el_h + "' " + el.className + ": " + ex);
    return null;
  };
  
  try
  {
    if (pa.tagName != "BODY") 
    {
      past.width = _pa_w;
      past.height = _pa_h;
    };
  }
  catch(ex)
  {
    QxDebug("QxDOM", "Failed to recover parent dimensions: '" + _pa_w + "', '" + _pa_h + "' " + pa.className + ": " + ex);
    return null;
  }; 
  
  // alert(el.className + ": " + result.width + "x" + result.height);

  return result;
};

QxDOM.getComputedPreferredWidth  = function(el) { return QxDOM.getComputedPreferredSize(el).width; };
QxDOM.getComputedPreferredHeight = function(el) { return QxDOM.getComputedPreferredSize(el).height; };

QxDOM.addClass = function(el, newClass) {
  var n = el.className.add(newClass, " ");
  if (n != el.className) { el.className = n; };
};

QxDOM.removeClass = function(el, oldClass) {
  var n = el.className.remove(oldClass, " ");
  if (n != el.className) { el.className = n; };
};

if ((new QxClient).isMshtml())
{
  QxDOM.setWidth = function(el, intValue) {
    el.style.pixelWidth = intValue;
  };

  QxDOM.setHeight = function(el, intValue) {
    el.style.pixelHeight = intValue;
  };
}
else
{
  QxDOM.setWidth = function(el, intValue) {
    el.style.width = intValue + "px";
  };

  QxDOM.setHeight = function(el, intValue) {
    el.style.height = intValue + "px";
  };
};


QxDOM.getElementFromPoint = function(x, y) {
  return QxDOM.getElementFromPointHandler(document.body, x, y);
};

QxDOM.getElementFromPointHandler = function(node, x, y)
{
  var ch = node.childNodes;
  var chl = ch.length-1;

  if (chl < 0) {
    return null;
  };

  var chc;
  var xtest, ytest;

  do{
    chc = ch[chl];

    if (chc.nodeType != 1) {
      continue;
    };

    xtest = chc.offsetLeft;
    if (x > xtest)
    {
      ytest = chc.offsetTop;
      if (y > ytest)
      {
        xtest += chc.offsetWidth;
        if (x < xtest)
        {
          ytest += chc.offsetHeight;
          if (y < ytest)
          {
            subres = QxDOM.getElementFromPointHandler(chc, x, y);
            return subres ? subres : chc;
          };
        };
      };
    };
  }
  while(chl--);
};

/*
Mozilla seems to be a little buggy here.
Mozilla/5.0 (Windows; U; Windows NT 5.1; de-DE; rv:1.7.5) Gecko/20041108 Firefox/1.0

It calculates some borders and/or paddings to the offsetProperties.
*/
if ((new QxClient).isGecko())
{
  QxDOM.getOffsetLeft = function(el) 
  {
    var val = el.offsetLeft;
    var pa = el.parentNode;

    var pose = QxDOM.getComputedStyleProperty(el, "position");
    var posp = QxDOM.getComputedStyleProperty(pa, "position");

    // If element is positioned non-static: Substract the border of the element
    if (pose != "absolute" && pose != "fixed") {
      val -= QxDOM.getComputedBorderLeft(pa);
    };

    // If parent is positioned static: Substract the border of the first
    // parent element which is ab positioned non-static.
    if (posp != "absolute" && posp != "fixed")
    {
      while(pa)
      {
        pa = pa.parentNode;

        if (!pa || isInvalidString(pa.tagName)) {
          break;
        };

        var posi = QxDOM.getComputedStyleProperty(pa, "position");

        if (posi == "absolute" || posi == "relative" || posi == "fixed") {
          val -= QxDOM.getComputedBorderLeft(pa) + QxDOM.getComputedPaddingLeft(pa);
          break;
        };
      };
    };

    return val;
  };

  QxDOM.getOffsetTop = function(el) 
  {
    var val = el.offsetTop;
    var pa = el.parentNode;

    var pose = QxDOM.getComputedStyleProperty(el, "position");
    var posp = QxDOM.getComputedStyleProperty(pa, "position");

    // If element is positioned non-static: Substract the border of the element
    if (pose != "absolute" && pose != "fixed") {
      val -= QxDOM.getComputedBorderTop(pa);
    };

    // If parent is positioned static: Substract the border of the first
    // parent element which is ab positioned non-static.
    if (posp != "absolute" && posp != "fixed")
    {
      while(pa)
      {
        pa = pa.parentNode;

        if (!pa || isInvalidString(pa.tagName)) {
          break;
        };      

        var posi = QxDOM.getComputedStyleProperty(pa, "position");

        if (posi == "absolute" || posi == "relative" || posi == "fixed") {
          val -= QxDOM.getComputedBorderTop(pa) + QxDOM.getComputedPaddingTop(pa);
          break;
        };
      };
    };

    return val;
  };
}
else
{
  QxDOM.getOffsetLeft = function(el) {
    return el.offsetLeft;
  };

  QxDOM.getOffsetTop = function(el) {
    return el.offsetTop;
  };
};