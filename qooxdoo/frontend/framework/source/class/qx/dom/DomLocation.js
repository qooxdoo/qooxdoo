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

#module(dom)
#require(qx.sys.Client)

************************************************************************ */

qx.OO.defineClass("qx.dom.DomLocation");

qx.dom.DomLocation.getPageOuterLeft     = function(el) { return qx.dom.DomLocation.getPageBoxLeft(el)     - qx.dom.DomStyle.getMarginLeft(el); }
qx.dom.DomLocation.getPageOuterTop      = function(el) { return qx.dom.DomLocation.getPageBoxTop(el)      - qx.dom.DomStyle.getMarginTop(el); }
qx.dom.DomLocation.getPageOuterRight    = function(el) { return qx.dom.DomLocation.getPageBoxRight(el)    + qx.dom.DomStyle.getMarginRight(el); }
qx.dom.DomLocation.getPageOuterBottom   = function(el) { return qx.dom.DomLocation.getPageBoxBottom(el)   + qx.dom.DomStyle.getMarginBottom(el); }

qx.dom.DomLocation.getClientOuterLeft   = function(el) { return qx.dom.DomLocation.getClientBoxLeft(el)   - qx.dom.DomStyle.getMarginLeft(el); }
qx.dom.DomLocation.getClientOuterTop    = function(el) { return qx.dom.DomLocation.getClientBoxTop(el)    - qx.dom.DomStyle.getMarginTop(el); }
qx.dom.DomLocation.getClientOuterRight  = function(el) { return qx.dom.DomLocation.getClientBoxRight(el)  + qx.dom.DomStyle.getMarginRight(el); }
qx.dom.DomLocation.getClientOuterBottom = function(el) { return qx.dom.DomLocation.getClientBoxBottom(el) + qx.dom.DomStyle.getMarginBottom(el); }


if (qx.sys.Client.isMshtml())
{
  qx.dom.DomLocation.getClientBoxLeft   = function(el) { return el.getBoundingClientRect().left; }
  qx.dom.DomLocation.getClientBoxTop    = function(el) { return el.getBoundingClientRect().top; }

  qx.dom.DomLocation.getPageBoxLeft     = function(el) { return qx.dom.DomLocation.getClientBoxLeft(el)  + qx.dom.DomScroll.getLeftSum(el); }
  qx.dom.DomLocation.getPageBoxTop      = function(el) { return qx.dom.DomLocation.getClientBoxTop(el)   + qx.dom.DomScroll.getTopSum(el); }
}
else if (qx.sys.Client.isGecko())
{
  qx.dom.DomLocation.getClientBoxLeft   = function(el) { return qx.dom.DomLocation.getClientAreaLeft(el) - qx.dom.DomStyle.getBorderLeft(el); }
  qx.dom.DomLocation.getClientBoxTop    = function(el) { return qx.dom.DomLocation.getClientAreaTop(el)  - qx.dom.DomStyle.getBorderTop(el); }

  qx.dom.DomLocation.getPageBoxLeft     = function(el) { return qx.dom.DomLocation.getPageAreaLeft(el)   - qx.dom.DomStyle.getBorderLeft(el); }
  qx.dom.DomLocation.getPageBoxTop      = function(el) { return qx.dom.DomLocation.getPageAreaTop(el)    - qx.dom.DomStyle.getBorderTop(el); }
}
else
{
  qx.dom.DomLocation.getPageBoxLeft = function(el)
  {
    var sum = el.offsetLeft;
    while (el.tagName != "BODY")
    {
      el = el.offsetParent;
      sum += el.offsetLeft;
    }

    return sum;
  }

  qx.dom.DomLocation.getPageBoxTop = function(el)
  {
    var sum = el.offsetTop;
    while (el.tagName != "BODY")
    {
      el = el.offsetParent;
      sum += el.offsetTop;
    }

    return sum;
  }

  qx.dom.DomLocation.getClientBoxLeft = function(el)
  {
    var sum = el.offsetLeft;
    while (el.tagName != "BODY")
    {
      el = el.offsetParent;
      sum += el.offsetLeft - el.scrollLeft;
    }

    return sum;
  }

  qx.dom.DomLocation.getClientBoxTop = function(el)
  {
    var sum = el.offsetTop;
    while (el.tagName != "BODY")
    {
      el = el.offsetParent;
      sum += el.offsetTop - el.scrollTop;
    }

    return sum;
  }
}

