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

************************************************************************ */

if (Boolean(document.defaultView) && Boolean(document.defaultView.getComputedStyle))
{
  QxDom.getComputedStylePropertySure = function(el, prop) { return !el ? null : el.ownerDocument ? el.ownerDocument.defaultView.getComputedStyle(el, QxConst.CORE_EMPTY)[prop] : el.style[prop]; };

  QxDom.getComputedStyleProperty = function(el, prop)
  {
    try
    {
      return el.ownerDocument.defaultView.getComputedStyle(el, QxConst.CORE_EMPTY)[prop];
    }
    catch(ex)
    {
      throw new Error("Could not evaluate computed style: " + el + "[" + prop + "]: " + ex);
    };
  };
}
else if (QxClient.isMshtml())
{
  QxDom.getComputedStyleProperty = function(el, prop)
  {
    try
    {
      return el.currentStyle[prop];
    }
    catch(ex)
    {
      throw new Error("Could not evaluate computed style: " + el + "[" + prop + "]: " + ex);
    };
  };

  QxDom.getComputedStylePropertySure = function(el, prop)
  {
    try
    {
      if (!el) {
        return null;
      };

      if (el.parentNode && el.currentStyle)
      {
        return el.currentStyle[prop];
      }
      else
      {
        var v1 = el.runtimeStyle[prop];

        if (v1 != null && typeof v1 != QxConst.TYPEOF_UNDEFINED && v1 != QxConst.CORE_EMPTY) {
          return v1;
        };

        return el.style[prop];
      };
    }
    catch(ex)
    {
      throw new Error("Could not evaluate computed style: " + el + "[" + prop + "]: " + ex);
    };
  };
}
else
{
  QxDom.getComputedStylePropertySure = function(el, prop) { return !el ? null : el.style[prop]; };

  QxDom.getComputedStyleProperty = function(el, prop)
  {
    try
    {
      return el.style[prop];
    }
    catch(ex)
    {
      throw new Error("Could not evaluate computed style: " + el + "[" + prop + "]");
    };
  };
};


QxDom.getComputedStyleSize = function(el, prop) { return parseInt(QxDom.getComputedStyleProperty(el, prop)) || 0; };


// Properties
QxDom.getComputedMarginLeft    = function(el) { return QxDom.getComputedStyleSize(el, QxConst.PROPERTY_MARGINLEFT); };
QxDom.getComputedMarginTop     = function(el) { return QxDom.getComputedStyleSize(el, QxConst.PROPERTY_MARGINTOP); };
QxDom.getComputedMarginRight   = function(el) { return QxDom.getComputedStyleSize(el, QxConst.PROPERTY_MARGINRIGHT); };
QxDom.getComputedMarginBottom  = function(el) { return QxDom.getComputedStyleSize(el, QxConst.PROPERTY_MARGINBOTTOM); };

QxDom.getComputedPaddingLeft   = function(el) { return QxDom.getComputedStyleSize(el, QxConst.PROPERTY_PADDINGLEFT); };
QxDom.getComputedPaddingTop    = function(el) { return QxDom.getComputedStyleSize(el, QxConst.PROPERTY_PADDINGTOP); };
QxDom.getComputedPaddingRight  = function(el) { return QxDom.getComputedStyleSize(el, QxConst.PROPERTY_PADDINGRIGHT); };
QxDom.getComputedPaddingBottom = function(el) { return QxDom.getComputedStyleSize(el, QxConst.PROPERTY_PADDINGBOTTOM); };

QxDom.getComputedBorderLeft    = function(el) { return QxDom.getComputedStyleProperty(el, "borderLeftStyle")   == QxConst.CORE_NONE ? 0 : QxDom.getComputedStyleSize(el, "borderLeftWidth"); };
QxDom.getComputedBorderTop     = function(el) { return QxDom.getComputedStyleProperty(el, "borderTopStyle")    == QxConst.CORE_NONE ? 0 : QxDom.getComputedStyleSize(el, "borderTopWidth"); };
QxDom.getComputedBorderRight   = function(el) { return QxDom.getComputedStyleProperty(el, "borderRightStyle")  == QxConst.CORE_NONE ? 0 : QxDom.getComputedStyleSize(el, "borderRightWidth"); };
QxDom.getComputedBorderBottom  = function(el) { return QxDom.getComputedStyleProperty(el, "borderBottomStyle") == QxConst.CORE_NONE ? 0 : QxDom.getComputedStyleSize(el, "borderBottomWidth"); };
