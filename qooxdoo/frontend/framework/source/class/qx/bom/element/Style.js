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

   ======================================================================

   This class contains code based on the following work:

   * Prototype JS
     http://www.prototypejs.org/
     Version 1.5

     Copyright:
       (c) 2006-2007, Prototype Core Team

     License:
       MIT: http://www.opensource.org/licenses/mit-license.php

     Authors:
       * Prototype Core Team


************************************************************************ */

/* ************************************************************************

#module(bom)

************************************************************************ */

/**
 * Style querying and modification of HTML elements.
 *
 * Automatically normalizes cross-browser differences. Optimized for
 * performance. This class does not contain cross-browser support
 * for special things like <code>opacity</code> which otherwise will
 * result in a much bigger implementation. For special things like
 * these please use the appropriate classes in this namespace.
 */
qx.Class.define("qx.bom.element.Style",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /** Internal map of style property convertions */
    __hints :
    {
      // Style property name correction
      names :
      {
        "float" : qx.bom.client.Engine.MSHTML ? "styleFloat" : "cssFloat",
        "boxSizing" : qx.bom.client.Engine.GECKO ? "mozBoxSizing" : "boxSizing"
      },

      // Mshtml has propertiery pixel* properties for locations and dimensions
      // which return the pixel value. Used by getComputed() in mshtml variant.
      mshtmlPixel :
      {
        width : "pixelWidth",
        height : "pixelHeight",
        left : "pixelLeft",
        right : "pixelRight",
        top : "pixelTop",
        bottom : "pixelBottom"
      },
      
      special :
      {
        clip : true,
        cursor : true,
        opacity : true,
        overflow : true
      }
    },


    /*
    ---------------------------------------------------------------------------
      STRING HELPERS
    ---------------------------------------------------------------------------
    */

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





    /*
    ---------------------------------------------------------------------------
      CSS TEXT SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Set the full CSS content of the style attribute
     *
     * @type static
     * @param element {Element} The DOM element to modify
     * @param value {String} The full CSS string
     * @signature function(element, value)
     * @return {void}
     */
    setCss : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(element, value) {
        element.style.cssText = value;
      },

      "default" : function(element, value) {
        element.setAttribute("style", value);
      }
    }),


    /**
     * Returns the full content of the style attribute.
     *
     * @type static
     * @param element {Element} The DOM element to query
     * @return {String} the full CSS string
     * @signature function(element)
     */
    getCss : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(element) {
        return element.style.cssText.toLowerCase();
      },

      "default" : function(element) {
        return element.getAttribute("style");
      }
    }),





    /*
    ---------------------------------------------------------------------------
      LOCAL
    ---------------------------------------------------------------------------
    */

    /**
     * Sets the value of a style property
     *
     * @type static
     * @param element {Element} The DOM element to modify
     * @param name {String} Name of the style attribute (js variant e.g. marginTop, wordSpacing)
     * @param value {var} the value for the given style
     * @return {void}
     */
    set : function(element, name, value)
    {
      var hints = this.__hints;

      // normalize name
      name = hints.names[name] || name;

      // apply style
      element.style[name] = value || "";
    },


    /**
     * Gets the local value of a style property.
     * Ignores inheritance cascade. Does not interpret values.
     *
     * @type static
     * @param element {Element} The DOM element to modify
     * @param name {String} Name of the style attribute (js variant e.g. marginTop, wordSpacing)
     * @return {String|null} value of the property
     */
    get : function(element, name)
    {
      var hints = this.__hints;

      // normalize name
      name = hints.names[name] || name;

      // query style
      return element.style[name] || "";
    },
    
    
    /**
     * Resets the value of a style property
     *
     * @type static
     * @param element {Element} The DOM element to modify
     * @param name {String} Name of the style attribute (js variant e.g. marginTop, wordSpacing)
     * @return {void}
     */
    reset : function(element, name)
    {
      var hints = this.__hints;

      // normalize name
      name = hints.names[name] || name;

      // apply style
      element.style[name] = "";
    },    




    /*
    ---------------------------------------------------------------------------
      CASCADED
    ---------------------------------------------------------------------------
    */

    /**
     * Returns the cascaded value of a style property.
     *
     * @type static
     * @param element {Element} The DOM element to query
     * @param name {String} Name of the style attribute (js variant e.g. marginTop, wordSpacing)
     * @signature function(element, name)
     * @return {var} the cascaded value of the given style
     */
    getCascaded : qx.core.Variant.select("qx.client",
    {
      // Mshtml uses currentStyle to query the cascaded style.
      // This is a propertiery property of mshtml.
      // Opera supports currentStyle, too
      "mshtml|opera" : function(element, name)
      {
        var hints = this.__hints;

        // Normalize name
        name = hints.names[name] || name;

        // return currentStyle of element
        return element.currentStyle[name];
      },

      "default" : function(element, name)
      {
        var hints = this.__hints;

        throw new Error("Cascaded styles are not supported on this client");
      }
    }),




    /*
    ---------------------------------------------------------------------------
      COMPUTED
    ---------------------------------------------------------------------------
    */

    /**
     * Returns the computed value of a style property. Compared to the cascaded style,
     * this one also interprets the values e.g. translates <code>em</code> units to
     * <code>px</code>.
     *
     * @type static
     * @param element {Element} The DOM element to query
     * @param name {String} Name of the style attribute (js variant e.g. marginTop, wordSpacing)
     * @signature function(element, name)
     * @return {var} the computed value of the given style
     */
    getComputed : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(element, name)
      {
        var hints = this.__hints;

        // Normalize name
        name = hints.names[name] || name;

        // Read cascaded style
        var currentStyle = element.currentStyle[name];

        // Pixel values are always OK
        if (/^-?[\.\d]+(px)?$/i.test(currentStyle)) {
          return currentStyle;
        }

        // Try to convert non-pixel values
        var pixel = hints.mshtmlPixel[name];
        if (pixel)
        {
          // Backup local and runtime style
          var localStyle = element.style[name];

          // Overwrite local value with cascaded value
          // This is needed to have the pixel value setupped
          element.style[name] = currentStyle || 0;

          // Read pixel value and add "px"
          var value = element.style[pixel] + "px";

          // Recover old local value
          element.style[name] = localStyle;

          // Return value
          return value;
        }

        // Non-Pixel values may be problematic
        if (/^-?[\.\d]+(em|pt|%)?$/i.test(currentStyle)) {
          throw new Error("Untranslated computed property value: " + name + ". Only pixel values work well across different clients.");
        }

        // Just the current style
        return currentStyle;
      },


      // Support for the DOM2 getComputedStyle method
      //
      // Safari >= 3 & Gecko > 1.4 expose all properties to the returned
      // CSSStyleDeclaration object. In older browsers the function
      // "getPropertyValue" is needed to access the values.
      //
      // On a computed style object all properties are read-only which is
      // identical to the behavior of MSHTML's "currentStyle".
      "default" : function(element, name)
      {
        var hints = this.__hints;

        // Normalize name
        name = hints.names[name] || name;

        // Opera, Mozilla and Safari 3+ also have a global getComputedStyle which is identical
        // to the one found under document.defaultView.

        // The problem with this is however that this does not work correctly
        // when working with frames and access an element of another frame.
        // Then we must use the <code>getComputedStyle</code> of the document
        // where the element is defined.
        var doc = qx.dom.Node.getDocument(element);
        var computed = doc.defaultView.getComputedStyle(element, null);

        // All relevant browsers expose the configured style properties to
        // the CSSStyleDeclaration objects
        return computed ? computed[name] : null;
      }
    })
  }
});
