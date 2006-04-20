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

************************************************************************ */

if (Boolean(document.defaultView) && Boolean(document.defaultView.getComputedStyle))
{
  qx.dom.getComputedStylePropertySure = function(el, prop) { return !el ? null : el.ownerDocument ? el.ownerDocument.defaultView.getComputedStyle(el, QxConst.CORE_EMPTY)[prop] : el.style[prop]; };

  qx.dom.getComputedStyleProperty = function(el, prop)
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
else if (qx.sys.Client.isMshtml())
{
  qx.dom.getComputedStyleProperty = function(el, prop)
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

  qx.dom.getComputedStylePropertySure = function(el, prop)
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
  qx.dom.getComputedStylePropertySure = function(el, prop) { return !el ? null : el.style[prop]; };

  qx.dom.getComputedStyleProperty = function(el, prop)
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


qx.dom.getComputedStyleSize = function(el, prop) { return parseInt(qx.dom.getComputedStyleProperty(el, prop)) || 0; };


// Properties
qx.dom.getComputedMarginLeft    = function(el) { return qx.dom.getComputedStyleSize(el, QxConst.PROPERTY_MARGINLEFT); };
qx.dom.getComputedMarginTop     = function(el) { return qx.dom.getComputedStyleSize(el, QxConst.PROPERTY_MARGINTOP); };
qx.dom.getComputedMarginRight   = function(el) { return qx.dom.getComputedStyleSize(el, QxConst.PROPERTY_MARGINRIGHT); };
qx.dom.getComputedMarginBottom  = function(el) { return qx.dom.getComputedStyleSize(el, QxConst.PROPERTY_MARGINBOTTOM); };

qx.dom.getComputedPaddingLeft   = function(el) { return qx.dom.getComputedStyleSize(el, QxConst.PROPERTY_PADDINGLEFT); };
qx.dom.getComputedPaddingTop    = function(el) { return qx.dom.getComputedStyleSize(el, QxConst.PROPERTY_PADDINGTOP); };
qx.dom.getComputedPaddingRight  = function(el) { return qx.dom.getComputedStyleSize(el, QxConst.PROPERTY_PADDINGRIGHT); };
qx.dom.getComputedPaddingBottom = function(el) { return qx.dom.getComputedStyleSize(el, QxConst.PROPERTY_PADDINGBOTTOM); };

qx.dom.getComputedBorderLeft    = function(el) { return qx.dom.getComputedStyleProperty(el, "borderLeftStyle")   == QxConst.CORE_NONE ? 0 : qx.dom.getComputedStyleSize(el, "borderLeftWidth"); };
qx.dom.getComputedBorderTop     = function(el) { return qx.dom.getComputedStyleProperty(el, "borderTopStyle")    == QxConst.CORE_NONE ? 0 : qx.dom.getComputedStyleSize(el, "borderTopWidth"); };
qx.dom.getComputedBorderRight   = function(el) { return qx.dom.getComputedStyleProperty(el, "borderRightStyle")  == QxConst.CORE_NONE ? 0 : qx.dom.getComputedStyleSize(el, "borderRightWidth"); };
qx.dom.getComputedBorderBottom  = function(el) { return qx.dom.getComputedStyleProperty(el, "borderBottomStyle") == QxConst.CORE_NONE ? 0 : qx.dom.getComputedStyleSize(el, "borderBottomWidth"); };