if (qx.sys.Client.isMshtml())
{
  qx.dom.DomLocation.getClientBoxRight  = function(el) { return el.getBoundingClientRect().right; }
  qx.dom.DomLocation.getClientBoxBottom = function(el) { return el.getBoundingClientRect().bottom; }

  qx.dom.DomLocation.getPageBoxRight    = function(el) { return qx.dom.DomLocation.getClientBoxRight(el)  + qx.dom.DomScroll.getLeftSum(el); }
  qx.dom.DomLocation.getPageBoxBottom   = function(el) { return qx.dom.DomLocation.getClientBoxBottom(el) + qx.dom.DomScroll.getTopSum(el);  }
}
else
{
  qx.dom.DomLocation.getClientBoxRight  = function(el) { return qx.dom.DomLocation.getClientBoxLeft(el) + qx.dom.DomDimension.getBoxWidth(el); }
  qx.dom.DomLocation.getClientBoxBottom = function(el) { return qx.dom.DomLocation.getClientBoxTop(el)  + qx.dom.DomDimension.getBoxHeight(el); }

  qx.dom.DomLocation.getPageBoxRight    = function(el) { return qx.dom.DomLocation.getPageBoxLeft(el)   + qx.dom.DomDimension.getBoxWidth(el); }
  qx.dom.DomLocation.getPageBoxBottom   = function(el) { return qx.dom.DomLocation.getPageBoxTop(el)    + qx.dom.DomDimension.getBoxHeight(el); }
}

if (qx.sys.Client.isGecko())
{
  qx.dom.DomLocation.getPageAreaLeft = function(el) {
    return el.ownerDocument.getBoxObjectFor(el).x;
  }

  qx.dom.DomLocation.getPageAreaTop = function(el) {
    return el.ownerDocument.getBoxObjectFor(el).y;
  }

  // We need to subtract the scroll position of all parent containers (bug #186229).
  qx.dom.DomLocation.getClientAreaLeft = function(el) {
    return qx.dom.DomLocation.getPageAreaLeft(el) - qx.dom.DomScroll.getLeftSum(el);
  }

  // We need to subtract the scroll position of all parent containers (bug #186229).
  qx.dom.DomLocation.getClientAreaTop = function(el) {
    return qx.dom.DomLocation.getPageAreaTop(el) - qx.dom.DomScroll.getTopSum(el);
  }
}
else
{
  qx.dom.DomLocation.getClientAreaLeft = function(el) { return qx.dom.DomLocation.getClientBoxLeft(el) + qx.dom.DomStyle.getBorderLeft(el); }
  qx.dom.DomLocation.getClientAreaTop  = function(el) { return qx.dom.DomLocation.getClientBoxTop(el)  + qx.dom.DomStyle.getBorderTop(el); }

  qx.dom.DomLocation.getPageAreaLeft = function(el) { return qx.dom.DomLocation.getPageBoxLeft(el) + qx.dom.DomStyle.getBorderLeft(el); }
  qx.dom.DomLocation.getPageAreaTop  = function(el) { return qx.dom.DomLocation.getPageBoxTop(el)  + qx.dom.DomStyle.getBorderTop(el); }
}



qx.dom.DomLocation.getClientAreaRight   = function(el) { return qx.dom.DomLocation.getClientAreaLeft(el)  + qx.dom.DomDimension.getAreaWidth(el);  }
qx.dom.DomLocation.getClientAreaBottom  = function(el) { return qx.dom.DomLocation.getClientAreaTop(el)   + qx.dom.DomDimension.getAreaHeight(el); }

