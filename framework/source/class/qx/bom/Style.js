/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
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
 * take a look at {@see qx.bom.element.Style}.
 */
qx.Bootstrap.define("qx.bom.Style",
{
  statics : {
    /** Vendor-specific style property prefixes **/
    VENDOR_PREFIXES : ["Webkit", "Moz", "O", "ms", "Khtml"],

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
     * Detects CSS support by applying a style to a DOM element of the given type
     * and verifying the result. Also checks for vendor-prefixed variants of the
     * value, e.g. "linear-gradient" -> "-webkit-linear-gradient". Returns the
     * (possibly vendor-prefixed) value if successful or <code>null</code> if
     * the property and/or value are not supported.
     *
     * @param element {DOMelement} element to be used for the detection
     * @param propertyName {String} the style property to be tested
     * @param value {String} style property value to be tested
     * @param prefixed {Boolean?} try to determine the appropriate vendor prefix
     * for the value. Default: <code>true</code>
     * @return {String|null} prefixed style value or <code>null</code> if not supported
     * @internal
     */
    getAppliedStyle : function(element, propertyName, value, prefixed)
    {
      var vendorPrefixes = (prefixed !== false) ?
        [null].concat(this.VENDOR_PREFIXES) : [null];

      for (var i=0, l=vendorPrefixes.length; i<l; i++) {
        var prefixedVal = vendorPrefixes[i] ?
          "-" + vendorPrefixes[i].toLowerCase() + "-" + value : value;
        // IE might throw an exception
        try {
          element.style[propertyName] = prefixedVal;
          if (typeof element.style[propertyName] == "string" &&
            element.style[propertyName] !== "")
          {
            return prefixedVal;
          }
        } catch(ex) {}
      }
      return null;
    }
  }
});