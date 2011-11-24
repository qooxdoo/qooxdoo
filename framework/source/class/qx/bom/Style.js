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
     * Takes a style property name and value and returns the value with the 
     * appropriate vendor prefix for the current browser.
     * For example, 
     * <code>getPrefixedValue("background", "linear-gradient(0deg, #fff, #000)")</code>
     * will return <code>"-webkit-linear-gradient(0deg, #fff, #000)"</code> in
     * Chrome.
     * 
     * @param propertyName {String} Style property name 
     * @param value {String} Style value
     * @return {String null} Prefixed value or <code>null</code> if not supported 
     */
    getPrefixedValue : function(propertyName, value)
    {
      var vendorPrefixes = [null].concat(this.VENDOR_PREFIXES);
      var el = document.createElement("div");
      
      for (var i=0, l=vendorPrefixes.length; i<l; i++) {
        var prefixedVal = vendorPrefixes[i] ? 
          "-" + vendorPrefixes[i].toLowerCase() + "-" + value : value;
        // IE might throw an exception
        try {
          el.style[propertyName] = prefixedVal;
          if (el.style[propertyName] !== "") {
            return prefixedVal;
          }
        } catch(ex) {}
      }
      return null;
    }
  }
});