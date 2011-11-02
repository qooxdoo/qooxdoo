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
 * If you want to querying and modification styles of HTML elements, 
 * take alook at {@see qx.bom.element.Style}.
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
     * @return {String|null} The supported property name or null if not supported
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
    }
  }
});