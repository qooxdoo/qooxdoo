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
#require(qx.sys.Client)

************************************************************************ */

/**
 * Methods to get CSS style properties of DOM elements.
 */
qx.OO.defineClass("qx.dom.Style");

/**
 * TODO
 */
qx.dom.Style.getStylePropertySure = function(el, prop) {};

/**
 * Get the (CSS) style property of a given DOM element
 * 
 * @param vElement {Element} the DOM element
 * @param propertyName {string} the name of the style property. e.g. "color", "border", ...
 * @return {string} the (CSS) style property
 */
qx.dom.Style.getStyleProperty = function(el, prop) {};

if (Boolean(document.defaultView) && Boolean(document.defaultView.getComputedStyle))
{
  qx.dom.Style.getStylePropertySure = function(el, prop) { return !el ? null : el.ownerDocument ? el.ownerDocument.defaultView.getComputedStyle(el, "")[prop] : el.style[prop]; }

  qx.dom.Style.getStyleProperty = function(el, prop)
  {
    try
    {
      return el.ownerDocument.defaultView.getComputedStyle(el, "")[prop];
    }
    catch(ex)
    {
      throw new Error("Could not evaluate computed style: " + el + "[" + prop + "]: " + ex);
    }
  }
}
else if (qx.sys.Client.getInstance().isMshtml())
{
  qx.dom.Style.getStyleProperty = function(el, prop)
  {
    try
    {
      return el.currentStyle[prop];
    }
    catch(ex)
    {
      throw new Error("Could not evaluate computed style: " + el + "[" + prop + "]: " + ex);
    }
  }

  qx.dom.Style.getStylePropertySure = function(el, prop)
  {
    try
    {
      if (!el) {
        return null;
      }

      if (el.parentNode && el.currentStyle)
      {
        return el.currentStyle[prop];
      }
      else
      {
        var v1 = el.runtimeStyle[prop];

        if (v1 != null && typeof v1 != "undefined" && v1 != "") {
          return v1;
        }

        return el.style[prop];
      }
    }
    catch(ex)
    {
      throw new Error("Could not evaluate computed style: " + el + "[" + prop + "]: " + ex);
    }
  }
}
else
{
  qx.dom.Style.getStylePropertySure = function(el, prop) { return !el ? null : el.style[prop]; }

  qx.dom.Style.getStyleProperty = function(el, prop)
  {
    try
    {
      return el.style[prop];
    }
    catch(ex)
    {
      throw new Error("Could not evaluate computed style: " + el + "[" + prop + "]");
    }
  }
}

/**
 * Get a (CSS) style property of a given DOM element and interpret the property as integer value
 * 
 * @param vElement {Element} the DOM element
 * @param propertyName {string} the name of the style property. e.g. "paddingTop", "marginLeft", ...
 * @return {integer} the (CSS) style property converted to an integer value
 */
qx.dom.Style.getStyleSize = function(el, prop) { return parseInt(qx.dom.Style.getStyleProperty(el, prop)) || 0; }


// Properties
/**
 * Get the element's left margin.
 * 
 * @param vElement {Element} the DOM element
 * @return {integer} the element's left margin size
 */
qx.dom.Style.getMarginLeft    = function(vElement) { return qx.dom.Style.getStyleSize(vElement, "marginLeft"); }

/**
 * Get the element's top margin.
 * 
 * @param vElement {Element} the DOM element
 * @return {integer} the element's top margin size
 */
qx.dom.Style.getMarginTop     = function(vElement) { return qx.dom.Style.getStyleSize(vElement, "marginTop"); }

/**
 * Get the element's right margin.
 * 
 * @param vElement {Element} the DOM element
 * @return {integer} the element's right margin size
 */
qx.dom.Style.getMarginRight   = function(vElement) { return qx.dom.Style.getStyleSize(vElement, "marginRight"); }

/**
 * Get the element's bottom margin.
 * 
 * @param vElement {Element} the DOM element
 * @return {integer} the element's bottom margin size
 */
qx.dom.Style.getMarginBottom  = function(vElement) { return qx.dom.Style.getStyleSize(vElement, "marginBottom"); }

/**
 * Get the element's left padding.
 * 
 * @param vElement {Element} the DOM element
 * @return {integer} the element's left padding size
 */
qx.dom.Style.getPaddingLeft   = function(vElement) { return qx.dom.Style.getStyleSize(vElement, "paddingLeft"); }

/**
 * Get the element's top padding.
 * 
 * @param vElement {Element} the DOM element
 * @return {integer} the element's top padding size
 */
qx.dom.Style.getPaddingTop    = function(vElement) { return qx.dom.Style.getStyleSize(vElement, "paddingTop"); }

/**
 * Get the element's right padding.
 * 
 * @param vElement {Element} the DOM element
 * @return {integer} the element's right padding size
 */
qx.dom.Style.getPaddingRight  = function(vElement) { return qx.dom.Style.getStyleSize(vElement, "paddingRight"); }

/**
 * Get the element's bottom padding.
 * 
 * @param vElement {Element} the DOM element
 * @return {integer} the element's bottom padding size
 */
qx.dom.Style.getPaddingBottom = function(vElement) { return qx.dom.Style.getStyleSize(vElement, "paddingBottom"); }

/**
 * Get the element's left border width.
 * 
 * @param vElement {Element} the DOM element
 * @return {integer} the element's left border width
 */
qx.dom.Style.getBorderLeft    = function(vElement) { return qx.dom.Style.getStyleProperty(vElement, "borderLeftStyle")   == "none" ? 0 : qx.dom.Style.getStyleSize(vElement, "borderLeftWidth"); }

/**
 * Get the element's top border width.
 * 
 * @param vElement {Element} the DOM element
 * @return {integer} the element's top border width
 */
qx.dom.Style.getBorderTop     = function(vElement) { return qx.dom.Style.getStyleProperty(vElement, "borderTopStyle")    == "none" ? 0 : qx.dom.Style.getStyleSize(vElement, "borderTopWidth"); }

/**
 * Get the element's right border width.
 * 
 * @param vElement {Element} the DOM element
 * @return {integer} the element's right border width
 */
qx.dom.Style.getBorderRight   = function(vElement) { return qx.dom.Style.getStyleProperty(vElement, "borderRightStyle")  == "none" ? 0 : qx.dom.Style.getStyleSize(vElement, "borderRightWidth"); }

/**
 * Get the element's bottom border width.
 * 
 * @param vElement {Element} the DOM element
 * @return {integer} the element's bottom border width
 */
qx.dom.Style.getBorderBottom  = function(vElement) { return qx.dom.Style.getStyleProperty(vElement, "borderBottomStyle") == "none" ? 0 : qx.dom.Style.getStyleSize(vElement, "borderBottomWidth"); }
