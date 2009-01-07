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
     * Andreas Ecker (ecker)

************************************************************************ */

/**
 * Helper functions to handle Object as a Hash map.
 */
qx.Bootstrap.define("qx.lang.Object",
{
  statics :
  {
    /**
     * Clears the map from all values
     *
     * @param map {Object} the map to clear
     */
    empty : function(map)
    {
      for (var key in map) 
      {
        if (map.hasOwnProperty(key)) {
          delete map[key];
        }  
      }
    },
    
    
    /**
     * Check if the hash has any keys
     *
     * @param map {Object} the map to check
     * @return {Boolean} whether the map has any keys
     */
    isEmpty : function(map)
    {
      for (var key in map) {
        return false;
      }

      return true;
    },


    /**
     * Get the number of objects in the map
     *
     * @param map {Object} the map
     * @return {Integer} number of objects in the map
     */
    len : function(map)
    {
      var length = 0;

      for (var key in map) {
        length++;
      }

      return length;
    },


    /**
     * Get the keys of a map as array as returned by a "for ... in" statement.
     *
     * @param map {Object} the map
     * @return {Array} array of the keys of the map
     */
    keys : function(map)
    {
      var arr = [];

      for (var key in map) {
        arr.push(key);
      }

      return arr;
    },


    /**
     * Get the keys of a map as string
     *
     * @param map {Object} the map
     * @return {String} String of the keys of the map
     *         The keys are separated by ", "
     */
    keysFormatted : function(map)
    {
      var keys = [];
      for (var key in map) {
        keys.push(key);
      }

      return '"' + keys.join('\", "') + '"';
    },


    /**
     * Get the values of a map as array
     *
     * @param map {Object} the map
     * @return {Array} array of the values of the map
     */
    values : function(map)
    {
      var arr = [];

      for (var key in map) {
        arr.push(map[key]);
      }

      return arr;
    },
    
  
    /**
     * Return a clone of the given map
     *
     * @param source {Object} map to clone
     * @return {Object} the clone
     */
    clone : function(source)
    {
      var clone = {};

      for (var key in source) {
        clone[key] = source[key];
      }

      return clone;
    },


    /**
     * Inverts a map by exchanging the keys with the values.
     *
     * If the map has the same values for different keys, information will get lost.
     * The values will be converted to strings using the toString methos.
     *
     * @param map {Object} Map to invert
     * @return {Object} inverted Map
     */
    invert : function(map)
    {
      var result = {};

      for (var key in map) {
        result[map[key].toString()] = key;
      }

      return result;
    },
    
    
    /**
     * Get the key of the given value from a map.
     * If the map has more than one key matching the value the fist match is returned.
     * If the map does not contain the value <code>null</code> is returned.
     *
     * @param obj {Object} Map to search for the key
     * @param value {var} Value to look for
     * @return {String|null} Name of the key (null if not found).
     */    
    keyOf : function(obj, value)
    {
  		for (var key in obj)
  		{
  			if (obj.hasOwnProperty(key) && obj[key] === value) {
  			  return key;
			  } 
  		}
  		
  		return null;    
    },
    
    
    /**
     * Whether the map contains the given value.
     *
     * @param obj {Object} Map to search for the value
     * @param value {var} Value to look for
     * @return {Boolean} Whether the value was found in the map.
     */
    contains : function(obj, value) {
      return this.keyOf(obj, value) !== null;
    },


    /**
     * Selects the value with the given key from the map.
     *
     * @param key {String} name of the key to get the value from
     * @param map {Object} map to get the value from
     * @return {var} value for the given key from the map
     */
    select: function(key, map) {
      return map[key];
    },

  
    
    
    
    
    
    
    /*
    ---------------------------------------------------------------------------
       LEGACY SECTION
    ---------------------------------------------------------------------------
    */        

    /**
     * Convert an array into a map.
     *
     * All elements of the array become keys of the returned map by
     * calling <code>toString</code> on the array elements. The values of the
     * map are set to <code>true</code>
     *
     * @deprecated Legacy code - unused in the framework!
     * @param array {Array} array to convert
     * @return {Map} the array converted to a map.
     */
    fromArray: function(array)
    {
      if (qx.core.Variant.isSet("qx.debug", "on")) {
        qx.log.Logger.deprecatedMethodWarning(arguments.callee);
      }
        
      var obj = {};

      for (var i=0, l=array.length; i<l; i++)
      {
        if (qx.core.Variant.isSet("qx.debug", "on"))
        {
          switch(typeof array[i])
          {
            case "object":
            case "function":
            case "undefined":
              throw new Error("Could not convert complex objects like " + array[i] + " at array index " + i + " to map syntax");
          }
        }

        obj[array[i].toString()] = true;
      }

      return obj;
    },
    
    
    /**
     * Check whether the number of objects in the maps is at least "length"
     *
     * @deprecated Legacy code - unused in the framework!
     * @param map {Object} the map to check
     * @param length {Integer} minimum number of objects in the map
     * @return {Boolean} whether the map contains at least "length" objects.
     */
    hasMinLength : function(map, length)
    {
      if (qx.core.Variant.isSet("qx.debug", "on")) {
        qx.log.Logger.deprecatedMethodWarning(arguments.callee);
      }
        
      var i = 0;

      for (var key in map)
      {
        if ((++i) >= length) {
          return true;
        }
      }

      return false;
    },
    
    
    /**
     * Get the number of objects in the map
     *
     * @deprecated Use {@link #len} instead
     * @param map {Object} the map
     * @return {Integer} number of objects in the map
     */
    getLength : function(map) 
    {
      if (qx.core.Variant.isSet("qx.debug", "on")) {
        qx.log.Logger.deprecatedMethodWarning(arguments.callee, "Use len() instead.");
      }
              
      return this.len(map);
    },    
    
    
    /**
     * Get the keys of a map as array as returned by a "for ... in" statement.
     *
     * @deprecated Use {@link #keys} instead
     * @param map {Object} the map
     * @return {Array} array of the keys of the map
     */
    getKeys : function(map) 
    {
      if (qx.core.Variant.isSet("qx.debug", "on")) {
        qx.log.Logger.deprecatedMethodWarning(arguments.callee, "Use keys() instead.");
      }
      
      return this.keys(map);
    },
        
    
    /**
     * Get the keys of a map as string
     *
     * @deprecated Use {@link #keysFormatted} instead
     * @param map {Object} the map
     * @return {String} String of the keys of the map
     *         The keys are separated by ", "
     */
    getKeysAsString : function(map) 
    {
      if (qx.core.Variant.isSet("qx.debug", "on")) {
        qx.log.Logger.deprecatedMethodWarning(arguments.callee, "Use keysFormatted() instead.");
      }
            
      return this.keysFormatted(map);
    },
        
    
    /**
     * Get the values of a map as array
     *
     * @deprecated Use {@link #values} instead
     * @param map {Object} the map
     * @return {Array} array of the values of the map
     */    
    getValues : function(map) 
    {
      if (qx.core.Variant.isSet("qx.debug", "on")) {
        qx.log.Logger.deprecatedMethodWarning(arguments.callee, "Use values() instead.");
      }
               
      return this.values(map);
    },    
    
    
    /**
     * Return a clone of the given map
     *
     * @deprecated Use {@link #clone} instead
     * @param source {Object} map to clone
     * @return {Object} the clone
     */    
    copy : function(source) 
    {
      if (qx.core.Variant.isSet("qx.debug", "on")) {
        qx.log.Logger.deprecatedMethodWarning(arguments.callee, "Use clone() instead.");
      }
               
      return this.clone(source);
    },
    

    /**
     * Get the key of the given value from a map.
     * If the map has more than one key matching the value the fist match is returned.
     * If the map does not contain the value <code>null</code> is returned.
     *
     * @deprecated Please use {@link #keyOf} instead
     * @param obj {Object} Map to search for the key
     * @param value {var} Value to look for
     * @return {String|null} Name of the key (null if not found).
     */
    getKeyFromValue: function(obj, value) 
    {
      if (qx.core.Variant.isSet("qx.debug", "on")) {
        qx.log.Logger.deprecatedMethodWarning(arguments.callee, "Use keyOf() instead.");
      }
               
      return this.keyOf(obj, value);
    },
        
    
    /**
     * Inserts all keys of the source object into the
     * target objects. Attention: The target map gets modified.
     *
     * @deprecated Legacy code - unused in the framework!
     * @param target {Object} target object
     * @param source {Object} object to be merged
     * @param overwrite {Boolean ? true} If enabled existing keys will be overwritten
     * @return {Object} Target with merged values from the source object
     */
    mergeWith : function(target, source, overwrite)
    {
      if (qx.core.Variant.isSet("qx.debug", "on")) {
        qx.log.Logger.deprecatedMethodWarning(arguments.callee);
      }
            
      if (overwrite === undefined) {
        overwrite = true;
      }

      for (var key in source)
      {
        if (overwrite || target[key] === undefined) {
          target[key] = source[key];
        }
      }

      return target;
    },


    /**
     * Inserts all keys of the source object into the
     * target objects but don't override existing keys
     *
     * @deprecated Legacy code - unused in the framework!
     * @param target {Object} target object
     * @param source {Object} object to be merged
     * @return {Object} target with merged values from source
     */
    carefullyMergeWith : function(target, source) 
    {
      if (qx.core.Variant.isSet("qx.debug", "on")) {
        qx.log.Logger.deprecatedMethodWarning(arguments.callee);
      }
      
      return qx.lang.Object.mergeWith(target, source, false);
    },


    /**
     * Merge a number of objects.
     *
     * @deprecated Legacy code - unused in the framework!
     * @param target {Object} target object
     * @param varargs {Object} variable number of objects to merged with target
     * @return {Object} target with merged values from the other objects
     */
    merge : function(target, varargs)
    {
      if (qx.core.Variant.isSet("qx.debug", "on")) {
        qx.log.Logger.deprecatedMethodWarning(arguments.callee);
      }
      
      var len = arguments.length;

      for (var i=1; i<len; i++) {
        qx.lang.Object.mergeWith(target, arguments[i]);
      }

      return target;
    }    
  }
});
