/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)
     * Daniel Wagner (danielwagner)

************************************************************************ */
/**
 * Responsible class for everything concerning styles without the need of
 * an element.
 *
 * If you want to query or modify styles of HTML elements,
 * take a look at {@link qx.bom.element.Style}.
 *
 * @require(qx.lang.String)
 */
qx.Bootstrap.define("qx.bom.Style",
{
  statics : {
    /** Vendor-specific style property prefixes */
    VENDOR_PREFIXES : ["Webkit", "Moz", "O", "ms", "Khtml"],

    /**
     * Internal lookup table to map property names to CSS names
     * @internal
     */
    __cssName : {},

    /**
     * A reference to the native CSS.supports function (supportsCSS in Opera)
     * @internal
     */
    __supports : null,

    /**
     * Takes the name of a style property and returns the name the browser uses
     * for its implementation, which might include a vendor prefix.
     *
     * @param propertyName {String} Style property name to check
     * @return {String|null} The supported property name or <code>null</code> if
     * not supported
     */
    getPropertyName : function(propertyName)
    {
      var style = document.documentElement.style;

      if (style[propertyName] !== undefined) {
        return propertyName;
      }

      for (var i=0, l=this.VENDOR_PREFIXES.length; i<l; i++) {
        var prefixedProp = this.VENDOR_PREFIXES[i] +
          qx.lang.String.firstUp(propertyName);
        if (style[prefixedProp] !== undefined) {
          return prefixedProp;
        }
      }

      return null;
    },


    /**
     * Takes the name of a JavaScript style property and returns the
     * corresponding CSS name.
     *
     * The name of the style property is taken as is, i.e. it gets not
     * extended by vendor prefixes. The conversion into the CSS name is
     * done by string manipulation, not involving the DOM.
     *
     * Example:
     * <pre class='javascript'>qx.bom.Style.getCssName("MozTransform"); //returns "-moz-transform"</pre>
     *
     * @param propertyName {String} JavaScript style property
     * @return {String} CSS property
     */
    getCssName: function(propertyName)
    {
      var cssName = this.__cssName[propertyName];

      if (!cssName)
      {
        // all vendor prefixes (except for "ms") start with an uppercase letter
        cssName = propertyName.replace(/[A-Z]/g, function(match){
          return  ('-' + match.charAt(0).toLowerCase());
        });

        // lowercase "ms" vendor prefix needs special handling
        if((/^ms/.test(cssName))) {
          cssName = "-" + cssName;
        }
        this.__cssName[propertyName] = cssName;
      }

      return cssName;
    },


    /**
     * Detects CSS support by using the native CSS.supports function or by
     * applying a style to a DOM element of the given type and verifying
     * the result. Also checks for vendor-prefixed variants of the
     * value, e.g. "linear-gradient" -> "-webkit-linear-gradient". Returns the
     * (possibly vendor-prefixed) value if successful or <code>null</code> if
     * the property and/or value are not supported.
     *
     * @param element {Element} element to be used for the detection
     * @param propertyName {String} the style property to be tested
     * @param value {String} style property value to be tested
     * @param prefixed {Boolean?} try to determine the appropriate vendor prefix
     * for the value. Default: <code>true</code>
     * @return {String|null} prefixed style value or <code>null</code> if not supported
     * @internal
     */
    getAppliedStyle : function(element, propertyName, value, prefixed)
    {
      var cssProperty = qx.bom.Style.getCssName(propertyName);
      var win = qx.dom.Node.getWindow(element);

      var vendorPrefixes = (prefixed !== false) ?
        [null].concat(this.VENDOR_PREFIXES) : [null];

      for (var i=0, l=vendorPrefixes.length; i<l; i++) {
        var supported = false;
        var prefixedVal = vendorPrefixes[i] ?
          "-" + vendorPrefixes[i].toLowerCase() + "-" + value : value;

        if (qx.bom.Style.__supports) {
          supported = qx.bom.Style.__supports.call(win, cssProperty, prefixedVal);
        } else {
          element.style.cssText += cssProperty + ":" + prefixedVal + ";";
          supported = (typeof element.style[propertyName] == "string" &&
          element.style[propertyName] !== "");
        }

        if (supported) {
          return prefixedVal;
        }
      }
      return null;
    }
  },

  defer : function(statics) {
    if (window.CSS && window.CSS.supports) {
      qx.bom.Style.__supports = window.CSS.supports.bind(window.CSS);
    } else if (window.supportsCSS) {
      qx.bom.Style.__supports = window.supportsCSS.bind(window);
    }
  }
});
