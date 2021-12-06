/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
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

   ----------------------------------------------------------------------

     Copyright (c) 2005-2008 Sam Stephenson

     Permission is hereby granted, free of charge, to any person
     obtaining a copy of this software and associated documentation
     files (the "Software"), to deal in the Software without restriction,
     including without limitation the rights to use, copy, modify, merge,
     publish, distribute, sublicense, and/or sell copies of the Software,
     and to permit persons to whom the Software is furnished to do so,
     subject to the following conditions:

     THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
     EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
     MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
     NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
     HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
     WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
     DEALINGS IN THE SOFTWARE.

************************************************************************ */

/**
 * Style querying and modification of HTML elements.
 *
 * Automatically normalizes cross-browser differences for setting and reading
 * CSS attributes. Optimized for performance.
 *
 * @require(qx.lang.String)
 * @require(qx.bom.client.Css)

 * @require(qx.bom.element.Clip#set)
 * @require(qx.bom.element.Cursor#set)
 * @require(qx.bom.element.Opacity#set)
 * @require(qx.bom.element.BoxSizing#set)

 * @require(qx.bom.element.Clip#get)
 * @require(qx.bom.element.Cursor#get)
 * @require(qx.bom.element.Opacity#get)
 * @require(qx.bom.element.BoxSizing#get)

 * @require(qx.bom.element.Clip#reset)
 * @require(qx.bom.element.Cursor#reset)
 * @require(qx.bom.element.Opacity#reset)
 * @require(qx.bom.element.BoxSizing#reset)

 * @require(qx.bom.element.Clip#compile)
 * @require(qx.bom.element.Cursor#compile)
 * @require(qx.bom.element.Opacity#compile)
 * @require(qx.bom.element.BoxSizing#compile)
 */
