/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/**
 * Methods to get CSS style properties of DOM elements.
 * @deprecated: Should be replaced with qx.bom.element.Style which should
 *   also work a lot better
 */
qx.Class.define("qx.legacy.html.Style",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /**
     * TODO
     *
     * @param vElement {var} TODOC
     * @param propertyName {var} TODOC
     * @return {void}
     * @signature function(vElement, propertyName)
     */
    getStylePropertySure : qx.lang.Object.select((document.defaultView && document.defaultView.getComputedStyle) ? "hasComputed" : "noComputed",
    {
      "hasComputed" : function(el, prop) {
        return !el ? null : el.ownerDocument ? el.ownerDocument.defaultView.getComputedStyle(el, "")[prop] : el.style[prop];
      },

      "noComputed" : qx.core.Variant.select("qx.client",
      {
        "mshtml" : function(el, prop)
        {
          try
          {
            if (!el) {
              return null;
            }

            if (el.parentNode && el.currentStyle) {
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
        },

        "default" : function(el, prop) {
          return !el ? null : el.style[prop];
        }
      })
    }),


    /**
     * Get the computed (CSS) style property of a given DOM element
     *
     * @param vElement {Element} the DOM element
     * @param propertyName {String} the name of the style property. e.g. "color", "border", ...
     * @return {String} the (CSS) style property
     * @signature function(vElement, propertyName)
     */
    getStyleProperty : qx.lang.Object.select((document.defaultView && document.defaultView.getComputedStyle) ? "hasComputed" : "noComputed",
    {
      "hasComputed" : function(el, prop)
      {
        try {
          return el.ownerDocument.defaultView.getComputedStyle(el, "")[prop];
        } catch(ex) {
          throw new Error("Could not evaluate computed style: " + el + "[" + prop + "]: " + ex);
        }
      },

      "noComputed" : qx.core.Variant.select("qx.client",
      {
        "mshtml" : function(el, prop)
        {
          try {
            return el.currentStyle[prop];
          } catch(ex) {
            throw new Error("Could not evaluate computed style: " + el + "[" + prop + "]: " + ex);
          }
        },

        "default" : function(el, prop)
        {
          try {
            return el.style[prop];
          } catch(ex) {
            throw new Error("Could not evaluate computed style: " + el + "[" + prop + "]");
          }
        }
      })
    }),


    /**
     * Get a (CSS) style property of a given DOM element and interpret the property as integer value
     *
     * @param vElement {Element} the DOM element
     * @param propertyName {String} the name of the style property. e.g. "paddingTop", "marginLeft", ...
     * @return {Integer} the (CSS) style property converted to an integer value
     */
    getStyleSize : function(vElement, propertyName) {
      return parseInt(qx.legacy.html.Style.getStyleProperty(vElement, propertyName)) || 0;
    },


    /**
     * Get the element's left margin.
     *
     * @param vElement {Element} the DOM element
     * @return {Integer} the element's left margin size
     */
    getMarginLeft : function(vElement) {
      return qx.legacy.html.Style.getStyleSize(vElement, "marginLeft");
    },


    /**
     * Get the element's top margin.
     *
     * @param vElement {Element} the DOM element
     * @return {Integer} the element's top margin size
     */
    getMarginTop : function(vElement) {
      return qx.legacy.html.Style.getStyleSize(vElement, "marginTop");
    },


    /**
     * Get the element's right margin.
     *
     * @param vElement {Element} the DOM element
     * @return {Integer} the element's right margin size
     */
    getMarginRight : function(vElement) {
      return qx.legacy.html.Style.getStyleSize(vElement, "marginRight");
    },


    /**
     * Get the element's bottom margin.
     *
     * @param vElement {Element} the DOM element
     * @return {Integer} the element's bottom margin size
     */
    getMarginBottom : function(vElement) {
      return qx.legacy.html.Style.getStyleSize(vElement, "marginBottom");
    },


    /**
     * Get the element's left padding.
     *
     * @param vElement {Element} the DOM element
     * @return {Integer} the element's left padding size
     */
    getPaddingLeft : function(vElement) {
      return qx.legacy.html.Style.getStyleSize(vElement, "paddingLeft");
    },


    /**
     * Get the element's top padding.
     *
     * @param vElement {Element} the DOM element
     * @return {Integer} the element's top padding size
     */
    getPaddingTop : function(vElement) {
      return qx.legacy.html.Style.getStyleSize(vElement, "paddingTop");
    },


    /**
     * Get the element's right padding.
     *
     * @param vElement {Element} the DOM element
     * @return {Integer} the element's right padding size
     */
    getPaddingRight : function(vElement) {
      return qx.legacy.html.Style.getStyleSize(vElement, "paddingRight");
    },


    /**
     * Get the element's bottom padding.
     *
     * @param vElement {Element} the DOM element
     * @return {Integer} the element's bottom padding size
     */
    getPaddingBottom : function(vElement) {
      return qx.legacy.html.Style.getStyleSize(vElement, "paddingBottom");
    },


    /**
     * Get the element's left border width.
     *
     * @param vElement {Element} the DOM element
     * @return {Integer} the element's left border width
     */
    getBorderLeft : function(vElement) {
      return qx.legacy.html.Style.getStyleProperty(vElement, "borderLeftStyle") == "none" ? 0 : qx.legacy.html.Style.getStyleSize(vElement, "borderLeftWidth");
    },


    /**
     * Get the element's top border width.
     *
     * @param vElement {Element} the DOM element
     * @return {Integer} the element's top border width
     */
    getBorderTop : function(vElement) {
      return qx.legacy.html.Style.getStyleProperty(vElement, "borderTopStyle") == "none" ? 0 : qx.legacy.html.Style.getStyleSize(vElement, "borderTopWidth");
    },


    /**
     * Get the element's right border width.
     *
     * @param vElement {Element} the DOM element
     * @return {Integer} the element's right border width
     */
    getBorderRight : function(vElement) {
      return qx.legacy.html.Style.getStyleProperty(vElement, "borderRightStyle") == "none" ? 0 : qx.legacy.html.Style.getStyleSize(vElement, "borderRightWidth");
    },


    /**
     * Get the element's bottom border width.
     *
     * @param vElement {Element} the DOM element
     * @return {Integer} the element's bottom border width
     */
    getBorderBottom : function(vElement) {
      return qx.legacy.html.Style.getStyleProperty(vElement, "borderBottomStyle") == "none" ? 0 : qx.legacy.html.Style.getStyleSize(vElement, "borderBottomWidth");
    }
  }
});
