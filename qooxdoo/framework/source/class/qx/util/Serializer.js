/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * <h3>EXPERIMENTAL</h3>
 * 
 * This is a util class resposnible for serializing qooxdoo objects.
 */
qx.Class.define("qx.util.Serializer", 
{
  statics :
  {
    
    /**
     * Serializes the properties of the given qooxdoo object. To get the 
     * serialization working, every property needs has to have a string 
     * representation because the value od the property will be concated to the 
     * serialized string.
     * 
     * @param object {qx.core.Object} Any qooxdoo object
     * @return {String} The serialized object.
     */
    toUriParameter : function(object) {
      var result = "";
      var properties = qx.util.PropertyUtil.getProperties(object.constructor);
      
      for (var name in properties) {
        var value = object["get" + qx.lang.String.firstUp(name)]();
        result += encodeURIComponent(name) + "=" + encodeURIComponent(value) + "&";
      }
      return result.substring(0, result.length - 1);
    }
    
  }
});
