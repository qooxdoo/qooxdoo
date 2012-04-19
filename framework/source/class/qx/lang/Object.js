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
     * Check whether the number of objects in the maps is at least "length"
     *
     * @signature function(map, minLength)
     * @param map {Object} the map to check
     * @param minLength {Integer} minimum number of objects in the map
     * @return {Boolean} whether the map contains at least "length" objects.
     */
    hasMinLength : function(map, minLength)
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        qx.core.Assert && qx.core.Assert.assertMap(map, "Invalid argument 'map'");
        qx.core.Assert && qx.core.Assert.assertInteger(minLength, "Invalid argument 'minLength'");
      }

      if (minLength <= 0) {
        return true;
      }

      var length = 0;

      for (var key in map)
      {
        if ((++length) >= minLength) {
          return true;
        }
      }

      return false;
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
     * Get the keys of a map as array as returned by a "for ... in" statement.
     *
     * @signature function(map)
     * @param map {Object} the map
     * @return {Array} array of the keys of the map
     */
    getKeys : qx.Bootstrap.getKeys,


    /**
     * Get the keys of a map as string
     *
     * @signature function(map)
     * @param map {Object} the map
     * @return {String} String of the keys of the map
     *         The keys are separated by ", "
     */
    getKeysAsString : qx.Bootstrap.getKeysAsString,


    /**
     * Get the values of a map as array
     *
     * @param map {Object} the map
     * @return {Array} array of the values of the map
     */
    getValues : function(map)
    {
      if (qx.core.Environment.get("qx.debug")) {
        qx.core.Assert && qx.core.Assert.assertMap(map, "Invalid argument 'map'");
      }

      var arr = [];
      var keys = this.getKeys(map);

      for (var i=0, l=keys.length; i<l; i++) {
        arr.push(map[keys[i]]);
      }

      return arr;
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
     * Inserts all key/value pairs of the source object into the
     * target object but doesn't override existing keys
     *
     * @param target {Object} target object
     * @param source {Object} object to be merged
     * @return {Object} target with merged values from source
     */
    carefullyMergeWith : function(target, source)
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        qx.core.Assert && qx.core.Assert.assertMap(target, "Invalid argument 'target'");
        qx.core.Assert && qx.core.Assert.assertMap(source, "Invalid argument 'source'");
      }

      return qx.lang.Object.mergeWith(target, source, false);
    },


    /**
     * Merge a number of objects.
     *
     * @param target {Object} target object
     * @param varargs {Object} variable number of objects to merged with target
     * @return {Object} target with merged values from the other objects
     */
    merge : function(target, varargs)
    {
      if (qx.core.Environment.get("qx.debug")) {
        qx.core.Assert && qx.core.Assert.assertMap(target, "Invalid argument 'target'");
      }

      var len = arguments.length;

      for (var i=1; i<len; i++) {
        qx.lang.Object.mergeWith(target, arguments[i]);
      }

      return target;
    },


    /**
     * Return a copy of an Object
     *
     * @param source {Object} Object to copy
     * @param deep {Boolean} If the clone should be a deep clone.
     * @return {Object} copy of vObject
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
            clone[i] = qx.lang.Object.clone(source[i]);
          } else {
            clone[i] = source[i];
          }
        };
        return clone;

      }
      return source;
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
     * If the map has more than one key matching the value the fist match is returned.
     * If the map does not contain the value <code>null</code> is returned.
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
    * Selects the value with the given key from the map.
    *
    * @param key {String} name of the key to get the value from
    * @param map {Object} map to get the value from
    * @return {var} value for the given key from the map
    */
    select: function(key, map)
    {
      if (qx.core.Environment.get("qx.debug")) {
        qx.core.Assert && qx.core.Assert.assertMap(map, "Invalid argument 'map'");
      }
      return map[key];
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
    },

    /**
     * Serializes an object to URI parameters (also known as query string).
     *
     * Escapes characters that have a special meaning in URIs as well as
     * umlauts. Uses the global function encodeURIComponent, see
     * https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/encodeURIComponent
     *
     * Note: For URI parameters that are to be sent as
     * application/x-www-form-urlencoded (POST), spaces should be encoded
     * with "+".
     *
     * @param obj {Object}   Object to serialize.
     * @param post {Boolean} Whether spaces should be encoded with "+".
     * @return {String}      Serialized object. Safe to append to URIs or send as
     *                       URL encoded string.
     *
     */
    toUriParameter: function(obj, post)
    {
      var key,
          parts = [];

      for (key in obj) {
        if (obj.hasOwnProperty(key)) {
          var value = obj[key];
          if (value instanceof Array) {
            for (var i=0; i<value.length; i++) {
              this.__toUriParameter(key, value[i], parts, post);
            }
          } else {
            this.__toUriParameter(key, value, parts, post);
          }
        }
      }

      return parts.join("&");
    },

    /**
     * Encodes key/value to URI safe string and pushes to given array.
     *
     * @param key {String} Key.
     * @param value {String} Value.
     * @param parts {Array} Array to push to.
     * @param post {Boolean} Whether spaces should be encoded with "+".
     */
    __toUriParameter : function(key, value, parts, post) {
      var encode = window.encodeURIComponent;
      if (post) {
        parts.push(encode(key).replace(/%20/g, "+") + "=" +
          encode(value).replace(/%20/g, "+"));
      } else {
        parts.push(encode(key) + "=" + encode(value));
      }
    }
  }
});
