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
     * Andreas Ecker (ecker)

   ======================================================================

   This class contains code based on the following work:

   * Underscore.js
     http://underscorejs.org

     Copyright:
       2009-2014 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors

     License:
       MIT: http://www.opensource.org/licenses/mit-license.php

************************************************************************ */

/**
 * Helper functions to handle Object as a Hash map.
 *
 * @require(qx.lang.normalize.Object)
 * @ignore(qx.core.Assert)
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
      if (qx.core.Environment.get("qx.debug")) {
        qx.core.Assert && qx.core.Assert.assertMap(map, "Invalid argument 'map'");
      }

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
     * @signature function(map)
     * @param map {Object} the map to check
     * @return {Boolean} whether the map has any keys
     * @lint ignoreUnused(key)
     */
    isEmpty : function(map)
    {
      if (qx.core.Environment.get("qx.debug")) {
        qx.core.Assert && qx.core.Assert.assertMap(map, "Invalid argument 'map'");
      }

      for (var key in map) {
        return false;
      }

      return true;
    },


    /**
     * Get the number of objects in the map
     *
     * @signature function(map)
     * @param map {Object} the map
     * @return {Integer} number of objects in the map
     */
    getLength : qx.Bootstrap.objectGetLength,


    /**
     * Get the values of a map as array
     *
     * @deprecated {6.0} Please use Object instance values method instead
     *
     * @param map {Object} the map
     * @return {Array} array of the values of the map
     */
    getValues : function(map)
    {
      return Object.values(map); 
    },


    /**
     * Inserts all keys of the source object into the
     * target objects. Attention: The target map gets modified.
     *
     * @signature function(target, source, overwrite)
     * @param target {Object} target object
     * @param source {Object} object to be merged
     * @param overwrite {Boolean ? true} If enabled existing keys will be overwritten
     * @return {Object} Target with merged values from the source object
     */
    mergeWith : qx.Bootstrap.objectMergeWith,


    /**
     * Return a copy of an Object
     *
     * @param source {Object} Object to copy
     * @param deep {Boolean} If the clone should be a deep clone.
     * @return {Object} A copy of the object
     */
    clone : function(source, deep)
    {
      if (qx.lang.Type.isObject(source)) {
        var clone = {};
        for (var key in source) {
          if (deep) {
            clone[key] = qx.lang.Object.clone(source[key], deep);
          } else {
            clone[key] = source[key];
          }
        }
        return clone;

      } else if (qx.lang.Type.isArray(source)) {
        var clone = [];
        for (var i=0; i < source.length; i++) {
          if (deep) {
            clone[i] = qx.lang.Object.clone(source[i], deep);
          } else {
            clone[i] = source[i];
          }
        };
        return clone;

      }
      return source;
    },


  /**
   * Perform a deep comparison to check if two objects are equal
   *
   * @param object1 {Object} the object that is compared to
   * @param object2 {Object} the object that is compared with
   * @return {Boolean} The result of the comparison
   */
    equals : function(object1, object2){
      return qx.lang.Object.__equals(object1, object2, [], []);
    },

    /**
    * Internal recursive comparison function for equals
    *
    * @param object1 {Object} the object that is compared to
    * @param object2 {Object} the object that is compared with
    * @param aStack {Object} Stack of object1 sub-objects to be traversed
    * @param bStack {Object} Stack of object2 sub-objects to be traversed
    * @return {Boolean} The result of the comparison
    *
    */
    __equals : function(object1, object2, aStack, bStack){
      // Identical objects are equal. `0 === -0`, but they aren't identical.
      // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
      if (object1 === object2){
        return object1 !== 0 || 1 / object1 == 1 / object2;
      }
      // A strict comparison is necessary because `null == undefined`.
      if (object1 == null || object2 == null){
        return object1 === object2;
      }
      // Compare `[[Class]]` names.
      var className = Object.prototype.toString.call(object1);
      if (className != Object.prototype.toString.call(object2)){ return false; }
      switch (className) {
        // Strings, numbers, dates, and booleans are compared by value.
        case '[object String]':
          // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
          // equivalent to `new String("5")`.
          return object1 == String(object2);
        case '[object Number]':
          // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
          // other numeric values.
          return object1 != +object1 ? object2 != +object2 : (object1 == 0 ? 1 / object1 == 1 / object2 : object1 == +object2);
        case '[object Date]':
        case '[object Boolean]':
          // Coerce dates and booleans to numeric primitive values. Dates are compared by their
          // millisecond representations. Note that invalid dates with millisecond representations
          // of `NaN` are not equivalent.
          return +object1 == +object2;
          // RegExps are compared by their source patterns and flags.
        case '[object RegExp]':
          return object1.source == object2.source &&
            object1.global == object2.global &&
            object1.multiline == object2.multiline &&
            object1.ignoreCase == object2.ignoreCase;
      }
      if (typeof object1 != 'object' || typeof object2 != 'object'){ return false; }
      // Assume equality for cyclic structures. The algorithm for detecting cyclic
      // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
      var length = aStack.length;
      while (length--) {
        // Linear search. Performance is inversely proportional to the number of
        // unique nested structures.
        if (aStack[length] == object1){ return bStack[length] == object2; }
      }
      // Objects with different constructors are not equivalent, but `Object`s
      // from different frames are.
      var aCtor = object1.constructor,
        bCtor = object2.constructor;
      if (aCtor !== bCtor && !(qx.Bootstrap.isFunction(aCtor) && (aCtor instanceof aCtor) &&
        qx.Bootstrap.isFunction(bCtor) && (bCtor instanceof bCtor)) && ('constructor' in object1 && 'constructor' in object2)) {
        return false;
      }
      // Add the first object to the stack of traversed objects.
      aStack.push(object1);
      bStack.push(object2);
      var size = 0,
        result = true;
      // Recursively compare objects and arrays.
      if (className == '[object Array]') {
        // Compare array lengths to determine if a deep comparison is necessary.
        size = object1.length;
        result = size == object2.length;
        if (result) {
          // Deep compare the contents, ignoring non-numeric properties.
          while (size--) {
            if (!(result = qx.lang.Object.__equals(object1[size], object2[size], aStack, bStack))){ break; }
          }
        }
      } else {
        // Deep compare objects.
        for (var key in object1) {
          if (Object.prototype.hasOwnProperty.call(object1, key)) {
            // Count the expected number of properties.
            size++;
            // Deep compare each member.
            if (!(result = Object.prototype.hasOwnProperty.call(object2, key) && qx.lang.Object.__equals(object1[key], object2[key], aStack, bStack))){ break; }
          }
        }
        // Ensure that both objects contain the same number of properties.
        if (result) {
          for (key in object2) {
            if (Object.prototype.hasOwnProperty.call(object2, key) && !(size--)){ break; }
          }
          result = !size;
        }
      }
      // Remove the first object from the stack of traversed objects.
      aStack.pop();
      bStack.pop();

      return result;
    },


    /**
     * Inverts a map by exchanging the keys with the values.
     *
     * If the map has the same values for different keys, information will get lost.
     * The values will be converted to strings using the toString methods.
     *
     * @param map {Object} Map to invert
     * @return {Object} inverted Map
     */
    invert : function(map)
    {
      if (qx.core.Environment.get("qx.debug")) {
        qx.core.Assert && qx.core.Assert.assertMap(map, "Invalid argument 'map'");
      }

      var result = {};

      for (var key in map) {
        result[map[key].toString()] = key;
      }

      return result;
    },


    /**
     * Get the key of the given value from a map.
     * If the map has more than one key matching the value, the first match is returned.
     * If the map does not contain the value, <code>null</code> is returned.
     *
     * @param map {Object} Map to search for the key
     * @param value {var} Value to look for
     * @return {String|null} Name of the key (null if not found).
     */
    getKeyFromValue: function(map, value)
    {
      if (qx.core.Environment.get("qx.debug")) {
        qx.core.Assert && qx.core.Assert.assertMap(map, "Invalid argument 'map'");
      }

      for (var key in map)
      {
        if (map.hasOwnProperty(key) && map[key] === value) {
          return key;
        }
      }

      return null;
    },


    /**
     * Whether the map contains the given value.
     *
     * @param map {Object} Map to search for the value
     * @param value {var} Value to look for
     * @return {Boolean} Whether the value was found in the map.
     */
    contains : function(map, value)
    {
      if (qx.core.Environment.get("qx.debug")) {
        qx.core.Assert && qx.core.Assert.assertMap(map, "Invalid argument 'map'");
      }

      return this.getKeyFromValue(map, value) !== null;
    },


    /**
    * Convert an array into a map.
    *
    * All elements of the array become keys of the returned map by
    * calling <code>toString</code> on the array elements. The values of the
    * map are set to <code>true</code>
    *
    * @param array {Array} array to convert
    * @return {Map} the array converted to a map.
    */
    fromArray: function(array)
    {
      if (qx.core.Environment.get("qx.debug")) {
        qx.core.Assert && qx.core.Assert.assertArray(array, "Invalid argument 'array'");
      }

      var obj = {};

      for (var i=0, l=array.length; i<l; i++)
      {
        if (qx.core.Environment.get("qx.debug"))
        {
          switch(typeof array[i])
          {
            case "object":
            case "function":
            case "undefined":
              throw new Error("Could not convert complex objects like " + array[i] + " at array index "+ i +" to map syntax");
          }
        }

        obj[array[i].toString()] = true;
      }

      return obj;
    }
  }
});
