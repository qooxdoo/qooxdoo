qx.Class.define("qx.html2.ElementUtil",
{
  statics :
  {
    /** Internal map of attribute convertions */
    __attributeHints :
    {
      names :
      {
        "class" : "className",
        "for" : "htmlFor",
        html : "innerHTML",
        text : qx.core.Client.getInstance().isMshtml() ? "innerText" : "textContent",
        colspan : "colSpan",
        rowspan : "rowSpan",
        valign : "vAlign",
        datetime : "dateTime",
        accesskey : "accessKey",
        tabindex : "tabIndex",
        enctype : "encType",
        maxlength : "maxLength",
        readonly : "readOnly",
        longdesc : "longDesc"
      },

      property :
      {
        disabled : true,
        checked : true,
        readOnly : true,
        multiple : true,
        selected : true,
        value : true,
        maxLength : true,
        className : true,
        innerHTML : true,
        innerText : true,
        textContent : true,
        htmlFor : true
      },

      mshtmlOriginal :
      {
        href : true,
        src : true,
        type : true
      }
    },


    /**
     * Returns the value of the given HTML attribute
     *
     * @type static
     * @param el {Element} The DOM element to query
     * @param name {String} Name of the attribute
     * @return {var} New value of the attribute
     * @signature function(el, name)
     */
    getAttribute : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(el, name)
      {
        var hints = this.__attributeHints;
  
        // normalize name
        name = hints.names[name] || name;
  
        // respect properties
        if (hints.property[name]) {
          return el[name];
        }
  
        // respect original values
        // http://msdn2.microsoft.com/en-us/library/ms536429.aspx
        if (hints.mshtmlOriginal[name]) {
          return el.getAttribute(name, 2);
        }
  
        return el.getAttribute(name);
      },
      
      "default" : function(el, name)
      {
        var hints = this.__attributeHints;
  
        // normalize name
        name = hints.names[name] || name;
  
        // respect properties
        if (hints.property[name]) {
          return el[name];
        }
  
        return el.getAttribute(name);        
      }
    }),

    
    /**
     * Sets a HTML attribute on an DOM element
     *
     * @param el {Element} The DOM element to modify
     * @param name {String} Name of the attribute
     * @param value {var} New value of the attribute
     * @return {void}
     */
    setAttribute : function(el, name, value)
    {
      var hints = this.__attributeHints;

      // normalize name
      name = hints.names[name] || name;

      // apply attribute
      if (hints.property[name]) {
        el[name] = value;
      } else if (value === true) {
        el.setAttribute(name, name);
      } else if (value === false || value === null) {
        el.removeAttribute(name);
      } else {
        el.setAttribute(name, value);
      }
    },


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
