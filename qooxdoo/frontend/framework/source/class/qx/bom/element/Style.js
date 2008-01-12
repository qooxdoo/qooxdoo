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
 * performance.
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
        "float" : qx.core.Variant.isSet("qx.client", "mshtml") ? "styleFloat" : "cssFloat",
        "boxSizing" : qx.core.Variant.isSet("qx.client", "gecko") ? "mozBoxSizing" : "boxSizing"
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
        overflowX : true,
        overflowY : true
      }
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
      STYLE ATTRIBUTE SUPPORT
    ---------------------------------------------------------------------------
    */

    /** {Integer} Computed value of a style property. Compared to the cascaded style,
     * this one also interprets the values e.g. translates <code>em</code> units to
     * <code>px</code>.
     */
    COMPUTED_MODE : 1,


    /** {Integer} Cascaded value of a style property. */
    CASCADED_MODE : 2,


    /** {Integer} Local value of a style property. Ignores inheritance cascade. Does not interpret values. */
    LOCAL_MODE : 3,


    /**
     * Sets the value of a style property
     *
     * @type static
     * @param element {Element} The DOM element to modify
     * @param name {String} Name of the style attribute (js variant e.g. marginTop, wordSpacing)
     * @param value {var} The value for the given style
     * @param smart {Boolean?true} Whether the implementation should automatically use
     *    special implementations for some properties
     * @return {void}
     */
    set : function(element, name, value, smart)
    {
      var hints = this.__hints;

      // normalize name
      name = hints.names[name] || name;

      // special handling
      /*
      if (smart!==false && hints.special[name])
      {
        switch(name)
        {
          case "clip":
            return qx.bom.element.Clip.set(element, value);

          case "cursor":
            return qx.bom.element.Cursor.set(element, value);

          case "opacity":
            return qx.bom.element.Opacity.set(element, value);

          case "overflowX":
            return qx.bom.element.Overflow.setX(element, value);

          case "overflowY":
            return qx.bom.element.Overflow.setY(element, value);
        }
      }
      */

      // apply style
      element.style[name] = value || "";
    },


    /**
     * Resets the value of a style property
     *
     * @type static
     * @param element {Element} The DOM element to modify
     * @param name {String} Name of the style attribute (js variant e.g. marginTop, wordSpacing)
     * @param smart {Boolean?true} Whether the implementation should automatically use
     *    special implementations for some properties
     * @return {void}
     */
    reset : function(element, name, smart)
    {
      var hints = this.__hints;

      // normalize name
      name = hints.names[name] || name;

      // special handling
      /*
      if (smart!==false && hints.special[name])
      {
        switch(name)
        {
          case "clip":
            return qx.bom.element.Clip.reset(element);

          case "cursor":
            return qx.bom.element.Cursor.reset(element);

          case "opacity":
            return qx.bom.element.Opacity.reset(element);

          case "overflowX":
            return qx.bom.element.Overflow.resetX(element);

          case "overflowY":
            return qx.bom.element.Overflow.resetY(element);
        }
      }
      */

      // apply style
      element.style[name] = "";
    },


    /**
     * Gets the value of a style property.
     *
     * *Computed*
     *
     * Returns the computed value of a style property. Compared to the cascaded style,
     * this one also interprets the values e.g. translates <code>em</code> units to
     * <code>px</code>.
     *
     * *Cascaded*
     *
     * Returns the cascaded value of a style property.
     *
     * *Local*
     *
     * Ignores inheritance cascade. Does not interpret values.
     *
     * @type static
     * @signature function(element, name, mode, smart)
     * @param element {Element} The DOM element to modify
     * @param name {String} Name of the style attribute (js variant e.g. marginTop, wordSpacing)
     * @param mode {Number} Choose one of the modes {@link #COMPUTED_MODE}, {@link #CASCADED_MODE},
     *   {@link #LOCAL_MODE}. The computed mode is the default one.
     * @param smart {Boolean?true} Whether the implementation should automatically use
     *    special implementations for some properties
     * @return {var} The value of the property
     */
    get : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(element, name, mode, smart)
      {
        var hints = this.__hints;

        // normalize name
        name = hints.names[name] || name;

        // special handling
        /*
        if (smart!==false && hints.special[name])
        {
          switch(name)
          {
            case "clip":
              return qx.bom.element.Clip.get(element, mode);

            case "cursor":
              return qx.bom.element.Cursor.get(element, mode);

            case "opacity":
              return qx.bom.element.Opacity.get(element, mode);

            case "overflowX":
              return qx.bom.element.Overflow.getX(element, mode);

            case "overflowY":
              return qx.bom.element.Overflow.getY(element, mode);
          }
        }
        */

        // switch to right mode
        switch(mode)
        {
          case this.LOCAL_MODE:
            return element.style[name] || "";

          case this.CASCADED_MODE:
            return element.currentStyle[name];

          default:
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
        }
      },

      "default" : function(element, name, mode, smart)
      {
        var hints = this.__hints;

        // normalize name
        name = hints.names[name] || name;

        // special handling
        /*
        if (smart!==false && hints.special[name])
        {
          switch(name)
          {
            case "clip":
              return qx.bom.element.Clip.get(element, mode);

            case "cursor":
              return qx.bom.element.Cursor.get(element, mode);

            case "opacity":
              return qx.bom.element.Opacity.get(element, mode);

            case "overflowX":
              return qx.bom.element.Overflow.getX(element, mode);

            case "overflowY":
              return qx.bom.element.Overflow.getY(element, mode);
          }
        }
        */

        // switch to right mode
        switch(mode)
        {
          case this.LOCAL_MODE:
            return element.style[name];

          case this.CASCADED_MODE:
            // Currently only supported by Opera and Internet Explorer
            if (element.currentStyle) {
              return element.currentStyle[name];
            }

            throw new Error("Cascaded styles are not supported in this browser!");

          // Support for the DOM2 getComputedStyle method
          //
          // Safari >= 3 & Gecko > 1.4 expose all properties to the returned
          // CSSStyleDeclaration object. In older browsers the function
          // "getPropertyValue" is needed to access the values.
          //
          // On a computed style object all properties are read-only which is
          // identical to the behavior of MSHTML's "currentStyle".
          default:
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
      }
    })
  }
});