qx.Bootstrap.define("qx.bom.element.Style",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    __styleNames : null,

    __cssNames : null,

    /**
     * Detect vendor specific properties.
     */
    __detectVendorProperties : function()
    {
      var styleNames = {
        "appearance" : qx.core.Environment.get("css.appearance"),
        "userSelect" : qx.core.Environment.get("css.userselect"),
        "textOverflow" : qx.core.Environment.get("css.textoverflow"),
        "borderImage" : qx.core.Environment.get("css.borderimage"),
        "float" : qx.core.Environment.get("css.float"),
        "userModify" : qx.core.Environment.get("css.usermodify"),
        "boxSizing" : qx.core.Environment.get("css.boxsizing")
      };

      this.__cssNames = {};
      for (var key in qx.lang.Object.clone(styleNames)) {
        if (!styleNames[key]) {
          delete styleNames[key];
        }
        else {
          if (key === 'float') {
            this.__cssNames['cssFloat'] = key;
          } else {
            this.__cssNames[key] = qx.bom.Style.getCssName(styleNames[key]);
          }
        }
      }

      this.__styleNames = styleNames;
    },


    /**
     * Gets the (possibly vendor-prefixed) name of a style property and stores
     * it to avoid multiple checks.
     *
     * @param name {String} Style property name to check
     * @return {String|null} The client-specific name of the property, or
     * <code>null</code> if it's not supported.
     */
    __getStyleName : function(name)
    {
      var styleName = qx.bom.Style.getPropertyName(name);
      if (styleName) {
        this.__styleNames[name] = styleName;
      }
      return styleName;
    },


    /**
     * Mshtml has proprietary pixel* properties for locations and dimensions
     * which return the pixel value. Used by getComputed() in mshtml variant.
     *
     * @internal
     */
    __mshtmlPixel :
    {
      width : "pixelWidth",
      height : "pixelHeight",
      left : "pixelLeft",
      right : "pixelRight",
      top : "pixelTop",
      bottom : "pixelBottom"
    },

    /**
     * Whether a special class is available for the processing of this style.
     *
     * @internal
     */
    __special :
    {
      clip : qx.bom.element.Clip,
      cursor : qx.bom.element.Cursor,
      opacity : qx.bom.element.Opacity,
      boxSizing : qx.bom.element.BoxSizing
    },


    /*
    ---------------------------------------------------------------------------
      COMPILE SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Compiles the given styles into a string which can be used to
     * concat a HTML string for innerHTML usage.
     *
     * @param map {Map} Map of style properties to compile
     * @return {String} Compiled string of given style properties.
     */
    compile : function(map)
    {
      var html = [];
      var special = this.__special;
      var cssNames = this.__cssNames;
      var name, value;

      for (name in map)
      {
        // read value
        value = map[name];
        if (value == null) {
          continue;
        }

        // normalize name
        name = this.__cssNames[name] || name;

        // process special properties
        if (special[name]) {
          html.push(special[name].compile(value));
        } else {
          if (!cssNames[name]) {
            cssNames[name] = qx.bom.Style.getCssName(name);
          }
          html.push(cssNames[name], ":", value === "" ? "\"\"" : value, ";");
        }
      }

      return html.join("");
    },

    /*
    ---------------------------------------------------------------------------
      CSS TEXT SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Set the full CSS content of the style attribute
     *
     * @param element {Element} The DOM element to modify
     * @param value {String} The full CSS string
     */
    setCss : function(element, value)
    {
      element.setAttribute("style", value);
    },


    /**
     * Returns the full content of the style attribute.
     *
     * @param element {Element} The DOM element to query
     * @return {String} the full CSS string
     * @signature function(element)
     */
    getCss : function(element)
    {
      return element.getAttribute("style");
    },





    /*
    ---------------------------------------------------------------------------
      STYLE ATTRIBUTE SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Checks whether the browser supports the given CSS property.
     *
     * @param propertyName {String} The name of the property
     * @return {Boolean} Whether the property id supported
     */
    isPropertySupported : function(propertyName)
    {
      return (
        this.__special[propertyName] ||
        this.__styleNames[propertyName] ||
        propertyName in document.documentElement.style
      );
    },


    /** @type {Integer} Computed value of a style property. Compared to the cascaded style,
     * this one also interprets the values e.g. translates <code>em</code> units to
     * <code>px</code>.
     */
    COMPUTED_MODE : 1,


    /** @type {Integer} Cascaded value of a style property. */
    CASCADED_MODE : 2,


    /**
     * @type {Integer} Local value of a style property. Ignores inheritance cascade.
     *   Does not interpret values.
     */
    LOCAL_MODE : 3,


    /**
     * Sets the value of a style property
     *
     * @param element {Element} The DOM element to modify
     * @param name {String} Name of the style attribute (js variant e.g. marginTop, wordSpacing)
     * @param value {var} The value for the given style
     * @param smart {Boolean?true} Whether the implementation should automatically use
     *    special implementations for some properties
     */
    set : function(element, name, value, smart)
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        qx.core.Assert.assertElement(element, "Invalid argument 'element'");
        qx.core.Assert.assertString(name, "Invalid argument 'name'");
        if (smart !== undefined) {
          qx.core.Assert.assertBoolean(smart, "Invalid argument 'smart'");
        }
      }


      // normalize name
      name = this.__styleNames[name] || this.__getStyleName(name) || name;

      // special handling for specific properties
      // through this good working switch this part costs nothing when
      // processing non-smart properties
      if (smart!==false && this.__special[name]) {
        this.__special[name].set(element, value);
      } else {
        element.style[name] = value !== null ? value : "";
      }
    },


    /**
     * Convenience method to modify a set of styles at once.
     *
     * @param element {Element} The DOM element to modify
     * @param styles {Map} a map where the key is the name of the property
     *    and the value is the value to use.
     * @param smart {Boolean?true} Whether the implementation should automatically use
     *    special implementations for some properties
     */
    setStyles : function(element, styles, smart)
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        qx.core.Assert.assertElement(element, "Invalid argument 'element'");
        qx.core.Assert.assertMap(styles, "Invalid argument 'styles'");
        if (smart !== undefined) {
          qx.core.Assert.assertBoolean(smart, "Invalid argument 'smart'");
        }
      }

      // inline calls to "set" and "reset" because this method is very
      // performance critical!
      var styleNames = this.__styleNames;
      var special = this.__special;

      var style = element.style;

      for (var key in styles)
      {
        var value = styles[key];
        var name = styleNames[key] || this.__getStyleName(key) || key;

        if (value === undefined)
        {
          if (smart!==false && special[name]) {
            special[name].reset(element);
          } else {
            style[name] = "";
          }
        }
        else
        {
          if (smart!==false && special[name]) {
            special[name].set(element, value);
          } else {
            style[name] = value !== null ? value : "";
          }
        }
      }
    },


    /**
     * Resets the value of a style property
     *
     * @param element {Element} The DOM element to modify
     * @param name {String} Name of the style attribute (js variant e.g. marginTop, wordSpacing)
     * @param smart {Boolean?true} Whether the implementation should automatically use
     *    special implementations for some properties
     */
    reset : function(element, name, smart)
    {
      // normalize name
      name = this.__styleNames[name] || this.__getStyleName(name) || name;

      // special handling for specific properties
      if (smart!==false && this.__special[name]) {
        this.__special[name].reset(element);
      } else {
        element.style[name] = "";
      }
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
     * @signature function(element, name, mode, smart)
     * @param element {Element} The DOM element to modify
     * @param name {String} Name of the style attribute (js variant e.g. marginTop, wordSpacing)
     * @param mode {Number} Choose one of the modes {@link #COMPUTED_MODE}, {@link #CASCADED_MODE},
     *   {@link #LOCAL_MODE}. The computed mode is the default one.
     * @param smart {Boolean?true} Whether the implementation should automatically use
     *    special implementations for some properties
     * @return {var} The value of the property
     */
    get : function(element, name, mode, smart)
    {
      // normalize name
      name = this.__styleNames[name] || this.__getStyleName(name) || name;

      // special handling
      if (smart!==false && this.__special[name]) {
        return this.__special[name].get(element, mode);
      }

      // switch to right mode
      switch(mode)
      {
        case this.LOCAL_MODE:
          return element.style[name] || "";

        case this.CASCADED_MODE:
          // Currently only supported by Opera and Internet Explorer
          if (element.currentStyle) {
            return element.currentStyle[name] || "";
          }

          throw new Error("Cascaded styles are not supported in this browser!");

        default:
          // Opera, Mozilla and Safari 3+ also have a global getComputedStyle which is identical
          // to the one found under document.defaultView.

          // The problem with this is however that this does not work correctly
          // when working with frames and access an element of another frame.
          // Then we must use the <code>getComputedStyle</code> of the document
          // where the element is defined.

          var doc = qx.dom.Node.getDocument(element);
          var getStyle = doc.defaultView ? doc.defaultView.getComputedStyle : undefined;

          if (getStyle !== undefined)
          {
            // Support for the DOM2 getComputedStyle method
            //
            // Safari >= 3 & Gecko > 1.4 expose all properties to the returned
            // CSSStyleDeclaration object. In older browsers the function
            // "getPropertyValue" is needed to access the values.
            //
            // On a computed style object all properties are read-only which is
            // identical to the behavior of MSHTML's "currentStyle".

            var computed = getStyle(element, null);
            // All relevant browsers expose the configured style properties to
            // the CSSStyleDeclaration objects
            if (computed && computed[name]) {
              return computed[name];
            }
          }
          else
          {
            // if the element is not inserted into the document "currentStyle"
            // may be undefined. In this case always return the local style.
            if (!element.currentStyle) {
              return element.style[name] || "";
            }

            // Read cascaded style. Shorthand properties like "border" are not available
            // on the currentStyle object.
            var currentStyle = element.currentStyle[name] || element.style[name] || "";

            // Pixel values are always OK
            if (/^-?[\.\d]+(px)?$/i.test(currentStyle)) {
              return currentStyle;
            }

            // Try to convert non-pixel values
            var pixel = this.__mshtmlPixel[name];
            if (pixel && (pixel in element.style))
            {
              // Backup local and runtime style
              var localStyle = element.style[name];

              // Overwrite local value with cascaded value
              // This is needed to have the pixel value setup
              element.style[name] = currentStyle || 0;

              // Read pixel value and add "px"
              var value = element.style[pixel] + "px";

              // Recover old local value
              element.style[name] = localStyle;

              // Return value
              return value;
            }

            // Just the current style
            return currentStyle;
          }

          return element.style[name] || "";
      }
    }
  },

  defer : function(statics) {
    statics.__detectVendorProperties();
  }
});
