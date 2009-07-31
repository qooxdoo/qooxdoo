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
    },
    
    
    /**
     * Serializes the properties of the given qooxdoo object into a json object.
     * 
     * @param object {qx.core.Object} Any qooxdoo object
     * @return {String} The serialized object.
     */
    toJson : function(object) {
      var result = "";
      
      // null or undefined
      if (object == null) {
        return "null";
      // data array
      } else if (qx.Class.hasInterface(object.constructor, qx.data.IListData)) {
        result += "[";
        for (var i = 0; i < object.getLength(); i++) {
          result += qx.util.Serializer.toJson(object.getItem(i)) + ",";
        }
        if (result != "[") {
          result = result.substring(0, result.length - 1);
        }        
        return result + "]";
                
      // other arrays
      } else if (qx.lang.Type.isArray(object)) {
        result += "[";
        for (var i = 0; i < object.length; i++) {
          result += qx.util.Serializer.toJson(object[i]) + ",";
        }
        if (result != "[") {
          result = result.substring(0, result.length - 1);
        }        
        return result + "]";
        
      // qooxdoo object  
      } else if (object instanceof qx.core.Object) {
        result += "{";
        var properties = qx.util.PropertyUtil.getProperties(object.constructor);
        for (var name in properties) {
          // ignore property groups
          if (properties[name].group != undefined) {
            continue;
          }
          var value = object["get" + qx.lang.String.firstUp(name)]();
          result += '"' + name + '":' + qx.util.Serializer.toJson(value) + ",";
        }
        if (result != "{") {
          result = result.substring(0, result.length - 1);
        }
        return result + "}";        
        
      // strings
      } else if (qx.lang.Type.isString(object)) {
        // escape 
        object = object.replace(/([\\])/g, '\\\\');
        object = object.replace(/(["])/g, '\\"');
        object = object.replace(/([\r])/g, '\\r');
        object = object.replace(/([\f])/g, '\\f');
        object = object.replace(/([\n])/g, '\\n');
        object = object.replace(/([\t])/g, '\\t');
        object = object.replace(/([\b])/g, '\\b');
                                                        
        return '"' + object + '"';
        
      // Date and RegExp
      } else if (

        qx.lang.Type.isDate(object) || 
        qx.lang.Type.isRegExp(object)
      ) {
        return '"' + object + '"';
      }
      // all other stuff
      return object + "";      
    }
    
  }
});