qx.dom.DomLocation.getPageAreaRight     = function(el) { return qx.dom.DomLocation.getPageAreaLeft(el)    + qx.dom.DomDimension.getAreaWidth(el);  }
qx.dom.DomLocation.getPageAreaBottom    = function(el) { return qx.dom.DomLocation.getPageAreaTop(el)     + qx.dom.DomDimension.getAreaHeight(el); }




qx.dom.DomLocation.getClientInnerLeft   = function(el) { return qx.dom.DomLocation.getClientAreaLeft(el)  + qx.dom.DomStyle.getPaddingLeft(el); }
qx.dom.DomLocation.getClientInnerTop    = function(el) { return qx.dom.DomLocation.getClientAreaTop(el)   + qx.dom.DomStyle.getPaddingTop(el);  }
qx.dom.DomLocation.getClientInnerRight  = function(el) { return qx.dom.DomLocation.getClientInnerLeft(el) + qx.dom.DomDimension.getInnerWidth(el);  }
qx.dom.DomLocation.getClientInnerBottom = function(el) { return qx.dom.DomLocation.getClientInnerTop(el)  + qx.dom.DomDimension.getInnerHeight(el); }

qx.dom.DomLocation.getPageInnerLeft     = function(el) { return qx.dom.DomLocation.getPageAreaLeft(el)    + qx.dom.DomStyle.getPaddingLeft(el); }
qx.dom.DomLocation.getPageInnerTop      = function(el) { return qx.dom.DomLocation.getPageAreaTop(el)     + qx.dom.DomStyle.getPaddingTop(el);  }
qx.dom.DomLocation.getPageInnerRight    = function(el) { return qx.dom.DomLocation.getPageInnerLeft(el)   + qx.dom.DomDimension.getInnerWidth(el);  }
qx.dom.DomLocation.getPageInnerBottom   = function(el) { return qx.dom.DomLocation.getPageInnerTop(el)    + qx.dom.DomDimension.getInnerHeight(el); }


// Screen
if (qx.sys.Client.isGecko())
{
  /*
    screenX and screenY seem to return the distance to the box
    and not to the area. Confusing, especially as the x and y properties
    of the BoxObject return the distance to the area.
  */

  qx.dom.DomLocation.getScreenBoxLeft = function(el)
  {
    // We need to subtract the scroll position of all
    // parent containers (bug #186229).
    var sum = 0;
    var p = el.parentNode;
    while (p.nodeType == 1) {
      sum += p.scrollLeft;
      p = p.parentNode;
    }

    return el.ownerDocument.getBoxObjectFor(el).screenX - sum;
  }

  qx.dom.DomLocation.getScreenBoxTop = function(el)
  {
    // We need to subtract the scroll position of all
    // parent containers (bug #186229).
    var sum = 0;
    var p = el.parentNode;
    while (p.nodeType == 1) {
      sum += p.scrollTop;
      p = p.parentNode;
    }

    return el.ownerDocument.getBoxObjectFor(el).screenY - sum;
  }
}
else
{
  // Hope this works in khtml, too (opera 7.6p3 seems to be ok)
  qx.dom.DomLocation.getScreenBoxLeft = function(el) { return qx.dom.DomLocation.getScreenDocumentLeft(el) + qx.dom.DomLocation.getPageBoxLeft(el); }
  qx.dom.DomLocation.getScreenBoxTop  = function(el) { return qx.dom.DomLocation.getScreenDocumentTop(el) + qx.dom.DomLocation.getPageBoxTop(el); }
}

qx.dom.DomLocation.getScreenBoxRight    = function(el) { return qx.dom.DomLocation.getScreenBoxLeft(el)    + qx.dom.DomDimension.getBoxWidth(el); }
qx.dom.DomLocation.getScreenBoxBottom   = function(el) { return qx.dom.DomLocation.getScreenBoxTop(el)     + qx.dom.DomDimension.getBoxHeight(el); }

