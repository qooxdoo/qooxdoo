/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)

************************************************************************ */

/* ************************************************************************

#module(html2)

************************************************************************ */

qx.Class.define("qx.html2.element.Style",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */
  
  statics :
  {
    /*
    ---------------------------------------------------------------------------
      ELEMENT CSS
    ---------------------------------------------------------------------------
    */
    
    /**
     * Set the full CSS content of the style attribute
     *
     * @type static
     * @param el {Element} The DOM element to modify
     * @param value {String} The full CSS string
     * @signature function(el, value)
     * @return {void}
     */
    setCss : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(el, value) {
        el.style.cssText = value;
      },

      "default" : function(el, value) {
        el.setAttribute("style", value);
      }
    }),


    /**
     * Returns the full content of the style attribute.
     *
     * @type static
     * @param el {Element} The DOM element to query
     * @return {String} the full CSS string
     * @signature function(el)
     */
    getCss : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(el) {
        return el.style.cssText.toLowerCase();
      },

      "default" : function(el) {
        return el.getAttribute("style");
      }
    }),







    /*
    ---------------------------------------------------------------------------
      ELEMENT STYLE
    ---------------------------------------------------------------------------
    */

    /** Internal map of style property convertions */
    __styleHints :
    {
      names :
      {
        "float" : qx.core.Client.getInstance().isMshtml() ? "styleFloat" : "cssFloat"
      }
    },


    /**
     * Converts a script style property name to the CSS variant e.g. marginTop => margin-top
     *
     * @type static
     * @param name {String} Name of the style attribute (CSS variant e.g. marginTop, wordSpacing)
     * @return {String} the CSS style name e.g. margin-top, word-spacing
     */
    toCssStyle : function(name) {
      return name.replace(/([A-Z])/g, '-$1').toLowerCase();
    },


    /**
     * Converts a CSS style property name to the script variant e.g. margin-top => marginTop
     *
     * @type static
     * @param name {String} Name of the style attribute (CSS variant e.g. margin-top, word-spacing)
     * @return {String} the script style name e.g. marginTop, wordSpacing
     */
    toScriptStyle : function(name)
    {
      return name.replace(/\-([a-z])/g, function(match, chr) {
        return chr.toUpperCase();
      });
    },


    /**
     * Sets the value of a style property
     *
     * @type static
     * @param el {Element} The DOM element to modify
     * @param name {String} Name of the style attribute (js variant e.g. marginTop, wordSpacing)
     * @param value {var} the value for the given style
     * @return {void}
     */
    setStyle : function(el, name, value)
    {
      var hints = this.__styleHints;

      // normalize name
      name = hints.names[name] || name;

      // apply style
      el.style[name] = value || "";
    },


    /**
     * Returns the computed value of a style property
     *
     * @type static
     * @param el {Element} The DOM element to query
     * @param name {String} Name of the style attribute (js variant e.g. marginTop, wordSpacing)
     * @signature function(el, name)
     * @return {var} the value of the given style
     */
    getStyle : qx.core.Variant.select("qx.client",
    {
      // Mshtml uses currentStyle to query the computed style.
      // This is a propertiery property on mshtml.
      // Opera supports currentStyle, too, which is also faster
      // than evaluating using style+getComputedStyle
      "mshtml|opera" : function(el, name)
      {
        var hints = this.__styleHints;

        // normalize name
        name = hints.names[name] || name;

        // read out computed style
        var value = el.currentStyle[name];

        // auto should be interpreted as null
        return value === "auto" ? null : value;
      },

      // Support for the DOM2 getComputedStyle method
      //
      // Safari >= 3 & Gecko > 1.4 expose all properties to the returned
      // CSSStyleDeclaration object. In older browsers the function
      // "getPropertyValue" is needed to access the values.
      //
      // On a computed style object all properties are read-only which is
      // identical to the behavior of MSHTML's "currentStyle".
      "default" : function(el, name)
      {
        var hints = this.__styleHints;

        // normalize name
        name = hints.names[name] || name;

        // read out explicit style:
        // faster than the method call later
        var value = el.style[name];

        // otherwise try computed value
        if (!value)
        {
          // Opera, Mozilla and Safari 3+ also have a global getComputedStyle which is identical
          // to the one found under document.defaultView.
          var computed = getComputedStyle(el, null);

          // All relevant browsers expose the configured style properties to the CSSStyleDeclaration
          // objects
          if (computed) {
            value = computed[name];
          }
        }

        // auto should be interpreted as null
        return value === "auto" ? null : value;
      }
    })
  }
});
