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


   This class contains code based on the following work:

     Base2:
       http://code.google.com/p/base2/
       Version 0.9

     Copyright:
       (c) 2006-2007, Dean Edwards

     License:
       MIT: http://www.opensource.org/licenses/mit-license.php

     Authors:
       * Dean Edwards


     ---


     Prototype JS:
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

#module(html2)

************************************************************************ */

/**
 * High performance DOM element interaction.
 */
qx.Class.define("qx.html2.ElementUtil",
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
      NODE CREATION & TYPES
    ---------------------------------------------------------------------------
    */

    /**
     * Creates an DOM element
     *
     * @type static
     * @param name {String} Tag name of the element
     * @param xhtml {Boolean?false} Enable XHTML
     * @return {Element} the created element node
     */
    createElement : function(name, xhtml)
    {
      if (xhtml) {
        return document.createElementNS("http://www.w3.org/1999/xhtml", name);
      } else {
        return document.createElement(name);
      }
    },


    /**
     * Whether the given node is a DOM element
     *
     * @type static
     * @param node {Node} the node which should be tested
     * @return {Boolean} true if the node is a DOM element
     */
    isElement : function(node) {
      return !!(node && node.nodeType === qx.dom.Node.ELEMENT);
    },


    /**
     * Whether the given node is a document
     *
     * @type static
     * @param node {Node} the node which should be tested
     * @return {Boolean} true when the node is a document
     */
    isDocument : function(node) {
      return !!(node && node.nodeType === qx.dom.Node.DOCUMENT);
    },










    /*
    ---------------------------------------------------------------------------
      NODE STRUCTURE
    ---------------------------------------------------------------------------
    */

    /**
     * Returns the owner document of the given node
     *
     * @type static
     * @param node {Node} the node which should be tested
     * @return {Document|null} The document of the given DOM node
     */
    getDocument : function(node) {
      return node.ownerDocument || node.document || null;
    },


    /**
     * Returns the DOM2 "defaultView" which represents the window
     * of a DOM node
     *
     * @type static
     * @param node {Node} TODOC
     * @return {var} TODOC
     */
    getDefaultView : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(node) {
        return this.getDocument(node).parentWindow;
      },

      "default" : function(node) {
        return this.getDocument(node).defaultView;
      }
    }),


    /**
     * Whether the first element contains the second one
     *
     * @type static
     * @param el {Element} Parent element
     * @param target {Node} Child node
     * @return {Boolean}
     */
    contains : function(el, target)
    {
      if (el.contains)
      {
        return this.isDocument(el) ?
          el === this.getOwnerDocument(target) :
          el !== target && el.contains(target);
      }
      else
      {
        while (target && (target = target.parentNode) && el != target) {
          continue;
        }

        return !!target;
      }
    },


    /**
     * Whether the given element is empty
     *
     * @type static
     * @param el {Element} The element to check
     * @return {Boolean} true when the element is empty
     */
    isEmpty : function(el)
    {
      el = el.firstChild;

      while (el)
      {
        if (el.nodeType === qx.dom.Node.ELEMENT || el.nodeType === qx.dom.Node.TEXT) {
          return false;
        }

        el = el.nextSibling;
      }

      return true;
    },


    /**
     * Returns the DOM index of the given node
     *
     * @type static
     * @param node {Node} Node to look for
     * @return {Integer} The DOM index
     */
    getNodeIndex : function(node)
    {
      var index = 0;

      while (node && (node = node.previousSibling)) {
        index++;
      }

      return index;
    },


    /**
     * Return the next element to the supplied element
     *
     * "nextSibling" is not good enough as it might return a text or comment el
     *
     * @type static
     * @param el {Element} Starting element node
     * @return {Element|null} Next element node
     */
    getNextElementSibling : function(el)
    {
      while (el && (el = el.nextSibling) && !this.isElement(el)) {
        continue;
      }

      return el || null;
    },


    /**
     * Return the previous element to the supplied element
     *
     * "previousSibling" is not good enough as it might return a text or comment el
     *
     * @type static
     * @param el {Element} Starting element node
     * @return {Element|null} Previous element node
     */
    getPreviousElementSibling : function(el)
    {
      while (el && (el = el.previousSibling) && !this.isElement(el)) {
        continue;
      }

      return el || null;
    },






    /*
    ---------------------------------------------------------------------------
      ELEMENT CLASS NAME
    ---------------------------------------------------------------------------
    */

    /**
     * Adds a className to the given element
     * If successfully added the given className will be returned
     *
     * Inspired by Dean Edwards' Base2
     *
     * @type static
     * @param element {Element} The element to modify
     * @param className {String} The new class name
     * @return {String} The added classname (if so)
     */
    addClass : function(element, className)
    {
      if (!this.hasClass(element, className))
      {
        element.className += (element.className ? " " : "") + className;
        return className;
      }
    },


    /**
     * Whether the given element has the given className.
     *
     * Inspired by Dean Edwards' Base2
     *
     * @type static
     * @param element {Element} The DOM element to check
     * @param className {String} The class name to check for
     * @return {var} TODOC
     */
    hasClass : function(element, className)
    {
      var regexp = new RegExp("(^|\\s)" + className + "(\\s|$)");
      return regexp.test(element.className);
    },


    /**
     * Removes a className from the given element
     *
     * Inspired by Dean Edwards' Base2
     *
     * @type static
     * @param element {Element} The DOM element to modify
     * @param className {String} The class name to remove
     * @return {String} The removed class name
     */
    removeClass : function(element, className)
    {
      var regexp = new RegExp("(^|\\s)" + className + "(\\s|$)");
      element.className = element.className.replace(regexp, "$2");

      return className;
    },






    /*
    ---------------------------------------------------------------------------
      ELEMENT ATTRIBUTES
    ---------------------------------------------------------------------------
    */

    /** Internal map of attribute convertions */
    __attributeHints :
    {
      names :
      {
        "class" : "className",
        "for" : "htmlFor",
        html : "innerHTML",
        text : qx.core.Variant.isSet("qx.client", "mshtml") ? "innerText" : "textContent",
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
     * Correctly supports HTML "for" attribute
     * Can handle both name variants lowercase & camelcase
     * Supports for "text" property to define innerText/textContent
     * Supports for "html" property to define innerHTML content
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
    }),







    /*
    ---------------------------------------------------------------------------
      ELEMENT VISIBILITY
    ---------------------------------------------------------------------------
    */

    /**
     * Shows the given element
     *
     * @type static
     * @param el {Element} DOM element to show
     * @return {void}
     */
    show : function(el) {
      el.style.visibility = "visible";
    },


    /**
     * Hides the given element
     *
     * @type static
     * @param el {Element} DOM element to show
     * @return {void}
     */
    hide : function(el) {
      el.style.visibility = "hidden";
    },


    /**
     * Toggle the visibility of the given element
     *
     * @type static
     * @param el {Element} DOM element to show
     * @return {void}
     */
    toggle : function(el) {
      el.style.visibility = this.isHidden(el) ? "visible" : "hidden";
    },


    /**
     * Whether the given element is visible
     *
     * @type static
     * @param el {Element} DOM element to query
     * @return {Boolean} true when the element is visible
     */
    isVisible : function(el) {
      return this.getStyle(el, "visibility") !== "hidden";
    },


    /**
     * Whether the given element is visible
     *
     * @type static
     * @param el {Element} DOM element to query
     * @return {Boolean} true when the element is visible
     */
    isHidden : function(el) {
      return this.getStyle(el, "visibility") === "hidden";
    },







    /*
    ---------------------------------------------------------------------------
      ELEMENT OPACITY
    ---------------------------------------------------------------------------
    */

    /**
     * Sets opacity of given element. Accepts numbers between zero and one
     * where "0" means transparent, "1" means opaque.
     *
     * @type static
     * @param el {Element} DOM element to modify
     * @param opacity {Float} A float number between 0 and 1
     * @return {void}
     * @signature function(el, opacity)
     */
    setOpacity : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(el, opacity)
      {
        if (opacity < 0.00001) {
          opacity = 0;
        }

				// IE has trouble with opacity if it does not have layout (hasLayout)
				// Force it by setting the zoom level
				if (!el.currentStyle.hasLayout) {
          this.setStyle(el, "zoom", 1);
        }

        // Read in computed filter
        var filter = this.getStyle(el, "filter");

        // Remove old alpha filter and add new one
        el.style.filter = filter.replace(/alpha\([^\)]*\)/gi, "") +
          "alpha(opacity=" + opacity * 100 + ")";;
      },

      "gecko" : function(el, opacity)
      {
        // Animations look better when not using 1.0 in gecko
        if (opacity == 1) {
          opacity = 0.999999;
        }

        if (qx.html2.client.Engine.VERSION < 1.7) {
          el.style.MozOpacity = opacity;
        } else {
          el.style.opacity = opacity;
        }
      },

      "default" : function(el, opacity) {
        el.style.opacity = opacity;
      }
    }),


    /**
     * Gets opacity of given element. Accepts numbers between zero and one
     * where "0" means transparent, "1" means opaque.
     *
     * @type static
     * @param el {Element} DOM element to modify
     * @return {Float} A float number between 0 and 1
     * @signature function(el)
     */
    getOpacity : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(el)
      {
        var filter = this.getStyle(el, "filter");

        if (filter)
        {
          var opacity = filter.match(/alpha\(opacity=(.*)\)/);

          if (opacity && opacity[1]) {
            return parseFloat(opacity[1]) / 100;
          }
        }

        return 1.0;
      },

      "gecko" : function(el)
      {
        var opacity = this.getStyle(el, qx.html2.client.Engine.VERSION < 1.7 "MozOpacity" : "opacity");

        if (opacity == 0.999999) {
          opacity = 1.0;
        }

        if (opacity != null) {
          return parseFloat(opacity);
        }

        return 1.0;
      },

      "default" : function(el)
      {
        var opacity = this.getStyle(el, "opacity");

        if (opacity != null) {
          return parseFloat(opacity);
        }

        return 1.0;
      }
    })
  }
});