qx.dom.DomLocation.getScreenOuterLeft   = function(el) { return qx.dom.DomLocation.getScreenBoxLeft(el)    - qx.dom.DomStyle.getMarginLeft(el); }
qx.dom.DomLocation.getScreenOuterTop    = function(el) { return qx.dom.DomLocation.getScreenBoxTop(el)     - qx.dom.DomStyle.getMarginTop(el); }
qx.dom.DomLocation.getScreenOuterRight  = function(el) { return qx.dom.DomLocation.getScreenBoxRight(el)   + qx.dom.DomStyle.getMarginRight(el); }
qx.dom.DomLocation.getScreenOuterBottom = function(el) { return qx.dom.DomLocation.getScreenBoxBottom(el)  + qx.dom.DomStyle.getMarginBottom(el); }

qx.dom.DomLocation.getScreenAreaLeft    = function(el) { return qx.dom.DomLocation.getScreenBoxLeft(el)    + qx.dom.DomDimension.getInsetLeft(el); }
qx.dom.DomLocation.getScreenAreaTop     = function(el) { return qx.dom.DomLocation.getScreenBoxTop(el)     + qx.dom.DomDimension.getInsetTop(el); }
qx.dom.DomLocation.getScreenAreaRight   = function(el) { return qx.dom.DomLocation.getScreenBoxRight(el)   - qx.dom.DomDimension.getInsetRight(el); }
qx.dom.DomLocation.getScreenAreaBottom  = function(el) { return qx.dom.DomLocation.getScreenBoxBottom(el)  - qx.dom.DomDimension.getInsetBottom(el); }

qx.dom.DomLocation.getScreenInnerLeft   = function(el) { return qx.dom.DomLocation.getScreenAreaLeft(el)   + qx.dom.DomStyle.getPaddingLeft(el); }
qx.dom.DomLocation.getScreenInnerTop    = function(el) { return qx.dom.DomLocation.getScreenAreaTop(el)    + qx.dom.DomStyle.getPaddingTop(el); }
qx.dom.DomLocation.getScreenInnerRight  = function(el) { return qx.dom.DomLocation.getScreenAreaRight(el)  - qx.dom.DomStyle.getPaddingRight(el); }
qx.dom.DomLocation.getScreenInnerBottom = function(el) { return qx.dom.DomLocation.getScreenAreaBottom(el) - qx.dom.DomStyle.getPaddingBottom(el); }


if (qx.sys.Client.isGecko())
{
  /*
    Notice:
      This doesn't work like the mshtml method:
      el.ownerDocument.defaultView.screenX;
  */

  // Tested in Gecko 1.7.5
  qx.dom.DomLocation.getScreenDocumentLeft = function(el) { return qx.dom.DomLocation.getScreenOuterLeft(el.ownerDocument.body); }
  qx.dom.DomLocation.getScreenDocumentTop = function(el) { return qx.dom.DomLocation.getScreenOuterTop(el.ownerDocument.body); }
  qx.dom.DomLocation.getScreenDocumentRight = function(el) { return qx.dom.DomLocation.getScreenOuterRight(el.ownerDocument.body); }
  qx.dom.DomLocation.getScreenDocumentBottom = function(el) { return qx.dom.DomLocation.getScreenOuterBottom(el.ownerDocument.body); }
}
else
{
  // Tested in Opera 7.6b3 and Mshtml 6.0 (XP-SP2)
  // What's up with khtml (Safari/Konq)?
  qx.dom.DomLocation.getScreenDocumentLeft = function(el) { return el.document.parentWindow.screenLeft; }
  qx.dom.DomLocation.getScreenDocumentTop = function(el) { return el.document.parentWindow.screenTop; }
  qx.dom.DomLocation.getScreenDocumentRight = function(el) {}
  qx.dom.DomLocation.getScreenDocumentBottom = function(el) {}
}
